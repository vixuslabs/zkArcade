"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

function BackButton() {
  const router = useRouter();

  return (
    <Button
      variant="secondary"
      onClick={() => {
        router.push("/dashboard");
      }}
      className="fixed left-5 top-5 z-10"
    >
      Back
    </Button>
  );
}

export default BackButton;
