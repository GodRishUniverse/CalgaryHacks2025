// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./WildlifeDAOToken.sol";

contract WildlifeDAO is Ownable {
    WildlifeDAOToken public wldToken;

    uint256 public totalValueLocked;
    uint256 public totalWLD;
    uint256 public exchangeRate = 1; // 1 USD = 1 WLD
    uint256 public constant MIN_DONATION = 1; // $1 minimum
    uint256 public constant MAX_DONATION = 1000; // $1000 maximum per donation
    uint256 public constant DAO_FEE = 500; // 5% in basis points (100 = 1%)
    uint256 public constant VOTE_COST = 10 * 10**18; // 10 WLD to create a proposal
    uint256 public constant MIN_VOTE_POWER = 100 * 10**18; // Need 100 WLD to vote
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant AUTO_VALIDATION_PERIOD = 1 minutes;  // 1 minute for auto-validation

    // Validator management
    mapping(address => bool) public validators;
    uint256 public minValidationsRequired = 2; // Minimum validators needed to approve

    enum ProjectStatus {
        Pending,    // Initial state
        Validating, // Under auto-validation
        Approved,   // Ready for voting
        Rejected,   // Rejected by validators or vote
        Executed    // Proposal passed and executed
    }

    struct Project {
        string title;
        string description;
        address proposer;
        uint256 fundingRequired;
        uint256 fundingReceived;
        uint256 validationCount;
        ProjectStatus status;
        uint256 submissionTime;
        mapping(address => bool) validatedBy;
        mapping(address => uint256) contributions;
        mapping(address => VoteInfo) votes;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 votingStartTime;
        uint256 votingEndTime;
        bool executed;
    }

    struct VoteInfo {
        bool hasVoted;
        uint256 votingPower;
        bool support;
    }

    mapping(uint256 => Project) public projects;
    uint256 public projectCount;
    mapping(string => uint256) public proposalIdToProjectId;

    // Updated events
    event ProposalSubmitted(
        uint256 indexed projectId,
        address indexed submitter,
        string title,
        uint256 fundingRequired,
        ProjectStatus status
    );

    event ProjectStatusChanged(
        uint256 indexed projectId,
        ProjectStatus oldStatus,
        ProjectStatus newStatus
    );

    event DonationReceived(
        address indexed donor,
        uint256 usdAmount,
        uint256 wldMinted,
        uint256 daoFeeAmount
    );

    event VoteCast(
        uint256 indexed projectId,
        address indexed voter,
        bool support,
        uint256 votingPower
    );

    // Add event for debugging
    event ValidationCheck(
        uint256 indexed projectId,
        uint256 currentTime,
        uint256 submissionTime,
        uint256 validationPeriod
    );

    event VotingStarted(
        uint256 indexed projectId,
        uint256 startTime,
        uint256 endTime
    );

    modifier onlyValidator() {
        require(validators[msg.sender], "Not a validator");
        _;
    }

    constructor(address _wldToken) Ownable(msg.sender) {
        require(_wldToken != address(0), "Invalid token address");
        wldToken = WildlifeDAOToken(_wldToken);
        // Add deployer as first validator
        validators[msg.sender] = true;
    }

    // Validator management
    function addValidator(address validator) external onlyOwner {
        require(!validators[validator], "Already a validator");
        validators[validator] = true;
    }

    function removeValidator(address validator) external onlyOwner {
        require(validators[validator], "Not a validator");
        validators[validator] = false;
    }

    function submitProject(
        string memory proposalId,
        string memory title,
        string memory description,
        uint256 fundingRequired
    ) external returns (uint256) {
        require(bytes(proposalId).length > 0, "Invalid proposal ID");
        require(proposalIdToProjectId[proposalId] == 0, "Proposal ID already exists");

        projectCount++;
        uint256 projectId = projectCount;

        Project storage project = projects[projectId];
        project.title = title;
        project.description = description;
        project.fundingRequired = fundingRequired;
        project.proposer = msg.sender;
        project.status = ProjectStatus.Approved;
        project.submissionTime = block.timestamp;
        project.votingStartTime = block.timestamp;
        project.votingEndTime = block.timestamp + VOTING_PERIOD;

        proposalIdToProjectId[proposalId] = projectId;

        emit ProposalSubmitted(
            projectId,
            msg.sender,
            title,
            fundingRequired,
            ProjectStatus.Approved
        );

        emit ProjectStatusChanged(
            projectId,
            ProjectStatus.Pending,
            ProjectStatus.Approved
        );

        emit VotingStarted(
            projectId,
            project.votingStartTime,
            project.votingEndTime
        );

        return projectId;
    }

    function donate(uint256 _usdAmount, address _recipient) external payable {
        require(_usdAmount >= MIN_DONATION, "Donation too small");
        require(_usdAmount <= MAX_DONATION, "Donation too large");
        require(_recipient != address(0), "Invalid recipient");

        uint256 wldToMint = _usdAmount * 10**18;
        uint256 daoFee = (wldToMint * DAO_FEE) / 10000;
        uint256 userAmount = wldToMint - daoFee;

        totalValueLocked += _usdAmount;
        totalWLD += wldToMint;

        // Mint tokens
        wldToken.mintWLD(_recipient, userAmount);
        if (daoFee > 0) {
            wldToken.mintWLD(owner(), daoFee);
        }

        emit DonationReceived(msg.sender, _usdAmount, wldToMint, daoFee);
    }

    function voteOnProject(uint256 projectId, bool support) external {
        Project storage project = projects[projectId];
        require(project.status == ProjectStatus.Approved, "Project not in voting phase");
        require(block.timestamp <= project.votingEndTime, "Voting period ended");
        require(!project.votes[msg.sender].hasVoted, "Already voted");

        uint256 voterBalance = wldToken.balanceOf(msg.sender);
        require(voterBalance >= MIN_VOTE_POWER, "Insufficient voting power");

        uint256 totalSupply = wldToken.totalSupply();
        uint256 votingPower = (voterBalance * 10000) / totalSupply;

        project.votes[msg.sender] = VoteInfo({
            hasVoted: true,
            votingPower: votingPower,
            support: support
        });

        if (support) {
            project.forVotes += votingPower;
        } else {
            project.againstVotes += votingPower;
        }

        // Emit vote cast event
        emit VoteCast(projectId, msg.sender, support, votingPower);

        // Check if voting is complete
        _checkVoteOutcome(projectId);
    }

    function _checkVoteOutcome(uint256 projectId) internal {
        Project storage project = projects[projectId];
        
        if (block.timestamp > project.votingEndTime) {
            uint256 totalVotes = project.forVotes + project.againstVotes;
            uint256 quorum = 3000; // 30% quorum

            if (totalVotes >= quorum) {
                ProjectStatus newStatus = project.forVotes > project.againstVotes 
                    ? ProjectStatus.Executed 
                    : ProjectStatus.Rejected;
                
                emit ProjectStatusChanged(
                    projectId,
                    project.status,
                    newStatus
                );
                
                project.status = newStatus;
            }
        }
    }

    // View functions
    function getProjectStatus(uint256 projectId) external view returns (
        ProjectStatus status,
        uint256 submissionTime,
        uint256 votingStartTime,
        uint256 votingEndTime
    ) {
        Project storage project = projects[projectId];
        return (
            project.status,
            project.submissionTime,
            project.votingStartTime,
            project.votingEndTime
        );
    }

    function getProjectVotes(uint256 projectId) external view returns (
        uint256 forVotes,
        uint256 againstVotes,
        uint256 votingEndTime
    ) {
        Project storage project = projects[projectId];
        return (
            project.forVotes,
            project.againstVotes,
            project.votingEndTime
        );
    }
} 