#### 프로젝트 설정

```shell
mkdir erc721

cd erc721

mkdir metadata

truffle init ./truffle

cd truffle

npm init -y

npm i web3
```

#### matadata

#### EC721 Contract 작성

1. ERC표준 Extension(Openzeppelin/contracts)설치

```shell
npm install @openzeppelin/contracts@4.8.1
```

2. Smart Contract 작성

```solidity title=contracts/MyERC721.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";

contract MyERC721 is ERC721PresetMinterPauserAutoId {
    constructor() ERC721PresetMinterPauserAutoId("MyNFT", "MNFT", "https://raw.githubusercontent.com/neo-rooney/kisa-training/main/erc721/metadata/") {
        mint(msg.sender);
    }
}
```

#### 배포 스크립트 작성

```js title=migrations/1_deploy_erc721.js
const myErc721 = artifacts.require("MyERC721");

module.exports = function (deployer) {
  deployer.deploy(myErc721);
};
```

#### 단위 테스트 실습

##### (1) 테스트 코드 작성

```js title=test/ERC721.js
const ERC721 = artifacts.require("MyERC721");
const BN = web3.utils.BN;

contract("MyERC721", async (accounts) => {
  const msgSender = accounts[0];
  const receiver = accounts[1];
  const tokenId = 0;

  it("생성자에 의해 배포 될 때, NFT가 1개 민팅된다.", async () => {
    const erc721Deployed = await ERC721.deployed();
    const balance = await erc721Deployed.balanceOf.call(msgSender);

    assert.equal(balance, "1", "NFT가 민팅되지 않았습니다.");
  });

  it("NFT가 정상적으로 전송된다.", async () => {
    const erc721Deployed = await ERC721.deployed();
    const ownerOfNft = await erc721Deployed.ownerOf(tokenId.toString());
    console.log(`0번 NFT 소유 주소 : ${ownerOfNft}`);

    await erc721Deployed.transferFrom(msgSender, receiver, tokenId.toString());

    const ownerOfNftAfterTransfer = await erc721Deployed.ownerOf(
      tokenId.toString()
    );
    console.log(`0번 NFT 소유 주소 : ${ownerOfNftAfterTransfer}`);

    assert.equal(
      ownerOfNftAfterTransfer,
      receiver,
      "NFT 전송에 문제가 발생했습니다."
    );
  });
});
```

##### (2) 테스트 실행

```
truffle test
```

##### (3)테스트 결과

