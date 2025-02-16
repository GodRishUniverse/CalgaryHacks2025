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
    uint256 public constant VOTE_DURATION = 7 days;
    uint256 public constant MIN_VOTE_POWER = 100 * 10**18; // Need 100 WLD to vote

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
        uint256 validationCount;
        ProjectStatus status;
        mapping(address => bool) validatedBy;
        mapping(address => bool) hasVoted;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 votingEndTime;
    }

    mapping(uint256 => Project) public projects;
    uint256 public projectCount;

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
        string memory title,
        string memory description,
        uint256 fundingRequired
    ) external {
        uint256 projectId = projectCount++;
        Project storage project = projects[projectId];
        project.title = title;
        project.description = description;
        project.proposer = msg.sender;
        project.fundingRequired = fundingRequired;
        project.status = ProjectStatus.Pending;

        emit ProjectSubmitted(projectId, msg.sender, title, fundingRequired);
        emit ProjectStatusUpdated(projectId, ProjectStatus.Pending);
    }

    function validateProject(uint256 projectId) external onlyValidator {
        Project storage project = projects[projectId];
        require(project.status == ProjectStatus.Pending || 
                project.status == ProjectStatus.Validating, "Invalid project status");
        require(!project.validatedBy[msg.sender], "Already validated");

        project.validatedBy[msg.sender] = true;
        project.validationCount++;
        
        if (project.status == ProjectStatus.Pending) {
            project.status = ProjectStatus.Validating;
            emit ProjectStatusUpdated(projectId, ProjectStatus.Validating);
        }

        emit ProjectValidated(projectId, msg.sender, project.validationCount);

        // If enough validations, move to voting phase
        if (project.validationCount >= minValidationsRequired) {
            project.status = ProjectStatus.Approved;
            project.votingEndTime = block.timestamp + VOTE_DURATION;
            emit ProjectStatusUpdated(projectId, ProjectStatus.Approved);
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
        require(_usdAmount >= MIN_DONATION, "Donation below minimum");
        require(_usdAmount <= MAX_DONATION, "Donation above maximum");
        require(_recipient != address(0), "Invalid recipient address");

        // Calculate DAO fee
        uint256 daoFeeAmount = (_usdAmount * DAO_FEE) / 10000;
        uint256 recipientAmount = _usdAmount - daoFeeAmount;

        // Calculate WLD amounts
        uint256 wldToMint = recipientAmount * exchangeRate;
        uint256 daoWldAmount = daoFeeAmount * exchangeRate;

        totalValueLocked += _usdAmount;
        totalWLD += (wldToMint + daoWldAmount);

        // Mint tokens to recipient and DAO
        wldToken.mintWLD(_recipient, wldToMint);
        wldToken.mintWLD(owner(), daoWldAmount);

        emit DonationReceived(
            _recipient, 
            _usdAmount, 
            wldToMint,
            daoWldAmount
        );
    }

    // Voting on validated projects
    function voteOnProject(uint256 projectId, bool support) external {
        Project storage project = projects[projectId];
        require(project.status == ProjectStatus.Approved, "Project not approved");
        require(block.timestamp < project.votingEndTime, "Voting period ended");
        require(!project.hasVoted[msg.sender], "Already voted");
        require(wldToken.balanceOf(msg.sender) >= MIN_VOTE_POWER, "Insufficient voting power");

        project.hasVoted[msg.sender] = true;
        uint256 votingPower = wldToken.balanceOf(msg.sender);

        if (support) {
            project.forVotes += votingPower;
        } else {
            project.againstVotes += votingPower;
        }
    }
} 