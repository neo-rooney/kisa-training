// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/draft-ERC721Votes.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyERC721Vote is ERC721, ERC721Burnable, AccessControl, EIP712, ERC721Votes {
    using Counters for Counters.Counter;

    // Define a MINTER_ROLE constant
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("MyERC721Vote", "MEV") EIP712("MyERC721VoteEIP", "1") {
        // Grant the contract deployer the default admin role and minter role
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
    }

    string private _baseTokenURI;

    function _baseURI() internal view virtual override returns (string memory) {
        return "https://metadata-api-server-git-main-rooneydevs-projects.vercel.app/api/token/";
    }

    function mint(address to) public {
        // Check that the caller has the MINTER_ROLE
        require(hasRole(MINTER_ROLE, msg.sender), "MyERC721Vote: must have minter role to mint");
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    // Override supportsInterface to resolve multiple inheritance issues
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // The following functions are overrides required by Solidity.

    function _afterTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Votes)
    {
        super._afterTokenTransfer(from, to, tokenId, batchSize);
    }
}
