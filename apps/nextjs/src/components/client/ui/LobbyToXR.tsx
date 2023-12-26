"use client";

import React from "react";
// import { dynamic } from "next/dynamic";
import { Transition } from "@headlessui/react";

interface LobbyToXRProps {
  children: React.ReactNode;
  showXR: boolean;
}

function LobbyToXR({ children, showXR }: LobbyToXRProps) {
  const transitionRef = React.useRef(null);
  return (
    <Transition
      //   as={React.Fragment}
      appear={true}
      show={true}
      enter="transform transition duration-[400ms]"
      enterFrom="opacity-0 rotate-[-120deg] scale-50"
      enterTo="opacity-100 rotate-0 scale-100"
      leave="transform duration-200 transition ease-in-out"
      leaveFrom="opacity-100 rotate-0 scale-100 "
      leaveTo="opacity-0 scale-95 "
    >
      {showXR ? (
        <div ref={transitionRef}>
          <p>hello there</p>
        </div>
      ) : (
        <div ref={transitionRef}> {children} </div>
      )}
    </Transition>
  );
}

export default LobbyToXR;
