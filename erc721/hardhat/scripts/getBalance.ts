require("dotenv").config();
const { CA, OWNER_PUBLIC_KEY } = process.env;
import { ethers } from "hardhat";

async function getBalance() {
  try {
    const contractAddress = CA!;
    const ERC721 = await ethers.getContractAt("MyERC721", contractAddress);

    let balance = await ERC721.balanceOf(OWNER_PUBLIC_KEY!);

    console.log(`NFT Balance of ${OWNER_PUBLIC_KEY} is ${balance}`);
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
}

getBalance();
