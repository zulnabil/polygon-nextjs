"use client";

import { MantineProvider } from "@mantine/core";
import { useSearchParams } from "next/navigation";

export default function Provider({ children }) {
  const searchParams = useSearchParams();
  const color = searchParams.get("color");
  const primaryColor = colors.includes(color) ? color : "dark";

  return (
    <MantineProvider
      theme={{
        fontFamily: "Inter, sans-serif",
        primaryColor,
      }}
    >
      {children}
    </MantineProvider>
  );
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
];
