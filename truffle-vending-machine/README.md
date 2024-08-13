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

```shell title=truffle_project_init
mkdir truffle-vending-machine

cd truffle-vending-machine

npm init -y

npm i truffle

truffle init
```

#### 3. Smart Contract 작성

```solidity title=contract/VendingMachine.sol
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
        require(msg.value >= amount * 0.0001 ether, "You must pay at least 0.0001 ETH per cupcake");
        require(cupcakeBalances[address(this)] >= amount, "Not enough cupcakes in stock to complete this purchase");
        cupcakeBalances[address(this)] -= amount;
        cupcakeBalances[msg.sender] += amount;
        emit Purchase(msg.sender, amount);
    }
}
```

##### (1) 이벤트와 로그

- Events는 Smart Contract 상에서 사용자가 알림을 받고 싶은 내용을 등록하는 것이다.
- 거래의 생성이나 변경등을 확인(logs를 통해)하고 그에 맞는 행동을 할 수 있게 도와준다.

#### 4. Deploy Script 작성

- 1_deploy_vendinMachine.js

```js title=migrations/1_deploy_contract.js 작성
const VendingMachine = artifacts.require("VendingMachine");

module.exports = function (deployer) {
  deployer.deploy(VendingMachine);
};
```

#### 5. 단위테스트

##### (1) 테스트 코드 작성

```js title=test/vandingMachine.js
const VendingMachine = artifacts.require("VendingMachine");

contract("VendingMachine", async (accounts) => {
  it("컨트랙트가 배포 될 때 컵케익의 개수는 100이다.", async () => {
    const vendingMachineInstance = await VendingMachine.deployed();
    const balance = await vendingMachineInstance.cupcakeBalances.call(
      vendingMachineInstance.address
    );
    assert.equal(balance.valueOf(), 100);
  });

  it("컵케익이 정상적으로 전달된다.", async () => {
    const vendingMachineInstance = await VendingMachine.deployed();
    // Setup contract and receiver
    const contract = vendingMachineInstance.address;
    const receiver = accounts[1];

    // Get initial balances of contract and receiver.
    const contractStartingBalance = (
      await vendingMachineInstance.cupcakeBalances.call(contract)
    ).toNumber();
    const receiverStartingBalance = (
      await vendingMachineInstance.cupcakeBalances.call(receiver)
    ).toNumber();

    // Make transaction from contract to receiver.
    const amount = 10;
    const cupcakePrice = 0.0001;
    await vendingMachineInstance.purchase(amount, {
      from: receiver,
      value: amount * cupcakePrice * 10 ** 18,
    });

    // Get balances of contract and receiver after the transactions.
    const contractrEndingBalance = (
      await vendingMachineInstance.cupcakeBalances.call(contract)
    ).toNumber();
    const receiverEndingBalance = (
      await vendingMachineInstance.cupcakeBalances.call(receiver)
    ).toNumber();
    console.log("contractrEndingBalance >>", contractrEndingBalance);
    console.log("receiverEndingBalance >>", receiverEndingBalance);
    assert.equal(
      contractrEndingBalance,
      contractStartingBalance - amount,
      "Amount wasn't correctly taken from the contract"
    );
    assert.equal(
      receiverEndingBalance,
      receiverStartingBalance + amount,
      "Amount wasn't correctly taken from the receiver"
    );
  });

  it("컵케익이 정상적으로 리필된다.", async () => {
    const vendingMachineInstance = await VendingMachine.deployed();
    const vendingMahcineStartingBalance = (
      await vendingMachineInstance.cupcakeBalances.call(
        vendingMachineInstance.address
      )
    ).toNumber();

    console.log("vendingMahcineStartingBalance", vendingMahcineStartingBalance);
    const amount = 10;
    await vendingMachineInstance.refill(amount);

    const vendingMahcineEndingBalance = (
      await vendingMachineInstance.cupcakeBalances.call(
        vendingMachineInstance.address
      )
    ).toNumber();
    console.log("vendingMahcineEndingBalance", vendingMahcineEndingBalance);

    assert.equal(
      vendingMahcineEndingBalance,
      vendingMahcineStartingBalance + amount,
      "Cupcakes wasn't refilled correctly"
    );
  });
});
```

##### (2) test 실행

```shell title=테스트_수행
truffle test ./test/vandingMachine.js
```

