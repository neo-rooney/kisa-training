import { ethers } from "hardhat";

async function purchase() {
  try {
    const amount = 10;

    const contractAddress = "0x27c4db64FbBca8CC26E79f773e6899812A2D270D";

    const vendingMachine = await ethers.getContractAt(
      "VendingMachine",
      contractAddress
    );

    const purchase = await vendingMachine.purchase(amount, {
      value: (amount * 10 ** 18).toString(),
    });

    console.log("purchase :", purchase);
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
}

purchase();
