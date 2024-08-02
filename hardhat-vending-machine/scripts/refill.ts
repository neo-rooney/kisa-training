import { ethers } from "hardhat";

async function purchase() {
  try {
    const amount = 1;

    const contractAddress = "0x27c4db64FbBca8CC26E79f773e6899812A2D270D";

    const vendingMachine = await ethers.getContractAt(
      "VendingMachine",
      contractAddress
    );

    await vendingMachine.refill(amount);

    const balanceBigInt = await vendingMachine.cupcakeBalances(contractAddress);

    const balanceNumber = Number(balanceBigInt);
    console.log("balance >>", balanceNumber);
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
}

purchase();
