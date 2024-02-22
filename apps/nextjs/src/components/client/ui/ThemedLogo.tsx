"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import LightModeLogo from "@/../public/zkArcade_logo_black.png";
import DarkModeLogo from "@/../public/zkArcade_logo_white.png";
import { useTheme } from "next-themes";

export default function ThemedLogo() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  let localTheme: string | null = "";

  if (typeof window !== "undefined") localTheme = localStorage.getItem("theme");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted)
    return (
      <Image
        alt="logo"
        width={64}
        height={64}
        src={DarkModeLogo}
        blurDataURL={"/zkArcade_logo_light.png"}
      />
    );

  return (
    <>
      {theme === "light" || localTheme === "light" ? (
        <Image
          alt="logo"
          width={64}
          height={64}
          src={LightModeLogo}
          blurDataURL={"/zkArcade_logo_dark.png"}
        />
      ) : (
        <Image
          alt="logo"
          width={64}
          height={64}
          src={DarkModeLogo}
          blurDataURL={"/zkArcade_logo_dark.png"}
        />
      )}
    </>
  );
}
