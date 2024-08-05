#### 1. 프로젝트 설정

```shell
mkdir ownable

cd ownable

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

```
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyOwnable is Ownable {
}
```

#### 3. 테스트

##### (1) 테스트 코드 작성

```ts title=testMyOwnalbeTest.ts
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
```

##### (2) 테스트 실행

```shell
npx harhat test
```

##### (3) 테스트 결과

![image](https://github.com/user-attachments/assets/d96692e0-58c7-4af0-b11b-fe52d7bb9be2)
