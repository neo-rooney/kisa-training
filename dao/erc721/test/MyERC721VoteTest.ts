import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("MyERC721Vote", function () {
  async function MyERC721VoteFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const MyERC721Vote = await ethers.deployContract("MyERC721Vote");

    return { MyERC721Vote, owner, addr1, addr2 };
  }

  it("", async () => {});
});
