"use client";

import Image from "next/image";
import LightModeLogo from "@/../public/zkArcade_logo_black.png";
import DarkModeLogo from "@/../public/zkArcade_logo_white.png";
import { useTheme } from "next-themes";

export default function LogoWithName() {
  const { theme } = useTheme();

  return (
    <>
      {theme === "light" ? (
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
      <h1 className="text-2xl font-extrabold">zkArcade</h1>
    </>
  );
}
