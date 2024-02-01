"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

function BackButton() {
  const router = useRouter();

  return (
    <Button
      variant="secondary"
      onClick={() => {
        router.push("/dashboard");
      }}
      className="fixed top-5 left-5 z-10"
    >
      Back
    </Button>
  );
}

export default BackButton;
