// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WildlifeDAOToken is ERC20, Ownable {
    address public daoContract;

    event TokensMinted(address indexed recipient, uint256 amount);

    constructor() ERC20("WildlifeDAO Token", "WLD") Ownable(msg.sender) {}

    function setDAOContract(address _daoContract) external onlyOwner {
        daoContract = _daoContract;
    }

    function mintWLD(address recipient, uint256 amount) external {
        require(msg.sender == daoContract || msg.sender == owner(), "Not authorized to mint");
        require(recipient != address(0), "Invalid recipient address");
        require(amount > 0, "Mint amount must be greater than zero");

        _mint(recipient, amount);
        emit TokensMinted(recipient, amount);
    }
} 