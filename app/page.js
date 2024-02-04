'use client'

import Image from "next/image";
import styles from "./page.module.css";
import { ethers } from "ethers"
import config from '~/app/constants/config.json'
import HelloWorld from '~/app/constants/abis/HelloWorld.json'
import { useEffect, useState } from "react";

export default function Home() {
  const [provider, setProvider] = useState(null)
  const [helloWorld, setHelloWorld] = useState(null)

  const loadBlockchainData = async () => {
    if (typeof window === "undefined") {
      return
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)

    const network = await provider.getNetwork()

    const helloWorldAddress = config[network.chainId].helloWorld.address

    const helloWorld = new ethers.Contract(
      helloWorldAddress,
      HelloWorld,
      provider
    )

    setHelloWorld(helloWorld)

    console.debug("Hello World", helloWorld)

    const appName = await helloWorld.appName()
    console.debug("appName", appName)

    window.ethereum.on("accountsChanged", async () => {
      console.debug('changing accounts')
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })
      const account = ethers.utils.getAddress(accounts[0])
      console.debug("Account", account)
      setAccount(account)
    })
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  async function handleUpdateAppName() {
    const signer = await provider.getSigner()
    const newAppName = "New App Name "+ Math.random()
    const transaction = await helloWorld.connect(signer).updateAppName(newAppName)
    await transaction.wait()
    console.debug("New App Name", newAppName)
  }

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <button onClick={handleUpdateAppName}>Update app name</button>
        <p>
          Get started by editing&nbsp;
          <code className={styles.code}>src/app/page.js</code>
        </p>
        <div>
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{" "}
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className={styles.vercelLogo}
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>

      <div className={styles.center}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>

      <div className={styles.grid}>
        <a
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Docs <span>-&gt;</span>
          </h2>
          <p>Find in-depth information about Next.js features and API.</p>
        </a>

        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Learn <span>-&gt;</span>
          </h2>
          <p>Learn about Next.js in an interactive course with&nbsp;quizzes!</p>
        </a>

        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Templates <span>-&gt;</span>
          </h2>
          <p>Explore starter templates for Next.js.</p>
        </a>

        <a
          href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Deploy <span>-&gt;</span>
          </h2>
          <p>
            Instantly deploy your Next.js site to a shareable URL with Vercel.
          </p>
        </a>
      </div>
    </main>
  );
}
