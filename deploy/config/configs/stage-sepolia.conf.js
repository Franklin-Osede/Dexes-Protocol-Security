const { ZERO_ADDR, PRECISION } = require("../../../scripts/utils/constants.js");
const { wei } = require("../../../scripts/utils/utils.js");

const { getBytesPolynomialPowerInit } = require("../utils.js");

const owners = ["0x04130F8679394e3A8d55568F2189c3F3BF48ecbb"];

const tokens = {
  DEXE: "0xC65901190eC6727f979C995EC718e28BFF74563a",
  BUSD: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06",
  USDT: "0x6f14C02Fc1F78322cFd7d707aB90f18baD3B54f5",
  BABT: "0xCd365455653A2E966Ad98939D0C64b7aD6f30b4C",
  WBNB: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
};

const uniswap = {
  router: "0x8bc7BA2e98c660819f74eD4B4759689BBC6cB041",
  quoter: "0xed1f6473345f45b75f8179591dd5ba1888cf2fb3",
};

const NETWORK_PROPERTIES_CONTRACT_NAME = "ETHProperties";

const DEXE_DAO_NAME = "DeXe Protocol";

const DOCUMENT_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";

const DEFAULT_CORE_PROPERTIES = {
  govVotesLimit: 50,
  govCommissionPercentage: PRECISION.times(30).toFixed(),
  tokenSaleProposalCommissionPercentage: PRECISION.toFixed(),
  micropoolVoteRewardsPercentage: PRECISION.times(20).toFixed(),
  treasuryVoteRewardsPercentage: PRECISION.times(1.618).toFixed(),
};

const DEFAULT_POOL_TYPES = [
  ["0", uniswap.router, "0"],
  ["1", uniswap.quoter, "100"],
  ["1", uniswap.quoter, "500"],
  ["1", uniswap.quoter, "2500"],
  ["1", uniswap.quoter, "10000"],
];

const POOL_PARAMETERS = {
  settingsParams: {
    proposalSettings: [
      {
        earlyCompletion: true,
        delegatedVotingAllowed: false,
        validatorsVote: false,
        duration: 432000, // 5 days
        durationValidators: 432000, // 5 days
        quorum: PRECISION.times("5").toFixed(), // 5%
        quorumValidators: PRECISION.times("51").toFixed(), // 51%
        minVotesForVoting: wei("13"), // 13 votes
        minVotesForCreating: wei("10000"), // 10000 votes
        executionDelay: 1800, // 30 mins
        rewardsInfo: {
          rewardToken: ZERO_ADDR,
          creationReward: 0,
          executionReward: 0,
          voteRewardsCoefficient: 0,
        },
        executorDescription: "default",
      },
      {
        earlyCompletion: true,
        delegatedVotingAllowed: false,
        validatorsVote: false,
        duration: 432000, // 5 days
        durationValidators: 432000, // 5 days
        quorum: PRECISION.times("5").toFixed(), // 5%
        quorumValidators: PRECISION.times("51").toFixed(), // 51%
        minVotesForVoting: wei("13"), // 13 votes
        minVotesForCreating: wei("10000"), // 10000 votes
        executionDelay: 1800, // 30 mins
        rewardsInfo: {
          rewardToken: ZERO_ADDR,
          creationReward: 0,
          executionReward: 0,
          voteRewardsCoefficient: 0,
        },
        executorDescription: "internal",
      },
      {
        earlyCompletion: true,
        delegatedVotingAllowed: false,
        validatorsVote: false,
        duration: 432000, // 5 days
        durationValidators: 432000, // 5 days
        quorum: PRECISION.times("5").toFixed(), // 5%
        quorumValidators: PRECISION.times("51").toFixed(), // 51%
        minVotesForVoting: wei("13"), // 13 votes
        minVotesForCreating: wei("10000"), // 10000 votes
        executionDelay: 1800, // 30 mins
        rewardsInfo: {
          rewardToken: ZERO_ADDR,
          creationReward: 0,
          executionReward: 0,
          voteRewardsCoefficient: 0,
        },
        executorDescription: "validators",
      },
    ],
    additionalProposalExecutors: [],
  },
  validatorsParams: {
    name: "DEXE Validator Token",
    symbol: "DEXEVT",
    proposalSettings: {
      duration: 432000, // 5 days
      executionDelay: 1800, // 30 mins
      quorum: PRECISION.times("51").toFixed(), // 51%
    },
    validators: [],
    balances: [],
  },
  userKeeperParams: {
    tokenAddress: tokens.DEXE,
    nftAddress: ZERO_ADDR,
    individualPower: 0,
    nftsTotalSupply: 0,
  },
  tokenParams: {
    name: "",
    symbol: "",
    users: [],
    cap: 0,
    mintedTotal: 0,
    amounts: [],
  },
  votePowerParams: {
    voteType: 1,
    initData: getBytesPolynomialPowerInit(PRECISION.times("1.08"), PRECISION.times("0.92"), PRECISION.times("0.97")),
    presetAddress: ZERO_ADDR,
  },
  verifier: ZERO_ADDR,
  onlyBABTHolders: false,
  descriptionURL: "",
  name: DEXE_DAO_NAME,
};

const DP_SETTINGS = {
  earlyCompletion: false,
  delegatedVotingAllowed: true,
  validatorsVote: false,
  duration: 432000, // 5 days
  durationValidators: 432000, // 5 days
  quorum: PRECISION.times("5").toFixed(), // 5%
  quorumValidators: PRECISION.times("51").toFixed(), // 51%
  minVotesForVoting: wei("13"), // 13 votes
  minVotesForCreating: wei("10000"), // 10000 votes
  executionDelay: 1800, // 30 mins
  rewardsInfo: {
    rewardToken: ZERO_ADDR,
    creationReward: 0,
    executionReward: 0,
    voteRewardsCoefficient: 0,
  },
  executorDescription: "distribution-proposal",
};

const TOKENSALE_SETTINGS = {
  earlyCompletion: true,
  delegatedVotingAllowed: false,
  validatorsVote: false,
  duration: 432000, // 5 days
  durationValidators: 432000, // 5 days
  quorum: PRECISION.times("5").toFixed(), // 5%
  quorumValidators: PRECISION.times("51").toFixed(), // 51%
  minVotesForVoting: wei("13"), // 13 votes
  minVotesForCreating: wei("10000"), // 10000 votes
  executionDelay: 1800, // 30 mins
  rewardsInfo: {
    rewardToken: ZERO_ADDR,
    creationReward: 0,
    executionReward: 0,
    voteRewardsCoefficient: 0,
  },
  executorDescription: "tokensale-proposal",
};

module.exports = {
  owners,
  tokens,
  uniswap,
  NETWORK_PROPERTIES_CONTRACT_NAME,
  DEXE_DAO_NAME,
  DOCUMENT_HASH,
  DEFAULT_CORE_PROPERTIES,
  DEFAULT_POOL_TYPES,
  POOL_PARAMETERS,
  DP_SETTINGS,
  TOKENSALE_SETTINGS,
};
