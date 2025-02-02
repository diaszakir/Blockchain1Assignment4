import { contractABI } from "./contractABI.js";

const provider = new ethers.providers.Web3Provider(window.ethereum);
let signer;
let userAddress;
const tokenAddress = "0xbC1bEaF5b412cD2fe02B8b055bD80acB7Cd9cd7c";
const tokenContract = new ethers.Contract(tokenAddress, contractABI, provider);

async function connectWallet() {
  if (!window.ethereum) {
    alert("Please install Metamask!");
    return;
  }
  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    signer = provider.getSigner();
    userAddress = await signer.getAddress();
    document.getElementById("walletStatus").innerText =
      "Connected: " + userAddress;
    updateTokenBalance();
  } catch (error) {
    console.error("Connection failed", error);
  }
}

// Получение баланса токенов
async function updateTokenBalance() {
  try {
    const balance = await tokenContract.balanceOf(userAddress);
    document.getElementById(
      "tokenBalance"
    ).innerText = `Balance: ${ethers.utils.formatEther(balance)} ATE`;
  } catch (error) {
    console.error("Error fetching balance", error);
  }
}

// Проверка подключения при загрузке
window.addEventListener("load", async () => {
  if (window.ethereum) {
    provider.send("eth_accounts", []).then(async (accounts) => {
      if (accounts.length > 0) {
        userAddress = accounts[0];
        document.getElementById("walletStatus").innerText =
          "Connected: " + userAddress;
        updateTokenBalance();
      }
    });
  }
});

// Назначаем обработчик кнопки
document
  .getElementById("connectWalletBtn")
  .addEventListener("click", connectWallet);
