import "@/styles/globals.css";

import { Jura } from "next/font/google";
import { headers } from "next/headers";

import { TRPCReactProvider } from "@/trpc/react";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/client/providers";
import { PusherClientProvider } from "@/pusher/client";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

const jura = Jura({
  subsets: ["latin"],
  weight: "600",
  style: "normal",
  variable: "--font-jura",
});

export const metadata = {
  title: "Hot 'n Cold",
  description: "Hide and seek with a twist",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            `min-h-screen bg-background font-jura antialiased`,
            jura.variable,
          )}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <PusherClientProvider>
              <TRPCReactProvider headers={headers()}>
                {children}
              </TRPCReactProvider>
            </PusherClientProvider>
          </ThemeProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
