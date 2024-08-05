import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("MyEIP712", function () {
  async function MyEIP712Fixture() {
    const [signer] = await ethers.getSigners();

    const MyEIP712 = await ethers.deployContract("MyEIP712");

    const ca = await MyEIP712.getAddress();

    const TestStructure = {
      from: await signer.getAddress(),
      to: ca,
      contents: "This is test contents",
    };

    return { MyEIP712, TestStructure, signer, ca };
  }

  it("서명자를 올바르게 검증해야 한다", async () => {
    const { MyEIP712, TestStructure, signer, ca } = await loadFixture(
      MyEIP712Fixture
    );

    // 해시 생성
    const structHash = await MyEIP712.hashStruct(TestStructure);
    console.log("hashStruct is: ", structHash);

    // EIP-712 도메인 정의
    const domain = {
      name: "MyEIP712",
      version: "1",
      chainId: (await ethers.provider.getNetwork()).chainId,
      verifyingContract: ca,
    };

    // EIP-712 타입 정의
    const types = {
      Mail: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "contents", type: "string" },
      ],
    };

    // EIP-712 서명 생성
    const signature = await signer.signTypedData(domain, types, TestStructure);
    console.log("Signature is: ", signature);

    // 서명 검증
    const recoveredAddress = await MyEIP712.validateSigner(
      structHash,
      signature
    );
    console.log("Recovered Address is: ", recoveredAddress);

    // 실제 signer의 주소와 검증된 주소 비교
    expect(recoveredAddress).to.equal(await signer.getAddress());
  });
});
