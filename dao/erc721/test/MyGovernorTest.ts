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

    const MyGovernorCA = await MyGovernor.getAddress();

    // MyGovernor 컨트랙트에 MINTER_ROLE 부여
    await MyERC721Vote.grantRole(
      await MyERC721Vote.MINTER_ROLE(),
      MyGovernorCA
    );

    // 초기 설정: NFT 0번 발행
    await MyERC721Vote.mint(owner.address);
    await MyERC721Vote.connect(owner).delegate(owner);

    return {
      MyGovernor,
      MyERC721Vote,
      owner,
      addr1,
      addr2,
      MyERC721VoteCA,
      MyGovernorCA,
    };
  }

  it("배포 테스트 ", async () => {});

  it("제안 생성 및 투표 테스트", async () => {
    let currentBlockNumber;

    const { MyGovernor, MyERC721Vote, owner, addr1, addr2, MyERC721VoteCA } =
      await loadFixture(MyGovernorFixture);

    // 배포 테스트
    const name = "MyERC721Vote";
    const symbol = "MEV";
    expect(await MyERC721Vote.name()).to.equal(name);
    expect(await MyERC721Vote.symbol()).to.equal(symbol);
    expect(await MyGovernor.votingDelay()).to.equal(9);
    expect(await MyGovernor.votingPeriod()).to.equal(5);

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

    await MyGovernor.propose(targets, values, calldatas, description);

    // 제안 상태 확인 - votingDelay가 초과되지 않았으므로 Pending
    const state = await MyGovernor.state(proposeId);
    expect(state).to.equal(0); // 0은 ProposalState.Pending 상태를 의미함

    //  블록을 생성하여 제안이 Active 상태가 되도록 함
    const votingDelay = await MyGovernor.votingDelay();
    for (let i = 0; i <= votingDelay; i++) {
      await network.provider.send("evm_mine", []); // votingDelay 만큼 블록 생성
    }
    // 제안 상태 확인 - votingDelay 초과되었으므로 Active
    const afterDeplayState = await MyGovernor.state(proposeId);
    expect(afterDeplayState).to.equal(1); // 1은 ProposalState.Active 상태를 의미함(투표 가능)

    // 투표권 확인
    console.log(
      "투표권 부여의 기준 블록 Number : ",
      await MyGovernor.proposalSnapshot(proposeId)
    );
    currentBlockNumber = await ethers.provider.getBlockNumber();
    console.log("currentBlockNumber", currentBlockNumber);
    expect(
      await MyERC721Vote.getPastVotes(owner.address, currentBlockNumber - 1)
    ).to.equal("1");
    expect(
      await MyGovernor.getVotes(owner.address, currentBlockNumber - 1)
    ).to.equal("1");

    console.log(
      "투표 종료 블록 Number : ",
      await MyGovernor.proposalDeadline(proposeId)
    );
    currentBlockNumber = await ethers.provider.getBlockNumber();
    console.log("currentBlockNumber : ", currentBlockNumber);

    // 투표 실행: owner가 제안에 대해 "찬성"으로 투표
    await MyGovernor.connect(owner).castVote(proposeId, 1);

    // 투표 기간이 끝날 때까지 블록 생성
    const votingPeriod = await MyGovernor.votingPeriod();
    for (let i = 0; i < votingPeriod; i++) {
      await network.provider.send("evm_mine", []);
    }

    currentBlockNumber = await ethers.provider.getBlockNumber();
    console.log("currentBlockNumber : ", currentBlockNumber);

    // 제안의 상태를 확인
    const afterVoteState = await MyGovernor.state(proposeId);
    expect(afterVoteState).to.equal(4); // 4는 ProposalState.Succeeded 상태를 의미함

    // // // 제안 실행
    await MyGovernor.execute(
      targets,
      values,
      calldatas,
      ethers.id(description)
    );

    expect(await MyERC721Vote.ownerOf(1)).to.equal(addr2.address);
  });
});
