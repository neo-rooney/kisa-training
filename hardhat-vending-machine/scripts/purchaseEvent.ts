import { ethers } from "hardhat";
import json from "../artifacts/contracts/VendingMachine.sol/VendingMachine.json";

async function purchaseEvent() {
  try {
    const contractAddress = "0x27c4db64FbBca8CC26E79f773e6899812A2D270D";

    const vendingMachine = await ethers.getContractAt(
      "VendingMachine",
      contractAddress
    );

    const topic = await vendingMachine.filters.Purchase().getTopicFilter();
    const ca = await vendingMachine.getAddress();
    const filter: any = {
      address: ca,
      fromBlock: 0,
      toBlock: 10000000,
      topics: [topic],
    };

    const logs = await ethers.provider.getLogs(filter);
    const abi = json.abi;
    let iface = new ethers.Interface(abi);

    //로그를 분석하기 위해서 abi를 가져옴
    logs.forEach(async (logs) => {
      //실제로 이벤트 로그 내용을 분석하기 위해서는 각각의 트랜잭션 receipt를 가져와서 처리해야 한다.
      const receipt = await ethers.provider.getTransactionReceipt(
        logs.transactionHash
      );
      // console.log("receipt >>>", receipt);
      //반복문을 통해서 각로그들의 내용 출력 진행
      receipt?.logs.forEach((log) => {
        // console.log("iface.parseLog(log) >>", iface.parseLog(log));
        console.log("purchaser >>", iface.parseLog(log)?.args[0]);
        console.log("amount >>", Number(iface.parseLog(log)?.args[1]));
      });
    });
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
}

purchaseEvent();
