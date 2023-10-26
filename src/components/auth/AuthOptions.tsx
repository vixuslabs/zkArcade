"use client";

import { useSignIn, useSignUp } from "@clerk/nextjs";

export function SignInButton() {
  const signIn = useSignIn();

  return (
    <>
      <button>Sign In</button>
    </>
  );
}
