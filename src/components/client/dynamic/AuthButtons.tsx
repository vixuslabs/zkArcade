"use client";

import {
  SignInButton as ClerkSignInButton,
  SignUpButton as ClerkSignUpButton,
} from "@clerk/nextjs";
import dynamic from "next/dynamic";
import { LoadingSpinner } from "../ui";

import { useSignIn } from "@clerk/nextjs";

export function _SignInButton(props: {
  className?: string;
  mode?: "modal" | "redirect";
}) {
  return <ClerkSignInButton {...props} />;
}

export const SignInButton = dynamic(
  () =>
    import("@/components/client/dynamic/AuthButtons").then(
      (mod) => mod._SignInButton,
    ),
  {
    loading: () => {
      return (
        <div className="rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm">
          {/* <LoadingSpinner /> */}
          Sign In
        </div>
      );
    },
    // ssr: false,
  },
);

export function _SignUpButton(props: {
  className?: string;
  mode?: "modal" | "redirect";
}) {
  return <ClerkSignUpButton {...props} />;
}

export const SignUpButton = dynamic(
  () =>
    import("@/components/client/dynamic/AuthButtons").then(
      (mod) => mod._SignUpButton,
    ),
  {
    loading: () => {
      return (
        <div className="rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm">
          Sign up
        </div>
      );
    },
    // ssr: false,
  },
);
