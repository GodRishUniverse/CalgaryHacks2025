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
    uint256 public constant AUTO_VALIDATION_PERIOD = 1 minutes;  // 1 minute for MVP

    // Validator management
    mapping(address => bool) public validators;
    uint256 public minValidationsRequired = 2; // Minimum validators needed to approve

    enum ProjectStatus {
        Pending,    // Just submitted
        Validating, // Under validator review
        Approved,   // Approved by validators
        Rejected,   // Rejected by validators
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
        uint256 submissionTime;    // Add this field
        mapping(address => bool) validatedBy;
        mapping(address => uint256) contributions; // Track individual contributions
        mapping(address => VoteInfo) votes;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 votingStartTime;
        uint256 votingEndTime;
        bool executed;
    }

    struct VoteInfo {
        bool hasVoted;
        uint256 votingPower;  // Represents the voter's token balance at time of vote
        bool support;
    }

    mapping(uint256 => Project) public projects;
    uint256 public projectCount;

    // Add a mapping to track proposals by their IDs
    mapping(string => uint256) public proposalIdToProjectId;

    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);
    event ProjectSubmitted(
        uint256 indexed projectId,
        address indexed proposer,
        string title,
        uint256 fundingRequired
    );
    event ProjectValidated(
        uint256 indexed projectId,
        address indexed validator,
        uint256 currentValidations
    );
    event ProjectStatusUpdated(
        uint256 indexed projectId,
        ProjectStatus newStatus
    );
    event DonationReceived(
        address indexed donor,
        uint256 usdAmount,
        uint256 wldMinted,
        uint256 daoFeeAmount
    );
    event ProjectContribution(
        uint256 indexed projectId,
        address indexed contributor,
        uint256 amount,
        uint256 tokensBurned,
        uint256 totalFunding
    );
    event VoteCast(
        uint256 indexed projectId,
        address indexed voter,
        bool support,
        uint256 votingPower
    );
    event ProjectStatusChanged(
        uint256 indexed projectId,
        ProjectStatus oldStatus,
        ProjectStatus newStatus
    );
    event ProposalSubmitted(
        string proposalId,
        uint256 projectId,
        address submitter,
        string title,
        uint256 fundingRequired,
        string status
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
        emit ValidatorAdded(msg.sender);
    }

    // Validator management
    function addValidator(address validator) external onlyOwner {
        require(!validators[validator], "Already a validator");
        validators[validator] = true;
        emit ValidatorAdded(validator);
    }

    function removeValidator(address validator) external onlyOwner {
        require(validators[validator], "Not a validator");
        validators[validator] = false;
        emit ValidatorRemoved(validator);
    }

    // Project submission and validation
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
        project.status = ProjectStatus.Pending;
        project.submissionTime = block.timestamp;  // Record submission time
        project.validationCount = 0;

        proposalIdToProjectId[proposalId] = projectId;

        emit ProposalSubmitted(
            proposalId,
            projectId,
            msg.sender,
            title,
            fundingRequired,
            "Pending"
        );

        return projectId;
    }

    function validateProject(uint256 projectId) external onlyValidator {
        Project storage project = projects[projectId];
        require(project.status == ProjectStatus.Pending, "Invalid project status");
        require(!project.validatedBy[msg.sender], "Already validated");

        project.validatedBy[msg.sender] = true;
        project.validationCount++;

        emit ProjectValidated(projectId, msg.sender, project.validationCount);

        // Key part: When enough validators approve, voting period starts automatically
        if (project.validationCount >= minValidationsRequired) {
            project.status = ProjectStatus.Approved;
            project.votingStartTime = block.timestamp;  // Start voting now
            project.votingEndTime = block.timestamp + VOTING_PERIOD;  // End in 7 days
            emit ProjectStatusChanged(projectId, ProjectStatus.Pending, ProjectStatus.Approved);
        }
    }

    function rejectProject(uint256 projectId) external onlyValidator {
        Project storage project = projects[projectId];
        require(project.status == ProjectStatus.Pending || 
                project.status == ProjectStatus.Validating, "Invalid project status");
        
        project.status = ProjectStatus.Rejected;
        emit ProjectStatusUpdated(projectId, ProjectStatus.Rejected);
    }

    // Regular donation function
    function donate(uint256 _usdAmount, address _recipient) external payable {
        require(_usdAmount >= MIN_DONATION, "Donation too small");
        require(_usdAmount <= MAX_DONATION, "Donation too large");
        require(_recipient != address(0), "Invalid recipient");

        // Calculate WLD tokens to mint (1:1 ratio with USD)
        uint256 wldToMint = _usdAmount * 10**18; // Convert to wei
        
        try wldToken.mintWLD(_recipient, wldToMint) {
            // Update totals
            totalValueLocked += _usdAmount;
            totalWLD += wldToMint;

            emit DonationReceived(msg.sender, _usdAmount, wldToMint, 0);
        } catch Error(string memory reason) {
            revert(string(abi.encodePacked("Minting failed: ", reason)));
        }
    }

    // Proportional voting based on token ownership
    function voteOnProject(uint256 projectId, bool support) external {
        Project storage project = projects[projectId];
        require(project.status == ProjectStatus.Approved, "Project not in voting phase");
        require(block.timestamp <= project.votingEndTime, "Voting period ended");
        require(!project.votes[msg.sender].hasVoted, "Already voted");

        uint256 voterBalance = wldToken.balanceOf(msg.sender);
        require(voterBalance >= MIN_VOTE_POWER, "Insufficient voting power");

        // Calculate voting power
        uint256 totalSupply = wldToken.totalSupply();
        uint256 votingPower = (voterBalance * 10000) / totalSupply; // basis points (100 = 1%)

        // Record vote
        project.votes[msg.sender] = VoteInfo({
            hasVoted: true,
            votingPower: votingPower,
            support: support
        });

        // Update vote tallies
        if (support) {
            project.forVotes += votingPower;
        } else {
            project.againstVotes += votingPower;
        }

        emit VoteCast(projectId, msg.sender, support, votingPower);

        // Check if we can finalize the vote
        _checkVoteOutcome(projectId);
    }

    function _checkVoteOutcome(uint256 projectId) internal {
        Project storage project = projects[projectId];
        
        // Only check if voting period has ended
        if (block.timestamp > project.votingEndTime) {
            uint256 totalVotes = project.forVotes + project.againstVotes;
            uint256 quorum = 3000; // 30% quorum requirement

            if (totalVotes >= quorum) {
                if (project.forVotes > project.againstVotes) {
                    project.status = ProjectStatus.Executed;
                } else {
                    project.status = ProjectStatus.Rejected;
                }
                emit ProjectStatusChanged(
                    projectId, 
                    ProjectStatus.Approved, 
                    project.status
                );
            }
        }
    }

    // Modify quadratic voting to be contribution-based
    function quadraticContribute(uint256 projectId, uint256 numVotes) external {
        Project storage project = projects[projectId];
        require(project.status == ProjectStatus.Approved, "Project not approved");
        require(project.fundingReceived < project.fundingRequired, "Funding goal reached");
        
        // Calculate total cost in WLD tokens
        uint256 contributionCost = calculateVoteCost(numVotes);
        
        // Check user has enough tokens
        require(wldToken.balanceOf(msg.sender) >= contributionCost, "Insufficient WLD balance");
        
        // Burn the tokens as contribution
        wldToken.burnFrom(msg.sender, contributionCost);
        
        // Record the contribution
        project.contributions[msg.sender] += numVotes;
        project.fundingReceived += numVotes;
        
        // Check if project is fully funded
        if (project.fundingReceived >= project.fundingRequired) {
            project.status = ProjectStatus.Executed;
            emit ProjectStatusUpdated(projectId, ProjectStatus.Executed);
        }
        
        emit ProjectContribution(
            projectId,
            msg.sender,
            numVotes,
            contributionCost,
            project.fundingReceived
        );
    }

    // Cost increases quadratically with number of votes
    function calculateVoteCost(uint256 numVotes) public pure returns (uint256) {
        return numVotes * numVotes * (1 * 10**18); // Cost in WLD tokens
    }

    // Add getter functions for frontend
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

    function hasVoted(uint256 projectId, address voter) external view returns (bool) {
        return projects[projectId].votes[voter].hasVoted;
    }

    // Add function to get project by proposal ID
    function getProjectByProposalId(string memory proposalId) 
        external 
        view 
        returns (
            uint256 projectId,
            string memory title,
            address proposer,
            ProjectStatus status
        ) 
    {
        projectId = proposalIdToProjectId[proposalId];
        require(projectId != 0, "Proposal not found");
        
        Project storage project = projects[projectId];
        return (
            projectId,
            project.title,
            project.proposer,
            project.status
        );
    }

    // Add function to check and auto-validate projects
    function checkAndAutoValidate(uint256 projectId) external {
        Project storage project = projects[projectId];
        require(project.status == ProjectStatus.Pending, "Project not pending");
        require(
            block.timestamp >= project.submissionTime + AUTO_VALIDATION_PERIOD,
            "Validation period not ended"
        );

        // Auto-validate and start voting period
        project.status = ProjectStatus.Approved;
        project.votingStartTime = block.timestamp;
        project.votingEndTime = block.timestamp + VOTING_PERIOD;

        emit ProjectStatusChanged(
            projectId,
            ProjectStatus.Pending,
            ProjectStatus.Approved
        );
    }

    // Add getter function for proposal status
    function getProposalStatus(string memory proposalId) external view returns (
        uint256 projectId,
        ProjectStatus status,
        uint256 submissionTime,
        uint256 votingStartTime,
        uint256 votingEndTime
    ) {
        projectId = proposalIdToProjectId[proposalId];
        require(projectId != 0, "Proposal not found");
        
        Project storage project = projects[projectId];
        return (
            projectId,
            project.status,
            project.submissionTime,
            project.votingStartTime,
            project.votingEndTime
        );
    }
} 