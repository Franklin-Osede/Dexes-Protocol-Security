const getConfig = () => {
  if (process.env.ENVIRONMENT == "PROD") {
    return require("./configs/prod.conf.js");
  }

  if (process.env.ENVIRONMENT == "STAGE") {
    return require("./configs/stage.conf.js");
  }

  if (process.env.ENVIRONMENT == "DEV") {
    return require("./configs/dev.conf.js");
  }

  if (process.env.ENVIRONMENT == "PROD_ETH") {
    return require("./configs/prod-ethereum.conf.js");
  }

  if (process.env.ENVIRONMENT == "STAGE_SEPOLIA") {
    return require("./configs/stage-sepolia.conf.js");
  }

  if (process.env.ENVIRONMENT == "DEV_SEPOLIA") {
    return require("./configs/dev-sepolia.conf.js");
  }

  if (process.env.ENVIRONMENT == "DEV_AMOY") {
    return require("./configs/dev-amoy.conf.js");
  }

  if (process.env.ENVIRONMENT == "DEV_OPTIMISM") {
    return require("./configs/dev-optimism.conf.js");
  }

  if (process.env.ENVIRONMENT == "DEV_BASE") {
    return require("./configs/dev-base.conf.js");
  }

  throw Error("No environment config specified");
};

const getBytesPolynomialPowerInit = (k1, k2, k3) => {
  return web3.eth.abi.encodeFunctionCall(
    {
      name: "__PolynomialPower_init",
      type: "function",
      inputs: [
        {
          type: "uint256",
          name: "k1",
        },
        {
          type: "uint256",
          name: "k2",
        },
        {
          type: "uint256",
          name: "k3",
        },
      ],
    },
    [k1, k2, k3],
  );
};

const getBytesContractsRegistryInit = () => {
  return web3.eth.abi.encodeFunctionCall(
    {
      name: "__MultiOwnableContractsRegistry_init",
      type: "function",
      inputs: [],
    },
    [],
  );
};

const getBytesDexeMultiplierInit = (multiplierName, multiplierSymbol) => {
  return web3.eth.abi.encodeFunctionCall(
    {
      name: "__ERC721Multiplier_init",
      type: "function",
      inputs: [
        {
          type: "string",
          name: "name",
        },
        {
          type: "string",
          name: "symbol",
        },
      ],
    },
    [multiplierName, multiplierSymbol],
  );
};

const getBytesNetworkPropertiesInit = (wethAddress) => {
  return web3.eth.abi.encodeFunctionCall(
    {
      name: "__NetworkProperties_init",
      type: "function",
      inputs: [
        {
          type: "address",
          name: "weth_",
        },
      ],
    },
    [wethAddress],
  );
};

const getBytesTokenAllocatorInit = () => {
  return web3.eth.abi.encodeFunctionCall(
    {
      name: "__TokenAllocator_init",
      type: "function",
      inputs: [],
    },
    [],
  );
};

module.exports = {
  getConfig,
  getBytesPolynomialPowerInit,
  getBytesContractsRegistryInit,
  getBytesDexeMultiplierInit,
  getBytesNetworkPropertiesInit,
  getBytesTokenAllocatorInit,
};
