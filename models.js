import { contractABI } from "./contractABI.js";

const provider = new ethers.providers.Web3Provider(window.ethereum);
let signer;
let userAddress;
const tokenAddress = "0xCEE6698aEB179fC77859C2223f988239D47f95F5";
let tokenContract = new ethers.Contract(tokenAddress, contractABI, provider);

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
    loadModels(); // Load models after connecting
  } catch (error) {
    console.error("Connection failed", error);
  }
}

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

async function listModel(event) {
  event.preventDefault();
  try {
    if (!signer) {
      alert("Please connect your wallet first!");
      return;
    }

    const name = document.getElementById("modelName").value;
    const description = document.getElementById("modelDescription").value;
    const price = document.getElementById("modelPrice").value;

    const contractWithSigner = tokenContract.connect(signer);
    const priceInWei = ethers.utils.parseEther(price.toString());

    const tx = await contractWithSigner.listModel(
      name,
      description,
      priceInWei
    );
    await tx.wait();

    alert("Model listed successfully!");
    document.getElementById("listModelForm").reset();
    loadModels();
  } catch (error) {
    console.error("Error listing model:", error);
    alert("Failed to list model: " + error.message);
  }
}

async function purchaseModel() {
  try {
    const button = document.getElementById("purchase-button");
    const status = document.getElementById("purchase-status");
    const input = document.getElementById("purchase-model-id");

    if (!signer) {
      alert("Please connect your wallet first!");
      return;
    }

    const modelId = input.value.trim();
    if (!modelId) {
      alert("Please enter a valid Model ID.");
      return;
    }

    button.disabled = true;
    button.innerText = "Processing...";
    status.style.display = "none";

    const contractWithSigner = tokenContract.connect(signer);

    const modelDetails = await tokenContract.getModelDetails(modelId);
    const modelPrice = modelDetails[2];

    const userBalance = await tokenContract.balanceOf(userAddress);
    if (userBalance.lt(modelPrice)) {
      alert("Insufficient balance to purchase this model.");
      button.disabled = false;
      button.innerText = "Purchase";
      return;
    }

    const txApprove = await contractWithSigner.approve(
      tokenAddress,
      modelPrice
    );
    await txApprove.wait();

    const txPurchase = await contractWithSigner.purchaseModel(modelId);
    await txPurchase.wait();

    status.innerText = "Model purchased successfully!";
    status.style.display = "block";

    updateTokenBalance();
    loadModels();
  } catch (error) {
    console.error("Error purchasing model:", error);
    alert("Failed to purchase model: " + error.message);
  } finally {
    button.disabled = false;
    button.innerText = "Purchase";
  }
}

async function rateModel() {
  try {
    if (!signer) {
      alert("Please connect your wallet first!");
      return;
    }

    const modelId = document.getElementById("rate-model-id").value;
    const rating = document.getElementById("rating").value;

    if (rating < 1 || rating > 5) {
      alert("Rating must be between 1 and 5");
      return;
    }

    const contractWithSigner = tokenContract.connect(signer);
    const tx = await contractWithSigner.rateModel(modelId, rating);
    await tx.wait();

    alert("Rating submitted successfully!");
    document.getElementById("rate-model-id").value = "";
    document.getElementById("rating").value = "";
    loadModels();
  } catch (error) {
    console.error("Error rating model:", error);
    alert("Failed to submit rating: " + error.message);
  }
}

async function getModelDetails() {
  try {
    const modelId = document.getElementById("details-model-id").value;
    const details = await tokenContract.getModelDetails(modelId);

    const modelInfo = document.getElementById("model-info");
    modelInfo.innerHTML = `
            <div class="model-details">
                <p><strong>Name:</strong> ${details[0]}</p>
                <p><strong>Description:</strong> ${details[1]}</p>
                <p><strong>Price:</strong> ${ethers.utils.formatEther(
                  details[2]
                )} ATE</p>
                <p><strong>Creator:</strong> ${details[3]}</p>
                <p><strong>Average Rating:</strong> ${details[4].toNumber()}/5</p>
                <p><strong>Number of Ratings:</strong> ${details[5].toNumber()}</p>
            </div>
        `;
  } catch (error) {
    console.error("Error fetching model details:", error);
    document.getElementById("model-info").innerHTML =
      "Error fetching model details";
  }
}

async function withdrawFunds() {
  try {
    if (!signer) {
      alert("Please connect your wallet first!");
      return;
    }

    const contractWithSigner = tokenContract.connect(signer);
    const tx = await contractWithSigner.withdrawFunds();
    await tx.wait();

    alert("Funds withdrawn successfully!");
    updateTokenBalance();
  } catch (error) {
    console.error("Error withdrawing funds:", error);
    alert("Failed to withdraw funds: " + error.message);
  }
}

async function loadModels() {
  try {
    const modelsContainer = document.getElementById("modelsContainer");
    modelsContainer.innerHTML = "";

    for (let i = 1; i < 5; i++) {
      try {
        const details = await tokenContract.getModelDetails(i);
        const li = document.createElement("li");
        li.className = "model-item";
        li.innerHTML = `
                    <div class="model-card">
                        <h3>${details[0]}</h3>
                        <p>${details[1]}</p>
                        <p>Price: ${ethers.utils.formatEther(
                          details[2]
                        )} ATE</p>
                        <p>Creator: ${details[3]}</p>
                        <p>Rating: ${details[4].toNumber()}/5 (${details[5].toNumber()} ratings)</p>
                        <div class="model-id">ID: ${i}</div>
                    </div>
                `;
        modelsContainer.appendChild(li);
      } catch (error) {
        console.error(`Error loading model ${i}:`, error);
      }
    }
  } catch (error) {
    console.error("Error loading models:", error);
  }
}

// Event listeners
window.addEventListener("load", async () => {
  if (window.ethereum) {
    provider.send("eth_accounts", []).then(async (accounts) => {
      if (accounts.length > 0) {
        userAddress = accounts[0];
        document.getElementById("walletStatus").innerText =
          "Connected: " + userAddress;
        updateTokenBalance();
        loadModels();
      }
    });
  }
});

document
  .getElementById("connectWalletBtn")
  .addEventListener("click", connectWallet);
document.getElementById("listModelForm").addEventListener("submit", listModel);
document
  .getElementById("purchase-button")
  .addEventListener("click", purchaseModel);

export {
  connectWallet,
  listModel,
  purchaseModel,
  rateModel,
  getModelDetails,
  loadModels,
  withdrawFunds,
};
