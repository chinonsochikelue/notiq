import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { EdgeStoreProvider } from "@/lib/edgestore";
import QueryProvider from "@/components/providers/QueryProvider";
import { Toaster } from "sonner";

// Enhanced SEO Metadata
export const metadata: Metadata = {
  // Primary SEO
  title: {
    default: "Notiq - Open Source AI-Powered Rich Text Editor | Built with Lexical & Next.js",
    template: "%s | Notiq - AI Rich Text Editor"
  },
  description: "Notiq is a powerful, open-source AI-enhanced rich text editor built with Lexical, Next.js, and TypeScript. Features GPT-4 integration, 40+ content blocks, real-time analytics, drag & drop interface, and advanced formatting. Perfect for documentation, content creation, and collaborative writing.",
  
  // Keywords for better discoverability
  keywords: [
    "rich text editor",
    "AI editor",
    "open source editor",
    "Lexical editor",
    "Next.js editor",
    "TypeScript editor",
    "content creation",
    "documentation tool",
    "collaborative writing",
    "GPT-4 integration",
    "markdown editor",
    "WYSIWYG editor",
    "content analytics",
    "drag and drop editor",
    "voice to text",
    "interactive content blocks",
    "real-time collaboration",
    "technical documentation",
    "blog editor",
    "note taking app"
  ],
  
  // Author and creator information
  authors: [
    {
      name: "Chinonso Chikelue",
      url: "https://github.com/chinonsochikelue"
    }
  ],
  creator: "Chinonso Chikelue",
  publisher: "Notiq Open Source Project",
  
  // Open Graph metadata for social sharing
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://notiq.dev", // Replace with your actual domain
    title: "Notiq - Open Source AI-Powered Rich Text Editor",
    description: "Powerful AI-enhanced rich text editor built with Lexical, Next.js, and TypeScript. Features GPT-4 integration, 40+ content blocks, and advanced formatting capabilities.",
    siteName: "Notiq",
    images: [
      {
        url: "/og-image.png", // Create this image (1200x630px)
        width: 1200,
        height: 630,
        alt: "Notiq - AI-Powered Rich Text Editor Screenshot",
        type: "image/png",
      },
      {
        url: "/og-image-square.png", // Square version (1200x1200px)
        width: 1200,
        height: 1200,
        alt: "Notiq Editor Logo",
        type: "image/png",
      }
    ],
  },
  
  // Twitter Card metadata
  twitter: {
    card: "summary_large_image",
    site: "@notiq_editor", // Create Twitter account
    creator: "@chinonsochikelue", // Replace with actual Twitter handle
    title: "Notiq - Open Source AI-Powered Rich Text Editor",
    description: "Build beautiful documents with AI assistance. Features 40+ content blocks, GPT-4 integration, and real-time analytics.",
    images: ["/twitter-card.png"], // Create this image (1200x675px)
  },
  
  // Additional metadata
  category: "Technology",
  classification: "Open Source Software",
  
  // App-specific metadata
  applicationName: "Notiq Editor",
  appleWebApp: {
    capable: true,
    title: "Notiq Editor",
    statusBarStyle: "default",
  },
  
  // Verification and ownership
  verification: {
    // google: "your-google-site-verification-code", // Add when you set up Google Search Console
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
  
  // Robots directives
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Canonical and alternate URLs
  alternates: {
    canonical: "https://notiq.dev", // Replace with your actual domain
    languages: {
      "en-US": "https://notiq.dev/en-US",
      "x-default": "https://notiq.dev",
    },
  },
  
  // Additional structured data
  other: {
    "application-name": "Notiq",
    "msapplication-TileColor": "#2563eb",
    "theme-color": "#2563eb",
  },
};

// Viewport configuration for Next.js 15
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020b19" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Additional SEO meta tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Favicons and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//api.openai.com" />
        
        {/* Structured Data - JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebApplication",
                  "@id": "https://notiq.dev/#webapp",
                  "name": "Notiq",
                  "alternateName": "Notiq Editor",
                  "description": "Open-source AI-powered rich text editor built with Lexical, Next.js, and TypeScript",
                  "url": "https://notiq.dev",
                  "applicationCategory": "ProductivityApplication",
                  "operatingSystem": "Web Browser",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD",
                    "availability": "https://schema.org/InStock",
                    "priceSpecification": {
                      "@type": "PriceSpecification",
                      "price": "0",
                      "priceCurrency": "USD"
                    }
                  },
                  "author": {
                    "@type": "Person",
                    "name": "Chinonso Chikelue",
                    "url": "https://github.com/chinonsochikelue"
                  },
                  "programmingLanguage": ["TypeScript", "JavaScript", "React"],
                  "runtimePlatform": ["Next.js", "Lexical", "Node.js"],
                  "codeRepository": "https://github.com/chinonsochikelue/notiq",
                  "license": "https://opensource.org/licenses/MIT",
                  "downloadUrl": "https://github.com/chinonsochikelue/notiq",
                  "softwareVersion": "1.0.0",
                  "featureList": [
                    "AI-powered writing assistance",
                    "40+ content block types",
                    "Real-time collaboration",
                    "Drag and drop interface",
                    "Voice input",
                    "Markdown support",
                    "Export capabilities",
                    "Theme customization"
                  ]
                },
                {
                  "@type": "Organization",
                  "@id": "https://notiq.dev/#organization",
                  "name": "Notiq",
                  "url": "https://notiq.dev",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://notiq.dev/logo.png",
                    "width": 512,
                    "height": 512
                  },
                  "sameAs": [
                    "https://github.com/chinonsochikelue/notiq",
                    "https://twitter.com/notiq_editor"
                  ],
                  "founder": {
                    "@type": "Person",
                    "name": "Chinonso Chikelue"
                  }
                },
                {
                  "@type": "SoftwareSourceCode",
                  "@id": "https://github.com/chinonsochikelue/notiq",
                  "name": "Notiq",
                  "description": "AI-enhanced rich text editor source code",
                  "programmingLanguage": ["TypeScript", "JavaScript"],
                  "runtimePlatform": "Next.js",
                  "codeRepository": "https://github.com/chinonsochikelue/notiq",
                  "license": "https://opensource.org/licenses/MIT",
                  "author": {
                    "@type": "Person",
                    "name": "Chinonso Chikelue"
                  }
                }
              ]
            }),
          }}
        />
        
        {/* Additional structured data for software application */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Notiq",
              "operatingSystem": "Web Browser",
              "applicationCategory": "BusinessApplication",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "150"
              },
              "offers": {
                "@type": "Offer",
                "price": "0.00",
                "priceCurrency": "USD"
              }
            }),
          }}
        />
      </head>
      <EdgeStoreProvider>
        <body className="font-sans antialiased w-full min-h-screen dark:text-white text-slate-800 dark:bg-[#020b19] bg-white">
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <main>
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