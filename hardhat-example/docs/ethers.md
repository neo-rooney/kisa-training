#### 컨트렉트와 상호작용하기

##### (1) script 작성

```ts title=scripts/withdraw.ts
import { ethers } from "hardhat";

async function withdraw() {
  try {
    const contractAddress = "";

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
