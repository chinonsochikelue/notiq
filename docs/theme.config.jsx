export default {
  logo: (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-xl">N</span>
      </div>
      <div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
          Notiq
        </span>
        <p className="text-xs text-gray-500 dark:text-gray-400">Modern Block Editor</p>
      </div>
    </div>
  ),
  project: {
    link: 'https://github.com/chinonsochikelue/notiq'
  },
  chat: {
    link: 'https://github.com/chinonsochikelue/notiq/discussions'
  },
  docsRepositoryBase: 'https://github.com/chinonsochikelue/notiq/tree/main/docs',
  footer: {
    text: `MIT ${new Date().getFullYear()} © Chinonso Chikelue`
  },
  sidebar: {
    defaultMenuCollapseLevel: 1,
    toggleButton: true
  },
  toc: {
    backToTop: true
  },
  editLink: {
    text: 'Edit this page on GitHub'
  },
  feedback: {
    content: 'Question? Give us feedback →',
    labels: 'feedback'
  },
  navigation: true,
  darkMode: true,
  primaryHue: 270,
  primarySaturation: 70
}

