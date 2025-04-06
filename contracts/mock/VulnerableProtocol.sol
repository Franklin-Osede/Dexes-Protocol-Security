// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/core/IPriceFeed.sol";

/**
 * @title VulnerableProtocol
 * @dev A sample protocol that relies on PriceFeed for determining token prices.
 * This contract is deliberately vulnerable to path manipulation attacks to
 * demonstrate the vulnerability.
 */
contract VulnerableProtocol is Ownable {
    IPriceFeed public priceFeed;

    mapping(address => bool) public supportedTokens;

    event TokenExchanged(
        address indexed fromToken,
        address indexed toToken,
        uint256 amountIn,
        uint256 amountOut
    );

    /**
     * @dev Constructor
     * @param _priceFeed Address of the PriceFeed contract
     */
    constructor(address _priceFeed) Ownable() {
        _transferOwnership(msg.sender);
        priceFeed = IPriceFeed(_priceFeed);
    }

    /**
     * @dev Add supported tokens to the protocol
     * @param tokens Array of token addresses to add
     */
    function addSupportedTokens(address[] calldata tokens) external onlyOwner {
        for (uint256 i = 0; i < tokens.length; i++) {
            supportedTokens[tokens[i]] = true;
        }
    }

    /**
     * @dev Remove tokens from the supported list
     * @param tokens Array of token addresses to remove
     */
    function removeSupportedTokens(address[] calldata tokens) external onlyOwner {
        for (uint256 i = 0; i < tokens.length; i++) {
            supportedTokens[tokens[i]] = false;
        }
    }

    /**
     * @dev VULNERABLE FUNCTION: Exchanges tokens based on PriceFeed's price
     * This function is vulnerable to price manipulation attacks
     * @param fromToken The token to exchange from
     * @param toToken The token to exchange to
     * @param amountIn Amount of fromToken to exchange
     * @return amountOut Amount of toToken received
     */
    function exchangeTokens(
        address fromToken,
        address toToken,
        uint256 amountIn
    ) external returns (uint256 amountOut) {
        require(supportedTokens[fromToken], "Token not supported");
        require(supportedTokens[toToken], "Token not supported");

        // Transfer tokens to this contract
        IERC20(fromToken).transferFrom(msg.sender, address(this), amountIn);

        // Get the exchange rate from PriceFeed - VULNERABLE PART
        // The protocol blindly trusts the price returned by PriceFeed
        (amountOut, ) = priceFeed.getExtendedPriceOut(
            fromToken,
            toToken,
            amountIn,
            IPriceFeed.SwapPath(new address[](0), new uint8[](0))
        );

        // Send the tokens to the user
        IERC20(toToken).transfer(msg.sender, amountOut);

        emit TokenExchanged(fromToken, toToken, amountIn, amountOut);

        return amountOut;
    }

    /**
     * @dev VULNERABLE FUNCTION: Executes a trade based on provided price
     * This simulates a protocol function that would use PriceFeed for pricing
     * @param fromToken The token to exchange from
     * @param toToken The token to exchange to
     * @param rate The rate to use for the exchange
     * @return success Whether the trade was successful
     */
    function executeTradeWithPrice(
        address fromToken,
        address toToken,
        uint256 rate
    ) external returns (bool success) {
        // This function would be called by the attacker who provides a manipulated price
        // In a real attack, the protocol would call PriceFeed internally

        // Log the attempted trade using the manipulated rate
        emit TokenExchanged(fromToken, toToken, 1e18, rate);

        return true;
    }

    /**
     * @dev Withdraw tokens in case of emergency
     * @param token The token to withdraw
     */
    function emergencyWithdraw(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        IERC20(token).transfer(msg.sender, balance);
    }
}
