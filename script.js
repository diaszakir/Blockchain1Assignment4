import { contractABI } from "./contractABI.js";

let provider, signer, contract;
const contractAddress = "YOUR_CONTRACT_ADDRESS";

async function connectWallet() {
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, abi, signer);

    const address = await signer.getAddress();
    document.getElementById("walletAddress").innerText = address;
    updateBalance();
  } else {
    alert("Metamask not found!");
  }
}

async function updateBalance() {
  if (!contract) return;
  const address = await signer.getAddress();
  const balance = await contract.balanceOf(address);
  document.getElementById("tokenBalance").innerText =
    ethers.utils.formatEther(balance);
}

document
  .getElementById("connectWallet")
  .addEventListener("click", connectWallet);
