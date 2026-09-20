import './App.css'

function App() {
  return (
    <main className="app">
      <div className="noise"></div>

      <div className="glow glow-1"></div>
      <div className="glow glow-2"></div>
      <div className="glow glow-3"></div>

      <div className="grid"></div>

      <section className="hero">
        <div className="top-bar">
          <div className="status">
            <span className="status-dot"></span>
            Available for new projects
          </div>

          <span className="year">2026</span>
        </div>

        <div className="content">
          <div className="avatar">
            <span>🧑‍💻</span>
          </div>

          <p className="eyebrow">
            <span className="line"></span>
            FIRST REACT PROJECT
            <span className="line"></span>
          </p>

          <h1>
            Hello
            <span className="gradient-text"> World.</span>
          </h1>

          <p className="subtitle">
            A small beginning to a bigger journey.
          </p>

          <p className="description">
            Hi, I&apos;m <strong>Hoang Nguyen</strong>.
            <br />
            I&apos;m learning to build modern digital experiences
            <br className="desktop-break" />
            with <span>React.js</span>.
          </p>

          <div className="tech-stack">
            <span>React.js</span>
            <span>JavaScript</span>
            <span>Vite</span>
            <span>Vercel</span>
          </div>

          <div className="actions">
            <a
              href="https://react.dev/"
              target="_blank"
              rel="noreferrer"
              className="button primary"
            >
              <span>Explore React</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </a>

            <a
              href="https://github.com/hoangnguyen412"
              target="_blank"
              rel="noreferrer"
              className="button secondary"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5" />
                <path d="M9 18v-4a4.8 4.8 0 0 1 1-3.5" />
                <path d="M12 2a10 10 0 0 0-3.1 19.5c.5.1.7-.2.7-.5v-1.8" />
                <path d="M12 2a10 10 0 0 1 3.1 19.5c-.5.1-.7-.2-.7-.5v-1.8" />
                <path d="M8 9.5c-.8.1-1.8-.4-2.2-1.2" />
                <path d="M16 9.5c.8.1 1.8-.4 2.2-1.2" />
              </svg>
              <span>My GitHub</span>
            </a>
          </div>
        </div>

        <div className="bottom-bar">
          <div>
            <span className="muted">Built with</span>
            <span className="react-label">React.js</span>
          </div>

          <div className="scroll">
            <span>SCROLL TO EXPLORE</span>
            <span className="scroll-arrow">↓</span>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App