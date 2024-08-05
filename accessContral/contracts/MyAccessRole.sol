// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MyAccessControl is AccessControl {
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }
}