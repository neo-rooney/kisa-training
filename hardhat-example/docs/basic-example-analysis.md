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

![image](https://github.com/user-attachments/assets/0547460a-ed9b-4c32-a990-4b27d300cccb)

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

![image](https://github.com/user-attachments/assets/dca03465-278f-42e2-ba2c-76bb581341dd)

#### 로컬 네트워크에 배포

```
npx hardhat node

npx hardhat ignition deploy ./ignition/modules/Lock.ts --network localhost
```
