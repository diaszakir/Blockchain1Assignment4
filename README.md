# AI Model Marketplace

This project is an AI Model Marketplace that enables users to buy and sell AI models using a custom ERC-20 token. It integrates functionalities from previous assignments, including a Marketplace for AI Models and an ERC-20 Token Smart Contract.

## Features

- **User Authentication and Wallet Integration**: Users can connect their wallets using MetaMask to interact with the blockchain.
- **Token Balance Display**: Displays the user's ERC-20 token balance on the marketplace interface with an option to refresh the balance.
- **AI Model Listings**: Sellers can list AI models for sale by providing model details, price in ERC-20 tokens, and uploading the model file or access link. Buyers can view these listings, including model name, description, price, and seller details.
- **Purchase Flow**: Buyers can purchase AI models by transferring the specified amount of ERC-20 tokens to the seller. The marketplace UI updates to reflect the sale status.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [MetaMask](https://metamask.io/) browser extension
- [Hardhat] (for smart contract development)
- [Ganache](https://www.trufflesuite.com/ganache) (for local blockchain testing)

### Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/diaszakir/Blockchain1Assignment4.git
   cd Blockchain1Assignment4
   ```

2. **Install Dependencies**:

   ```bash
   npm install hardhat
   ```

3. **Deploy Smart Contracts**:

   ```bash
   npx hardhat run scripts/deploy.js --network ganache
   ```

4. **Compile Smart Contracts**:

   ```bash
   npx hardhat compile
   ```

5. **Start the Application**:

   ```bash
   npm start
   ```

   The application will be available at `http://localhost:3000`.

## Usage

1. **Connect Wallet**: Open the application and connect your MetaMask wallet.
2. **View Token Balance**: Your ERC-20 token balance will be displayed on the dashboard.
3. **List an AI Model**:
   - Navigate to the "Sell Model" section.
   - Provide the model name, description, price in ERC-20 tokens, and upload the model file or provide an access link.
   - Submit the listing.
4. **Purchase an AI Model**:
   - Browse the available AI models in the "Marketplace" section.
   - Select a model to view its details.
   - Click "Buy" and confirm the transaction in MetaMask to transfer the specified ERC-20 tokens to the seller.

## Smart Contract Details

- **ERC-20 Token Contract**: Implements a custom ERC-20 token used for transactions within the marketplace.
- **Marketplace Contract**: Manages the listing and sale of AI models, handling the transfer of tokens between buyers and sellers.

## Technologies Used

- **Solidity**: For smart contract development.
- **Hardhat**: Development framework for Ethereum.
- **React**: Frontend library for building the user interface.
- **Web3.js**: JavaScript library for interacting with the Ethereum blockchain.
- **MetaMask**: Browser extension for managing Ethereum wallets.

## References

- [Connecting to MetaMask with Vanilla JS](https://docs.web3js.org/guides/dapps/metamask-vanilla/)
- [OpenZeppelin Contracts Wizard](https://wizard.openzeppelin.com/)

### **Authors & Contributors**
- **Danel Kanbakova / SE-2320**
- **Dias Zakir / SE-2320**
- **Anvar Tamabayev / SE-2320**
- **Astana IT University**


