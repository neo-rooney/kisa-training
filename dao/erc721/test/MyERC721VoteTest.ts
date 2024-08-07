import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("MyERC721Vote", function () {
  async function MyERC721VoteFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const MyERC721Vote = await ethers.deployContract("MyERC721Vote");

    return { MyERC721Vote, owner, addr1, addr2 };
  }

  it("NFT 0번에 대한 권한을 addr1에게 부여한 후 addr1이 addr2에게 0번 NFT를 전송한다.", async () => {
    const { MyERC721Vote, owner, addr1, addr2 } = await loadFixture(
      MyERC721VoteFixture
    );

    // NFT를 발행(owner에게 0번 NFT 발행)
    await MyERC721Vote.connect(owner).mint(owner.address);

    // 권한 부여 owner -> addr1
    await MyERC721Vote.connect(owner).approve(addr1.address, 0);

    // addr1이 owner를 대행하여 addr2에게 0번 NFT 전송
    await MyERC721Vote.connect(addr1).transferFrom(
      owner.address,
      addr2.address,
      0
    );

    // addr2가 0번 NFT를 소유하고 있는지 확인
    expect(await MyERC721Vote.ownerOf(0)).to.equal(addr2.address);
  });
});
