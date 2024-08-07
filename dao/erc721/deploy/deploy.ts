import { ethers } from "hardhat";

async function main() {
  console.log("Start MyERC721Vote contract deployment");

  // Deploy MyERC721Vote contract
  const erc721Factory = await ethers.getContractFactory("MyERC721Vote");
  const erc721Contract = await erc721Factory.deploy();

  // 배포 트랜잭션이 완료될 때까지 대기
  await erc721Contract.deploymentTransaction()?.wait();

  const erc721Address = await erc721Contract.getAddress();
  console.log(`MyERC721Vote Contract is deployed: ${erc721Address}`);

  console.log("Start MyGovernor contract deployment");

  // Deploy MyGovernor contract with the address of the deployed MyERC721Vote contract
  const governorFactory = await ethers.getContractFactory("MyGovernor");
  const governorContract = await governorFactory.deploy(erc721Address);

  // 배포 트랜잭션이 완료될 때까지 대기
  await governorContract.deploymentTransaction()?.wait();

  const governorAddress = await governorContract.getAddress();
  console.log(`MyGovernor Contract is deployed: ${governorAddress}`);

  // Grant MINTER_ROLE to the MyGovernor contract
  const MINTER_ROLE = await erc721Contract.MINTER_ROLE();

  const tx = await erc721Contract.grantRole(MINTER_ROLE, governorAddress);

  // Role 부여 트랜잭션이 완료될 때까지 대기
  await tx.wait();

  console.log(`Granted MINTER_ROLE to MyGovernor contract`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