![image](https://github.com/user-attachments/assets/04a3b2c0-f773-4251-8c67-e14892c15e74)

#### 1. 로컬 네트워크에 배포

##### (1) truffle-config.js의 network 옵션 설정

```javascript title=truffle-config.js
module.exports = {
  networks: {
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    },
  },
  mocha: {
    // timeout: 100000
  },
  compilers: {
    solc: {
      version: "0.8.19", // Fetch exact version from solc-bin
    },
  },
};
```

##### (2) 로컬 네트워크에 컨트렉트 배포

- Ganache 실행 후 아래 명령어 입력
- 문제 발생 : https://ethereum.stackexchange.com/questions/154082/got-invalid-opcode-when-deploying-a-contract-to-ganache-test-network-from-truf

```shell
truffle migrate --network ganache
```

#### 2. script 작성

##### (1) env 설치 및 파일 생성

```shell
npm i dotenv
```

```json title=.env
RPC_Endpoints=

OWNER_PUBLIC_KEY=

OWNER_PRIVATE_KEY=

RECEIVER_PUBLIC_KEY=

CA=
```

##### (2) 잔고조회

###### 1) 코드 작성

```js title=scripts/getBalance.js
require("dotenv").config();
const { RPC_Endpoints, CA, OWNER_PUBLIC_KEY, RECEIVER_PUBLIC_KEY } =
  process.env;

const fs = require("fs");
const { Web3 } = require("web3");

const web3 = new Web3(RPC_Endpoints);

const contractABI = JSON.parse(
  fs.readFileSync("./build/contracts/MyERC721.json")
).abi;
const contractAddress = CA;

const contract = new web3.eth.Contract(contractABI, contractAddress);

async function getBalance(address) {
  const balance = await contract.methods.balanceOf(address).call();

  console.log(`NFT Balance of ${address} is ${balance}`);
}

getBalance(OWNER_PUBLIC_KEY);
```

###### 2) 실행

```shell
node ./scripts/getBalance.js
```

##### NFT 발행

###### 1) 코드 작성

```js title=scripts/mint.js
require("dotenv").config();
const { RPC_Endpoints, CA, OWNER_PUBLIC_KEY, OWNER_PRIVATE_KEY } = process.env;

const fs = require("fs");
const { Web3 } = require("web3");

const web3 = new Web3(RPC_Endpoints);

const contractABI = JSON.parse(
  fs.readFileSync("./build/contracts/MyERC721.json")
).abi;
const contractAddress = CA;

const contract = new web3.eth.Contract(contractABI, contractAddress);

async function mint(address, privateKey) {
  const gasPrice = await web3.eth.getGasPrice();
  const gasLimit = 2000000;

  const singedTx = await web3.eth.accounts.signTransaction(
    {
      from: address,
      to: contractAddress,
      gasPrice,
      gasLimit,
      data: contract.methods.mint(address).encodeABI(),
    },
    privateKey
  );

  console.log("singedTx >>", singedTx.rawTransaction);

  await web3.eth
    .sendSignedTransaction(singedTx.rawTransaction.toString("hex"))
    .on("receipt", console.log);
}

mint(OWNER_PUBLIC_KEY, OWNER_PRIVATE_KEY);
```

###### 2) 실행

```shell
node ./scripts/mint.js
node ./scripts/getBalance.js
```

##### NFT 전송

###### 1) 코드 작성

```js title=scripts/transfer.js
require("dotenv").config();
const {
  RPC_Endpoints,
  CA,
  OWNER_PUBLIC_KEY,
  OWNER_PRIVATE_KEY,
  RECEIVER_PUBLIC_KEY,
} = process.env;

const fs = require("fs");
const { Web3 } = require("web3");

const web3 = new Web3(RPC_Endpoints);

const contractABI = JSON.parse(
  fs.readFileSync("./build/contracts/MyERC721.json")
).abi;
const contractAddress = CA;

const contract = new web3.eth.Contract(contractABI, contractAddress);

async function transfer(from, fromPrivateKey, to, tokenId) {
  const gasPrice = await web3.eth.getGasPrice();
  const gasLimit = 2000000;

  const singedTx = await web3.eth.accounts.signTransaction(
    {
      from,
      to: contractAddress,
      gasPrice,
      gasLimit,
      data: contract.methods
        .transferFrom(from, to, tokenId.toString())
        .encodeABI(),
    },
    fromPrivateKey
  );

  await web3.eth
    .sendSignedTransaction(singedTx.rawTransaction.toString("hex"))
    .on("receipt", console.log);

  const onwerBalance = await contract.methods.balanceOf(from).call();

  const receiverBalance = await contract.methods.balanceOf(to).call();

  console.log(`전송 후 owner의 잔고 : ${onwerBalance}`);
  console.log(`전송 후 receiver의 잔고 : ${receiverBalance}`);
}

transfer(OWNER_PUBLIC_KEY, OWNER_PRIVATE_KEY, RECEIVER_PUBLIC_KEY, 0);
```

###### 2) 실행

```shell
node ./scripts/transfer.js
```

#### 1. Ethereum 테스트넷

- 테스트넷이란 실제 블록체인 네트워크에 적용시키기 전에 테스트하는 환경으로, 메인넷과 같은 구조의 임시 네트워크
- Goerli Testnet, Sepolia Testnet, Holesky Testnet 등
- 테스트넷에서 테스트를 하기 위해 테스트용 ETH를 받아야함

#### 2. Endpint

##### (1) infura

- https://www.infura.io/
  ![image](https://github.com/user-attachments/assets/a50ee43b-5270-4c95-9709-7322f12810b5)
  ![image](https://github.com/user-attachments/assets/c9ffc376-f945-4ae7-b8b8-1342792e1fd5)
  ![image](https://github.com/user-attachments/assets/f47404ad-542d-4c81-9ae9-4521457811f8)

##### (2) Alchemy

- https://www.alchemy.com/chain-connect/chain/sepolia

#### 3. testnet faucet ether 얻기

- https://www.alchemy.com/faucets/ethereum-sepolia
- 틈틈이 testnet ether를 받아 놓는것이 좋다.

#### 4. 네트워크 환경설정

##### (1) 환경 변수

```title=.env
RPC_Endpoints=
OWNER_PUBLIC_KEY=
OWNER_PRIVATE_KEY=
RECEIVER_PUBLIC_KEY=
CA=
```

##### (2) 테스트넷 배포에 필요한 package 설치

```shell
npm install @truffle/hdwallet-provider
```

- [HDWalletProvider Docs](https://github.com/trufflesuite/truffle/blob/develop/packages/hdwallet-provider/README.md#instantiation)

##### (3) 네트워크 설정에 sepolia 네크워크 추가

```js title=truffle-config.js
require("dotenv").config();
const { OWNER_PRIVATE_KEY, RPC_Endpoints } = process.env;
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  networks: {
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    },
    sepolia: {
      provider: () => new HDWalletProvider(OWNER_PRIVATE_KEY, RPC_Endpoints),
      network_id: 11155111,
    },
  },
  mocha: {
    // timeout: 100000
  },
  compilers: {
    solc: {
      version: "0.8.13",
    },
  },
};
```

#### 5. 테스트넷에 배포

##### (1) 배포

```shell
truffle migrate --network sepolia
```

- https://www.alchemy.com/chain-connect/chain/sepolia
  ![image](https://github.com/user-attachments/assets/395f0151-c26a-4cfa-8fda-66d292640252)

##### (2) 배포된 Contract etherscan에서 확인

- https://sepolia.etherscan.io/tx/0xaf46f57a5c76c729e38328e7437180d009488507ef4e33db50056fcc335fe4e1

##### (3) 테스트넷에 배포된 Contract와 상호작용

```
node ./scripts/getBalance.js
node ./scripts/mint.js
node ./scripts/transfer.js
```
