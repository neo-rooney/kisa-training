### 컨트렉트 작성

#### 1. 프로젝트 설정

```shell
mkdir eip712

cd eip712

mkdir hardhat

cd hardhat

npm init -y

npm install --save-dev hardhat

npx hardhat init
```

- typescript 프로젝트로 선택하여 진행
- contracts/Lock.sol 삭제
- ignition 삭제
- test/Lock.ts 삭제

#### 2. Smart Contract 작성

##### (1) ERC표준 Extension(Openzeppelin/contracts)설치

```shell
npm install @openzeppelin/contracts@4.8.1
```

##### (2)Smart Contract

```solidity title=scripts/MyEIP712
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract MyEIP712 is EIP712 {
    bytes32 public immutable _MESSAGE_TYPEHASH = keccak256("Mail(address from,address to,string contents)");

    struct Mail {
        address from;
        address to;
        string contents;
    }

    constructor() EIP712("MyEIP712", "1") {
    }

    function domainSeparatorV4() public view returns (bytes32) {
        return _domainSeparatorV4();
    }

    function hashTypedDataV4(bytes32 structHash)public view returns (bytes32) {
        return _hashTypedDataV4(structHash);
    }


    function validateSigner(bytes32 structHash, bytes memory signature) public view returns (address) {
        return ECDSA.recover(_hashTypedDataV4(structHash), signature);
    }

    function hashStruct(Mail memory mail)
        public
        view
        returns (bytes32)
    {
        return
        keccak256(
            abi.encode(
            _MESSAGE_TYPEHASH,
            mail.from,
            mail.to,
            keccak256(abi.encodePacked(mail.contents))
        ));
    }
}
```

### 테스트

#### 1. 시나리오 테스트

- 사용자가 서명을 하고 해당 서명이 유효한 서명인지 검증하는 테스트

##### (1) 테스트 코드 작성

```ts title=test/MyEIP712Test.ts
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
```

##### (2) 테스트 실행

```shell
npx hardhat test ./test/MyEIP721Test.ts
```

##### (3) 결과

![image](https://github.com/user-attachments/assets/e1d91601-fab6-4c7b-867c-922a4f01f27c)
