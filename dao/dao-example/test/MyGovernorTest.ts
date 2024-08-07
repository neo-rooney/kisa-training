import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";

describe("MyGovernor", function () {
  async function GovernorFixture() {
    const [owner, otherAccount, proposer, voter] = await ethers.getSigners();

    // MyGovernanceToken 배포
    const Token = await ethers.getContractFactory("MyGovernanceToken");
    const token = await Token.deploy();
    const tokenCa = await token.getAddress();

    // MyTimelockController 배포 (2일 대기)
    const minDelay = 2 * 24 * 60 * 60; // 2일(초 단위)
    const Timelock = await ethers.getContractFactory("MyTimelockController");
    const timelock = await Timelock.deploy(minDelay, [], [], owner.address);
    const timelockCa = await timelock.getAddress();

    // MyGovernor 배포
    const Governor = await ethers.getContractFactory("MyGovernor");
    const governor = await Governor.deploy(tokenCa, timelockCa);
    const governorCa = await governor.getAddress();
    console.log("governorCa", governorCa);

    // Token을 proposer와 voter에게 할당
    const mintAmount = ethers.parseUnits("50000", 18); // 50,000 토큰
    await token.connect(owner).transfer(proposer.address, mintAmount);
    await token.connect(owner).transfer(voter.address, mintAmount);

    return {
      token,
      tokenCa,
      governor,
      governorCa,
      timelock,
      timelockCa,
      owner,
      otherAccount,
      proposer,
      voter,
    };
  }

  describe("Governor functionality", function () {
    it("컨트랙트가 배포 될 때 토큰이 정상적으로 전달된다.", async function () {
      const { token, proposer } = await loadFixture(GovernorFixture);
      const proposerBalance = await token.balanceOf(proposer.address);
      expect(proposerBalance).to.equal(ethers.parseUnits("50000", 18));
    });

    it("제안이 정상적으로 생성된다.", async function () {
      const { governor, proposer } = await loadFixture(GovernorFixture);

      // 제안 내용을 정의
      const targets = [proposer.address];
      const values = [0];
      const calldatas = [ethers.hexlify(ethers.toUtf8Bytes(""))];
      const description = "Test proposal";

      // 제안자가 제안을 생성함
      await governor
        .connect(proposer)
        .propose(targets, values, calldatas, description);

      // 제안 ID를 가져옴
      const proposalId = await governor.hashProposal(
        targets,
        values,
        calldatas,
        ethers.id(description)
      );

      // 제안의 상태를 확인
      const state = await governor.state(proposalId);
      expect(state).to.equal(0); // 0은 ProposalState.Pending 상태를 의미함

      console.log("Proposal ID:", proposalId);
    });

    it("투표가 정상적으로 진행된다.", async function () {
      const { governor, proposer, voter, token } = await loadFixture(
        GovernorFixture
      );

      // 제안 내용을 정의
      const targets = [proposer.address];
      const values = [0];
      const calldatas = [ethers.hexlify(ethers.toUtf8Bytes(""))];
      const description = "Test proposal";

      // 제안자가 제안을 생성함
      await governor
        .connect(proposer)
        .propose(targets, values, calldatas, description);

      // 제안 ID를 가져옴
      const proposalId = await governor.hashProposal(
        targets,
        values,
        calldatas,
        ethers.id(description)
      );

      // 블록을 생성하여 제안이 Active 상태가 되도록 함
      const votingDelay = await governor.votingDelay();
      await network.provider.send("evm_mine", []); // 현재 블록
      for (let i = 0; i < votingDelay; i++) {
        await network.provider.send("evm_mine", []); // votingDelay 만큼 블록 생성
      }

      // 투표자가 투표를 진행함
      await token.connect(voter).delegate(voter.address); // 투표 권한 위임
      await governor.connect(voter).castVote(proposalId, 1); // 1 = 찬성 투표
      await token.connect(proposer).delegate(proposer.address); // 투표 권한 위임
      await governor.connect(proposer).castVote(proposalId, 1); // 1 = 찬성 투표

      // 투표 기간이 끝날 때까지 블록 생성
      const votingPeriod = await governor.votingPeriod();
      for (let i = 0; i < votingPeriod; i++) {
        await network.provider.send("evm_mine", []);
      }

      // 투표 종료 후 상태 확인 (Succeeded 상태)
      const state = await governor.state(proposalId);
      expect(state).to.equal(4); // ProposalState.Succeeded
    });

    it("제안이 통과되고 실행된다.", async function () {
      const { governor, proposer, voter, token } = await loadFixture(
        GovernorFixture
      );

      // 제안 내용을 정의
      const targets = [proposer.address];
      const values = [0];
      const calldatas = [ethers.hexlify(ethers.toUtf8Bytes(""))];
      const description = "Test proposal";

      // 제안자가 제안을 생성함
      await governor
        .connect(proposer)
        .propose(targets, values, calldatas, description);

      // 제안 ID를 가져옴
      const proposalId = await governor.hashProposal(
        targets,
        values,
        calldatas,
        ethers.id(description)
      );

      // 블록을 생성하여 제안이 Active 상태가 되도록 함
      const votingDelay = await governor.votingDelay();
      await network.provider.send("evm_mine", []); // 현재 블록
      for (let i = 0; i < votingDelay; i++) {
        await network.provider.send("evm_mine", []); // votingDelay 만큼 블록 생성
      }

      // 투표자가 투표를 진행함
      await token.connect(voter).delegate(voter.address); // 투표 권한 위임
      await governor.connect(voter).castVote(proposalId, 1); // 1 = 찬성 투표

      // 투표 기간이 끝날 때까지 블록 생성
      const votingPeriod = await governor.votingPeriod();
      for (let i = 0; i < votingPeriod; i++) {
        await network.provider.send("evm_mine", []);
      }

      // 제안이 성공적으로 통과된 후 실행 단계
      await governor
        .connect(proposer)
        .queue(targets, values, calldatas, ethers.id(description));
      await network.provider.send("evm_increaseTime", [2 * 24 * 60 * 60]); // 2일 대기
      await governor
        .connect(proposer)
        .execute(targets, values, calldatas, ethers.id(description));

      // 실행 후 상태 확인 (Executed 상태)
      const state = await governor.state(proposalId);
      expect(state).to.equal(7); // ProposalState.Executed
    });
  });
});
