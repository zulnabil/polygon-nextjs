"use client";

import { useEffect, useState } from "react";
import config from "~/app/constants/config.json";
import LiveQnA from "~/app/constants/abis/LiveQnA.json";
import { ethers } from "ethers";
import {
  Container,
  Text,
  Card,
  Title,
  Center,
  Textarea,
  TextInput,
  Flex,
  Stack,
  Box,
  Button,
  Group,
  ActionIcon,
  Space,
  useMantineTheme,
  Mark,
} from "@mantine/core";
import { IconCaretUp } from "@tabler/icons-react";
import { useScrollIntoView } from "@mantine/hooks";
import LoadingOverlay from "../components/LoadingOverlay";

export default function Channel({ id, pin }) {
  const theme = useMantineTheme();
  const { scrollIntoView, targetRef } = useScrollIntoView({
    offset: 60,
    duration: 200,
  });
  const [provider, setProvider] = useState(null);
  const [smartContract, setSmartContract] = useState(null);
  const [channelName, setChannelName] = useState("");
  const [account, setAccount] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");

  const loadBlockchainData = async () => {
    if (!window || typeof window === "undefined") {
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    const network = await provider.getNetwork();

    const liveQnAAddress = config[network.chainId].liveQnA.address;
    const liveQnA = new ethers.Contract(liveQnAAddress, LiveQnA, provider);

    setSmartContract(liveQnA);

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const account = ethers.utils.getAddress(accounts[0]);
    setAccount(account);

    const channel = await liveQnA.getChannel(id);
    setChannelName(channel.name);

    await getListQuestions(liveQnA);

    window.ethereum.on("accountsChanged", async () => {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = ethers.utils.getAddress(accounts[0]);
      setAccount(account);
    });
  };

  async function getListQuestions(smartContract) {
    try {
      const questions = await smartContract.getQuestionsOfChannel(id, pin);
      setQuestions(questions);
    } catch (error) {
      console.error("getListQuestions", error);
    }
  }

  useEffect(() => {
    loadBlockchainData();
  }, []);

  async function handleAddQuestion(event) {
    event.preventDefault();
    const signer = provider.getSigner();
    const input = event.target[0].value;
    const author = event.target[1].value || "Anonymous";
    try {
      setIsLoading(true);
      const tx = await smartContract
        .connect(signer)
        .addQuestionToChannel(id, pin, input, author);
      await tx.wait();
      await getListQuestions(smartContract);
      setInput("");
    } catch (error) {
      console.error("handleAddQuestion", error);
    } finally {
      setIsLoading(false);
      scrollIntoView({
        alignment: "center",
      });
    }
  }

  async function handleVote(questionId) {
    const signer = provider.getSigner();
    try {
      const tx = await smartContract
        .connect(signer)
        .voteQuestionOfChannel(id, pin, questionId);
      await tx.wait();
      await getListQuestions(smartContract);
    } catch (error) {
      console.error("handleVote", error);
    }
  }

  if (!id || !pin) {
    return (
      <Container size="sm">
        <Center p="lg">
          <Title order={2}>Invalid channel</Title>
        </Center>
      </Container>
    );
  }

  return (
    <>
      <LoadingOverlay visible={questions === null} />
      <Box bg={theme.primaryColor} p="lg">
        <Container p="md">
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
            const isLast = questions[questions.length - 1].id === question.id;
            return (
              <Card
                key={index}
                shadow="md"
                radius="0"
                className={isLast && "card-transition"}
              >
                <Group>
                  <Flex direction="column" align="center">
                    <ActionIcon
                      variant="subtle"
                      aria-label="Settings"
                      onClick={() => handleVote(question.id)}
                    >
                      <IconCaretUp stroke={1.5} />
                    </ActionIcon>
                    <Text fw={500}>{question.votes.toNumber()}</Text>
                  </Flex>
                  <Box>
                    <Text c="gray">{question.author}</Text>
                    <Text>{question.text}</Text>
                  </Box>
                </Group>
              </Card>
            );
          })}
        </Stack>
        <Space ref={targetRef} />
      </Container>
    </>
  );
}
