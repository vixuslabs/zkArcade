"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

function StartSandbox() {
  return (
    <>
      <Button variant="default" asChild>
        <Link href={"/sandbox"}>Sandbox</Link>
      </Button>
    </>
  );
}

export default StartSandbox;
