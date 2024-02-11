"use client";

import {
  Container,
  Flex,
  Title,
  Stack,
  Card,
  TextInput,
  Button,
  Notification,
  Text,
  Transition,
} from "@mantine/core";
import { IconPhoto, IconDownload, IconArrowRight } from "@tabler/icons-react";
import { ethers } from "ethers";
import config from "~/app/constants/config.json";
import LiveQnA from "~/app/constants/abis/LiveQnA.json";
import { useEffect, useState } from "react";
import Link from "next/link";
import CopyText from "../components/CopyText";
import { usePathname, useRouter } from "next/navigation";

export default function Landing() {
  const [provider, setProvider] = useState(null);
  const [smartContract, setSmartContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);
  const [channel, setChannel] = useState({
    id: null,
    name: null,
    pin: null,
  });

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

    window.ethereum.on("accountsChanged", async () => {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = ethers.utils.getAddress(accounts[0]);
      setAccount(account);
    });
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  async function createChannel(event) {
    event.preventDefault();
    setIsLoading(true);
    const signer = provider.getSigner();
    const input = event.target[0].value;
    try {
      const tx = await smartContract.connect(signer).createChannel(input);
      const receipt = await tx.wait();
      console.debug("receipt", receipt);
      const event = receipt.events[0];
      const eventData = event.args;
      const channelId = eventData?.channelId;
      const channelName = eventData?.channelName;
      const pin = eventData?.pin?.toNumber();
      if (channelName) {
        setChannel({
          id: channelId,
          name: channelName,
          pin: pin,
        });
        console.debug("Channel Created: ", channelName);
      }
      setInput("");
      setIsLoading(false);
    } catch (error) {
      console.debug("Error", error);
      setIsLoading(false);
      if (error.message) {
        setIsError(true);
        setError(error.message);
      }
    }
  }
  return (
    <Container size="sm">
      <Flex justify="center" p="xl" mb="lg">
        <Title order={1}>Live QnA Blockchain</Title>
      </Flex>
      <Stack
        align="center"
        style={{
          transition: "all 0.3s",
        }}
      >
        <Transition
          mounted={!!channel.id}
          transition="fade"
          duration={400}
          timingFunction="ease-in"
        >
          {(styles) => (
            <div style={{ ...styles, width: "100%" }}>
              <Notif channel={channel} />
            </div>
          )}
        </Transition>
        <Transition
          mounted={isError}
          transition="slide-down"
          duration={400}
          timingFunction="ease"
        >
          {(styles) => (
            <div style={{ ...styles, width: "100%" }}>
              <ErrorNotif message={error} onClose={() => setIsError(false)} />
            </div>
          )}
        </Transition>
        <Card
          withBorder
          radius="md"
          w="100%"
          style={{
            borderStyle: "dashed",
          }}
        >
          <form onSubmit={createChannel}>
            <Flex gap="md">
              <TextInput
                placeholder="My Town Hall QnA"
                radius="md"
                flex="1"
                size="lg"
                onChange={(event) => {
                  setInput(event.target.value);
                }}
                value={input}
              />
              <Button
                size="lg"
                radius="md"
                flex="1"
                type="submit"
                loading={isLoading}
                disabled={!input}
              >
                Create my own channel
              </Button>
            </Flex>
          </form>
        </Card>
      </Stack>
    </Container>
  );
}

function Notif({ channel }) {
  const channelLink = `${window.location.host}/channel/${channel.id}?pin=${channel.pin}`;
  const channelPath = channelLink.replace(window.location.host, "");
  return (
    <Notification
      color="lime"
      radius="md"
      title="Channel succeed created"
      w="100%"
      withCloseButton={false}
      withBorder
    >
      <Text>
        Channel <b>{`"${channel.name}"`}</b> has been created successfully.
      </Text>
      <Text mb="sm">
        This is your channel link, share it with your audience:
      </Text>
      <Flex align="center" mb="sm" gap="xs">
        <Link href={channelPath}>
          <Text c="blue" td="underline">
            {channelLink}
          </Text>
        </Link>
        <CopyText value={channelLink} />
      </Flex>
      <Link href={channelPath}>
        <Button
          rightSection={<IconArrowRight size={14} />}
          variant="light"
          color="blue"
        >
          Go to Channel
        </Button>
      </Link>
    </Notification>
  );
}

function ErrorNotif({ message, onClose }) {
  return (
    <Notification
      color="red"
      radius="md"
      title="Error"
      w="100%"
      onClose={onClose}
      withBorder
    >
      <Text>{message}</Text>
    </Notification>
  );
}
