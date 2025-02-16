// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./WildlifeDAOToken.sol";

contract WildlifeDAO is Ownable {
    IERC20 public wldToken;

    uint256 public totalValueLocked;
    uint256 public totalWLD;
    uint256 public exchangeRate = 100; // 1 imaginary USD = 100 WLD

    event DonationReceived(address indexed donor, uint256 usdAmount, uint256 wldMinted);

    constructor(address _wldToken) Ownable(msg.sender) {
        wldToken = IERC20(_wldToken);
    }

    function donate(uint256 _usdAmount, address _recipient) external payable {
        require(_usdAmount > 0, "Donation must be greater than zero");

        uint256 wldToMint = _usdAmount * exchangeRate;
        totalValueLocked += _usdAmount;
        totalWLD += wldToMint;

        // Call mintWLD on the token contract
        WildlifeDAOToken(address(wldToken)).mintWLD(_recipient, wldToMint);
        emit DonationReceived(_recipient, _usdAmount, wldToMint);
    }
} 