// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title FlashloanAttacker
 * @dev Mock contract to demonstrate price manipulation attack using flashloans
 * This is a simplified version that doesn't actually use a real flashloan provider,
 * but demonstrates the concept of the attack
 */
contract FlashloanAttacker {
    using Address for address;

    address public immutable uniswapRouter;

    event Attack(address token, uint256 amount, uint256 profit);

    constructor(address _uniswapRouter) {
        uniswapRouter = _uniswapRouter;
    }

    /**
     * @dev Executes a price path manipulation attack using a simulated flashloan
     * @param token The token to manipulate (intermediate token in the path)
     * @param priceFeed The address of the PriceFeed contract being targeted
     * @param dexeToken The DEXE token address
     * @param usdToken The USD token address
     * @param flashAmount The amount of tokens to "flashloan"
     */
    function executeAttack(
        address token,
        address priceFeed,
        address dexeToken,
        address usdToken,
        uint256 flashAmount
    ) external {
        // Step 1: Take "flashloan" of the manipulation token (in a real attack, this would be a flashloan)
        // Here we just assume the attacker already has the tokens or has received them

        // Step 2: Manipulate the pools to change the price path
        // This would involve various swaps to drain or increase liquidity in specific pools
        // In our mock, this is done directly in the test

        // Step 3: Call the PriceFeed to get manipulated prices
        // In our test, we call the PriceFeed directly

        // Step 4: Use these manipulated prices to extract value
        // This could involve calling functions on victim contracts that use the PriceFeed

        // Step 5: Repay the flashloan and keep the profit
        // In our mock, this is done directly in the test

        // Log the attack
        emit Attack(token, flashAmount, 0);
    }

    /**
     * @dev Receives ETH when needed
     */
    receive() external payable {}

    /**
     * @dev Allows the contract to retrieve ERC20 tokens (including those acquired during an attack)
     * @param token The ERC20 token to withdraw
     * @param to The recipient address
     * @param amount The amount to withdraw
     */
    function withdrawToken(address token, address to, uint256 amount) external {
        IERC20(token).transfer(to, amount);
    }
}
