#### 기본 예제 프로젝트에 web3.js 설치

1. [web3.js 설치](https://docs.web3js.org/guides/getting_started/quickstart)

```
npm i web3
```

2. 지갑 조회 script 작성

```js
const fs = require("fs");
const { Web3 } = require("web3");

const web3 = new Web3("http://127.0.0.1:7545/");

const contractABI = JSON.parse(
  fs.readFileSync("./build/contracts/MetaCoin.json")
).abi;
const contractAddress = "";

const contract = new web3.eth.Contract(contractABI, contractAddress);

async function getBalance() {
  const accounts = await web3.eth.getAccounts();
  const defaultAccount = accounts[0];
  const balanceBigInt = await contract.methods
    .getBalance(defaultAccount)
    .call();
  const balanceNumber = Number(balanceBigInt);
  console.log("balance >>", balanceNumber);
}

getBalance();
```

3. 잔액 조회 script 실행

```
node scripts/getBalances.js
```

4. transfer script 작성

```js
const fs = require("fs");
const { Web3 } = require("web3");

const web3 = new Web3("");

const contractABI = JSON.parse(
  fs.readFileSync("./build/contracts/MetaCoin.json")
).abi;
const contractAddress = "";

const contract = new web3.eth.Contract(contractABI, contractAddress);

async function purchase() {
  try {
    const accounts = await web3.eth.getAccounts();

    const sender = accounts[0];
    const receiver = accounts[1];
    const value = 500;

    await contract.methods.sendCoin(receiver, value).send({ from: sender });

    const senderBalanceBigInt = await contract.methods
      .getBalance(sender)
      .call();
    const senderBalance = Number(senderBalanceBigInt);

    const receiverBalanceBigInt = await contract.methods
      .getBalance(receiver)
      .call();
    const receiverBalance = Number(receiverBalanceBigInt);

    console.log(`sender : ${sender} >> ${senderBalance}`);
    console.log(`receiver : ${receiver} >> ${receiverBalance}`);
  } catch (e) {
    console.log(e);
  }
}

purchase();
```

5. 전송 스크립트 실행

```
node scripts/transfer.js
```
