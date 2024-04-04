"use client"

import { Button } from "@mantine/core"
import {
  useWeb3Modal,
  useWeb3ModalAccount,
  useDisconnect,
} from "@web3modal/ethers5/react"
import { useMemo } from "react"
import { StringHelper } from "~/app/libs/string"

export default function ConnectButton(props) {
  const { open } = useWeb3Modal()
  const { address, isConnected } = useWeb3ModalAccount()
  const { disconnect } = useDisconnect()

  async function handleClickConnect() {
    if (isConnected) {
      const answer = confirm("Do you want to disconnect?")
      if (!answer) return
      return disconnect()
    }
    await open()
  }

  const label = useMemo(() => {
    if (address) {
      return `Connected as ${StringHelper.maskAdress(address)}`
    }
    return "Connect"
  }, [address])

  return (
    <Button
      onClick={handleClickConnect}
      pos="absolute"
      top="1rem"
      right="1rem"
      {...props}
    >
      {label}
    </Button>
  )
}
