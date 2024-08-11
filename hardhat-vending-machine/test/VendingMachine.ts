import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("VendingMachine", function () {
  async function VendingMachineFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const vendingMachine = await ethers.deployContract("VendingMachine");

    const ca = await vendingMachine.getAddress();

    return { vendingMachine, owner, otherAccount, ca };
  }

  describe("VendingMachine", function () {
    it("컨트랙트가 배포 될 때 컵케익의 개수는 100이다.", async function () {
      const { vendingMachine, ca } = await loadFixture(VendingMachineFixture);
      expect(Number(await vendingMachine.cupcakeBalances(ca))).to.equal(100);
    });

    it("컵케익이 정상적으로 전달된다.", async function () {
      const { vendingMachine, ca, otherAccount } = await loadFixture(
        VendingMachineFixture
      );

      const contractStartingBalance = Number(
        await vendingMachine.cupcakeBalances(ca)
      );

      const receiverStartingBalance = Number(
        await vendingMachine.cupcakeBalances(otherAccount)
      );

      console.log("contractStartingBalance >>", contractStartingBalance);
      console.log("receiverStartingBalance >>", receiverStartingBalance);

      const amount = 10;

      const cupcakePrice = 0.0001;
      await expect(
        vendingMachine.connect(otherAccount).purchase(amount, {
          value: ethers.parseEther((amount * cupcakePrice).toFixed(18)),
        })
      )
        .to.emit(vendingMachine, "Purchase")
        .withArgs(otherAccount.address, amount);

      const contractrEndingBalance = Number(
        await vendingMachine.cupcakeBalances(ca)
      );

      const receiverEndingBalance = Number(
        await vendingMachine.cupcakeBalances(otherAccount)
      );

      console.log("contractrEndingBalance >>", contractrEndingBalance);
      console.log("receiverEndingBalance >>", receiverEndingBalance);

      expect(contractrEndingBalance).to.equal(contractStartingBalance - amount);
      expect(receiverEndingBalance).to.equal(receiverStartingBalance + amount);
    });

    it("컵케익이 정상적으로 리필된다.", async function () {
      const { vendingMachine, ca, otherAccount } = await loadFixture(
        VendingMachineFixture
      );

      const contractStartingBalance = Number(
        await vendingMachine.cupcakeBalances(ca)
      );
      console.log("contractStartingBalance >>", contractStartingBalance);

      const amount: number = 10;
      await vendingMachine.refill(amount);

      const contractrEndingBalance = Number(
        await vendingMachine.cupcakeBalances(ca)
      );
      console.log("contractrEndingBalance >>", contractrEndingBalance);

      expect(contractrEndingBalance).to.equal(contractStartingBalance + amount);
    });
  });
});
