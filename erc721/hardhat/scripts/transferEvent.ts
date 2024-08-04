require("dotenv").config();
const { CA, RECEIVER_PUBLIC_KEY } = process.env;
import { ethers } from "hardhat";
import json from "../artifacts/contracts/MyERC721.sol/MyERC721.json";

async function purchaseEvent() {
  try {
    const contractAddress = CA!;

    const ERC721 = await ethers.getContractAt("MyERC721", contractAddress);

    const topic = await ERC721.filters.Transfer().getTopicFilter();
    const filter: any = {
      address: contractAddress,
      fromBlock: 0,
      toBlock: 10000000,
      topics: [topic],
    };

    const logs = await ethers.provider.getLogs(filter);
    const abi = json.abi;
    let iface = new ethers.Interface(abi);

    logs.forEach(async (logs) => {
      const receipt = await ethers.provider.getTransactionReceipt(
        logs.transactionHash
      );
      receipt?.logs.forEach((log) => {
        const parsedLog = iface.parseLog(log);
        if (parsedLog?.topic === topic[0]) {
          console.log("from >>", iface.parseLog(log)?.args.from);
          console.log("to >>", iface.parseLog(log)?.args.to);
          console.log(
            "tokenId >>",
            iface.parseLog(log)?.args.tokenId.toString()
          );
        }
      });
    });
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
}

purchaseEvent();
