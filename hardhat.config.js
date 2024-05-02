/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require("dotenv").config()
require("@nomicfoundation/hardhat-toolbox")

const { API_URL, PRIVATE_KEY } = process.env

module.exports = {
  solidity: "0.8.9",
  defaultNetwork: "polygon_amoy",
  networks: {
    hardhat: {},
    polygon_amoy: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
}
