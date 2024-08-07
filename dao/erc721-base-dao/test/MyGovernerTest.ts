/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { expect } from "chai";
// import chai from 'chai';
// import { solidity } from 'ethereum-waffle';
import { Contract } from "ethers";
import { ethers } from "hardhat";

// chai.use(solidity);

const name = "MyNFT";
const symbol = "MNFT";
const decimals = 18;
// const tokenURI = 'https://raw.githubusercontent.com/hyunkicho/blockchain101/main/erc721/metadata/';
function changeToBigInt(amount: number) {
  const answerBigint = ethers.parseUnits(amount.toString(), decimals);
  return answerBigint;
}

describe("Start Example ERC721 Governor test", async () => {
  // contracts
  let exampleERC721: any;
  let exampleERC20: any;
  let governor: any;
  //signers
  let owner: any;
  let voter1: any;
  let voter2: any;
  let voter3: any;
  let voter4: any;
  let teamAddr: any;
  let proposeId: number;
  let transferCalldata: string;
  const name = "MyNFT";
  const symbol = "MNFT";

  it("Set data for exampleERC721 Governor test", async () => {
    [owner, voter1, voter2, voter3, voter4, teamAddr] =
      await ethers.getSigners(); // get a test address
  });

  describe("Test Example exampleERC721 Governor deployment", () => {
    it("Should get correct name, symbol, decimal for the Example ERC721 Contract", async () => {
      console.log("deploying MyERC20 contract");
      exampleERC20 = await ethers.deployContract("MyERC20");

      console.log("deploying MyERC721Vote contract");
      exampleERC721 = await ethers.deployContract("MyERC721Vote");

      expect(await exampleERC721.name()).to.equal(name);
      expect(await exampleERC721.symbol()).to.equal(symbol);
      const exampleERC721CA = await exampleERC721.getAddress();
      console.log(`erc721vote contract is deployed to ${exampleERC721CA}`);

      console.log("deploying governance contract");
      const Governor = await ethers.getContractFactory("MyGovernor");
      governor = await Governor.deploy(exampleERC721CA);
      const governorCa = await governor.getAddress();
      expect(await governor.votingDelay()).to.equal(9);
      expect(await governor.votingPeriod()).to.equal(5);
      console.log(`governor contract is deployed to ${governorCa}`);
    });

    it("step 01) set proposal action", async () => {
      let currentBlockNumber = await ethers.provider.getBlockNumber();
      console.log("proposal currentBlockNumber is : ", currentBlockNumber);
      const erc20Token = await ethers.getContractAt(
        "MyERC20",
        await exampleERC20.getAddress()
      );
      console.log("exampleERC20.address : ", exampleERC20.address);

      //set Proposal to send token
      let teamAddress = teamAddr.address;
      console.log("team address :", teamAddress);
      const grantAmount = 100;
      await exampleERC20.mint(
        await governor.getAddress(),
        changeToBigInt(grantAmount)
      );
      transferCalldata = erc20Token.interface.encodeFunctionData("transfer", [
        teamAddress,
        changeToBigInt(grantAmount),
      ]);
      console.log("transferCalldata :", transferCalldata);

      proposeId = await governor.hashProposal(
        [await exampleERC20.getAddress()],
        [0],
        [transferCalldata],
        ethers.id("Proposal #1: Give grant to team")
      );
      //proposal을 해시한 값이 아이디로 나오게 된다.
      console.log("proposeId is : ", proposeId);
      //값을 미리 받아온 후 실행, 실제로는 이벤트를 불러와서 체크할 수 있다.
      await governor.propose(
        [await exampleERC20.getAddress()],
        [0],
        [transferCalldata],
        "Proposal #1: Give grant to team"
      );
      const stateOfProposal = await governor.state(proposeId);
      console.log("stateOfProposal is : ", stateOfProposal);
    });

    it("step 02) check get Votes", async () => {
      const currentBlockNumber = await ethers.provider.getBlockNumber();
      expect(
        await governor.getVotes(voter1.address, currentBlockNumber - 1)
      ).to.equal("0");
      expect(
        await governor.getVotes(voter2.address, currentBlockNumber - 1)
      ).to.equal("0");
      expect(
        await governor.getVotes(voter3.address, currentBlockNumber - 1)
      ).to.equal("0");
      expect(
        await governor.getVotes(voter4.address, currentBlockNumber - 1)
      ).to.equal("0");
    });

    it("step 03) get nft and check Votes again", async () => {
      console.log("step 01 👉 : mint erc721 ");
      await exampleERC721.mint(voter1.address);
      expect(await exampleERC721.balanceOf(voter1.address)).to.equal("1");
      await exampleERC721.mint(voter2.address);
      expect(await exampleERC721.balanceOf(voter2.address)).to.equal("1");
      await exampleERC721.mint(voter3.address);
      expect(await exampleERC721.balanceOf(voter3.address)).to.equal("1");
      await exampleERC721.mint(voter4.address);
      expect(await exampleERC721.balanceOf(voter4.address)).to.equal("1");

      console.log("step 02 👉 : delgate from erc721 ");
      await exampleERC721.connect(voter1).delegate(voter1.address);
      await exampleERC721.connect(voter2).delegate(voter2.address);
      await exampleERC721.connect(voter3).delegate(voter3.address);
      await exampleERC721.connect(voter4).delegate(voter4.address);
      const currentBlockNumber = await ethers.provider.getBlockNumber();
      console.log("currentBlockNumber : ", currentBlockNumber);

      await ethers.provider.send("evm_mine", []); //mine to start vote
      console.log("step 03 👉 : check getPastVotes from erc721 ");
      expect(
        await exampleERC721.getPastVotes(voter1.address, currentBlockNumber)
      ).to.equal("1");
      expect(
        await exampleERC721.getPastVotes(voter2.address, currentBlockNumber)
      ).to.equal("1");
      expect(
        await exampleERC721.getPastVotes(voter3.address, currentBlockNumber)
      ).to.equal("1");
      expect(
        await exampleERC721.getPastVotes(voter4.address, currentBlockNumber)
      ).to.equal("1");

      console.log("step 04 👉 : check getVotes from governor ");
      expect(
        await governor.getVotes(voter1.address, currentBlockNumber)
      ).to.equal("1");
      expect(
        await governor.getVotes(voter2.address, currentBlockNumber)
      ).to.equal("1");
      expect(
        await governor.getVotes(voter3.address, currentBlockNumber)
      ).to.equal("1");
      expect(
        await governor.getVotes(voter4.address, currentBlockNumber)
      ).to.equal("1");

      const stateOfProposal = await governor.state(proposeId);
      console.log("stateOfProposal is : ", stateOfProposal);
    });

    it("step 04) castVote action", async () => {
      console.log(
        "proposal snap shot : ",
        await governor.proposalSnapshot(proposeId)
      );
      console.log(
        "proposal deadline : ",
        await governor.proposalDeadline(proposeId)
      );
      let currentBlockNumber = await ethers.provider.getBlockNumber();
      console.log("currentBlockNumber : ", currentBlockNumber);

      await ethers.provider.send("evm_mine", []); //mine to start vote

      currentBlockNumber = await ethers.provider.getBlockNumber();
      console.log("currentBlockNumber : ", currentBlockNumber);

      await governor.connect(voter1).castVote(proposeId, 1); //1 is FOR 0 is Against

      await governor.connect(voter2).castVote(proposeId, 1); //1 is FOR 0 is Against

      let hasVoted = await governor.hasVoted(proposeId, voter2.address);
      console.log("hasVoted is : ", hasVoted);

      await governor.connect(voter3).castVote(proposeId, 1); //1 is FOR 0 is Against
      hasVoted = await governor.hasVoted(proposeId, voter3.address);
      console.log("hasVoted is : ", hasVoted);

      await governor.connect(voter4).castVote(proposeId, 1); //1 is FOR 0 is Against
      hasVoted = await governor.hasVoted(proposeId, voter4.address);
      console.log("hasVoted is : ", hasVoted);

      const deadline = await governor.proposalDeadline(proposeId);
      console.log("deadline is ", deadline);

      let stateOfProposal = await governor.state(proposeId);
      console.log("stateOfProposal is : ", stateOfProposal);

      currentBlockNumber = await ethers.provider.getBlockNumber();
      console.log("currentBlockNumber is : ", currentBlockNumber);

      await ethers.provider.send("evm_mine", []); //mine to start vote
      await ethers.provider.send("evm_mine", []); //mine to start vote
      await ethers.provider.send("evm_mine", []); //mine to start vote
      await ethers.provider.send("evm_mine", []); //mine to start vote
      await ethers.provider.send("evm_mine", []); //mine to start vote
      currentBlockNumber = await ethers.provider.getBlockNumber();
      console.log("currentBlockNumber is : ", currentBlockNumber);

      const quorum = await governor.quorum(currentBlockNumber);
      console.log("qurom :", quorum);
      stateOfProposal = await governor.state(proposeId);
      console.log("stateOfProposal is : ", stateOfProposal);
      let quorumReached = await governor.quorumReached(proposeId);
      console.log("quorumReached is : ", quorumReached);
      let proposalVotes = await governor.proposalVotes(proposeId);
      console.log("proposalVotes is : ", proposalVotes);
      let voteSucceeded = await governor.voteSucceeded(proposeId);
      console.log("voteSucceeded is : ", voteSucceeded);
      await ethers.provider.send("evm_mine", []); //mine to start vote
      await ethers.provider.send("evm_mine", []); //mine to start vote
      await ethers.provider.send("evm_mine", []); //mine to start vote
      await ethers.provider.send("evm_mine", []); //mine to start vote
      await ethers.provider.send("evm_mine", []); //mine to start vote
      await ethers.provider.send("evm_mine", []); //mine to start vote
      const descriptionHash = ethers.id("Proposal #1: Give grant to team");

      const balance = await exampleERC20.balanceOf(teamAddr);
      console.log("balance", balance);
      await governor.execute(
        [await exampleERC20.getAddress()],
        [0],
        [transferCalldata],
        descriptionHash
      );
      const balanceAfter = await exampleERC20.balanceOf(teamAddr);
      console.log("balanceAfter", balanceAfter);
    });
  });
});
