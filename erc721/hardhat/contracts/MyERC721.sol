// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";

contract MyERC721 is ERC721PresetMinterPauserAutoId {
    constructor() ERC721PresetMinterPauserAutoId("MyNFT", "MNFT", "https://metadata-api-server-git-main-rooneydevs-projects.vercel.app/api/token/") {
        mint(msg.sender);
    }
}