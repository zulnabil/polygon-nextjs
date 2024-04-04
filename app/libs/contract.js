import { ethers } from "ethers"
import LiveQnA from "~/app/constants/abis/LiveQnA.json"
import { CONTRACT_ADDRESS } from "~/app/constants/config"

export const ContractHelper = {
  getSigner: async (walletProvider) => {
    if (!walletProvider) return null
    const provider = new ethers.providers.Web3Provider(walletProvider)
    return provider.getSigner()
  },
  getContract: async (walletProvider) => {
    if (!walletProvider) return null
    const provider = new ethers.providers.Web3Provider(walletProvider)
    const signer = await provider.getSigner()

    // The Contract object
    return new ethers.Contract(CONTRACT_ADDRESS, LiveQnA, signer)
  },
}
