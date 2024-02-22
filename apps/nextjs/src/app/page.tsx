import { Suspense } from "react";
import Link from "next/link";
import Features from "@/components/client/landingPage/Features";
import Footer from "@/components/client/landingPage/Footer";
import GamesSection from "@/components/client/landingPage/GamesSection";
import ThemedLogo from "@/components/client/ui/ThemedLogo";
import { ThemeToggle } from "@/components/client/ui/ToggleTheme";
import { Button } from "@/components/ui/button";
import { currentUser } from "@clerk/nextjs";

// export default function Page() {
export default async function Page() {
  const user = await currentUser();
  // const user = true;

  return (
    <>
      {/* Nav Bar */}
      <nav className=" flex items-center justify-between px-8 pt-4 lg:px-24 2xl:px-48">
        <div className="flex items-center">
          <ThemedLogo />
          <h1 className="text-2xl font-extrabold">zkArcade</h1>
        </div>
        <div className="flex space-x-4 align-middle">
          <Suspense>
            <ThemeToggle />
          </Suspense>
          <Button variant="default" asChild>
            <Link href={"/dashboard"}>{user ? "Dashboard" : "Sign In"}</Link>
            {/* Sign In */}
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative">
        <div
          key="1"
          className="mx-auto max-w-7xl lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8"
        >
          <div className="px-6 pb-24 pt-10 sm:pb-32 lg:col-span-7 lg:px-0 lg:pb-56 lg:pt-32">
            <div className="mx-auto max-w-2xl lg:mx-0">
              <div className="px-8 py-20 text-left">
                <h1 className="mt-24 text-4xl font-bold tracking-tight text-primary sm:mt-10 sm:text-6xl">
                  Compete with the confidence every game is fair
                </h1>
                <p className="mt-6 text-lg leading-8">
                  A collection of mixed reality multiplayer games, built on{" "}
                  <a
                    href="https://minaprotocol.com/"
                    rel="noreferrer"
                    target="_blank"
                    className="underline underline-offset-2"
                  >
                    Mina
                  </a>{" "}
                  to help make cheating a thing of the past.
                </p>
                <div className="mt-10 flex items-center gap-x-6 sm:justify-center md:justify-start">
                  <Button>Get Started</Button>

                  <Button asChild variant="secondary">
                    <Link href="/sandbox">Try Sandbox Mode</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 ">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7">
              Play with anyone around the world
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight  sm:text-4xl">
              Your source for mixed reality multiplayer ZK games on the web
            </p>
            <p className="mt-6 text-lg leading-8 ">
              By proving the validatity of player moves with zero knowledge
              proofs, its impossible for cheaters to get away with it
            </p>
          </div>
          <Features />
        </div>
      </div>

      {/* Games Section */}
      <GamesSection />

      {/* Footer */}
      <Footer />
    </>
  );
}

// export function Example() {
//   return (
//     <div className="relative bg-white">
//       <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8">
//         <div className="px-6 pb-24 pt-10 sm:pb-32 lg:col-span-7 lg:px-0 lg:pb-56 lg:pt-48 xl:col-span-6">
//           <div className="mx-auto max-w-2xl lg:mx-0">
//             <img
//               className="h-11"
//               src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
//               alt="Your Company"
//             />
//             <div className="hidden sm:mt-32 sm:flex lg:mt-16">
//               <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-500 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
//                 Anim aute id magna aliqua ad ad non deserunt sunt.{" "}
//                 <a
//                   href="#"
//                   className="whitespace-nowrap font-semibold text-indigo-600"
//                 >
//                   <span className="absolute inset-0" aria-hidden="true" />
//                   Read more <span aria-hidden="true">&rarr;</span>
//                 </a>
//               </div>
//             </div>
//             <h1 className="mt-24 text-4xl font-bold tracking-tight text-gray-900 sm:mt-10 sm:text-6xl">
//               Data to enrich your online business
//             </h1>
//             <p className="mt-6 text-lg leading-8 text-gray-600">
//               Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui
//               lorem cupidatat commodo. Elit sunt amet fugiat veniam occaecat
//               fugiat aliqua.
//             </p>
//             <div className="mt-10 flex items-center gap-x-6">
//               <a
//                 href="#"
//                 className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
//               >
//                 Get started
//               </a>
//               <a
//                 href="#"
//                 className="text-sm font-semibold leading-6 text-gray-900"
//               >
//                 Learn more <span aria-hidden="true">→</span>
//               </a>
//             </div>
//           </div>
//         </div>
//         <div className="relative lg:col-span-5 lg:-mr-8 xl:absolute xl:inset-0 xl:left-1/2 xl:mr-0">
//           <img
//             className="aspect-[3/2] w-full bg-gray-50 object-cover lg:absolute lg:inset-0 lg:aspect-auto lg:h-full"
//             src="https://images.unsplash.com/photo-1498758536662-35b82cd15e29?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2102&q=80"
//             alt=""
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function Page() {
//     return (
//       <div key="1">
//         <nav className="flex items-center justify-between px-8 py-4 lg:px-64">
//           <div className="flex items-center space-x-8">
//             {/* <Link href="#">
//               <Image
//                 placeholder="blur"
//                 className="w-auto"
//                 alt="logo"
//                 height={64}
//                 width={64}
//                 blurDataURL="/hotNcold.png"
//                 src="/hotNcold.png"
//               />
//             </Link> */}
//             <h1 className="text-xl font-extrabold">zkArcade</h1>
//           </div>
//           <ul className="flex w-full items-center justify-center space-x-12">
//             <li>
//               <Link className="hover:underline hover:underline-offset-2" href="#">
//                 Home
//               </Link>
//             </li>
//             <li>
//               <Link className="hover:underline hover:underline-offset-2" href="#">
//                 About
//               </Link>
//             </li>
//           </ul>
//           <Button variant="default">Sign In</Button>
//         </nav>
//         <header className="px-8 py-20 text-left md:px-16">
//           <h1 className="mb-6 text-4xl font-bold text-primary">zkArcade</h1>
//           <p className="mb-8 text-xl text-gray-300">
//             Arcade for XR-based zero knowledge games, built on the Mina Protocol
//           </p>
//           <div className="flex space-x-4">
//             <Button>Get Started</Button>
//             <Button variant="secondary">Learn More</Button>
//           </div>
//         </header>
//       </div>
//     );
//   }
