import { ethers } from "hardhat";

async function main() {
  console.log("Start contract deployment");
  const factory = await ethers.getContractFactory("MyERC721");
  const contract = await factory.deploy();
  const address = await contract.getAddress();

  console.log(`Contract is deployed : ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
