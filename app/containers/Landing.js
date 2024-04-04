"use client"

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
  Group,
  Box,
  Mark,
  em,
} from "@mantine/core"
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers5/react"
import { IconArrowRight } from "@tabler/icons-react"
import { useState } from "react"
import Link from "next/link"
import CopyText from "../components/CopyText"
import AnimationPlayer from "../components/AnimationPlayer"
import { useMediaQuery } from "@mantine/hooks"
import ConnectButton from "~/app/components/ConnectButton"
import { ContractHelper } from "~/app/libs/contract"

export default function Landing() {
  const { isConnected } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()
  const [isLoading, setIsLoading] = useState(false)
  const [input, setInput] = useState("")
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState(null)
  const [channel, setChannel] = useState({
    id: null,
    name: null,
    pin: null,
  })

  async function createChannel(event) {
    event.preventDefault()
    setIsError(false)
    setIsLoading(true)
    const liveQnA = await ContractHelper.getContract(walletProvider)
    const signer = await ContractHelper.getSigner(walletProvider)
    const input = event.target[0].value
    try {
      const tx = await liveQnA.connect(signer).createChannel(input)
      const receipt = await tx.wait()
      const event = receipt.events[0]
      const eventData = event.args
      const channelId = eventData?.channelId
      const channelName = eventData?.channelName
      const pin = eventData?.pin?.toNumber()
      if (channelName) {
        setChannel({
          id: channelId,
          name: channelName,
          pin: pin,
        })
        console.debug("Channel Created: ", channelName)
      }
      setInput("")
      setIsLoading(false)
    } catch (error) {
      console.debug("Error", error)
      setIsLoading(false)
      if (error.message) {
        setIsError(true)
        setError(error.message)
      }
    }
  }

  return (
    <Container pos="relative">
      <ConnectButton />
      <Flex justify="center" pt="5rem" pb="xl" mb="lg">
        <Title fw="600" ta="center" order={1}>
          Live QnA Blockchain
        </Title>
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
            borderColor: isError ? "red" : "gray.100",
            borderStyle: "dashed",
          }}
          className={isError ? "card-vibrate" : ""}
        >
          <form onSubmit={createChannel}>
            <Text fw="500" mb="xs">
              Create your own Channel
            </Text>
            <Flex gap="md">
              <TextInput
                placeholder="My Town Hall QnA"
                radius="md"
                flex="100%"
                size="lg"
                onChange={(event) => {
                  setInput(event.target.value)
                }}
                value={input}
                disabled={!isConnected}
              />
              <Button
                size="lg"
                px="xs"
                radius="md"
                flex="100%"
                type="submit"
                loading={isLoading}
                disabled={!input}
              >
                Create channel
              </Button>
            </Flex>
          </form>
        </Card>
      </Stack>
    </Container>
  )
}

function Notif({ channel }) {
  const isMobile = useMediaQuery(`(max-width: ${em(750)})`)
  const channelLink = `${window.location.host}/channel/${channel.id}?pin=${channel.pin}`
  const channelPath = channelLink.replace(window.location.host, "")
  return (
    <Notification
      color="teal"
      radius="md"
      w="100%"
      withCloseButton={false}
      withBorder
    >
      <Group justify={isMobile ? "center" : "flex-start"}>
        <AnimationPlayer src="/animations/success.json" />
        <Box c="gray.7">
          <Text fw="bold">
            Channel{" "}
            <Mark bg="teal" c="white" px="3">
              {channel.name}
            </Mark>{" "}
            has been created successfully.
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
        </Box>
      </Group>
    </Notification>
  )
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
  )
}
