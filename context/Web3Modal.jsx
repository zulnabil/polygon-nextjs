"use client"

import { createWeb3Modal, defaultConfig } from "@web3modal/ethers5/react"
import config from "~/app/constants/config.json"

// 1. Get projectId
const projectId = process.env.NEXT_PUBLIC_WEB3MODAL_PROJECT_ID

// 2. Set chains
const mainnet = {
  chainId: 31337,
  name: "Hardhat",
  currency: "ETH",
  explorerUrl: "https://etherscan.io",
  rpcUrl: "http://127.0.0.1:8545",
}

// 3. Create modal
const metadata = {
  name: "Live QnA",
  description: "Live QnA description",
  url: "http://localhost:3000", // origin must match your domain & subdomain
  icons: ["https://avatars.mywebsite.com/"],
}

createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [mainnet],
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  tokens: {
    31337: {
      address: config[31337].liveQnA.address,
    },
  },
})

export function Web3ModalProvider({ children }) {
  return children
}
