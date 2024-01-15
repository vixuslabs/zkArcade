"use client";

import React from "react";
import {
  ClerkLoaded,
  ClerkLoading,
  SignInButton,
  SignUpButton,
  // useClerk
} from "@clerk/nextjs";

export function HomeAuth() {
  // const { openSignIn } = useClerk();
  return (
    <>
      <ClerkLoading>
        <div className="rounded-md bg-secondary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm">
          Sign in
        </div>
        <div className="rounded-md bg-secondary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm">
          Sign up
        </div>
      </ClerkLoading>
      <ClerkLoaded>
        <SignInButton
          // @ts-expect-error SignInButton can take className
          className="rounded-md bg-secondary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm"
          mode="redirect"
          redirectUrl="/dashboard"
        />
        <SignUpButton
          // @ts-expect-error SignUpButton can take className
          className="rounded-md bg-secondary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm"
          mode="redirect"
          redirectUrl="/dashboard"
        />
      </ClerkLoaded>
    </>
  );
}
