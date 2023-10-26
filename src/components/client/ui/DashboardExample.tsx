"use client";

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  CalendarIcon,
  ChartPieIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
  CogIcon,
} from "@heroicons/react/24/outline";

import { cn } from "@/utils";
import Image from "next/image";

interface NavigationItem {
  name: string;
  href: string;
  icon: typeof HomeIcon;
  current: boolean;
}

const navigation: NavigationItem[] = [
  { name: "Home", href: "#", icon: HomeIcon, current: true },
  { name: "Friends", href: "#", icon: UsersIcon, current: false },
  { name: "Leaderboards", href: "#", icon: ChartPieIcon, current: false },
  { name: "Settings", href: "#", icon: CogIcon, current: false },
];

export default function DashboardExample() {
  const [selectedNavItem, setSelectedNavItem] = useState<string>("Home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderMainContent = () => {
    if (selectedNavItem === "Home") {
      return (
        <div className="flex h-full flex-col">
          <div className="flex-1 bg-gray-100 p-4">
            {/* Challenge player section */}
            <div>
              <select placeholder="Select friend">
                {/* Dummy friend data */}
                <option>Friend 1</option>
                <option>Friend 2</option>
              </select>
              <select placeholder="Hiding Time limit">
                {/* Dummy time data */}
                <option>30s</option>
                <option>1m</option>
              </select>
              <select placeholder="Finding Time limit">
                {/* Dummy time data */}
                <option>1m</option>
                <option>2m</option>
              </select>
              <select placeholder="Rounds">
                {/* Dummy rounds data */}
                <option>Best of 3</option>
                <option>Best of 5</option>
              </select>
              <button className="rounded-md bg-blue-500 px-4 py-2 text-white">
                Play
              </button>
            </div>
          </div>
          <div className="flex-1 bg-gray-200 p-4">
            {/* Match history section */}
            {/* Dummy data */}
            <div className="my-2 border p-2">Match against Friend 1</div>
            <div className="my-2 border p-2">Match against Friend 2</div>
          </div>
        </div>
      );
    }
    // Other content for other nav items can be added similarly
    return null;
  };

  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-white">
        <body class="h-full">
        ```
      */}
      <div>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50 lg:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button
                        type="button"
                        className="-m-2.5 p-2.5"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>

                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-2 ring-1 ring-white/10">
                    <div className="flex h-16 shrink-0 items-center">
                      <img
                        width={32}
                        height={32}
                        className="h-8 w-auto"
                        src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                        alt="Your Company"
                      />
                    </div>
                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="-mx-2 flex-1 space-y-1">
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <a
                              href={item.href}
                              className={cn(
                                item.current
                                  ? "bg-gray-800 text-white"
                                  : "text-gray-400 hover:bg-gray-800 hover:text-white",
                                "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6",
                              )}
                            >
                              <item.icon
                                className="h-6 w-6 shrink-0"
                                aria-hidden="true"
                              />
                              {item.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-20 lg:overflow-y-auto lg:bg-gray-900 lg:pb-4">
          <div className="flex h-16 shrink-0 items-center justify-center">
            <img
              width={32}
              height={32}
              className="h-8 w-auto"
              src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
              alt="Your Company"
            />
          </div>
          <nav className="mt-8">
            <ul role="list" className="flex flex-col items-center space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className={cn(
                      item.current
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white",
                      "group flex gap-x-3 rounded-md p-3 text-sm font-semibold leading-6",
                    )}
                  >
                    <item.icon
                      className="h-6 w-6 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="sr-only">{item.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-gray-900 px-4 py-4 shadow-sm sm:px-6 lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 text-sm font-semibold leading-6 text-white">
            Dashboard
          </div>
          <a href="#">
            <span className="sr-only">Your profile</span>
            <img
              width={32}
              height={32}
              className="h-8 w-8 rounded-full bg-gray-800"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt=""
            />
          </a>
        </div>

        <main className="lg:pl-20">
          <div className="xl:pl-96">
            <div className="relative h-full px-4 py-10 sm:px-6 lg:px-8 lg:py-6">
              <div className="inset-y-0 flex flex-col gap-y-8">
                <div className="min-h-[43vh] rounded-lg bg-slate-500 p-4 shadow-md">
                  hello{" "}
                </div>
                <div className="relative">
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center">
                    {/* <span className="bg-white px-2 text-sm text-gray-500">
                      Continue
                    </span> */}
                  </div>
                </div>
                <div className="min-h-[43vh] rounded-md bg-neutral-300">
                  hello{" "}
                </div>
              </div>
            </div>
          </div>
        </main>

        <aside className="fixed inset-y-0 left-20 hidden w-96 overflow-y-auto border-r border-gray-200 px-4 py-6 sm:px-6 lg:px-8 xl:block">
          {/* Secondary column (hidden on smaller screens) */}
          <div className="h-full rounded-md bg-neutral-300 bg-opacity-20 shadow-lg ">
            hello{" "}
          </div>
        </aside>
      </div>
    </>
  );

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-1/5 bg-gray-900 text-white">
        <nav className="mt-6">
          <ul>
            {navigation.map((item) => (
              <li
                key={item.name}
                onClick={() => setSelectedNavItem(item.name)}
                className="cursor-pointer p-4 hover:bg-gray-800"
              >
                <item.icon className="mr-2 inline h-6 w-6" />
                {item.name}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-300 p-4">{renderMainContent()}</main>

      {/* Small left empty container */}
      <div className="w-1/6 bg-gray-400">
        {/* Content based on the sidebar selection */}
        {selectedNavItem}
      </div>
    </div>
  );
}
