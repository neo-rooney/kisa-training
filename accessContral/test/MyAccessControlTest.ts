import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("MyAccessControl", function () {
  async function AccessControlFixture() {
    const [admin, addr1, addr2] = await ethers.getSigners();

    const MyAccessControl = await ethers.deployContract("MyAccessControl");

    return { MyAccessControl, admin, addr1, addr2 };
  }

  it("배포된 컨트랙트의 초기 관리자 역할은 배포자 주소이다.", async () => {
    const { MyAccessControl, admin } = await loadFixture(AccessControlFixture);
    const DEFAULT_ADMIN_ROLE = await MyAccessControl.DEFAULT_ADMIN_ROLE();

    expect(await MyAccessControl.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to
      .be.true;
  });

  it("관리자 권한을 addr1에게 부여할 수 있다.", async () => {
    const { MyAccessControl, admin, addr1 } = await loadFixture(
      AccessControlFixture
    );
    const DEFAULT_ADMIN_ROLE = await MyAccessControl.DEFAULT_ADMIN_ROLE();

    await MyAccessControl.grantRole(DEFAULT_ADMIN_ROLE, addr1.address);

    expect(await MyAccessControl.hasRole(DEFAULT_ADMIN_ROLE, addr1.address)).to
      .be.true;
  });

  it("관리자 권한을 addr1에서 해제할 수 있다.", async () => {
    const { MyAccessControl, admin, addr1 } = await loadFixture(
      AccessControlFixture
    );
    const DEFAULT_ADMIN_ROLE = await MyAccessControl.DEFAULT_ADMIN_ROLE();

    await MyAccessControl.grantRole(DEFAULT_ADMIN_ROLE, addr1.address);
    expect(await MyAccessControl.hasRole(DEFAULT_ADMIN_ROLE, addr1.address)).to
      .be.true;

    await MyAccessControl.revokeRole(DEFAULT_ADMIN_ROLE, addr1.address);
    expect(await MyAccessControl.hasRole(DEFAULT_ADMIN_ROLE, addr1.address)).to
      .be.false;
  });

  it("관리자 권한을 본인 스스로 포기할 수 있다.", async () => {
    const { MyAccessControl, admin } = await loadFixture(AccessControlFixture);
    const DEFAULT_ADMIN_ROLE = await MyAccessControl.DEFAULT_ADMIN_ROLE();

    await MyAccessControl.renounceRole(DEFAULT_ADMIN_ROLE, admin.address);

    expect(await MyAccessControl.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to
      .be.false;
  });

  it("관리자 권한을 갖지 않은 계정이 grantRole을 호출하면 실패한다.", async () => {
    const { MyAccessControl, addr1, addr2 } = await loadFixture(
      AccessControlFixture
    );
    const DEFAULT_ADMIN_ROLE = await MyAccessControl.DEFAULT_ADMIN_ROLE();

    await expect(
      MyAccessControl.connect(addr1).grantRole(
        DEFAULT_ADMIN_ROLE,
        addr2.address
      )
    ).to.be.revertedWith(
      `AccessControl: account ${addr1.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
    );
  });

  it("관리자 권한을 갖지 않은 계정이 revokeRole을 호출하면 실패한다.", async () => {
    const { MyAccessControl, addr1, addr2 } = await loadFixture(
      AccessControlFixture
    );
    const DEFAULT_ADMIN_ROLE = await MyAccessControl.DEFAULT_ADMIN_ROLE();

    await MyAccessControl.grantRole(DEFAULT_ADMIN_ROLE, addr2.address);

    await expect(
      MyAccessControl.connect(addr1).revokeRole(
        DEFAULT_ADMIN_ROLE,
        addr2.address
      )
    ).to.be.revertedWith(
      `AccessControl: account ${addr1.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
    );
  });

  it("새로운 역할 MY_ROLE을 생성하고 addr1에게 부여할 수 있다.", async () => {
    const { MyAccessControl, admin, addr1 } = await loadFixture(
      AccessControlFixture
    );
    const MY_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MY_ROLE"));

    await MyAccessControl.grantRole(MY_ROLE, addr1.address);

    expect(await MyAccessControl.hasRole(MY_ROLE, addr1.address)).to.be.true;
  });
});
