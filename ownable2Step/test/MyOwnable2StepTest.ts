import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("MyOwnable2Step", function () {
  async function MyOwnable2StepFixture() {
    const [owner, addr1] = await ethers.getSigners();

    const MyOwnable2Step = await ethers.deployContract("MyOwnable2Step");

    return { MyOwnable2Step, owner, addr1 };
  }

  it("컨트렉트가 배포 될 때, 배포한 주소가 Owner가 된다.", async () => {
    const { MyOwnable2Step, owner } = await loadFixture(MyOwnable2StepFixture);
    expect(await MyOwnable2Step.owner()).to.equal(owner);
  });

  it("Owner 권한을 양도하면 양도 받은 주소는 pendingOwner가 되고 실제 onwer는 여전히 최초 owner이다.", async () => {
    const { MyOwnable2Step, owner, addr1 } = await loadFixture(
      MyOwnable2StepFixture
    );

    await MyOwnable2Step.transferOwnership(addr1);

    expect(await MyOwnable2Step.owner()).to.equal(owner);
    expect(await MyOwnable2Step.pendingOwner()).to.equal(addr1);
  });

  it("pendingOwner가 owner 권한을 수락하면 owner 권한이 addr1이 된다.", async () => {
    const { MyOwnable2Step, addr1 } = await loadFixture(MyOwnable2StepFixture);

    await MyOwnable2Step.transferOwnership(addr1);

    await MyOwnable2Step.connect(addr1).acceptOwnership();

    expect(await MyOwnable2Step.owner()).to.equal(addr1);
  });
});
