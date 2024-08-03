const GLDToken = artifacts.require("GLDToken");

contract("GLDToken", async (accounts) => {
  const msgSender = accounts[0];
  const receiver = accounts[1];

  it("컨트랙트가 배포 될 때 생성자에 의해 1000 개의 GLOToken이 발행된다.", async () => {
    const gldTokenDeployed = await GLDToken.deployed();
    const balance = await gldTokenDeployed.balanceOf.call(msgSender);
    assert.equal(
      balance,
      web3.utils.toWei("1000", "ether"),
      "컨트랙트가 배포 될 때 생성자에 의해 1000 1000 개의 GLOToken이 발행되지 않았습니다."
    );
  });

  it("GLOToken이 정상적으로 전송된다.", async () => {
    const gldTokenDeployed = await GLDToken.deployed();
    const initialBalanceMsgSender = await gldTokenDeployed.balanceOf(msgSender);
    console.log(`초기 msgSender의 잔고 : ${initialBalanceMsgSender}`);

    const initialBalanceReceiver = await gldTokenDeployed.balanceOf(receiver);
    console.log(`초기 receiver의 잔고:${initialBalanceReceiver}`);

    await gldTokenDeployed.transfer(receiver, web3.utils.toWei("0.5", "ether"));

    const endBalanceMsgSender = await gldTokenDeployed.balanceOf(msgSender);
    console.log(`전송 후 msgSender의 잔고 : ${endBalanceMsgSender}`);
    const endBalanceReceiver = await gldTokenDeployed.balanceOf(receiver);
    console.log(`전송 후 receiver의 잔고 : ${endBalanceReceiver}`);

    assert.equal(
      endBalanceMsgSender,
      endBalanceMsgSender,
      "GLOToken이 정상적으로 전송되지 않았습니다."
    );
  });
});
