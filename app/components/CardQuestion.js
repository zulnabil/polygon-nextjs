"use client"

import { ActionIcon, Box, Card, Flex, Group, Text } from "@mantine/core"
import { IconCaretUp } from "@tabler/icons-react"
import classes from "./CardQuestion.module.css"
import { useState } from "react"

export default function CardQuestion({ isLast, question, isVoted, onVote }) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleVote(questionId) {
    setIsLoading(true)
    await onVote(questionId)
    setIsLoading(false)
  }

  return (
    <Card shadow="md" radius="0" className={isLast && "card-transition"}>
      <Group>
        <Flex direction="column" align="center">
          <ActionIcon
            variant="subtle"
            disabled={isVoted}
            loading={isLoading}
            className={classes.vote}
            onClick={() => handleVote(question.id)}
          >
            <IconCaretUp fill={isVoted ? "true" : "none"} stroke={1.5} />
          </ActionIcon>
          <Text fw={500}>{question.votes.toNumber()}</Text>
        </Flex>
        <Box>
          <Text c="gray">{question.author}</Text>
          <Text>{question.text}</Text>
        </Box>
      </Group>
    </Card>
  )
}
