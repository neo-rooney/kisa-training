// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/governance/TimelockController.sol";

contract MyTimelockController is TimelockController {
    constructor(
        uint256 minDelay,           // 최소 지연 시간(초)
        address[] memory proposers, // 제안 권한이 있는 주소
        address[] memory executors, // 실행 권한이 있는 주소
        address admin               // 관리자 주소
    )
        TimelockController(minDelay, proposers, executors, admin)
    {}
}
