import React, { Component } from "react";
import Web3 from "web3";
import "./App.css";
import Main from "./Main";
import Navbar from "./Navbar";
import Token from "../abis/Token.json";
import EthSwap from "../abis/EthSwap.json";

class App extends Component {
  constructor() {
    super();
    this.state = {
      account: "",
      token: {},
      ethSwap: {},
      ethBalance: 0,
      tokenBalance: 0,
      loading: true,
    };
    this.buyTokens = this.buyTokens.bind(this);
    this.sellTokens = this.sellTokens.bind(this);
  }

  async componentDidMount() {
    await this.loadWeb3();
    await this.loadBlockChainData();
    // console.log(window.web3); // check to see if we have our web3 instance
  }

  // Pulls the ethereum provider from metamask and exposes it to our app
  async loadWeb3() {
    if (window.ethereum) {
      // Modern web browsers have this
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      // Legacy web browsers have this
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }

  async loadBlockChainData() {
    const web3 = window.web3;
    // Fetch account we are connected with inside of metamask
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    // Fetch the balance of the account connected
    const ethBalance = await web3.eth.getBalance(this.state.account);
    this.setState({ ethBalance });

    // Create a JS version of the smart contract
    // abi tells us how the SC works
    // address is where that SC is on the blockchain

    // Load Token
    const networkId = await web3.eth.net.getId();
    const tokenData = Token.networks[networkId];

    if (tokenData) {
      const token = new web3.eth.Contract(Token.abi, tokenData.address);
      this.setState({ token });
      // need to use the call method to fetch information from the blockchain
      let tokenBalance = await token.methods
        .balanceOf(this.state.account)
        .call();
      this.setState({ tokenBalance: tokenBalance.toString() });
    } else {
      window.alert("Token contract not deployed to detected network");
    }

    // Load EthSwap
    const ethSwapData = EthSwap.networks[networkId];

    if (ethSwapData) {
      const ethSwap = new web3.eth.Contract(EthSwap.abi, ethSwapData.address);
      this.setState({ ethSwap });
    } else {
      window.alert("EthSwap contract not deployed to detected network");
    }

    this.setState({ loading: false });
  }

  buyTokens = async (etherAmount) => {
    this.setState({ loading: true });
    await this.state.ethSwap.methods
      .buyTokens()
      .send({ from: this.state.account, value: etherAmount })
      .on("transactionHash", (hash) => {
        this.setState({ loading: false });
      });
  };

  // There is a timing delay between approving and selling the token
  // The second call is wrapped in a delay, 1sec delay between the 2nd call is working fine
  sellTokens = (tokenAmount) => {
    this.setState({ loading: true });
    this.state.token.methods
      .approve(this.state.ethSwap.address, tokenAmount)
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        delayedCallback(this, hash);
      });

    function delayedCallback(obj, hash) {
      console.log("in delay", obj.state.account);
      window.setTimeout(() => {
        console.log("approval", hash);
        obj.state.ethSwap.methods
          .sellTokens(tokenAmount)
          .send({ from: obj.state.account })
          .on("transactionHash", (hash) => {
            obj.setState({ loading: false });
          });
      }, 1000);
    }
  };

  render() {
    let content;
    if (this.state.loading) {
      content = (
        <p id="loader" className="text-center">
          Loading...
        </p>
      );
    } else {
      content = (
        <Main
          ethBalance={this.state.ethBalance}
          tokenBalance={this.state.tokenBalance}
          buyTokens={this.buyTokens}
          sellTokens={this.sellTokens}
        />
      );
    }
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main
              role="main"
              className="col-lg-12 ml-auto mr-auto"
              style={{ maxWidth: "600px" }}
            >
              <div className="content mr-auto ml-auto">{content}</div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
