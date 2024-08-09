### ERC721 컨트렉트 작성

#### 1. 프로젝트 설정

```shell
cd erc721

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

```solidity title=scripts/MyERC721.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";

contract MyERC721 is ERC721PresetMinterPauserAutoId {
    constructor() ERC721PresetMinterPauserAutoId("MyNFT", "MNFT", "https://metadata-api-server-git-main-rooneydevs-projects.vercel.app/api/token/") {
        mint(msg.sender);
    }
}
```

#### 3. 배포 script 작성 및 로컬 배포 테스트

##### (1) 배포 script 작성

```js title=deploy/deployERC721.ts
import { ethers } from "hardhat";

async function main() {
  console.log("Start contract deployment");
  const factory = await ethers.getContractFactory("MyERC721");
  const contract = await factory.deploy();
  const address = await contract.getAddress();

  console.log(`Contract is deployed : ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

##### (2) 로컬 배포 테스트

###### 1) 명령어

```
npx hardhat run deploy/deployERC721.ts
```

###### 2) 결과

![image](https://github.com/user-attachments/assets/a680d8a3-e2e9-4b97-b8bf-301a44622e2b)

### ERC721 단위 테스트

#### 1. 단위 테스트 실습

##### (1) 테스트 코드 작성

```ts title=test/ERC721UnitTest.ts
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

  it("특정 주소로 NFT가 정상 전송된다..", async () => {
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
```

##### (2) 테스트 실행

```shell title=테스트_수행
npx hardhat test ./test/ERC721UnitTest.ts
```

##### (3) 결과

![image](https://github.com/user-attachments/assets/5a9a3e58-e930-4a3d-b4c7-6613e4502bcd)

#### 2. 시나리오 테스트

- 복잡한 상황 테스트

##### (1) 테스트 코드 작성

```ts title=scripts/ERC721SenarioTest.ts
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
```

##### (2) 테스트 실행

```shell
npx hardhat test ./test/ERC721SenarioTest.ts
```

##### (3) 결과

![image](https://github.com/user-attachments/assets/ec5a33f0-a877-407a-82df-cf1a5a95917e)

### ERC721 로컬 테스트

#### 1. 로컬 네트워크에 배포

##### (1) env 설정

###### 1) env 설치

```shell
npm i dotenv
```

###### 2) env 작성

```
RPC_Endpoints=

OWNER_PUBLIC_KEY=

OWNER_PRIVATE_KEY=

RECEIVER_PUBLIC_KEY=

CA=
```

##### (2) hardhat.config.ts의 network 옵션 설정

```ts title=hardhat.config.ts
require("dotenv").config();
const { OWNER_PRIVATE_KEY } = process.env;

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545/",
      accounts: [OWNER_PRIVATE_KEY!],
    },
  },
  solidity: "0.8.24",
};

export default config;
```

##### (3) 로컬 네트워크에 컨트렉트 배포

```bash
npx hardhat run deploy/deployERC721.ts --network ganache
```

#### 2. script 작성

##### (1) 잔고조회

###### 1) 코드 작성

```ts title=scripts/getBalance.ts
require("dotenv").config();
const { CA, OWNER_PUBLIC_KEY } = process.env;
import { ethers } from "hardhat";

async function getBalance() {
  try {
    const contractAddress = CA!;
    const ERC721 = await ethers.getContractAt("MyERC721", contractAddress);

    let balance = await ERC721.balanceOf(OWNER_PUBLIC_KEY!);

    console.log(`NFT Balance of ${OWNER_PUBLIC_KEY} is ${balance}`);
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
}

getBalance();
```

###### 2) 실행

```shell
npx hardhat run scripts/getBalance.ts --network ganache
```

##### (2) 발행

###### 1) 코드작성

```ts title=scripts/mint.ts
require("dotenv").config();
const { CA, RECEIVER_PUBLIC_KEY } = process.env;
import { ethers } from "hardhat";

async function mint() {
  try {
    const contractAddress = CA!;
    const ERC721 = await ethers.getContractAt("MyERC721", contractAddress);

    const mint = await ERC721.mint(RECEIVER_PUBLIC_KEY!);
    console.log("mint :", mint);

    const numebr1NftOwnerAddresss = await ERC721.ownerOf("1");
    console.log(`NFT 1 owner is ${numebr1NftOwnerAddresss}`);
    console.log(`RECEIVER_PUBLIC_KEY is ${RECEIVER_PUBLIC_KEY}`);
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
}

mint();
```

###### 2) 실행

```shell
npx hardhat run scripts/mint.ts --network ganache
```

##### (3) 전송

###### 1) 코드작성

```ts title=scripts/transfer.ts
require("dotenv").config();
const { CA, OWNER_PUBLIC_KEY, RECEIVER_PUBLIC_KEY } = process.env;
import { ethers } from "hardhat";

async function transfer() {
  try {
    const contractAddress = CA!;
    const ERC721 = await ethers.getContractAt("MyERC721", contractAddress);
    const tokenId = "0";

    const transfer = await ERC721.transferFrom(
      OWNER_PUBLIC_KEY!,
      RECEIVER_PUBLIC_KEY!,
      tokenId
    );

    const numebr1NftOwnerAddresss = await ERC721.ownerOf(tokenId);
    console.log("transfer :", transfer);
    console.log(`NFT ${tokenId} owner is ${numebr1NftOwnerAddresss}`);
    console.log(`RECEIVER_PUBLIC_KEY is ${RECEIVER_PUBLIC_KEY}`);
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
}

transfer();
```

###### 2) 실행

```shell
npx hardhat run scripts/transfer.ts --network ganache
```

### ERC721 이벤트 로그

#### 1. script 작성

##### (1) Transfer 이벤트

###### 1) 코드 작성

```ts title=scripts/transferEvent.ts
require("dotenv").config();
const { CA, RECEIVER_PUBLIC_KEY } = process.env;
import { ethers } from "hardhat";
import json from "../artifacts/contracts/MyERC721.sol/MyERC721.json";

async function transferEvent() {
  try {
    const contractAddress = CA!;

    const ERC721 = await ethers.getContractAt("MyERC721", contractAddress);

    const topic = await ERC721.filters.Transfer().getTopicFilter();
    const filter: any = {
      address: contractAddress,
      fromBlock: 0,
      toBlock: 10000000,
      topics: [topic],
    };

    const logs = await ethers.provider.getLogs(filter);
    const abi = json.abi;
    let iface = new ethers.Interface(abi);

    logs.forEach(async (logs) => {
      const receipt = await ethers.provider.getTransactionReceipt(
        logs.transactionHash
      );
      receipt?.logs.forEach((log) => {
        const parsedLog = iface.parseLog(log);
        if (parsedLog?.topic === topic[0]) {
          console.log("from >>", iface.parseLog(log)?.args.from);
          console.log("to >>", iface.parseLog(log)?.args.to);
          console.log(
            "tokenId >>",
            iface.parseLog(log)?.args.tokenId.toString()
          );
        }
      });
    });
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
}

transferEvent();
```

###### 2) 실행

```shell
npx hardhat run scripts/transferEvent.ts --network ganache
```

###### 3) 결과

![image](https://github.com/user-attachments/assets/12337816-ea96-43fc-9106-746d79c37410)

### ERC721 컨트렛트 테스트넷에 배포

#### 1. 네트워크 환경 설정

- https://www.alchemy.com/chain-connect/chain/sepolia

##### (1) 환경 변수

```title=.env
RPC_Endpoints=
OWNER_PUBLIC_KEY=
OWNER_PRIVATE_KEY=
RECEIVER_PUBLIC_KEY=
CA=
```

##### (2) 네트워크 설정에 sepolia 네크워크 추가

```ts title=hardhat.config.ts
require("dotenv").config();
const { RPC_Endpoints, OWNER_PRIVATE_KEY } = process.env;

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545/",
      accounts: [OWNER_PRIVATE_KEY!],
    },
    sepolia: {
      url: RPC_Endpoints,
      accounts: [OWNER_PRIVATE_KEY!],
    },
  },
  solidity: "0.8.24",
};

export default config;
```

#### 2. 테스트넷에 배포

##### (1) 배포

```shell
npx hardhat run deploy/deployERC721.ts --network sepolia
```

![image](https://github.com/user-attachments/assets/3781f8b4-d2f5-4918-a872-a9b05eda75f4)

##### (2) 배포된 Contract etherscan에서 확인

- https://sepolia.etherscan.io/address/0x7834f4896ff6E40662c253ffF1f2289D4022BdA2

##### (3) 배포된 Contract와 상호작용

```shell
npx hardhat run scripts/getBalance.ts --network sepolia
npx hardhat run scripts/mint.ts --network sepolia
npx hardhat run scripts/transfer.ts --network sepolia
npx hardhat run scripts/transferEvent.ts --network sepolia
```
