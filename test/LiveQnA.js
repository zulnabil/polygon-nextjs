const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("LiveQnA", () => {
  let liveQnA

  beforeEach(async () => {
    const LiveQnA = await ethers.getContractFactory("LiveQnA")
    liveQnA = await LiveQnA.deploy()
    await liveQnA.deployed()
  })

  describe("Deployment", () => {
    it("Should deploy successfully", async () => {
      expect(liveQnA.address).to.not.be.undefined
    })
  })
})
