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

    return { MyGovernor, MyERC721Vote, owner, addr1, addr2, MyERC721VoteCA };
  }

  it("제안 생성 및 투표 테스트", async () => {
    const { MyGovernor, MyERC721Vote, owner, addr1, addr2, MyERC721VoteCA } =
      await loadFixture(MyGovernorFixture);

    // 제안 생성
    const targets = [MyERC721VoteCA];
    const values = [0];
    const calldatas = [
      MyERC721Vote.interface.encodeFunctionData("mint", [addr2.address]),
    ];
    const description = "Mint a new NFT to addr2";

    const proposeId = await MyGovernor.hashProposal(
      targets,
      values,
      calldatas,
      ethers.id(description)
    );

    let proposeTx = await MyGovernor.propose(
      targets,
      values,
      calldatas,
      description
    );

    // // 제안의 상태를 확인
    const state = await MyGovernor.state(proposeId);
    expect(state).to.equal(0); // 0은 ProposalState.Pending 상태를 의미함

    // // 블록을 생성하여 제안이 Active 상태가 되도록 함
    const votingDelay = await MyGovernor.votingDelay();
    await network.provider.send("evm_mine", []); // 현재 블록
    for (let i = 0; i < votingDelay; i++) {
      await network.provider.send("evm_mine", []); // votingDelay 만큼 블록 생성
    }

    // // 제안의 상태를 확인
    const afterDeplayState = await MyGovernor.state(proposeId);
    expect(afterDeplayState).to.equal(1); // 1은 ProposalState.Active 상태를 의미함

    // // 투표 실행: owner가 제안에 대해 "찬성"으로 투표
    await MyGovernor.connect(owner).castVote(proposeId, 1);

    // // 투표 기간이 끝날 때까지 블록 생성
    const votingPeriod = await MyGovernor.votingPeriod();
    for (let i = 0; i < votingPeriod; i++) {
      await network.provider.send("evm_mine", []);
    }

    // // 제안의 상태를 확인
    const afterVoteState = await MyGovernor.state(proposeId);
    expect(afterVoteState).to.equal(4); // 4는 ProposalState.Succeeded 상태를 의미함

    // // 제안 실행
    const executeTx = await MyGovernor.connect(owner).execute(
      targets,
      values,
      calldatas,
      ethers.id(description)
    );

    // // 트랜잭션이 완료될 때까지 대기
    // const receipt = await executeTx.wait();
    // console.log("Execute Proposal Receipt:", receipt);

    // // addr2가 새로운 NFT를 소유하고 있는지 확인
    // try {
    //   const ownerOfZero = await MyERC721Vote.ownerOf(0);
    //   console.log("Token 0 Owner:", ownerOfZero);

    //   const ownerOfOne = await MyERC721Vote.ownerOf(1);
    //   console.log("Token 1 Owner:", ownerOfOne);
    // } catch (error) {
    //   console.error("Error retrieving token owner:", error);
    // }

    // // 실제로 발행된 토큰이 1번인지 확인합니다.
    // expect(await MyERC721Vote.ownerOf(1)).to.equal(addr2.address);
  });
});
