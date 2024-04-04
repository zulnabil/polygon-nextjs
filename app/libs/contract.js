import { ethers } from "ethers"
import config from "~/app/constants/config.json"
import LiveQnA from "~/app/constants/abis/LiveQnA.json"

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
    const network = await provider.getNetwork()
    const liveQnAAddress = config[network.chainId].liveQnA.address

    // The Contract object
    return new ethers.Contract(liveQnAAddress, LiveQnA, signer)
  },
}
