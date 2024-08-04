require("dotenv").config();
const { CA, OWNER_PUBLIC_KEY, RECEIVER_PUBLIC_KEY } = process.env;
import { ethers } from "hardhat";

async function getBalance() {
  try {
    const contractAddress = CA!;
    const ERC721 = await ethers.getContractAt("MyERC721", contractAddress);
    const tokenId = "0";

    const transfer = await ERC721.transferFrom(
      OWNER_PUBLIC_KEY!,
      RECEIVER_PUBLIC_KEY!,
      tokenId
    );

    const numebr1NftOwnerAddresss = await ERC721.ownerOf(tokenId);
    console.log("transfer :", transfer);
    console.log(`NFT ${tokenId} owner is ${numebr1NftOwnerAddresss}`);
    console.log(`RECEIVER_PUBLIC_KEY is ${RECEIVER_PUBLIC_KEY}`);
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
}

getBalance();
