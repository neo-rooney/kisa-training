import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";

describe("MyGovernor", function () {
  async function MyGovernorFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    // MyERC721Vote 배포
    const MyERC721Vote = await ethers.deployContract("MyERC721Vote");
    const MyERC721VoteCA = await MyERC721Vote.getAddress();

    // MyGovernor 배포 (MyERC721Vote의 주소를 사용하여 IVotes 인터페이스로 초기화)
    const MyGovernor = await ethers.deployContract("MyGovernor", [
      MyERC721VoteCA,
    ]);
    // 초기 설정: NFT 발행 및 투표권 부여
    await MyERC721Vote.connect(owner).mint(owner.address);
    await MyERC721Vote.connect(owner).delegate(owner.address);

    return { MyGovernor, MyERC721Vote, owner, addr1, addr2 };
  }

  it("제안 생성 및 투표 테스트", async () => {
    const { MyGovernor, MyERC721Vote, owner, addr1, addr2 } = await loadFixture(
      MyGovernorFixture
    );

    // 제안 생성
    const targets = [addr1.address];
    const values = [0];
    const calldatas = [
      MyERC721Vote.interface.encodeFunctionData("mint", [addr2.address]),
    ];
    const description = "Mint a new NFT to addr2";

    await MyGovernor.connect(owner).propose(
      targets,
      values,
      calldatas,
      description
    );

    const proposalId = await MyGovernor.hashProposal(
      targets,
      values,
      calldatas,
      ethers.id(description)
    );

    // 제안의 상태를 확인
    const state = await MyGovernor.state(proposalId);
    expect(state).to.equal(0); // 0은 ProposalState.Pending 상태를 의미함

    console.log("Proposal ID:", proposalId);

    // 블록을 생성하여 제안이 Active 상태가 되도록 함
    const votingDelay = await MyGovernor.votingDelay();
    await network.provider.send("evm_mine", []); // 현재 블록
    for (let i = 0; i < votingDelay; i++) {
      await network.provider.send("evm_mine", []); // votingDelay 만큼 블록 생성
    }

    // 제안의 상태를 확인
    const afterDeplayState = await MyGovernor.state(proposalId);
    expect(afterDeplayState).to.equal(1); // 1은 ProposalState.Active 상태를 의미함

    // // 투표 실행: owner가 제안에 대해 "찬성"으로 투표
    await MyGovernor.connect(owner).castVote(proposalId, 1);

    // 투표 기간이 끝날 때까지 블록 생성
    const votingPeriod = await MyGovernor.votingPeriod();
    for (let i = 0; i < votingPeriod; i++) {
      await network.provider.send("evm_mine", []);
    }

    // 제안의 상태를 확인
    const afterVoteState = await MyGovernor.state(proposalId);
    expect(afterVoteState).to.equal(4); // 1은 ProposalState.Succeeded 상태를 의미함

    // 시간 잠금을 넘기기 위해 2일을 증가시킴
    await network.provider.send("evm_increaseTime", [2 * 24 * 60 * 60]);
    await network.provider.send("evm_mine", []); // 블록 생성

    // // // 제안 실행
    // const test = await MyGovernor.connect(owner).executeProposal(
    //   proposalId,
    //   targets,
    //   values,
    //   calldatas,
    //   ethers.id(description)
    // );

    console.log(afterVoteState);

    // // // addr2가 새로운 NFT를 소유하고 있는지 확인
    // expect(await MyERC721Vote.ownerOf(1)).to.equal(addr2.address);
  });
});
