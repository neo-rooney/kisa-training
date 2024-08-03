#### hardhat 프로젝트 생성

```
mkdir hardhat-example
npm init -y
```

#### hardhat 설치

```
npm install --save-dev hardhat
```

#### Quick start hardhat

```
npx hardhat init
```

![[스크린샷 2024-08-02 오후 4.25.21.png]]

#### 프로젝트 구조 분석

- contracts : Solidity Contarct 관련 디렉토리
- ignition : Hardhat Ignition module 배포 관련 디렉토리
- test : 테스트 관련 디렉토리
- hardhat.config.ts : network information, 프로젝트 설정 등을 관리하는 파일

#### Smart Contract 분석

- 코드보며 말하기

#### 테스트

```
npx hardhat test
```

#### 컴파일

```
npx hardhat compile
```

#### 배포

```
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```

![[스크린샷 2024-08-02 오후 4.30.50.png]]

#### 로컬 네트워크에 배포

```
npx hardhat node

npx hardhat ignition deploy ./ignition/modules/Lock.ts --network localhost
```

#### 컨트렉트와 상호작용하기

##### (1) script 작성

```ts title=scripts/withdraw.ts
import { ethers } from "hardhat";

async function withdraw() {
  try {
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    const lock = await ethers.getContractAt("Lock", contractAddress);

    lock.withdraw();
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
}

withdraw();
```

##### (2) 실행

```
npx hardhat run scripts/withdraw.ts --network localhost
```
