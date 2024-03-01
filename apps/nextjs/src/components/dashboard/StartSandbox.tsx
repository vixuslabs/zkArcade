"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

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
