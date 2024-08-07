import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true, // 최적화 옵션 활성화
        runs: 200, // 최적화 실행 횟수, 일반적으로 200이 적절
      },
    },
  },
};

export default config;
