// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WildlifeDAOToken is ERC20, Ownable {
    address public daoContract;
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10**18; // 1M total supply
    uint256 public constant MAX_PER_DONATION = 1000 * 10**18; // Max 1000 tokens per donation

    event TokensMinted(
        address indexed recipient, 
        uint256 amount, 
        string purpose
    );

    constructor() ERC20("WildlifeDAO Token", "WLD") Ownable(msg.sender) {
        // Initial distribution for demo:
        // 100k to DAO treasury (deployer)
        _mint(msg.sender, 100_000 * 10**18);
        emit TokensMinted(msg.sender, 100_000, "Initial DAO Treasury");
    }

    function setDAOContract(address _daoContract) external onlyOwner {
        require(_daoContract != address(0), "Invalid DAO address");
        daoContract = _daoContract;
    }

    function mintWLD(address recipient, uint256 amount) external {
        require(msg.sender == daoContract || msg.sender == owner(), "Not authorized to mint");
        require(recipient != address(0), "Invalid recipient address");
        require(amount > 0, "Mint amount must be greater than zero");
        require(amount <= MAX_PER_DONATION, "Exceeds maximum tokens per donation");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");

        _mint(recipient, amount * 10**decimals());
        emit TokensMinted(recipient, amount, "Donation");
    }
} 