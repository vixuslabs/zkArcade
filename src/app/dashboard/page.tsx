import { auth } from "@clerk/nextjs";
import DashboardExample from "@/components/client/ui/DashboardExample";

export default function Dashboard() {
  const user = auth();

  return (
    // <DashboardExample />
    <></>
    // <div className="min-h-screen bg-gray-100 p-6">
    //   {/* Header */}
    //   <header className="mb-8 flex items-center justify-between">
    //     <div className="text-2xl font-bold">Hot &apos;n Cold</div>
    //     <div className="flex items-center space-x-4">
    //       <div className="relative">
    //         <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
    //           3
    //         </span>
    //         <button className="text-gray-600">
    //           <i className="far fa-bell"></i>
    //         </button>{" "}
    //         {/* placeholder icon */}
    //       </div>
    //       <div className="h-8 w-8 rounded-full bg-blue-500"></div>{" "}
    //       {/* Placeholder for user avatar */}
    //     </div>
    //   </header>

    //   {/* Main Section */}
    //   <main className="grid grid-cols-3 gap-6">
    //     {/* Sidebar */}
    //     <aside className="col-span-1 rounded bg-white p-4 shadow">
    //       <h2 className="mb-4 text-xl font-semibold">Friends</h2>
    //       {/* List of friends (this can be mapped) */}
    //       <div className="mb-2 flex items-center justify-between">
    //         <span>Jane Doe</span>
    //         <button className="text-blue-500">Challenge</button>
    //       </div>
    //       {/* ... more friends */}

    //       <h2 className="mb-4 mt-6 text-xl font-semibold">Leaderboard</h2>
    //       {/* Leaderboard entries */}
    //       <div className="mb-2 flex items-center justify-between">
    //         <span>John Smith</span>
    //         <span>#1</span>
    //       </div>
    //       {/* ... more leaderboard entries */}
    //     </aside>

    //     {/* Content */}
    //     <section className="col-span-2 rounded bg-white p-4 shadow">
    //       {/* Play now button */}
    //       <button className="mb-6 rounded bg-blue-500 px-4 py-2 text-white">
    //         Play Now
    //       </button>

    //       {/* Challenges */}
    //       <div className="mb-6">
    //         <h2 className="mb-4 text-xl font-semibold">Challenges</h2>
    //         {/* Incoming challenges */}
    //         <div className="mb-4">
    //           <h3 className="mb-2 text-lg font-medium">Incoming</h3>
    //           <div className="mb-2 flex items-center justify-between">
    //             <span>From: Jane Doe</span>
    //             <div>
    //               <button className="mr-2 text-green-500">Accept</button>
    //               <button className="text-red-500">Decline</button>
    //             </div>
    //           </div>
    //           {/* ... more incoming challenges */}
    //         </div>

    //         {/* Outgoing challenges */}
    //         <div>
    //           <h3 className="mb-2 text-lg font-medium">Outgoing</h3>
    //           <div className="mb-2 flex items-center justify-between">
    //             <span>To: John Smith</span>
    //             <span className="text-gray-500">Pending</span>
    //           </div>
    //           {/* ... more outgoing challenges */}
    //         </div>
    //       </div>

    //       {/* Ongoing Matches */}
    //       <div>
    //         <h2 className="mb-4 text-xl font-semibold">Ongoing Matches</h2>
    //         <div className="mb-2 flex items-center justify-between">
    //           <span>With: Jane Doe</span>
    //           <span className="text-green-500">Your Turn to Hide</span>
    //         </div>
    //         {/* ... more ongoing matches */}
    //       </div>
    //     </section>
    //   </main>

    //   {/* Footer */}
    //   <footer className="mt-8 text-center">
    //     <a href="#" className="text-blue-500">
    //       About
    //     </a>
    //     <span className="mx-2">|</span>
    //     <a href="#" className="text-blue-500">
    //       Support/Help
    //     </a>
    //   </footer>
    // </div>
  );
}
