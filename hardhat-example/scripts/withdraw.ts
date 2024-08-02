import { ethers } from "hardhat";

async function withdraw() {
  try {
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    const lock = await ethers.getContractAt("Lock", contractAddress);

    lock.withdraw();
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
}

withdraw();
