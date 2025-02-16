// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./WildlifeDAOToken.sol";

contract WildlifeDAO is Ownable {
    WildlifeDAOToken public wldToken;

    uint256 public totalValueLocked;
    uint256 public totalWLD;
    uint256 public exchangeRate = 100; // 1 USD = 100 WLD

    event DonationReceived(address indexed donor, uint256 usdAmount, uint256 wldMinted);

    constructor(address _wldToken) Ownable(msg.sender) {
        require(_wldToken != address(0), "Invalid token address");
        wldToken = WildlifeDAOToken(_wldToken);
    }

    function donate(uint256 _usdAmount, address _recipient) external payable {
        require(_usdAmount > 0, "Donation must be greater than zero");
        require(_recipient != address(0), "Invalid recipient address");

        uint256 wldToMint = _usdAmount * exchangeRate;
        totalValueLocked += _usdAmount;
        totalWLD += wldToMint;

        // Mint tokens to the recipient
        wldToken.mintWLD(_recipient, wldToMint);
        emit DonationReceived(_recipient, _usdAmount, wldToMint);
    }
} 