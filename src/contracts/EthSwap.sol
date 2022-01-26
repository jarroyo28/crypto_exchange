pragma solidity ^0.5.0;
// Imported smart contract
import "./Token.sol";

contract EthSwap {
    // public to read this variable value outside of smart contract
    string public name;
    // Creates a variable that represents the token smart contract
    Token public token; 
    // Tells our EthSwap SC where the Token SC is located
    // That's why we pass the address in the constructor whenever we deploy the token
    // to the network
    uint public rate = 100;

    // Can make a transaction history using this emitted information
    event TokenPurchased(
        address account,
        address token,
        uint amount,
        uint rate
    );

    event TokenSold(
        address account,
        address token,
        uint amount,
        uint rate
    );

    constructor(Token _token) public {
        name = 'EthSwap';
        token = _token;
    }

    // Payable allows us to send eth whenever we call this function
    // msg.value would not work if the function wasnt payable
    function buyTokens() public payable {
        // Redemption rate = # of tokens they receive for 1 ether
        // Amount of Ethereum * Redemption Rate
        // msg.value contains the amount of wei sent in the transation
        // Calculate the number of tokens to buy
        uint tokenAmount = msg.value * rate;

        // If someone tries to buy more tokens than the exchange has, it will fail
        // "this" refers to the EthSwap smart contract address
        require(token.balanceOf(address(this)) >= tokenAmount); 

        // Transfers token to the user calling the function
        token.transfer(msg.sender, tokenAmount);

        // Emit an event
        emit TokenPurchased(msg.sender, address(token), tokenAmount, rate);
    }

    function sellTokens(uint _amount) public {
        // User can't sell more tokens than they have
        require(token.balanceOf(msg.sender) >= _amount);
        
        // Calculate the amount of ether to redeem
        uint etherAmount = _amount / rate;

        // Require that EthSwap has enough Ether
        require(address(this).balance >= etherAmount);

        // Peform sale
        token.transferFrom(msg.sender, address(this), _amount);
        msg.sender.transfer(etherAmount);

        // Emit an event
        emit TokenSold(msg.sender, address(token), _amount, rate);
    }
}