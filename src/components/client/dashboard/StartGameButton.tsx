"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

function StartGameButton() {
  return (
    <>
      <Button
        variant="default"
        onClick={() => {
          console.log("Start Game");
        }}
        asChild
      >
        <Link href={"/sync"}>Start</Link>
      </Button>
    </>
  );
}

export default StartGameButton;
