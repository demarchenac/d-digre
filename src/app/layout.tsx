import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { cn } from "~/lib/utils";
import { ThemeToggle } from "~/components/ui/theme-toggle";
import { ThemeProvider } from "~/components/theme-provider";
import { JotaiProvider } from "~/components/jotai-provider";
import { FloatingControls } from "~/components/floating-controls";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Demarchenac's Directed Graph Rendering Engine (D-DiGRE)",
  description: "Made with t3-stack and <3, by @demarchenac",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)}>
        <JotaiProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <header className="absolute right-0 top-0 z-10 flex w-fit justify-end  p-4">
              <ThemeToggle />
            </header>

            <FloatingControls />

            <main>{children}</main>
          </ThemeProvider>
        </JotaiProvider>
      </body>
    </html>
  );
}
