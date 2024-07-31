const VendingMachine = artifacts.require("VendingMachine");

contract("VendingMachine", async (accounts) => {
  it("컨트랙트가 배포 될 때 컵케익의 개수는 100이다.", async () => {
    const vendingMachineInstance = await VendingMachine.deployed();
    const balance = await vendingMachineInstance.cupcakeBalances.call(
      vendingMachineInstance.address
    );
    assert.equal(balance.valueOf(), 100);
  });

  it("컵케익이 정상적으로 전달된다.", async () => {
    const vendingMachineInstance = await VendingMachine.deployed();
    // Setup contract and receiver
    const contract = vendingMachineInstance.address;
    const receiver = accounts[1];

    // Get initial balances of contract and receiver.
    const contractStartingBalance = (
      await vendingMachineInstance.cupcakeBalances.call(contract)
    ).toNumber();
    const receiverStartingBalance = (
      await vendingMachineInstance.cupcakeBalances.call(receiver)
    ).toNumber();

    // Make transaction from contract to receiver.
    const amount = 10;
    await vendingMachineInstance.purchase(amount, {
      from: receiver,
      value: 10 * 10 ** 18,
    });

    // Get balances of contract and receiver after the transactions.
    const contractrEndingBalance = (
      await vendingMachineInstance.cupcakeBalances.call(contract)
    ).toNumber();
    const receiverEndingBalance = (
      await vendingMachineInstance.cupcakeBalances.call(receiver)
    ).toNumber();
    console.log("contractrEndingBalance >>", contractrEndingBalance);
    console.log("receiverEndingBalance >>", receiverEndingBalance);
    assert.equal(
      contractrEndingBalance,
      contractStartingBalance - amount,
      "Amount wasn't correctly taken from the contract"
    );
    assert.equal(
      receiverEndingBalance,
      receiverStartingBalance + amount,
      "Amount wasn't correctly taken from the receiver"
    );
  });

  it("컵케익이 정상적으로 리필된다.", async () => {
    const vendingMachineInstance = await VendingMachine.deployed();
    const vendingMahcineStartingBalance = (
      await vendingMachineInstance.cupcakeBalances.call(
        vendingMachineInstance.address
      )
    ).toNumber();

    console.log("vendingMahcineStartingBalance", vendingMahcineStartingBalance);
    const amount = 10;
    await vendingMachineInstance.refill(amount);

    const vendingMahcineEndingBalance = (
      await vendingMachineInstance.cupcakeBalances.call(
        vendingMachineInstance.address
      )
    ).toNumber();
    console.log("vendingMahcineEndingBalance", vendingMahcineEndingBalance);

    assert.equal(
      vendingMahcineEndingBalance,
      vendingMahcineStartingBalance + amount,
      "Cupcakes wasn't refilled correctly"
    );
  });
});
