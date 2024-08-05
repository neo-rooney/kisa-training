import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("MyOwnable", function () {
  async function MyOwnableFixture() {
    const [owner, addr1] = await ethers.getSigners();

    const MyOwnable = await ethers.deployContract("MyOwnable");

    return { MyOwnable, owner, addr1 };
  }

  it("컨트렉트가 배포 될 때, 배포한 주소가 Owner가 된다.", async () => {
    const { MyOwnable, owner } = await loadFixture(MyOwnableFixture);
    expect(await MyOwnable.owner()).to.equal(owner);
  });

  it("Owner 권한이 addr1으로 양도된다.", async () => {
    const { MyOwnable, addr1 } = await loadFixture(MyOwnableFixture);

    await MyOwnable.transferOwnership(addr1);
    // await MyOwnable.connect(addr1).renounceOwnership();

    expect(await MyOwnable.owner()).to.equal(addr1);
  });

  it("Owner 권한이 정상적으로 포기된다.", async () => {
    const { MyOwnable } = await loadFixture(MyOwnableFixture);

    await MyOwnable.renounceOwnership();

    expect(await MyOwnable.owner()).to.equal(ethers.ZeroAddress);
  });
});
