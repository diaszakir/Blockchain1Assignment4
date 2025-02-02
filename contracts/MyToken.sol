// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MyToken is ERC20, Ownable {
    using Strings for uint256;

    event TransactionMade(address indexed sender, address indexed receiver, uint256 amount, uint256 timestamp);
    event ModelListed(uint256 indexed modelId, string name, address indexed creator);
    event ModelPurchased(uint256 indexed modelId, address indexed buyer);
    event ModelRated(uint256 indexed modelId, address indexed rater, uint8 rating);

    struct Transaction {
        address sender;
        address receiver;
        uint256 amount;
        uint256 timestamp;
    }

    struct AIModel {
        string name;
        string description;
        uint256 price;
        address creator;
        uint256 totalRatings;
        uint256 ratingSum;
        uint256 numberOfRatings;
        bool exists;
    }
    
    Transaction[] private transactions;
    uint256 public constant MAX_TRANSACTIONS = 1000;
    
    mapping(uint256 => AIModel) public models;
    mapping(address => mapping(uint256 => bool)) public purchases;
    mapping(address => mapping(uint256 => bool)) public hasRated;
    uint256 private nextModelId = 1;
    
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

    // New marketplace functions
    function listModel(string memory name, string memory description, uint256 price) public returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(price > 0, "Price must be greater than 0");
        
        uint256 modelId = nextModelId++;
        models[modelId] = AIModel({
            name: name,
            description: description,
            price: price,
            creator: msg.sender,
            totalRatings: 0,
            ratingSum: 0,
            numberOfRatings: 0,
            exists: true
        });
        
        emit ModelListed(modelId, name, msg.sender);
        return modelId;
    }

    function purchaseModel(uint256 modelId) public {
        require(models[modelId].exists, "Model does not exist");
        require(!purchases[msg.sender][modelId], "Already purchased this model");
        require(balanceOf(msg.sender) >= models[modelId].price, "Insufficient balance");

        AIModel storage model = models[modelId];

        // Проверяем, что маркетплейс одобрен на снятие токенов
        uint256 allowance = allowance(msg.sender, address(this));
        require(allowance >= model.price, "Approve the marketplace to spend tokens");

        // Переводим токены через transferFrom
        _transfer(msg.sender, model.creator, model.price);

        // Фиксируем покупку
        purchases[msg.sender][modelId] = true;

        emit ModelPurchased(modelId, msg.sender);
    }


    function rateModel(uint256 modelId, uint8 rating) public {
        require(models[modelId].exists, "Model does not exist");
        require(purchases[msg.sender][modelId], "Must purchase before rating");
        require(!hasRated[msg.sender][modelId], "Already rated this model");
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");

        AIModel storage model = models[modelId];
        model.ratingSum += rating;
        model.numberOfRatings++;
        hasRated[msg.sender][modelId] = true;

        emit ModelRated(modelId, msg.sender, rating);
    }


    function withdrawFunds() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    function getModelDetails(uint256 modelId) public view returns (
        string memory name,
        string memory description,
        uint256 price,
        address creator,
        uint256 averageRating,
        uint256 numberOfRatings
    ) {
        require(models[modelId].exists, "Model does not exist");
        
        AIModel storage model = models[modelId];
        averageRating = model.numberOfRatings > 0 ? model.ratingSum / model.numberOfRatings : 0;
        
        return (
            model.name,
            model.description,
            model.price,
            model.creator,
            averageRating,
            model.numberOfRatings
        );
    }
}