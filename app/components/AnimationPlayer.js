"use client";

import { Player } from "@lottiefiles/react-lottie-player";

export default function AnimationPlayer({ src }) {
  return (
    <Player
      autoplay
      keepLastFrame
      src={src}
      style={{ height: "100px", width: "100px", fill: "pink" }}
    />
  );
}
