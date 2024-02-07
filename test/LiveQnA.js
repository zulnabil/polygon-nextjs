const { expect } = require("chai")
const { ethers } = require("hardhat")

const MOCK_CHANNEL_NAME = "Channel 1"

describe("LiveQnA", () => {
  let liveQnA
  let adminA, userA, userB
  let channelId, channelName, pin
  let questionId

  beforeEach(async () => {
    ;[adminA, userA, userB] = await ethers.getSigners()
    const LiveQnA = await ethers.getContractFactory("LiveQnA")
    liveQnA = await LiveQnA.deploy()
    await liveQnA.deployed()

    const tx = await liveQnA.connect(adminA).createChannel(MOCK_CHANNEL_NAME)
    const receipt = await tx.wait()
    const event = receipt.events[0]
    const eventData = event.args
    channelId = eventData.channelId
    channelName = eventData.channelName
    pin = eventData.pin.toNumber()
  })

  describe("Deployment", () => {
    it("Should deployed successfully", async () => {
      expect(liveQnA.address).to.not.be.undefined
    })

    it("Should set the admin correctly", async () => {
      expect(await liveQnA.owner()).to.equal(adminA.address)
    })
  })

  describe("Admin", () => {
    it("Should be able to create channel", async () => {
      expect(channelName).to.equal(MOCK_CHANNEL_NAME)
      expect(channelId).to.equal(0)
      expect(pin.toString().length).to.equal(6)
    })
  })

  describe("User A", () => {
    it("Should be able to join channel", async () => {
      const questions = await liveQnA
        .connect(userA)
        .getQuestionsOfChannel(channelId, pin)
      expect(questions.length).to.equal(0)
    })

    it("Should be able to ask question", async () => {
      const text = "What is the meaning of life?"
      const author = "User A"
      const tx = await liveQnA
        .connect(userA)
        .addQuestionToChannel(channelId, pin, text, author)
      await tx.wait()
      const questions = await liveQnA
        .connect(userA)
        .getQuestionsOfChannel(channelId, pin)
      const lastQuestion = questions[0]
      questionId = lastQuestion.id
      expect(lastQuestion.text).to.equal(text)
      expect(lastQuestion.author).to.equal(author)
    })
  })

  describe("User B", () => {
    beforeEach(async () => {
      const text = "What is the meaning of life?"
      const author = "User A"
      const tx = await liveQnA
        .connect(userA)
        .addQuestionToChannel(channelId, pin, text, author)
      await tx.wait()
    })

    it("Should be able to vote for question", async () => {
      const question = await liveQnA.connect(userB).questions(questionId)
      const votes = question.votes.toNumber()
      expect(votes).to.equal(0)

      const tx = await liveQnA
        .connect(userB)
        .voteQuestionOfChannel(channelId, pin, questionId)
      await tx.wait()
      const updatedQuestion = await liveQnA.connect(userB).questions(questionId)
      const updatedVotes = updatedQuestion.votes.toNumber()
      expect(updatedVotes).to.equal(1)
    })

    it("Should be able to retrieve questions sort by highest votes", async () => {
      const text = "This is the newest message but with no votes."
      const author = "User B"
      const tx = await liveQnA
        .connect(userB)
        .addQuestionToChannel(channelId, pin, text, author)
      await tx.wait()

      const questions = await liveQnA
        .connect(userB)
        .getQuestionsOfChannel(channelId, pin)
      expect(questions.length).to.equal(2)
      expect(questions[0].id).to.equal(questionId)
    })
  })
})
