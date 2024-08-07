### ERC721 기반 Governor 컨트렉트 작성

#### 1. 예제 분석

- https://docs.openzeppelin.com/contracts/4.x/governance
- 토큰 기반 투표권:
  - 투표권은 특정 ERC721 토큰을 보유한 사람에게 부여됩니다.
  - 각 토큰은 1개의 투표권을 대표합니다. 즉, 10개의 NFT 토큰을 보유하고 있다면 10개의 투표권을 행사할 수 있습니다.
  - 투표권은 현재 잔액이 아니라 과거 스냅샷(제안서 생성 시점의 잔액)을 기준으로 합니다. 이 방식은 토큰을 이중으로 사용할 수 없도록 보호합니다.
- 의결 정족수:
  - 제안서가 통과되기 위해서는 전체 토큰 공급량의 일정 비율(예: 4%) 이상이 투표에 참여해야 합니다.
  - 의결 정족수는 해당 시점의 총 토큰 공급량을 기준으로 계산됩니다.
- 투표 옵션:
  - 투표자는 "찬성", "반대", "기권" 세 가지 옵션 중 하나를 선택할 수 있습니다.
  - "찬성" 및 "기권" 투표만이 의결 정족수에 포함됩니다.
- 투표 기간:
  - 제안서가 생성된 후 일정 기간(예: 1주일) 동안 투표가 가능합니다.
  - 이 기간 동안 투표자들은 자신이 선택한 옵션으로 투표를 합니다

#### 2. 프로젝트 세팅

```shell
mkdir dao

cd dao

mkdir erc721

cd erc721

npm init -y

npm install --save-dev hardhat

npx hardhat init

npm install @openzeppelin/contracts@4.8.1
```

- typescript 프로젝트로 선택하여 진행
- contracts/Lock.sol 삭제
- ignition 삭제
- test/Lock.ts 삭제

#### 3. Contract 작성

##### (1) MyERC721Vote.sol

```solidity title=contracts/MyERC721Vote.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/draft-ERC721Votes.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyERC721Vote is ERC721, ERC721Burnable, AccessControl, EIP712, ERC721Votes {
    using Counters for Counters.Counter;

    // Define a MINTER_ROLE constant
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("MyERC721Vote", "MEV") EIP712("MyERC721VoteEIP", "1") {
        // Grant the contract deployer the default admin role and minter role
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
    }

    string private _baseTokenURI;

    function _baseURI() internal view virtual override returns (string memory) {
        return "https://metadata-api-server-git-main-rooneydevs-projects.vercel.app/api/token/";
    }

    function mint(address to) public {
        // Check that the caller has the MINTER_ROLE
        require(hasRole(MINTER_ROLE, msg.sender), "MyERC721Vote: must have minter role to mint");
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    // Override supportsInterface to resolve multiple inheritance issues
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // The following functions are overrides required by Solidity.

    function _afterTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Votes)
    {
        super._afterTokenTransfer(from, to, tokenId, batchSize);
    }
}
```

##### (2) MyGovernor.sol

```solidity title=contracts/MyGovernor.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";

contract MyGovernor is Governor, GovernorCountingSimple, GovernorVotes {
    constructor(IVotes _token)
        Governor("MyGovernor")
        GovernorVotes(_token)
    {}

    function votingDelay() public view override returns (uint256) {
        return 9; // 9 block to snap shot
    }

    function votingPeriod() public view override returns (uint256) {
        return 5; // 5 block to vote
    }

    // // The following functions are overrides required by Solidity.
    /**
     * @dev Returns the quorum for a block number, in terms of number of votes: `supply * numerator / denominator`.
     */
    function quorum(uint256 blockNumber) public view virtual override returns (uint256) {
        //원할 시 정족수에 대한 로직 추가 가능
        return 1;
    }

    function quorumReached(uint256 proposalId) public view returns (bool){
        return _quorumReached(proposalId);
    }

    function voteSucceeded(uint256 proposalId) public view returns (bool){
        return _voteSucceeded(proposalId);
    }
}
```

### ERC 721 기반 Governor 컨트렉트 테스트

#### 1. 테스트 실습

##### (1) 테스트 코드 작성

- MyGovernorTest.ts

