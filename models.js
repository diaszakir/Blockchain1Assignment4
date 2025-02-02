import { contractABI } from "./contractABI.js";

const provider = new ethers.providers.Web3Provider(window.ethereum);
let signer;
let userAddress;
const tokenAddress = "0x11Bd08fD03cE9169A268BD172d65BD725efDc8EE";
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

function handleRateModel() {
  const modelId = parseInt(document.getElementById("rate-model-id").value);
  const rating = parseInt(document.getElementById("rate-value").value);

  if (!modelId || rating < 1 || rating > 5) {
    alert("Please enter a valid Model ID and a rating between 1 and 5.");
    return;
  }

  rateModel(modelId, rating);
}

async function rateModel(modelId, rating) {
  try {
    const signer = await provider.getSigner();
    const contractWithSigner = tokenContract.connect(signer);

    console.log(`Rating model ${modelId} with ${rating} stars...`);

    let tx = await contractWithSigner.rateModel(modelId, rating);
    await tx.wait();

    alert(`You rated Model ${modelId} with ${rating} stars!`);

    updateModelRating(modelId);
  } catch (error) {
    console.error("Rating failed:", error);
    alert("Rating failed: " + (error.data?.message || error.message));
  }
}

// Функция для обновления рейтинга модели в интерфейсе
async function updateModelRating(modelId) {
  try {
    const modelDetails = await tokenContract.getModelDetails(modelId);
    const averageRating = modelDetails[4]; // Средний рейтинг (делится в контракте)

    document.getElementById(
      `model-rating-${modelId}`
    ).innerText = `Rating: ${averageRating}/5`;
  } catch (error) {
    console.error("Failed to update rating:", error);
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

async function getModelDetailsUI() {
  const modelId = document.getElementById("model-id-input").value;

  if (!modelId) {
    alert("Please enter a valid Model ID.");
    return;
  }

  try {
    const modelDetails = await tokenContract.getModelDetails(modelId);

    document.getElementById("model-name").innerText = modelDetails[0];
    document.getElementById("model-description").innerText = modelDetails[1];
    document.getElementById("model-price").innerText = modelDetails[2];
    document.getElementById("model-creator").innerText = modelDetails[3];
    document.getElementById("model-average-rating").innerText = modelDetails[4];
    document.getElementById("model-ratings-count").innerText = modelDetails[5];

    document.getElementById("model-info").style.display = "block";
  } catch (error) {
    console.error("Failed to fetch model details:", error);
    alert("Error fetching model details.");
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
document
  .getElementById("rate-button")
  .addEventListener("click", handleRateModel);
document
  .getElementById("model_button")
  .addEventListener("click", getModelDetailsUI);

export {
  connectWallet,
  listModel,
  purchaseModel,
  rateModel,
  getModelDetails,
  loadModels,
  withdrawFunds,
};
