// Feature Card Component
export function FeatureCard({ icon, title, description }) {
    return (
        <div className="premium-card p-6 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">{icon}</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{description}</p>
        </div>
    )
}

// Code Block with Copy Button
export function CodeBlock({ code, language = 'tsx' }) {
    return (
        <div className="enhanced-code-block my-6">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
                <span className="text-xs text-gray-400 font-mono">{language}</span>
                <button className="text-xs text-gray-400 hover:text-white transition-colors">
                    Copy
                </button>
            </div>
            <pre className="p-4 overflow-x-auto">
                <code className={`language-${language}`}>{code}</code>
            </pre>
        </div>
    )
}

// Callout Component
export function Callout({ type = 'info', children }) {
    const styles = {
        info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-900 dark:text-blue-100',
        warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-900 dark:text-yellow-100',
        error: 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-900 dark:text-red-100',
        success: 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-900 dark:text-green-100'
    }

    return (
        <div className={`border-l-4 p-4 rounded-r-lg my-6 ${styles[type]}`}>
            {children}
        </div>
    )
}

// Stats Component
export function Stats({ stats }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
            {stats.map((stat, index) => (
                <div key={index} className="premium-card p-6 text-center">
                    <div className="text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                    <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
            ))}
        </div>
    )
}

// Hero Section
export function Hero({ title, description, cta }) {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 p-12 my-12 text-white">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
            <div className="relative z-10">
                <h1 className="text-5xl font-bold mb-4">{title}</h1>
                <p className="text-xl text-purple-100 mb-8 max-w-2xl">{description}</p>
                {cta && (
                    <a href={cta.href} className="inline-block premium-button">
                        {cta.text}
                    </a>
                )}
            </div>
        </div>
    )
}

// Tab Component
export function Tabs({ tabs }) {
    return (
        <div className="my-8">
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 mb-6">
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        className="px-4 py-2 font-medium text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 border-b-2 border-transparent hover:border-purple-600 transition-colors"
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    )
}
