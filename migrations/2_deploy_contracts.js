const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

module.exports = async function(deployer) {
  // Deploy Token
  await deployer.deploy(Token);
  // Fetch token smart contract
  const token = await Token.deployed();

  // Deploy EthSwap
  await deployer.deploy(EthSwap, token.address);
  // Fetch ethSwap smart contract
  const ethSwap = await EthSwap.deployed();

  // Transfer all tokens to EthSwap (1 million)
  // Originally the address that deployed that SC was given all the tokens
  // but we want the EthSwap exchange to actually have them
  await token.transfer(ethSwap.address, "1000000000000000000000000");
};
// Takes our SC and puts it on the blockchain
