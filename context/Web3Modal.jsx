"use client"

import { createWeb3Modal, defaultConfig } from "@web3modal/ethers5/react"
import {
  CONTRACT_ADDRESS,
  NETWORK_CHAIN_ID,
  NETWORK_CURRENCY,
  NETWORK_EXPLORER,
  NETWORK_NAME,
  NETWORK_RPC_URL,
  WEB3MODAL_PROJECT_ID,
} from "~/app/constants/config"

// 2. Set chains
const mainnet = {
  chainId: NETWORK_CHAIN_ID || 31337,
  name: NETWORK_NAME || "Hardhat",
  currency: NETWORK_CURRENCY || "ETH",
  explorerUrl: NETWORK_EXPLORER || "https://etherscan.io",
  rpcUrl: NETWORK_RPC_URL || "http://127.0.0.1:8545",
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
  projectId: WEB3MODAL_PROJECT_ID,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  tokens: {
    [NETWORK_CHAIN_ID]: {
      address: CONTRACT_ADDRESS,
    },
  },
})

export function Web3ModalProvider({ children }) {
  return children
}
