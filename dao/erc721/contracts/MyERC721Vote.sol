// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/draft-ERC721Votes.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyERC721Vote is ERC721, ERC721Burnable, Ownable, EIP712, ERC721Votes {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("MyNFT", "MNFT") EIP712("MyToken", "1") {}

    function _baseURI() internal view virtual override returns (string memory) {
        return "https://metadata-api-server-git-main-rooneydevs-projects.vercel.app/api/token/";
    }

    function mint(address to) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    // 아래 함수들은 Solidity에서 필수로 오버라이드가 필요합니다.

    function _afterTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
    internal
    override(ERC721, ERC721Votes){
      super._afterTokenTransfer(from, to, tokenId, batchSize);
    }


    function _mint(address to, uint256 tokenId) internal override(ERC721) {
        super._mint(to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721) {
        super._burn(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
