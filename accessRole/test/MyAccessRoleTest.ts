import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("AccessControlTest", function () {
  async function AccessControlFixture() {
    const [admin, addr1, addr2] = await ethers.getSigners();

    const AccessControlTest = await ethers.deployContract("AccessControlTest");

    return { AccessControlTest, admin, addr1, addr2 };
  }

  it("배포된 컨트랙트의 초기 관리자 역할은 배포자 주소이다.", async () => {
    const { AccessControlTest, admin } = await loadFixture(
      AccessControlFixture
    );
    const DEFAULT_ADMIN_ROLE = await AccessControlTest.DEFAULT_ADMIN_ROLE();

    expect(await AccessControlTest.hasRole(DEFAULT_ADMIN_ROLE, admin.address))
      .to.be.true;
  });

  it("관리자 권한을 addr1에게 부여할 수 있다.", async () => {
    const { AccessControlTest, admin, addr1 } = await loadFixture(
      AccessControlFixture
    );
    const DEFAULT_ADMIN_ROLE = await AccessControlTest.DEFAULT_ADMIN_ROLE();

    await AccessControlTest.grantRole(DEFAULT_ADMIN_ROLE, addr1.address);

    expect(await AccessControlTest.hasRole(DEFAULT_ADMIN_ROLE, addr1.address))
      .to.be.true;
  });

  it("관리자 권한을 addr1에서 해제할 수 있다.", async () => {
    const { AccessControlTest, admin, addr1 } = await loadFixture(
      AccessControlFixture
    );
    const DEFAULT_ADMIN_ROLE = await AccessControlTest.DEFAULT_ADMIN_ROLE();

    await AccessControlTest.grantRole(DEFAULT_ADMIN_ROLE, addr1.address);
    expect(await AccessControlTest.hasRole(DEFAULT_ADMIN_ROLE, addr1.address))
      .to.be.true;

    await AccessControlTest.revokeRole(DEFAULT_ADMIN_ROLE, addr1.address);
    expect(await AccessControlTest.hasRole(DEFAULT_ADMIN_ROLE, addr1.address))
      .to.be.false;
  });

  it("관리자 권한을 본인 스스로 포기할 수 있다.", async () => {
    const { AccessControlTest, admin } = await loadFixture(
      AccessControlFixture
    );
    const DEFAULT_ADMIN_ROLE = await AccessControlTest.DEFAULT_ADMIN_ROLE();

    await AccessControlTest.renounceRole(DEFAULT_ADMIN_ROLE, admin.address);

    expect(await AccessControlTest.hasRole(DEFAULT_ADMIN_ROLE, admin.address))
      .to.be.false;
  });

  it("관리자 권한을 갖지 않은 계정이 grantRole을 호출하면 실패한다.", async () => {
    const { AccessControlTest, addr1, addr2 } = await loadFixture(
      AccessControlFixture
    );
    const DEFAULT_ADMIN_ROLE = await AccessControlTest.DEFAULT_ADMIN_ROLE();

    await expect(
      AccessControlTest.connect(addr1).grantRole(
        DEFAULT_ADMIN_ROLE,
        addr2.address
      )
    ).to.be.revertedWith(
      `AccessControl: account ${addr1.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
    );
  });

  it("관리자 권한을 갖지 않은 계정이 revokeRole을 호출하면 실패한다.", async () => {
    const { AccessControlTest, addr1, addr2 } = await loadFixture(
      AccessControlFixture
    );
    const DEFAULT_ADMIN_ROLE = await AccessControlTest.DEFAULT_ADMIN_ROLE();

    await AccessControlTest.grantRole(DEFAULT_ADMIN_ROLE, addr2.address);

    await expect(
      AccessControlTest.connect(addr1).revokeRole(
        DEFAULT_ADMIN_ROLE,
        addr2.address
      )
    ).to.be.revertedWith(
      `AccessControl: account ${addr1.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
    );
  });

  it("새로운 역할 MY_ROLE을 생성하고 addr1에게 부여할 수 있다.", async () => {
    const { AccessControlTest, admin, addr1 } = await loadFixture(
      AccessControlFixture
    );
    const MY_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MY_ROLE"));

    await AccessControlTest.grantRole(MY_ROLE, addr1.address);

    expect(await AccessControlTest.hasRole(MY_ROLE, addr1.address)).to.be.true;
  });
});
