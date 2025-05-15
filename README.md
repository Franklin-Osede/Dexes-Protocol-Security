### About DeXe Protocol

DeXe is a decentralized autonomous organization (DAO) that provides tokenized asset management, social trading strategies, and community-governed investment products. Their smart contracts have been rigorously audited to ensure fund safety and protocol correctness.

Official website: dexe.io

This repository captures voluntary security research activities focused on key DeXe protocol contracts.

Research Scope & Objectives

Understand staking vaults, strategy execution, and DAO governance flows.

Probe for reentrancy, access-control weaknesses, and integer overflows.

Validate fee distribution logic and on-chain voting modules under edge-case scenarios.

Contracts under review:

StakingVault.sol

StrategyFactory.sol

Governance.sol

Treasury.sol

### Methodologies & Tools

A hybrid approach combining static, dynamic, and manual techniques:

Static Analysis

Slither: Detects Solidity anti-patterns and potential misconfigurations

Mythril: Symbolic analysis for common exploit classes

Securify & SmartCheck: Cross-verification of static findings

Dynamic & Fuzz Testing

Echidna: Property-based fuzzing for invariants like stake accounting

Manticore: Symbolic execution to explore complex governance logic

Foundry (forge): Custom tests for edge-case interactions

Manual Review & Penetration Techniques

Code walkthroughs focusing on unchecked math, oracle dependencies, and DAO vote replay

Transaction simulations via Hardhat to observe revert reasons and event logs

Web3.py scripts for multi-participant and time-manipulation testing

### Setup & Usage

# Clone the repository
git clone https://github.com/Franklin-Osede/Dexes-Protocol-Security.git
cd Dexes-Protocol-Security

# Install dependencies
npm install --save-dev slither-analyzer mythx-cli securify smartcheck
echo "export PATH=$PATH:$(npm bin)"
npm install --save-dev echidna-core manticore forge hardhat
npm install --save-dev solhint prettier prettier-plugin-solidity

# Run static analysis
npx slither contracts/

# Run fuzz tests
echidna-test contracts/ --config echidna-config.yaml

# Symbolic execution
manticore --output-dir reports/manticore contracts/StrategyFactory.sol

### Documentation of Attempts

All executions and manual tests are logged under /research-logs, including:

Tool & Version

Configuration

Timestamp

Key Observations (warnings, errors, anomalies)

### Current Status

No vulnerabilities have been discovered to date. Research is ongoing, and all new test logs will be added to /research-logs.

### Collaboration

Fellow researchers are encouraged to:

Fork the repository and add new test cases or scripts.

Open issues to suggest additional attack vectors or scenarios.

Submit pull requests with enhanced tooling or sample exploit proofs.

Disclaimer

This is a voluntary security research effort and not an official audit. Use these methodologies at your own risk.
