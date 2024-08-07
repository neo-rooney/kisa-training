#### 기본 예제 프로젝트 생성하기

1. 작업공간 생성
2. [Truffle Boxes](https://archive.trufflesuite.com/boxes)를 이용한 예제 Template 생성

```bash
truffle unbox metacoin ./truffle-example
```

#### 프로젝트 구조 분석

- contracts : Solidity Contarct 관련 디렉토리
  - MetaCoin.sol : smart contract (written in Solidity)
- migrations : 배포 스크립트 관련 디렉토리
  - 1_deploy_contracts.js : migration (deployment) script.
- test : 테스트 관련 디렉토리
  - TestMetaCoin.sol : Solidity로 작성된 테스트 코드 파일
  - metacoin.js : js로 작성된 테스트 코드 파일
- truffle-config.js : network information, 프로젝트 설정 등을 관리하는 파일

#### Smart Contract 분석

- 코드를 보며 설명

#### 테스트

- SmartContract는 메인넷에 배포된 후 수정 할 수 없다. 따라서 테스트가 중요하다
- Dapp은 일반 적으로 로컬 테스트 > 테스트넷 > 메인넷 순서로 개발한다.
- truffle을 이용하면 가상으로 구현된 블록체인 네트워크에서 테스트를 할 수 있다.

```
# 모든 테스트를 동시에 실행
truffle test
# 테스트를 개별적으로 실행
truffle test ./test/TestMetaCoin.sol
truffle test ./test/metacoin.js
```

![image](https://github.com/user-attachments/assets/1fa0d5c6-7720-4265-935b-5804d485d2bd)

#### 컴파일

- Smart Contract를 Compile하게 되면 Bytecode, OPCODE, ABI를 얻게 된다.
- Bytecode : EVM에서 실행되는 저수준의 언어
- ABI : ABI를 통해서 Client에서 정해진 Interface로 Contract와 통신
- OPCODE : Contract와 통신 할 때 가스비 계산에 필요, EVM은 해당 함수의 OPCODE와 사용된 데이터의 크기에 따라 Transaction Gas Limit을 하나씩 계산

```
truffle compile
```

#### 배포

```
truffle develop
```

![image](https://github.com/user-attachments/assets/4d4cd988-dc1c-43f1-a0f2-d0a23af10de0)

```
migrate
```

![image](https://github.com/user-attachments/assets/7a920246-768c-4d40-b2c6-fcf9a097f7c7)

#### Contract와 상호작용

1. truffle-config.js 수정

```js
module.exports = {
  networks: {
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    },
  },
};
```

2. ganache 실행 및 연결
3. 배포

```shell
truffle migrate --network ganache
```

4. truffle console 실행

```
truffle console
```

5. 인스턴스 생성 및 계정 설정

```
let instance = await MetaCoin.deployed()
let accounts = await web3.eth.getAccounts()
```

6. 계약을 배포한 계정의 메타코인 잔액을 확인

```
let balance = await instance.getBalance(accounts[0])
balance.toNumber()
```

7. 한 계정에서 다른 계정으로 메타코인을 전송

```
instance.sendCoin(accounts[1], 500)
```

8. 메타코인을 받은 계좌의 잔액을 확인

```
let received = await instance.getBalance(accounts[1])
received.toNumber()
```

9. 메타코인을 보낸 계좌의 잔액을 확인

```
let newBalance = await instance.getBalance(accounts[0])
newBalance.toNumber()
```
