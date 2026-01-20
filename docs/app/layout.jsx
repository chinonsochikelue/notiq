
import { Layout } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import '../styles/globals.css'

export const metadata = {
    title: 'Notiq Documentation - Modern Block Editor for Next.js',
    description: 'Beautiful, powerful, and extensible block editor built for Next.js applications'
}

export default async function RootLayout({ children }) {
    const pageMap = await getPageMap()

    return (
        <html lang="en" dir="ltr" suppressHydrationWarning className="scroll-smooth">
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Fira+Code:wght@400;500;600&display=swap" rel="stylesheet" />
            </Head>
            <body className="font-sans antialiased">
                {/* Premium Banner */}
                <div className="premium-banner relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white z-50">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
                    <div className="relative px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-2 font-semibold text-sm md:text-base">
                            <span className="animate-pulse">🚀</span>
                            <span>Notiq v1.0.7 is now available!</span>
                            <a href="https://github.com/chinonsochikelue/notiq" className="underline hover:text-purple-200 transition-colors ml-2">
                                View on GitHub →
                            </a>
                        </span>
                    </div>
                </div>

                <Layout pageMap={pageMap}>
                    {children}
                </Layout>
            </body>
        </html>
    )
}
