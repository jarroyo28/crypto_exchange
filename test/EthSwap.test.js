const { assert } = require("chai");
// Importing smart contract
const Token = artifacts.require("./Token.sol");
const EthSwap = artifacts.require("./EthSwap.sol");

// Configuring chai
require("chai")
  .use(require("chai-as-promised"))
  .should();

// This helpfer function is converting the tokens passed in to Wei
// The smallest denomination of ether
function tokens(n) {
  return web3.utils.toWei(n, "Ether");
}

contract("EthSwap", ([deployer, investor]) => {
  let ethSwap;
  let token;

  // This is basically saying before the tests start,
  // get a copy of the deployed smart contract
  before(async () => {
    token = await Token.new();
    ethSwap = await EthSwap.new(token.address);
    await token.transfer(ethSwap.address, "1000000000000000000000000");
  });

  describe("Token deployment", async () => {
    it("contract has a name", async () => {
      const name = await token.name();
      assert.equal(name, "Astry Token");
    });

    it("deploys successfully", async () => {
      const address = await token.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, "");
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });
  });

  describe("EthSwap deployment", async () => {
    it("contract has a name", async () => {
      const name = await ethSwap.name();
      assert.equal(name, "EthSwap");
    });

    it("deploys successfully", async () => {
      const address = await ethSwap.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, "");
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });

    it("contract has tokens", async () => {
      let balance = await token.balanceOf(ethSwap.address);
      assert.equal(balance.toString(), tokens("1000000"));
    });
  });

  describe("buyTokens()", async () => {
    let result;
    before(async () => {
      // Purchas tokens before each example
      result = await ethSwap.buyTokens({
        from: investor,
        value: web3.utils.toWei("1", "Ether"),
      });
    });

    it("allows user to instantly purchase tokens from ethSwap for a fixed price", async () => {
      // Check investor token balance after purchase
      let investorBalance = await token.balanceOf(investor);
      assert.equal(investorBalance.toString(), tokens("100"));

      // Check ethSwap balance after purchase
      let ethSwapBalance = await token.balanceOf(ethSwap.address);
      assert.equal(ethSwapBalance.toString(), tokens("999900"));
      ethSwapBalance = await web3.eth.getBalance(ethSwap.address);
      assert.equal(ethSwapBalance.toString(), web3.utils.toWei("1", "Ether"));

      // event is storing the emitted arguments that were created when the function was called
      // Now we check to make sure that the information is correct with the tests below
      // Check logs to ensure event was emitted with correct data
      const event = result.logs[0].args;
      assert.equal(event.account, investor);
      assert.equal(event.token, token.address);
      assert.equal(event.amount.toString(), tokens("100").toString());
      assert.equal(event.rate.toString(), "100");
    });
  });

  describe("sellTokens()", async () => {
    let result;
    before(async () => {
      // Investor must approve tokens before the purchase
      await token.approve(ethSwap.address, tokens("100"), { from: investor });
      // Investor sells tokens
      result = await ethSwap.sellTokens(tokens("100"), { from: investor });
    });

    it("allows users to instantly sell tokens to ethSwap for a fixed price", async () => {
      // Check investor token balance after purchase
      let investorBalance = await token.balanceOf(investor);
      assert.equal(investorBalance.toString(), tokens("0"));

      // Check ethSwap balance after purchase
      let ethSwapBalance = await token.balanceOf(ethSwap.address);
      assert.equal(ethSwapBalance.toString(), tokens("1000000"));
      ethSwapBalance = await web3.eth.getBalance(ethSwap.address);
      assert.equal(ethSwapBalance.toString(), web3.utils.toWei("0", "Ether"));

      // Check logs to ensure event was emitted with correct data
      const event = result.logs[0].args;
      assert.equal(event.account, investor);
      assert.equal(event.token, token.address);
      assert.equal(event.amount.toString(), tokens("100").toString());
      assert.equal(event.rate.toString(), "100");

      // FAILURE: investor can't sell more tokens than they have
      await ethSwap.sellTokens(tokens("500"), { from: investor }).should.be
        .rejected;
    });
  });
});
