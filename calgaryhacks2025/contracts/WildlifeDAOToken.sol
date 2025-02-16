// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WildlifeDAOToken is ERC20, Ownable {
    address public daoContract;

    event TokensMinted(address indexed recipient, uint256 amount);

    constructor() ERC20("WildlifeDAO Token", "WLD") Ownable(msg.sender) {
        // Maybe we should mint some initial tokens to the owner
        _mint(msg.sender, 1000000 * 10**decimals()); // Mint 1M tokens initially
    }

    function setDAOContract(address _daoContract) external onlyOwner {
        require(_daoContract != address(0), "Invalid DAO address");
        daoContract = _daoContract;
    }

    function mintWLD(address recipient, uint256 amount) external {
        require(msg.sender == daoContract || msg.sender == owner(), "Not authorized to mint");
        require(recipient != address(0), "Invalid recipient address");
        require(amount > 0, "Mint amount must be greater than zero");

        _mint(recipient, amount * 10**decimals()); // Convert to proper decimals
        emit TokensMinted(recipient, amount);
    }
} 