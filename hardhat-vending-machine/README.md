#### 0. VendingMachine 예제

- https://ethereum.org/en/developers/docs/smart-contracts/#what-is-a-smart-contract

1. SequenceDiagram
2. 프로젝트 생성
3. Smart Contract 작성
   1. 이벤트 로그
4. Deploy Script 작성
5. 단위 테스트
6. Web3.js를 이용한 Contract interaction script 작성
7. 로컬 네트워크에 배포 및 테스트

#### 1. VendingMachine sequenceDiagram

- [Mermaid](https://trusting-cardinal-9c1.notion.site/Vending-Machine-c56c530434924afb8f139336a4ea0e8e?pvs=4)
  ![image](https://github.com/user-attachments/assets/0f3c5cfc-5e58-4122-92ea-f1d6a949f74b)

#### 2. VendingMachine 프로젝트 생성

```
mkdir hardhat-vending-machine
cd hardhat-vending-machine
npm init -y
npm install --save-dev hardhat
npx hardhat init
```

- contracts/Lock.sol 삭제
- ignition 삭제
- test/Lock.ts 삭제

#### 3. Smart Contract 작성

```solidity title=contracts/VendingMachine.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract VendingMachine {
    // Define Event
    event Purchase (address indexed purchaser, uint256 amount);

    // Declare state variables of the contract
    address public owner;
    mapping (address => uint) public cupcakeBalances;

    // When 'VendingMachine' contract is deployed:
    // 1. set the deploying address as the owner of the contract
    // 2. set the deployed smart contract's cupcake balance to 100
    constructor() {
        owner = msg.sender;
        cupcakeBalances[address(this)] = 100;
    }

    // Allow the owner to increase the smart contract's cupcake balance
    function refill(uint amount) public {
        require(msg.sender == owner, "Only the owner can refill.");
        cupcakeBalances[address(this)] += amount;
    }

    // Allow anyone to purchase cupcakes
    function purchase(uint amount) public payable {
        require(msg.value >= amount * 1 ether, "You must pay at least 1 ETH per cupcake");
        require(cupcakeBalances[address(this)] >= amount, "Not enough cupcakes in stock to complete this purchase");
        cupcakeBalances[address(this)] -= amount;
        cupcakeBalances[msg.sender] += amount;
        emit Purchase(msg.sender, amount);
    }
}
```

#### 4. Deploy Script 작성

```js title=deploy/deploy.ts
import { ethers } from "hardhat";

async function main() {
  try {
    console.log("Start contract deployment");
    const factory = await ethers.getContractFactory("VendingMachine");
    const contract = await factory.deploy();
    const address = await contract.getAddress();

    console.log(`Contract is deployed : ${address}`);
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
}

main();
```

```
npx hardhat run deploy/deploy.ts
```

#### 5. 단위테스트

##### (1) 테스트 코드 작성

```ts title=test/VendingMachine.ts
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("VendingMachine", function () {
  async function VendingMachineFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const vendingMachine = await ethers.deployContract("VendingMachine");

    const ca = await vendingMachine.getAddress();

    return { vendingMachine, owner, otherAccount, ca };
  }

  describe("VendingMachine", function () {
    it("컨트랙트가 배포 될 때 컵케익의 개수는 100이다.", async function () {
      const { vendingMachine, ca } = await loadFixture(VendingMachineFixture);
      expect(Number(await vendingMachine.cupcakeBalances(ca))).to.equal(100);
    });

    it("컵케익이 정상적으로 전달된다.", async function () {
      const { vendingMachine, ca, otherAccount } = await loadFixture(
        VendingMachineFixture
      );

      const contractStartingBalance = Number(
        await vendingMachine.cupcakeBalances(ca)
      );

      const receiverStartingBalance = Number(
        await vendingMachine.cupcakeBalances(otherAccount)
      );

      console.log("contractStartingBalance >>", contractStartingBalance);
      console.log("receiverStartingBalance >>", receiverStartingBalance);

      const amount = 10;
      await expect(
        vendingMachine
          .connect(otherAccount)
          .purchase(amount, { value: (amount * 10 ** 18).toString() })
      )
        .to.emit(vendingMachine, "Purchase")
        .withArgs(otherAccount.address, amount);

      const contractrEndingBalance = Number(
        await vendingMachine.cupcakeBalances(ca)
      );

      const receiverEndingBalance = Number(
        await vendingMachine.cupcakeBalances(otherAccount)
      );

      console.log("contractrEndingBalance >>", contractrEndingBalance);
      console.log("receiverEndingBalance >>", receiverEndingBalance);

      expect(contractrEndingBalance).to.equal(contractStartingBalance - amount);
      expect(receiverEndingBalance).to.equal(receiverStartingBalance + amount);
    });

    it("컵케익이 정상적으로 리필된다.", async function () {
      const { vendingMachine, ca, otherAccount } = await loadFixture(
        VendingMachineFixture
      );

      const contractStartingBalance = Number(
        await vendingMachine.cupcakeBalances(ca)
      );
      console.log("contractStartingBalance >>", contractStartingBalance);

      const amount: number = 10;
      await vendingMachine.refill(amount);

      const contractrEndingBalance = Number(
        await vendingMachine.cupcakeBalances(ca)
      );
      console.log("contractrEndingBalance >>", contractrEndingBalance);

      expect(contractrEndingBalance).to.equal(contractStartingBalance + amount);
    });
  });
});
```

##### (2) test 실행

```shell title=테스트_수행
npx hardhat test ./test/vandingMachine.ts
```

#### 6. ethers를 이용한 Contract interaction script 작성

##### (1) getBalances script 작성

- scripts/getBalances.ts

```ts title=scripts/getBalances.ts
import { ethers } from "hardhat";

async function getBalance() {
  try {
    const contractAddress = "";

    const vendingMachine = await ethers.getContractAt(
      "VendingMachine",
      contractAddress
    );

    let balance = await vendingMachine.cupcakeBalances(contractAddress);
    console.log("Cupcake balance of contract:", balance.toString());
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
}

getBalance();
```

##### (2) purchase script 작성

- scripts/purchase.ts

```ts title=scripts/purchase.ts
import { ethers } from "hardhat";

async function purchase() {
  try {
    const amount = 10;

    const contractAddress = "";

    const vendingMachine = await ethers.getContractAt(
      "VendingMachine",
      contractAddress
    );

    const purchase = await vendingMachine.purchase(amount, {
      value: (amount * 10 ** 18).toString(),
    });

    console.log("purchase :", purchase);
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
}

purchase();
```

##### (3) refill script 작성

- scripts/refill.ts

```ts title=scripts/refill.js
import { ethers } from "hardhat";

async function purchase() {
  try {
    const amount = 1;

    const contractAddress = "";

    const vendingMachine = await ethers.getContractAt(
      "VendingMachine",
      contractAddress
    );

    await vendingMachine.refill(amount);

    const balanceBigInt = await vendingMachine.cupcakeBalances(contractAddress);

    const balanceNumber = Number(balanceBigInt);
    console.log("balance >>", balanceNumber);
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
}

purchase();
```

##### (4) Event Script 작성

- scripts/purchaseEvent.ts

```ts title=scripts/purchaseEvent.ts
import { ethers } from "hardhat";
import json from "../artifacts/contracts/VendingMachine.sol/VendingMachine.json";

async function purchaseEvent() {
  try {
    const contractAddress = "";

    const vendingMachine = await ethers.getContractAt(
      "VendingMachine",
      contractAddress
    );

    const topic = await vendingMachine.filters.Purchase().getTopicFilter();
    const ca = await vendingMachine.getAddress();
    const filter: any = {
      address: ca,
      fromBlock: 0,
      toBlock: 10000000,
      topics: [topic],
    };

    const logs = await ethers.provider.getLogs(filter);
    const abi = json.abi;
    let iface = new ethers.Interface(abi);

    //로그를 분석하기 위해서 abi를 가져옴
    logs.forEach(async (logs) => {
      //실제로 이벤트 로그 내용을 분석하기 위해서는 각각의 트랜잭션 receipt를 가져와서 처리해야 한다.
      const receipt = await ethers.provider.getTransactionReceipt(
        logs.transactionHash
      );
      // console.log("receipt >>>", receipt);
      //반복문을 통해서 각로그들의 내용 출력 진행
      receipt?.logs.forEach((log) => {
        // console.log("iface.parseLog(log) >>", iface.parseLog(log));
        console.log("purchaser >>", iface.parseLog(log)?.args[0]);
        console.log("amount >>", Number(iface.parseLog(log)?.args[1]));
      });
    });
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
}

purchaseEvent();
```

#### 7. 로컬 네트워크에 배포 및 테스트

##### (1) hardhat.config.ts의 network 옵션 설정

```ts title=hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545/",
      accounts: [""],
    },
  },
  solidity: "0.8.24",
};

export default config;
```

##### (2) 로컬 네트워크에 컨트렉트 배포

```bash
npx hardhat run deploy/deploy.ts --network ganache
```

##### (3) script 테스트

```
npx hardhat run scripts/purchase.ts --network ganache
npx hardhat run scripts/cupcakeBalance.ts --network ganache
npx hardhat run scripts/refill.ts --network ganache
npx hardhat run scripts/purchaseEvent.ts --network ganache
```
