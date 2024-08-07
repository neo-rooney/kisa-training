require("dotenv").config();
import { ethers, network } from "hardhat";

const { MY_ERC721_VOTE_CA, MY_GOVERNOR_CA, RECEIVER_PUBLIC_KEY } = process.env;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForBlocks(numBlocks: number, blockTimeInSeconds: number) {
  for (let i = 0; i < numBlocks; i++) {
    console.log(`Waiting for block ${i + 1}/${numBlocks}...`);
    await sleep(blockTimeInSeconds * 1000); // 테스트넷에서의 평균 블록 생성 시간
  }
}

async function sendWithRetry(
  txFunc: () => Promise<any>,
  retries: number = 3
): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const tx = await txFunc();
      const receipt = await tx.wait();
      return receipt;
    } catch (error: any) {
      console.log(`Transaction failed with error: ${error.message}`);
      if (i === retries - 1) throw error;
      console.log(`Retrying... (${i + 1}/${retries})`);
    }
  }
}

async function main() {
  try {
    const [owner] = await ethers.getSigners();

    const MyERC721Vote = await ethers.getContractAt(
      "MyERC721Vote",
      MY_ERC721_VOTE_CA!
    );
    const MyGovernor = await ethers.getContractAt(
      "MyGovernor",
      MY_GOVERNOR_CA!
    );

    // await sendWithRetry(() => MyERC721Vote.mint(owner.address));
    await sendWithRetry(() =>
      MyERC721Vote.connect(owner).delegate(owner.address)
    );
    console.log(`Votes delegated to ${owner.address}`);

    const targets = [MY_ERC721_VOTE_CA!];
    const values = [0];
    const calldatas = [
      MyERC721Vote.interface.encodeFunctionData("mint", [RECEIVER_PUBLIC_KEY!]),
    ];
    const description = "Mint a new NFT to addr!!!";

    const proposeTx = await MyGovernor.propose(
      targets,
      values,
      calldatas,
      description
    );
    const proposeReceipt = await proposeTx.wait();
    const proposeId = await MyGovernor.hashProposal(
      targets,
      values,
      calldatas,
      ethers.id(description)
    );

    console.log(`Proposal created with ID: ${proposeId}`);

    const votingDelay = await MyGovernor.votingDelay();
    const blockTimeInSeconds = 3; // 테스트넷의 평균 블록 생성 시간
    await waitForBlocks(Number(votingDelay), blockTimeInSeconds);
    const voteState = await MyGovernor.state(proposeId);
    console.log("Proposal state:", voteState);

    let currentBlockNumber = await ethers.provider.getBlockNumber();
    console.log("Current Block Number:", currentBlockNumber);

    const voteTx = await MyGovernor.castVote(proposeId, 1); // 1은 찬성
    await voteTx.wait();

    console.log("Vote cast successfully");

    const votingPeriod = await MyGovernor.votingPeriod();
    await waitForBlocks(Number(votingPeriod), blockTimeInSeconds);

    currentBlockNumber = await ethers.provider.getBlockNumber();
    console.log("Current Block Number:", currentBlockNumber);

    const afterVoteState = await MyGovernor.state(proposeId);
    console.log("Proposal state after voting:", afterVoteState);

    if (afterVoteState === BigInt(4)) {
      const executeTx = await MyGovernor.execute(
        targets,
        values,
        calldatas,
        ethers.id(description)
      );
      await executeTx.wait();

      console.log("Proposal executed successfully");
      await waitForBlocks(Number(3), blockTimeInSeconds);
      const newOwner = await MyERC721Vote.ownerOf(1);
      console.log(`New NFT Owner is: ${newOwner}`);
    } else {
      console.log("Proposal did not succeed. Current state:", afterVoteState);
    }
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
}

main();
