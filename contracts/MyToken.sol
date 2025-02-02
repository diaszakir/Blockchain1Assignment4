// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MyToken is ERC20, Ownable {
    using Strings for uint256;

    event TransactionMade(address indexed sender, address indexed receiver, uint256 amount, uint256 timestamp);

    struct Transaction {
        address sender;
        address receiver;
        uint256 amount;
        uint256 timestamp;
    }
    
    Transaction[] private transactions;
    uint256 public constant MAX_TRANSACTIONS = 1000;
    
    constructor() ERC20("AITUSE-2320", "ATE") Ownable(msg.sender) {
        _mint(msg.sender, 2000 * 10**18);
    }
    
    function transfer(address to, uint256 amount) public override returns (bool) {
        bool success = super.transfer(to, amount);
        if (success) {
            _storeTransaction(msg.sender, to, amount);
        }
        return success;
    }
  
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        bool success = super.transferFrom(from, to, amount);
        if (success) {
            _storeTransaction(from, to, amount);
        }
        return success;
    }
    
    function _storeTransaction(address sender, address receiver, uint256 amount) internal {
        transactions.push(Transaction(sender, receiver, amount, block.timestamp));
        emit TransactionMade(sender, receiver, amount, block.timestamp);
        
        if (transactions.length > MAX_TRANSACTIONS) {
            delete transactions[0];
        }
    }
    
    function getLatestTransactionTime() public view returns (uint256) {
        require(transactions.length > 0, "No transactions yet");
        return transactions[transactions.length - 1].timestamp;
    }
    
    function getLatestTransactionSender() public view returns (address) {
        require(transactions.length > 0, "No transactions yet");
        return transactions[transactions.length - 1].sender;
    }
    
    function getLatestTransactionReceiver() public view returns (address) {
        require(transactions.length > 0, "No transactions yet");
        return transactions[transactions.length - 1].receiver;
    }
}
