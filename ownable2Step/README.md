#### 1. 프로젝트 설정

```shell
mkdir ownable2Step

cd ownable2Step

npm init -y

npm install --save-dev hardhat

npx hardhat init

npm install @openzeppelin/contracts@4.8.1
```

- typescript 프로젝트로 선택하여 진행
- contracts/Lock.sol 삭제
- ignition 삭제
- test/Lock.ts 삭제

#### 2. Smart Contract 작성

```solidity title=contracts/MyOwnable2Step.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "@openzeppelin/contracts/access/Ownable2Step.sol";

contract MyOwnable2Step is Ownable2Step {
}
```

#### 3. 테스트

##### (1) 테스트 코드 작성

```ts title=testMyOwnalbe2StepTest.ts
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
```

##### (2) 테스트 실행

```shell
npx harhat test
```

##### (3) 테스트 결과

![image](https://github.com/user-attachments/assets/a2bd955d-1f27-4a37-83ed-9b00f1c01a00)
