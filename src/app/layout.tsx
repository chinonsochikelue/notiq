import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { EdgeStoreProvider } from "@/lib/edgestore";
import QueryProvider from "@/components/providers/QueryProvider";
import { Toaster } from "sonner";
export const metadata: Metadata = {
  title: "Notiq Editor - Intelligent Blogging with Content Analytics",
  description:
    "Advanced rich text editor with real-time content analytics, reading time estimation, and engagement optimization for bloggers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <EdgeStoreProvider>
        <body className="font-sans antialiased w-full min-h-screen dark:text-white text-slate-800 dark:bg-[#020b19] bg-white">
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <main className="mt-10">
                {children}
              </main>
              <Toaster />
            </ThemeProvider>
          </QueryProvider>
        </body>
      </EdgeStoreProvider>
    </html>
  );
}
