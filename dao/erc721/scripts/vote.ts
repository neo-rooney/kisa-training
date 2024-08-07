require("dotenv").config();
import { ethers, network } from "hardhat";

const { MY_ERC721_VOTE_CA, MY_GOVERNOR_CA, RECEIVER_PUBLIC_KEY } = process.env;

async function main() {
  try {
    const [owner] = await ethers.getSigners();

    // 컨트랙트 인스턴스 생성
    const MyERC721Vote = await ethers.getContractAt(
      "MyERC721Vote",
      MY_ERC721_VOTE_CA!
    );
    const MyGovernor = await ethers.getContractAt(
      "MyGovernor",
      MY_GOVERNOR_CA!
    );

    await MyERC721Vote.mint(owner.address);
    // 투표권 위임 (제안 생성 전에 수행)
    await MyERC721Vote.connect(owner).delegate(owner.address);
    console.log(`Votes delegated to ${owner.address}`);

    // 제안 생성
    const targets = [MY_ERC721_VOTE_CA!];
    const values = [0];
    const calldatas = [
      MyERC721Vote.interface.encodeFunctionData("mint", [RECEIVER_PUBLIC_KEY!]),
    ];
    const description = "Mint a new NFT to addr2";

    const proposeId = await MyGovernor.hashProposal(
      targets,
      values,
      calldatas,
      ethers.id(description)
    );

    await MyGovernor.propose(targets, values, calldatas, description);

    console.log(`Proposal created with ID: ${proposeId}`);

    // votingDelay 만큼 블록 생성
    const votingDelay = await MyGovernor.votingDelay();
    for (let i = 0; i <= votingDelay; i++) {
      await network.provider.send("evm_mine", []);
    }

    // 현재 블록 번호 가져오기
    let currentBlockNumber = await ethers.provider.getBlockNumber();
    console.log("Current Block Number:", currentBlockNumber);

    // 투표 실행
    const voteTx = await MyGovernor.castVote(proposeId, 1); // 1은 찬성
    await voteTx.wait();

    console.log("Vote cast successfully");

    // votingPeriod 만큼 블록 생성
    const votingPeriod = await MyGovernor.votingPeriod();
    for (let i = 0; i < votingPeriod; i++) {
      await network.provider.send("evm_mine", []);
    }

    currentBlockNumber = await ethers.provider.getBlockNumber();
    console.log("Current Block Number:", currentBlockNumber);

    // 제안의 상태를 확인
    const afterVoteState = await MyGovernor.state(proposeId);
    console.log("Proposal state after voting:", afterVoteState);

    // 제안 상태가 'Succeeded'(4)인지 확인하고, 그렇다면 제안 실행
    if (afterVoteState === BigInt(4)) {
      // 4는 ProposalState.Succeeded 상태를 의미
      const executeTx = await MyGovernor.execute(
        targets,
        values,
        calldatas,
        ethers.id(description)
      );
      await executeTx.wait();

      console.log("Proposal executed successfully");

      // NFT 소유자 확인
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
