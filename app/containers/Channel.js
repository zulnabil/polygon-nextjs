"use client"

import { useCallback, useEffect, useState } from "react"
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
  useWeb3Modal,
} from "@web3modal/ethers5/react"
import {
  Container,
  Title,
  Center,
  Textarea,
  TextInput,
  Flex,
  Stack,
  Box,
  Button,
  Space,
  useMantineTheme,
  Mark,
} from "@mantine/core"
import { useScrollIntoView } from "@mantine/hooks"
import LoadingOverlay from "../components/LoadingOverlay"
import { ContractHelper } from "~/app/libs/contract"
import ConnectButton from "~/app/components/ConnectButton"
import CardQuestion from "~/app/components/CardQuestion"

export default function Channel({ id, pin }) {
  const theme = useMantineTheme()
  const { walletProvider } = useWeb3ModalProvider()
  const { address, isConnected } = useWeb3ModalAccount()
  const { open } = useWeb3Modal()
  const { scrollIntoView, targetRef } = useScrollIntoView({
    offset: 60,
    duration: 200,
  })
  const [channelName, setChannelName] = useState("No")
  const [questions, setQuestions] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [input, setInput] = useState("")

  const getListQuestions = useCallback(
    async (smartContract, initialAccount) => {
      const signer = initialAccount || address
      try {
        const questions = await smartContract
          .connect(signer)
          .getQuestionsOfChannel(id, pin)

        setQuestions(questions)
      } catch (error) {
        console.error("getListQuestions", error)
      }
    },
    [address, id, pin]
  )

  useEffect(() => {
    const loadBlockchainData = async () => {
      if (!isConnected) {
        await open()
      }
      const liveQnA = await ContractHelper.getContract(walletProvider)

      liveQnA?.on("QuestionAdded", onChangeData)
      liveQnA?.on("QuestionVoted", onChangeData)
      liveQnA?.on("QuestionUnvoted", onChangeData)

      const channel = await liveQnA?.getChannel(id)
      if (!channel) return
      setChannelName(channel.name)

      await getListQuestions(liveQnA, address)
    }

    async function onChangeData(event) {
      const liveQnA = await ContractHelper.getContract(walletProvider)
      await getListQuestions(liveQnA, address)
      console.debug("Event retrieved: ", event)
    }

    loadBlockchainData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected])

  async function handleAddQuestion(event) {
    event.preventDefault()
    const liveQnA = await ContractHelper.getContract(walletProvider)
    const signer = await ContractHelper.getSigner(walletProvider)
    const input = event.target[0].value
    const author = event.target[1].value || "Anonymous"
    try {
      setIsLoading(true)
      const tx = await liveQnA
        .connect(signer)
        .addQuestionToChannel(id, pin, input, author)
      await tx.wait()
      await getListQuestions(liveQnA)
      setInput("")
    } catch (error) {
      console.error("handleAddQuestion", error)
    } finally {
      setIsLoading(false)
      scrollIntoView({
        alignment: "center",
      })
    }
  }

  async function handleVote(questionId) {
    const liveQnA = await ContractHelper.getContract(walletProvider)
    const signer = await ContractHelper.getSigner(walletProvider)
    try {
      const tx = await liveQnA
        .connect(signer)
        .voteQuestionOfChannel(id, pin, questionId)
      await tx.wait()
      await getListQuestions(liveQnA)
    } catch (error) {
      console.error("handleVote", error)
    }
  }

  if (!id || !pin) {
    return (
      <Container size="sm">
        <Center p="lg">
          <Title order={2}>Invalid channel</Title>
        </Center>
      </Container>
    )
  }

  const shouldShowLoading = questions === null

  return (
    <>
      <Box bg={theme.primaryColor} p="lg">
        <Container p="md" pos="relative">
          <ConnectButton color="white" variant="outline" />
          <Title order={3} c="white" mb="lg">
            <Mark bg="teal" px="5">
              {channelName}
            </Mark>{" "}
            channel
          </Title>
          <form onSubmit={handleAddQuestion}>
            <Stack>
              <Textarea
                placeholder="Enter your question here"
                size="lg"
                onChange={(event) => setInput(event.target.value)}
                value={input}
              />
              <Flex justify="space-between">
                <TextInput
                  placeholder="Enter your username (optional)"
                  size="md"
                />
                <Button
                  type="submit"
                  variant="white"
                  size="md"
                  loading={isLoading}
                  disabled={!input}
                >
                  Submit
                </Button>
              </Flex>
            </Stack>
          </form>
        </Container>
      </Box>
      <Container mt="lg">
        {!questions?.length && (
          <Center p="lg">
            <Title order={2}>No questions yet</Title>
          </Center>
        )}
        <Stack pb="lg">
          {questions?.map((question, index) => {
            const isVoted = question.isVoted
            const isLast = questions[questions.length - 1].id === question.id
            return (
              <CardQuestion
                key={index}
                isVoted={isVoted}
                isLast={isLast}
                question={question}
                onVote={handleVote}
              />
            )
          })}
        </Stack>
        <Space ref={targetRef} />
      </Container>
      <LoadingOverlay visible={shouldShowLoading} />
    </>
  )
}
