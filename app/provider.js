"use client"

import { MantineProvider } from "@mantine/core"
import { useSearchParams } from "next/navigation"
import { Web3ModalProvider } from "~/context/Web3Modal"

export default function Provider({ children }) {
  const searchParams = useSearchParams()
  const color = searchParams.get("color")
  const primaryColor = colors.includes(color) ? color : "dark"

  return (
    <MantineProvider
      theme={{
        fontFamily: "Inter, sans-serif",
        primaryColor,
      }}
    >
      <Web3ModalProvider>{children}</Web3ModalProvider>
    </MantineProvider>
  )
}

const colors = [
  "dark",
  "gray",
  "red",
  "pink",
  "grape",
  "violet",
  "indigo",
  "blue",
  "cyan",
  "teal",
  "green",
  "lime",
  "yellow",
  "orange",
]
