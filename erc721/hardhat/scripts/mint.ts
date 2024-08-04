require("dotenv").config();
const { CA, RECEIVER_PUBLIC_KEY } = process.env;
import { ethers } from "hardhat";

async function getBalance() {
  try {
    const contractAddress = CA!;
    const ERC721 = await ethers.getContractAt("MyERC721", contractAddress);

    const mint = await ERC721.mint(RECEIVER_PUBLIC_KEY!);
    console.log("mint :", mint);

    const numebr1NftOwnerAddresss = await ERC721.ownerOf("1");
    console.log(`NFT 1 owner is ${numebr1NftOwnerAddresss}`);
    console.log(`RECEIVER_PUBLIC_KEY is ${RECEIVER_PUBLIC_KEY}`);
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
}

getBalance();
