# Price Path Manipulation with Flashloans - Summary

## Vulnerability Overview

This submission demonstrates a critical vulnerability in the PriceFeed contract where an attacker can use flashloans to manipulate liquidity pools and influence the price path selection algorithm, leading to favorable pricing that can be exploited to extract value from the protocol.

## Files Included in This Submission

1. **VULNERABILITY_REPORT.md**: Detailed technical report explaining the vulnerability, its impact, and recommended mitigations.

2. **test/vulnerabilities/PriceFeed.flashloan.test.js**: Test case that simulates a flashloan attack and demonstrates how manipulating pool reserves can significantly affect the prices reported by PriceFeed.

3. **contracts/mock/FlashloanAttacker.sol**: A simplified mock contract to demonstrate the attack concept in the test.

4. **contracts/mock/RealWorldAttack.sol**: A more complete implementation of an attacker contract that demonstrates how a real-world attack would be executed using Aave flashloans.

5. **contracts/mock/VulnerableProtocol.sol**: A sample protocol contract that demonstrates how many protocols might use the PriceFeed in a vulnerable way.

6. **contracts/mock/IUniswapV2Factory.sol**: Interface required for the attacker contract's full implementation.

## Key Points

1. **Attack Vector**: The PriceFeed contract's `_getPathWithPrice` function in the UniswapPathFinder library selects the path that provides the most output tokens without any protection against manipulated pools.

2. **Manipulation Technique**: By using flashloans to temporarily manipulate specific liquidity pools, an attacker can influence the path selection mechanism to obtain favorable prices.

3. **Impact**: Any protocol function that relies on PriceFeed for price determination can be exploited to extract value, potentially leading to significant financial losses.

4. **Ease of Exploitation**: The attack can be performed by anyone with minimal upfront capital due to the use of flashloans.

5. **Proof of Concept**: The provided test file demonstrates that prices can be manipulated by at least 2x through simple pool manipulations.

## Recommended Mitigations

1. Implement minimum liquidity thresholds for pools to be considered in path calculations
2. Use time-weighted average prices (TWAP) instead of spot prices
3. Compare prices from multiple sources and reject outliers
4. Add price impact limits to reject paths with excessive price impact
5. Implement stricter controls on which tokens can be added as path tokens

This vulnerability is rated as **Critical** due to its potential for direct theft of funds with minimal resources required by an attacker. 