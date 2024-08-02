import { ethers } from "hardhat";

async function main() {
  try {
    console.log("Start contract deployment");
    const factory = await ethers.getContractFactory("VendingMachine");
    const contract = await factory.deploy();
    const address = await contract.getAddress();

    console.log(`Contract is deployed : ${address}`);
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
}

main();
