import "@mantine/core/styles.css"
import "./globals.css"

import { ColorSchemeScript } from "@mantine/core"
import { Inter } from "next/font/google"
import Provider from "./provider"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Live QnA App",
  description:
    "Based on blockchain technology, this app allows you to ask questions and get answers in real-time.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body className={inter.className}>
        <Suspense>
          <Provider>{children}</Provider>
        </Suspense>
      </body>
    </html>
  )
}
