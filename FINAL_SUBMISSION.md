# PriceFeed Flashloan Manipulation Vulnerability - 

## Vulnerability Overview

The PriceFeed contract is vulnerable to price manipulation via flashloan attacks. By temporarily manipulating the reserves of token pairs in liquidity pools, an attacker can significantly influence the prices reported by PriceFeed, potentially extracting value from any contract that relies on these price feeds for decision-making.

## Proof of Concept

I've created a test that demonstrates how an attacker could manipulate PriceFeed by temporarily changing token reserves, simulating a flashloan attack:

**File: test/vulnerabilities/PriceFeed.final.js**

The test demonstrates the vulnerability by:
1. Getting the normal price for 1000 DEXE tokens in USD
2. Simulating a flashloan by giving the attacker enough tokens to manipulate reserves
3. Manipulating reserves by reducing DEXE reserves to 10% and increasing USD reserves to 10x
4. Getting the manipulated price and calculating the price manipulation factor
5. Restoring reserves to their original values (simulating flashloan repayment)
6. Verifying that prices return to normal after the attack

## Vulnerability Details

The key vulnerability is in how PriceFeed calculates prices based on token reserves in liquidity pools:

1. **Root Cause**: PriceFeed relies directly on current token reserves in liquidity pools without any protection against temporary manipulations.

2. **Attack Vector**: An attacker can use a flashloan to temporarily manipulate token reserves in selected pools, drastically changing the price reported by PriceFeed.

3. **Impact**: Any protocol that uses PriceFeed for price determination can be exploited. For example:
   - Lending platforms might allow borrowing more than the collateral value
   - AMMs might execute trades at incorrect prices
   - Derivatives platforms might liquidate positions incorrectly

4. **Attack Flow**:
   - Attacker takes a flashloan of token X
   - Manipulates the reserves to change the price reported by PriceFeed
   - Exploits the incorrect price in a dependent protocol
   - Repays the flashloan and keeps the profit

## Mitigation Recommendations

1. **Time-Weighted Average Prices (TWAP)**: Implement a TWAP oracle that averages prices over time, making it resistant to short-term manipulations.

2. **Multi-Oracle Solution**: Use multiple price sources and take a median or average value.

3. **Reserve Checks**: Implement checks for suspicious reserve changes that could indicate manipulation.

4. **Price Impact Limits**: Add maximum price impact thresholds to prevent extreme price movements.

5. **Fixed Slippage Protection**: Add slippage protection to prevent trades from executing at manipulated prices.

## Files Created

**test/vulnerabilities/PriceFeed.final.js**: A proof of concept that clearly demonstrates the PriceFeed vulnerability to price manipulation via reserve changes.

## Conclusion

The PriceFeed contract is vulnerable to price manipulation through flashloan attacks. The vulnerability is significant because it potentially affects any protocol that relies on PriceFeed for price information. The proof of concept demonstrates how an attacker could manipulate prices to their advantage, potentially extracting value from dependent protocols. 