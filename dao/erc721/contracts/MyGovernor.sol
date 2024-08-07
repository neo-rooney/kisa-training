// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./MyERC721.sol";
import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Votes.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyGovernor is Governor, GovernorCountingSimple, GovernorVotes, GovernorVotesQuorumFraction {
    MyERC721 public myERC721Token;

    constructor(IVotes _token, MyERC721 _myERC721Token)
        Governor("MyGovernor")
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4)  // 4% 정족수
    {
        myERC721Token = _myERC721Token;
    }

    function votingDelay() public view override returns (uint256) {
        return 1; // 투표 시작 전 대기 블록 수
    }

    function votingPeriod() public view override returns (uint256) {
        return 5; // 투표 기간 (5블록)
    }

    function quorum(uint256 blockNumber) public view override returns (uint256) {
        return super.quorum(blockNumber);
    }

    function executeProposal(
        address to,
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) external {
        require(state(proposalId) == ProposalState.Succeeded, "Proposal not succeeded");

        // 민팅 로직 실행
        myERC721Token.mint(to);

        // 제안 실행
        _execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    // 오버라이드 필요
    function _execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor) {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _executor() internal view override(Governor) returns (address) {
        return super._executor();
    }
}