```ts title=test/MyGovernorTest.ts
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";

describe("MyGovernor", function () {
  async function MyGovernorFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    // MyERC721Vote 배포
    const MyERC721Vote = await ethers.deployContract("MyERC721Vote");
    const MyERC721VoteCA = await MyERC721Vote.getAddress();

    // MyGovernor 배포 (MyERC721Vote의 주소를 사용하여 IVotes 인터페이스로 초기화)
    const MyGovernor = await ethers.deployContract("MyGovernor", [
      MyERC721VoteCA,
    ]);

    const MyGovernorCA = await MyGovernor.getAddress();

    // MyGovernor 컨트랙트에 MINTER_ROLE 부여
    await MyERC721Vote.grantRole(
      await MyERC721Vote.MINTER_ROLE(),
      MyGovernorCA
    );

    // 초기 설정: NFT 0번 발행
    await MyERC721Vote.mint(owner.address);
    await MyERC721Vote.connect(owner).delegate(owner);

    return {
      MyGovernor,
      MyERC721Vote,
      owner,
      addr1,
      addr2,
      MyERC721VoteCA,
      MyGovernorCA,
    };
  }

  it("배포 테스트 ", async () => {});

  it("제안 생성 및 투표 테스트", async () => {
    let currentBlockNumber;

    const { MyGovernor, MyERC721Vote, owner, addr1, addr2, MyERC721VoteCA } =
      await loadFixture(MyGovernorFixture);

    // 배포 테스트
    const name = "MyERC721Vote";
    const symbol = "MEV";
    expect(await MyERC721Vote.name()).to.equal(name);
    expect(await MyERC721Vote.symbol()).to.equal(symbol);
    expect(await MyGovernor.votingDelay()).to.equal(9);
    expect(await MyGovernor.votingPeriod()).to.equal(5);

    // 제안 생성
    const targets = [MyERC721VoteCA];
    const values = [0];
    const calldatas = [
      MyERC721Vote.interface.encodeFunctionData("mint", [addr2.address]),
    ];
    const description = "Mint a new NFT to addr2";

    const proposeId = await MyGovernor.hashProposal(
      targets,
      values,
      calldatas,
      ethers.id(description)
    );

    await MyGovernor.propose(targets, values, calldatas, description);

    // 제안 상태 확인 - votingDelay가 초과되지 않았으므로 Pending
    const state = await MyGovernor.state(proposeId);
    expect(state).to.equal(0); // 0은 ProposalState.Pending 상태를 의미함

    //  블록을 생성하여 제안이 Active 상태가 되도록 함
    const votingDelay = await MyGovernor.votingDelay();
    for (let i = 0; i <= votingDelay; i++) {
      await network.provider.send("evm_mine", []); // votingDelay 만큼 블록 생성
    }
    // 제안 상태 확인 - votingDelay 초과되었으므로 Active
    const afterDeplayState = await MyGovernor.state(proposeId);
    expect(afterDeplayState).to.equal(1); // 1은 ProposalState.Active 상태를 의미함(투표 가능)

    // 투표권 확인
    console.log(
      "투표권 부여의 기준 블록 Number : ",
      await MyGovernor.proposalSnapshot(proposeId)
    );
    currentBlockNumber = await ethers.provider.getBlockNumber();
    console.log("currentBlockNumber", currentBlockNumber);
    expect(
      await MyERC721Vote.getPastVotes(owner.address, currentBlockNumber - 1)
    ).to.equal("1");
    expect(
      await MyGovernor.getVotes(owner.address, currentBlockNumber - 1)
    ).to.equal("1");

    console.log(
      "투표 종료 블록 Number : ",
      await MyGovernor.proposalDeadline(proposeId)
    );
    currentBlockNumber = await ethers.provider.getBlockNumber();
    console.log("currentBlockNumber : ", currentBlockNumber);

    // 투표 실행: owner가 제안에 대해 "찬성"으로 투표
    await MyGovernor.connect(owner).castVote(proposeId, 1);

    // 투표 기간이 끝날 때까지 블록 생성
    const votingPeriod = await MyGovernor.votingPeriod();
    for (let i = 0; i < votingPeriod; i++) {
      await network.provider.send("evm_mine", []);
    }

    currentBlockNumber = await ethers.provider.getBlockNumber();
    console.log("currentBlockNumber : ", currentBlockNumber);

    // 제안의 상태를 확인
    const afterVoteState = await MyGovernor.state(proposeId);
    expect(afterVoteState).to.equal(4); // 4는 ProposalState.Succeeded 상태를 의미함

    // // // 제안 실행
    await MyGovernor.execute(
      targets,
      values,
      calldatas,
      ethers.id(description)
    );

    expect(await MyERC721Vote.ownerOf(1)).to.equal(addr2.address);
  });
});
```

