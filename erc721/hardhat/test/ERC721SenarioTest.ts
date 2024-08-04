import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("MyERC721", function () {
  async function MyERC721Fixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const MyERC721 = await ethers.deployContract("MyERC721");

    const ca = await MyERC721.getAddress();

    return { MyERC721, owner, addr1, addr2, ca };
  }

  it("NFT 0번에 대한 권한을 addr1에게 부여한 후 addr1이 addr2에게 0번 NFT를 전송한다.", async () => {
    const { MyERC721, owner, addr1, addr2 } = await loadFixture(
      MyERC721Fixture
    );
    // 권한 부여 owner -> addr1
    await MyERC721.connect(owner).approve(addr1, "0");
    // addr1이 onwer를 대행해여 addr2에게 0번 nft 전송
    await MyERC721.connect(addr1).transferFrom(owner, addr2, "0");

    expect(await MyERC721.ownerOf(0)).to.equal(addr2);
  });
});
