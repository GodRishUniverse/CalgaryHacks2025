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

    enum ProjectStatus {
        Voting,     // 0: Project is in voting phase (initial state)
        Rejected,   // 1: Project was rejected by vote
        Executed    // 2: Project was approved by vote and executed
    }

    struct Project {
        string title;
        string description;
        address proposer;
        uint256 fundingRequired;
        uint256 fundingReceived;
        ProjectStatus status;
        uint256 submissionTime;
        mapping(address => uint256) contributions;
        mapping(address => VoteInfo) votes;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 votingStartTime;
        uint256 votingEndTime;
        bool executed;
        string proposalId;
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

    constructor(address _wldToken) Ownable(msg.sender) {
        require(_wldToken != address(0), "Invalid token address");
        wldToken = WildlifeDAOToken(_wldToken);
    }

    function submitProject(
        string memory proposalId,
        string memory title,
        string memory description,
        uint256 fundingRequired
    ) external returns (uint256) {
        projectCount++;
        uint256 projectId = projectCount;

        // Initialize project directly in voting phase
        Project storage project = projects[projectId];
        project.proposalId = proposalId;
        project.title = title;
        project.description = description;
        project.proposer = msg.sender;
        project.fundingRequired = fundingRequired;
        project.status = ProjectStatus.Voting;  // Start in voting phase immediately
        project.submissionTime = block.timestamp;
        project.votingStartTime = block.timestamp;  // Voting starts immediately
        project.votingEndTime = block.timestamp + VOTING_PERIOD;  // Set voting end time (7 days)
        project.forVotes = 0;
        project.againstVotes = 0;
        project.executed = false;

        // Map the proposalId to projectId for reference
        proposalIdToProjectId[proposalId] = projectId;

        // Emit event for the new project
        emit ProposalSubmitted(
            projectId,
            msg.sender,
            title,
            fundingRequired,
            ProjectStatus.Voting
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
        require(projectId > 0 && projectId <= projectCount, "Invalid project ID");
        require(project.status == ProjectStatus.Voting, "Project not in voting phase");
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

        emit VoteCast(projectId, msg.sender, support, votingPower);

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
    function getProjectState(uint256 projectId) external view returns (
        ProjectStatus status,
        uint256 votingStartTime,
        uint256 votingEndTime,
        uint256 forVotes,
        uint256 againstVotes
    ) {
        Project storage project = projects[projectId];
        return (
            project.status,
            project.votingStartTime,
            project.votingEndTime,
            project.forVotes,
            project.againstVotes
        );
    }

    function checkVoteEligibility(uint256 projectId, address voter) external view returns (
        bool isEligible,
        string memory reason
    ) {
        Project storage project = projects[projectId];
        
        if (projectId == 0 || projectId > projectCount) {
            return (false, "Invalid project ID");
        }
        
        if (project.status != ProjectStatus.Voting) {
            return (false, "Project not in voting phase");
        }
        
        if (block.timestamp > project.votingEndTime) {
            return (false, "Voting period ended");
        }
        
        if (project.votes[voter].hasVoted) {
            return (false, "Already voted");
        }
        
        uint256 voterBalance = wldToken.balanceOf(voter);
        if (voterBalance < MIN_VOTE_POWER) {
            return (false, "Insufficient voting power");
        }
        
        return (true, "Can vote");
    }

    function debugProjectStatus(uint256 projectId) external view returns (
        ProjectStatus status,
        uint256 currentTime,
        uint256 votingStartTime,
        uint256 votingEndTime,
        bool canVoteNow
    ) {
        Project storage project = projects[projectId];
        return (
            project.status,
            block.timestamp,
            project.votingStartTime,
            project.votingEndTime,
            (project.status == ProjectStatus.Voting && 
             block.timestamp >= project.votingStartTime &&
             block.timestamp <= project.votingEndTime)
        );
    }

    function debugVote(uint256 projectId, bool support) external view returns (
        bool canVote,
        string memory reason,
        uint256 voterBalance,
        uint256 minRequired,
        bool hasVotedAlready,
        ProjectStatus projectStatus,
        uint256 endTime,
        uint256 currentTime
    ) {
        Project storage project = projects[projectId];
        uint256 balance = wldToken.balanceOf(msg.sender);
        
        return (
            true,
            "Debug info",
            balance,
            MIN_VOTE_POWER,
            project.votes[msg.sender].hasVoted,
            project.status,
            project.votingEndTime,
            block.timestamp
        );
    }
} 