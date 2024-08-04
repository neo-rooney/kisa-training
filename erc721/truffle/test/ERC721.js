const ERC721 = artifacts.require("MyERC721");
const BN = web3.utils.BN;

contract("MyERC721", async (accounts) => {
  const msgSender = accounts[0];
  const receiver = accounts[1];
  const tokenId = 0;

  it("생성자에 의해 배포 될 때, NFT가 1개 민팅된다.", async () => {
    const erc721Deployed = await ERC721.deployed();
    const balance = await erc721Deployed.balanceOf.call(msgSender);

    assert.equal(balance, "1", "NFT가 민팅되지 않았습니다.");
  });

  it("NFT가 정상적으로 전송된다.", async () => {
    const erc721Deployed = await ERC721.deployed();
    const ownerOfNft = await erc721Deployed.ownerOf(tokenId.toString());
    console.log(`0번 NFT 소유 주소 : ${ownerOfNft}`);

    await erc721Deployed.transferFrom(msgSender, receiver, tokenId.toString());

    const ownerOfNftAfterTransfer = await erc721Deployed.ownerOf(
      tokenId.toString()
    );
    console.log(`0번 NFT 소유 주소 : ${ownerOfNftAfterTransfer}`);

    assert.equal(
      ownerOfNftAfterTransfer,
      receiver,
      "NFT 전송에 문제가 발생했습니다."
    );
  });
});
