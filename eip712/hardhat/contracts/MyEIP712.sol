// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract MyEIP712 is EIP712 {
    bytes32 public immutable _MESSAGE_TYPEHASH = keccak256("Mail(address from,address to,string contents)");

    struct Mail {
        address from;
        address to;
        string contents;
    }

    constructor() EIP712("MyEIP712", "1") {
    }

    function domainSeparatorV4() public view returns (bytes32) {
        return _domainSeparatorV4();
    }

    function validateSigner(bytes32 structHash, bytes memory signature) public view returns (address) {
        return ECDSA.recover(_hashTypedDataV4(structHash), signature);
    }

    function hashStruct(Mail memory mail)
        public
        view
        returns (bytes32)
    {
        return 
        keccak256(
            abi.encode(
            _MESSAGE_TYPEHASH,
            mail.from,
            mail.to,
            keccak256(abi.encodePacked(mail.contents))
        ));
    }
}