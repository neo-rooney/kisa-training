import { ethers } from "hardhat";

async function purchase() {
  try {
    const amount = 10;

    const contractAddress = "0x27c4db64FbBca8CC26E79f773e6899812A2D270D";

    const vendingMachine = await ethers.getContractAt(
      "VendingMachine",
      contractAddress
    );

    const cupcakePrice = 0.0001;

    const purchase = await vendingMachine.purchase(amount, {
      value: ethers.parseEther((amount * cupcakePrice).toFixed(18)),
    });

    console.log("purchase :", purchase);
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
}

purchase();
