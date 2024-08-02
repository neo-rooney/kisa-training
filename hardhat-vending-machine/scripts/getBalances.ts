import { ethers } from "hardhat";

async function getBalance() {
  try {
    const contractAddress = "0x27c4db64FbBca8CC26E79f773e6899812A2D270D";

    const vendingMachine = await ethers.getContractAt(
      "VendingMachine",
      contractAddress
    );

    let balance = await vendingMachine.cupcakeBalances(contractAddress);
    console.log("Cupcake balance of contract:", balance.toString());
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
}

getBalance();
