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

  it("올바른 name, symbol로 Contract가 배포 된다.", async () => {
    const name = "MyNFT";
    const symbol = "MNFT";

    const { MyERC721 } = await loadFixture(MyERC721Fixture);

    expect(await MyERC721.name()).to.equal(name);
    expect(await MyERC721.symbol()).to.equal(symbol);
  });

  it("특정 주소로 NFT가 정상 발행된다.", async () => {
    const { MyERC721, addr1 } = await loadFixture(MyERC721Fixture);
    await MyERC721.mint(addr1);

    expect(await MyERC721.totalSupply()).to.equal("2");
    expect(await MyERC721.ownerOf(1)).to.equal(addr1);
  });

  it("특정 주소로 NFT가 정상 전송된다.", async () => {
    const { MyERC721, owner, addr1 } = await loadFixture(MyERC721Fixture);
    await MyERC721.connect(owner).transferFrom(owner, addr1, "0");

    expect(await MyERC721.ownerOf(0)).to.equal(addr1);
  });

  it("특정 NFT에 대한 권한 부여가 정상적으로 작동한다.", async () => {
    const { MyERC721, owner, addr1 } = await loadFixture(MyERC721Fixture);

    await MyERC721.connect(owner).approve(addr1, "0");

    expect(await MyERC721.getApproved("0")).to.equal(addr1);
  });
});