##### (2) 테스트 실행

```shell
npx hardhat test ./test/MyGovernorTest.ts
```

##### (3) 테스트 결과

![image](https://github.com/user-attachments/assets/d128020f-8d29-406f-a24d-10e2805f5916)

### ERC 721 기반 Governer 로컬 테스트

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

MY_ERC721_VOTE_CA=

MY_GOVERNOR_CA=
```

##### (2) hardhat.config.ts의 network 옵션 설정

```ts title=hardhat.config.ts
require("dotenv").config();
const { RPC_Endpoints, OWNER_PRIVATE_KEY } = process.env;

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  networks: {
    ganache: {
      url: RPC_Endpoints,
      accounts: [OWNER_PRIVATE_KEY!],
    },
  },
  solidity: "0.8.24",
};

export default config;
```

##### (3) 배포 스크립트 작성

- deploy.ts

```ts title=deploy/deploy.ts
import { ethers } from "hardhat";

async function main() {
  console.log("Start MyERC721Vote contract deployment");

  // Deploy MyERC721Vote contract
  const erc721Factory = await ethers.getContractFactory("MyERC721Vote");
  const erc721Contract = await erc721Factory.deploy();

  const erc721Address = await erc721Contract.getAddress();
  console.log(`MyERC721Vote Contract is deployed: ${erc721Address}`);

  console.log("Start MyGovernor contract deployment");

  // Deploy MyGovernor contract with the address of the deployed MyERC721Vote contract
  const governorFactory = await ethers.getContractFactory("MyGovernor");
  const governorContract = await governorFactory.deploy(erc721Address);

  const governorAddress = await governorContract.getAddress();
  console.log(`MyGovernor Contract is deployed: ${governorAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

##### (4) 로컬 네트워크에 컨트렉트 배포

- ganache 실행

```bash
npx hardhat run deploy/deploy.ts --network ganache
```

#### 2. Script 작성

##### (1) Vote.ts

###### 1) 코드 작성

- vote.ts

```ts title=scripts/vote.ts
require("dotenv").config();
import { ethers, network } from "hardhat";

const { MY_ERC721_VOTE_CA, MY_GOVERNOR_CA, RECEIVER_PUBLIC_KEY } = process.env;

async function main() {
  try {
    const [owner] = await ethers.getSigners();

    // 컨트랙트 인스턴스 생성
    const MyERC721Vote = await ethers.getContractAt(
      "MyERC721Vote",
      MY_ERC721_VOTE_CA!
    );
    const MyGovernor = await ethers.getContractAt(
      "MyGovernor",
      MY_GOVERNOR_CA!
    );

    await MyERC721Vote.mint(owner.address);
    // 투표권 위임 (제안 생성 전에 수행)
    await MyERC721Vote.connect(owner).delegate(owner.address);
    console.log(`Votes delegated to ${owner.address}`);

    // 제안 생성
    const targets = [MY_ERC721_VOTE_CA!];
    const values = [0];
    const calldatas = [
      MyERC721Vote.interface.encodeFunctionData("mint", [RECEIVER_PUBLIC_KEY!]),
    ];
    const description = "Mint a new NFT to addr2";

    const proposeId = await MyGovernor.hashProposal(
      targets,
      values,
      calldatas,
      ethers.id(description)
    );

    await MyGovernor.propose(targets, values, calldatas, description);

    console.log(`Proposal created with ID: ${proposeId}`);

    // votingDelay 만큼 블록 생성
    const votingDelay = await MyGovernor.votingDelay();
    for (let i = 0; i <= votingDelay; i++) {
      await network.provider.send("evm_mine", []);
    }

    // 현재 블록 번호 가져오기
    let currentBlockNumber = await ethers.provider.getBlockNumber();
    console.log("Current Block Number:", currentBlockNumber);

    // 투표 실행
    const voteTx = await MyGovernor.castVote(proposeId, 1); // 1은 찬성
    await voteTx.wait();

    console.log("Vote cast successfully");

    // votingPeriod 만큼 블록 생성
    const votingPeriod = await MyGovernor.votingPeriod();
    for (let i = 0; i < votingPeriod; i++) {
      await network.provider.send("evm_mine", []);
    }

    currentBlockNumber = await ethers.provider.getBlockNumber();
    console.log("Current Block Number:", currentBlockNumber);

    // 제안의 상태를 확인
    const afterVoteState = await MyGovernor.state(proposeId);
    console.log("Proposal state after voting:", afterVoteState);

    // 제안 상태가 'Succeeded'(4)인지 확인하고, 그렇다면 제안 실행
    if (afterVoteState === BigInt(4)) {
      // 4는 ProposalState.Succeeded 상태를 의미
      const executeTx = await MyGovernor.execute(
        targets,
        values,
        calldatas,
        ethers.id(description)
      );
      await executeTx.wait();

      console.log("Proposal executed successfully");

      // NFT 소유자 확인
      const newOwner = await MyERC721Vote.ownerOf(1);
      console.log(`New NFT Owner is: ${newOwner}`);
    } else {
      console.log("Proposal did not succeed. Current state:", afterVoteState);
    }
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
}

main();
```

###### 2) 실행

```shell
npx hardhat run scripts/vote.ts --network ganache
```

###### 3) 결과

![image](https://github.com/user-attachments/assets/ccf4fd30-1576-46bc-aa23-9cbb15f201a2)

### ERC 721 기반 Governer 테스트넷에 배포

#### 1. 네트워크 환경 설정

- https://chainlist.org/chain/97
- [Bnb Faucet](https://www.bnbchain.org/en/testnet-faucet)

##### (1) 환경 변수

```title=.env
RPC_Endpoints=
OWNER_PUBLIC_KEY=
OWNER_PRIVATE_KEY=
RECEIVER_PUBLIC_KEY=
MY_ERC721_VOTE_CA=
MY_GOVERNOR_CA=
```

##### (2) 네트워크 설정에 bnb 네크워크 추가

```ts title=hardhat.config.ts
require("dotenv").config();
const { RPC_Endpoints, OWNER_PRIVATE_KEY } = process.env;

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  networks: {
    ganache: {
      url: RPC_Endpoints,
      accounts: [OWNER_PRIVATE_KEY!],
    },
    sepolia: {
      url: RPC_Endpoints,
      accounts: [OWNER_PRIVATE_KEY!],
    },
    bnb: {
      url: RPC_Endpoints,
      accounts: [OWNER_PRIVATE_KEY!],
    },
  },
  solidity: "0.8.24",
};

export default config;
```

#### 2. 테스트넷에 배포

##### (1) 배포 스크립트 수정하기

- deploy.ts

```ts title=deploy/deploy.ts
import { ethers } from "hardhat";

async function main() {
  console.log("Start MyERC721Vote contract deployment");

  // Deploy MyERC721Vote contract
  const erc721Factory = await ethers.getContractFactory("MyERC721Vote");
  const erc721Contract = await erc721Factory.deploy();

  // 배포 트랜잭션이 완료될 때까지 대기
  await erc721Contract.deploymentTransaction()?.wait();

  const erc721Address = await erc721Contract.getAddress();
  console.log(`MyERC721Vote Contract is deployed: ${erc721Address}`);

  console.log("Start MyGovernor contract deployment");

  // Deploy MyGovernor contract with the address of the deployed MyERC721Vote contract
  const governorFactory = await ethers.getContractFactory("MyGovernor");
  const governorContract = await governorFactory.deploy(erc721Address);

  // 배포 트랜잭션이 완료될 때까지 대기
  await governorContract.deploymentTransaction()?.wait();

  const governorAddress = await governorContract.getAddress();
  console.log(`MyGovernor Contract is deployed: ${governorAddress}`);

  // Grant MINTER_ROLE to the MyGovernor contract
  const MINTER_ROLE = await erc721Contract.MINTER_ROLE();

  const tx = await erc721Contract.grantRole(MINTER_ROLE, governorAddress);

  // Role 부여 트랜잭션이 완료될 때까지 대기
  await tx.wait();

  console.log(`Granted MINTER_ROLE to MyGovernor contract`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

##### (3) 배포

```shell
npx hardhat run deploy/deploy.ts --network bnb
```

![image](https://github.com/user-attachments/assets/be8e64da-6226-485f-b5e0-283e885f3c08)

##### (3) 배포된 bnb scan에서 확인

- https://testnet.bscscan.com/address/0xc669BeE3ab8b4d256d2F3C942d07BAc727914146
- https://testnet.bscscan.com/address/0x2Da38C4Ba7758310855Cc13F83327D4B4AC44286

##### (4) 스크립트 수정하기

- vote_deploy.ts

```ts title=scripts/vote_deploy.ts
require("dotenv").config();
import { ethers, network } from "hardhat";

const { MY_ERC721_VOTE_CA, MY_GOVERNOR_CA, RECEIVER_PUBLIC_KEY } = process.env;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForBlocks(numBlocks: number, blockTimeInSeconds: number) {
  for (let i = 0; i < numBlocks; i++) {
    console.log(`Waiting for block ${i + 1}/${numBlocks}...`);
    await sleep(blockTimeInSeconds * 1000); // 테스트넷에서의 평균 블록 생성 시간
  }
}

async function sendWithRetry(
  txFunc: () => Promise<any>,
  retries: number = 3
): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const tx = await txFunc();
      const receipt = await tx.wait();
      return receipt;
    } catch (error: any) {
      console.log(`Transaction failed with error: ${error.message}`);
      if (i === retries - 1) throw error;
      console.log(`Retrying... (${i + 1}/${retries})`);
    }
  }
}

async function main() {
  try {
    const [owner] = await ethers.getSigners();

    const MyERC721Vote = await ethers.getContractAt(
      "MyERC721Vote",
      MY_ERC721_VOTE_CA!
    );
    const MyGovernor = await ethers.getContractAt(
      "MyGovernor",
      MY_GOVERNOR_CA!
    );

    await sendWithRetry(() => MyERC721Vote.mint(owner.address));
    await sendWithRetry(() =>
      MyERC721Vote.connect(owner).delegate(owner.address)
    );
    console.log(`Votes delegated to ${owner.address}`);

    const targets = [MY_ERC721_VOTE_CA!];
    const values = [0];
    const calldatas = [
      MyERC721Vote.interface.encodeFunctionData("mint", [RECEIVER_PUBLIC_KEY!]),
    ];
    const description = "Mint a new NFT to addr22222222222";

    const proposeTx = await MyGovernor.propose(
      targets,
      values,
      calldatas,
      description
    );
    const proposeReceipt = await proposeTx.wait();
    const proposeId = await MyGovernor.hashProposal(
      targets,
      values,
      calldatas,
      ethers.id(description)
    );

    console.log(`Proposal created with ID: ${proposeId}`);

    const votingDelay = await MyGovernor.votingDelay();
    const blockTimeInSeconds = 3; // 테스트넷의 평균 블록 생성 시간
    await waitForBlocks(Number(votingDelay), blockTimeInSeconds);
    const voteState = await MyGovernor.state(proposeId);
    console.log("Proposal state:", voteState);

    let currentBlockNumber = await ethers.provider.getBlockNumber();
    console.log("Current Block Number:", currentBlockNumber);

    const voteTx = await MyGovernor.castVote(proposeId, 1); // 1은 찬성
    await voteTx.wait();

    console.log("Vote cast successfully");

    const votingPeriod = await MyGovernor.votingPeriod();
    await waitForBlocks(Number(votingPeriod), blockTimeInSeconds);

    currentBlockNumber = await ethers.provider.getBlockNumber();
    console.log("Current Block Number:", currentBlockNumber);

    const afterVoteState = await MyGovernor.state(proposeId);
    console.log("Proposal state after voting:", afterVoteState);

    if (afterVoteState === BigInt(4)) {
      const executeTx = await MyGovernor.execute(
        targets,
        values,
        calldatas,
        ethers.id(description)
      );
      await executeTx.wait();

      console.log("Proposal executed successfully");
      await waitForBlocks(Number(3), blockTimeInSeconds);
      const newOwner = await MyERC721Vote.ownerOf(1);
      console.log(`New NFT Owner is: ${newOwner}`);
    } else {
      console.log("Proposal did not succeed. Current state:", afterVoteState);
    }
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
}

main();
```

##### (5) 배포된 Contract와 상호작용

```shell
npx hardhat run scripts/vote_deploy.ts --network bnb
```
