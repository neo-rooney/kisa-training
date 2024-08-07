// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";

contract MyGovernor is Governor, GovernorCountingSimple, GovernorVotes, GovernorVotesQuorumFraction {
    constructor(IVotes _token)
        Governor("MyGovernor")
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4) // 4% 의결 정족수
    {}

    function votingDelay() public view override returns (uint256) {
        return 1; // 투표 시작 전 대기 블록 수
    }

    function votingPeriod() public view override returns (uint256) {
        // return 1 weeks; // 투표 기간 (1주일)
        return 5; // 5 block to vote
    }

    function quorum(uint256 blockNumber) public view virtual override(GovernorVotesQuorumFraction, IGovernor) returns (uint256) {
        return super.quorum(blockNumber);
    }

    function executeProposal(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) external {
        ProposalState state = state(proposalId);
        require(state == ProposalState.Succeeded, "Proposal not succeeded");

        // 시간 잠금 구현 (2일)
        uint256 unlockTime = block.timestamp + 2 days;
        require(block.timestamp >= unlockTime, "Proposal is still locked");

        _execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor) {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor() internal view override(Governor) returns (address) {
        return super._executor();
    }
}
