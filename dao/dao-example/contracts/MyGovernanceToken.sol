// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract MyGovernanceToken is ERC20, ERC20Permit, ERC20Votes {
    constructor() ERC20("MyGovernanceToken", "MGT") ERC20Permit("MyGovernanceToken") {
        // 초기 공급량을 설정하고 토큰을 발행합니다.
        _mint(msg.sender, 100000 * 10 ** decimals()); // 초기 공급량 10만 MGT
    }

    // Solidity에서 요구하는 함수 재정의 (ERC20Votes와 ERC20 간 충돌 해결)
    function _afterTokenTransfer(address from, address to, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._burn(account, amount);
    }
}
