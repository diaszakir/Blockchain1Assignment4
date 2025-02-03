const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken", function () {
  let MyToken, myToken, owner, addr1, addr2;

  beforeEach(async function () {
    MyToken = await ethers.getContractFactory("MyToken");
    [owner, addr1, addr2] = await ethers.getSigners();
    myToken = await MyToken.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await myToken.owner()).to.equal(owner.address);
    });

    it("Should mint initial supply to owner", async function () {
      const ownerBalance = await myToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(ethers.parseUnits("2000", 18));
    });
  });

  describe("Model Marketplace", function () {
    let modelId;

    beforeEach(async function () {
      // List a model before each test
      const tx = await myToken.listModel(
        "Test Model",
        "Description",
        ethers.parseUnits("10", 18)
      );
      const receipt = await tx.wait();

      // Extract modelId from events
      const event = receipt.logs.find(
        (log) => log.fragment.name === "ModelListed"
      );
      modelId = event.args[0];
    });

    it("Should list a new model", async function () {
      const model = await myToken.getModelDetails(modelId);
      expect(model.name).to.equal("Test Model");
      expect(model.description).to.equal("Description");
      expect(model.creator).to.equal(owner.address);
    });

    it("Should allow purchasing a model", async function () {
      // Approve tokens for transfer
      await myToken.approve(myToken.target, ethers.parseUnits("10", 18));

      // Purchase the model
      await myToken.purchaseModel(modelId);

      // Check purchase status
      const purchaseStatus = await myToken.purchases(owner.address, modelId);
      expect(purchaseStatus).to.be.true;
    });

    it("Should allow rating a purchased model", async function () {
      // Approve and purchase model first
      await myToken.approve(myToken.target, ethers.parseUnits("10", 18));
      await myToken.purchaseModel(modelId);

      // Rate the model
      await myToken.rateModel(modelId, 4);

      // Get model details to check rating
      const model = await myToken.getModelDetails(modelId);
      expect(model.averageRating).to.equal(4n);
      expect(model.numberOfRatings).to.equal(1n);
    });
  });

  describe("Error Handling", function () {
    it("Should prevent purchasing without sufficient balance", async function () {
      // List model using BigInt for price
      const listTx = await myToken.listModel(
        "Test Model",
        "Description",
        ethers.toBigInt(ethers.parseUnits("10", 18))
      );
      const receipt = await listTx.wait();
      const event = receipt.logs.find(
        (log) => log.fragment.name === "ModelListed"
      );
      const modelId = event.args[0];

      // Attempt purchase with addr1 (who has no balance)
      await expect(
        myToken.connect(addr1).purchaseModel(modelId)
      ).to.be.revertedWith("Insufficient balance");
    });
  });
});
