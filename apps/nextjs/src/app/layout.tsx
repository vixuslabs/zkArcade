import "@/styles/globals.css";

import { Jura } from "next/font/google";
import { ThemeProvider } from "@/components/client/providers";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { PusherClientProvider } from "@/pusher/client";
import { TRPCReactProvider } from "@/trpc/react";
import { ClerkProvider } from "@clerk/nextjs";

const jura = Jura({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: "normal",
  variable: "--font-jura",
});

export const metadata = {
  title: "zkArcade",
  description: "Arcade for XR zero knowledge games, built on Mina Protocol",
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
            <TRPCReactProvider>
              <PusherClientProvider>{children}</PusherClientProvider>
            </TRPCReactProvider>
          </ThemeProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