#### 6. web3.js를 이용한 Contract interaction script 작성

##### (1) web3.js 설치

```shell title=web3.js
npm install web3
```

##### (2) getBalances.js script 작성

```js title=scripts/getBalances.js
const fs = require("fs");
const { Web3 } = require("web3");

const web3 = new Web3("");

const contractABI = JSON.parse(
  fs.readFileSync("./build/contracts/VendingMachine.json")
).abi;
const contractAddress = "";

const contract = new web3.eth.Contract(contractABI, contractAddress);

async function getBalance() {
  const balanceBigInt = await contract.methods
    .cupcakeBalances(contractAddress)
    .call();
  const balanceNumber = Number(balanceBigInt);
  console.log("balance >>", balanceNumber);
}

getBalance();
```

##### (3) purchase script 작성

```js title=scripts/purchase.js
const fs = require("fs");
const { Web3 } = require("web3");

const web3 = new Web3("");

const contractABI = JSON.parse(
  fs.readFileSync("./build/contracts/VendingMachine.json")
).abi;
const contractAddress = "";

const contract = new web3.eth.Contract(contractABI, contractAddress);

async function purchase() {
  try {
    const accounts = await web3.eth.getAccounts();
    const receiver = accounts[2];
    const amount = 1;
    const value = amount * 10 ** 18;
    const cupcakePrice = 0.0001;

    await contract.methods
      .purchase(amount)
      .send({ from: receiver, value: value * cupcakePrice })
      .on("transactionHash", function (hash) {
        console.log("tx hash >>", hash);
      })
      .on("receipt", function (receipt) {
        console.log("tx receipt >>", receipt);
      })
      .on("error", console.error);

    const contractBalance = await contract.methods
      .cupcakeBalances(contractAddress)
      .call();

    const receiverBalance = await contract.methods
      .cupcakeBalances(receiver)
      .call();

    console.log(`contract : ${contractAddress} >> ${contractBalance}`);
    console.log(`receiver : ${receiver} >> ${receiverBalance}`);
  } catch (e) {
    console.log(e);
  }
}

purchase();
```

##### (4) refill script 작성

```js title=scripts/refill.js
const fs = require("fs");
const { Web3 } = require("web3");

const web3 = new Web3("");

const contractABI = JSON.parse(
  fs.readFileSync("./build/contracts/VendingMachine.json")
).abi;
const contractAddress = "";

const contract = new web3.eth.Contract(contractABI, contractAddress);

async function refill() {
  try {
    const accounts = await web3.eth.getAccounts();
    const owner = accounts[0];
    const amount = 1;

    await contract.methods.refill(amount).send({ from: owner });

    const contractBalance = await contract.methods
      .cupcakeBalances(contractAddress)
      .call();

    console.log(`contract : ${contractAddress} >> ${contractBalance}`);
  } catch (e) {
    console.log(e);
  }
}

refill();
```

##### (5) Event Script 작성

```js title=scripts/purchaseEvent.js
const fs = require("fs");
const { Web3 } = require("web3");

const web3 = new Web3("");

const contractABI = JSON.parse(
  fs.readFileSync("./build/contracts/VendingMachine.json")
).abi;
const contractAddress = "";

const contract = new web3.eth.Contract(contractABI, contractAddress);

async function getPurchaseEvents() {
  const accounts = await web3.eth.getAccounts();
  const receiver = accounts[2];

  const events = await contract.getPastEvents("Purchase", {
    filter: { purchaser: receiver },
    fromBlock: 0,
    toBlock: "latest",
  });

  for (i in events) {
    console.log("i >>", i);
    console.log("blockNumber : ", events[i].blockNumber);
    console.log("blockHash : ", events[i].blockHash);
    console.log("purchaser : ", events[i].returnValues.purchaser);
    console.log("amount : ", Number(events[i].returnValues.amount));
  }
}

getPurchaseEvents();
```

#### 7. 로컬 네트워크에 배포 및 테스트

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
      version: "0.8.13", // Fetch exact version from solc-bin
    },
  },
};
```

##### (2) 로컬 네트워크에 컨트렉트 배포

```shell
truffle migrate --network ganache
```

##### (3) script 테스트

```
node ./scripts/getBalances.js
node ./scripts/purchase.js
node ./scripts/refill.js
node ./scripts/purchaseEvent.js
```
