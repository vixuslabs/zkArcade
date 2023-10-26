"use client";

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";

import { SignIn } from "@clerk/nextjs";

function LoginModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            {/* <SignIn /> */}
            {children}
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export default LoginModal;
