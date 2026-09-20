import { useEffect, useRef } from 'react'
import './App.css'

function App() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    let particles = []
    let animationId = 0
    let lastX = window.innerWidth / 2
    let lastY = window.innerHeight / 2
    let mouseX = lastX
    let mouseY = lastY
    let mouseVisible = false

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const addParticle = (x, y, vx, vy, burst = false) => {
      const angle = Math.random() * Math.PI * 2
      const speed = burst ? Math.random() * 3 + 1 : Math.random() * 0.9 + 0.25
      const hue = 235 + Math.random() * 55

      particles.push({
        x,
        y,
        prevX: x,
        prevY: y,
        vx: vx * 0.08 + Math.cos(angle) * speed,
        vy: vy * 0.08 + Math.sin(angle) * speed,
        size: Math.random() * 1.8 + (burst ? 0.8 : 0.5),
        life: 1,
        decay: Math.random() * 0.018 + (burst ? 0.012 : 0.018),
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.12,
        hue,
        twinkle: Math.random() * Math.PI * 2,
      })
    }

    const handlePointerMove = (event) => {
      const x = event.clientX
      const y = event.clientY
      const dx = x - lastX
      const dy = y - lastY
      const distance = Math.hypot(dx, dy)

      mouseX = x
      mouseY = y
      mouseVisible = true

      if (distance > 1) {
        const amount = Math.min(8, Math.max(1, Math.floor(distance / 7)))

        for (let i = 0; i < amount; i += 1) {
          const progress = amount === 1 ? 1 : i / (amount - 1)
          addParticle(
            lastX + dx * progress + (Math.random() - 0.5) * 10,
            lastY + dy * progress + (Math.random() - 0.5) * 10,
            dx,
            dy,
          )
        }
      }

      lastX = x
      lastY = y
    }

    const handlePointerDown = (event) => {
      for (let i = 0; i < 18; i += 1) {
        addParticle(event.clientX, event.clientY, 0, 0, true)
      }
    }

    const drawStar = (particle, time) => {
      const { x, y, size, rotation, life, hue } = particle
      const pulse = 0.72 + Math.sin(time * 0.008 + particle.twinkle) * 0.28
      const alpha = Math.max(0, life) * pulse

      ctx.save()
      ctx.globalCompositeOperation = 'lighter'

      ctx.strokeStyle = `hsla(${hue}, 95%, 75%, ${alpha * 0.2})`
      ctx.lineWidth = Math.max(0.6, size * 0.7)
      ctx.beginPath()
      ctx.moveTo(particle.prevX, particle.prevY)
      ctx.lineTo(x, y)
      ctx.stroke()

      const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 8)
      glow.addColorStop(0, `hsla(${hue}, 100%, 92%, ${alpha * 0.9})`)
      glow.addColorStop(0.2, `hsla(${hue}, 100%, 78%, ${alpha * 0.45})`)
      glow.addColorStop(1, `hsla(${hue}, 100%, 65%, 0)`)

      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(x, y, size * 8, 0, Math.PI * 2)
      ctx.fill()

      ctx.translate(x, y)
      ctx.rotate(rotation)
      ctx.fillStyle = `hsla(${hue}, 100%, 96%, ${alpha})`

      ctx.beginPath()
      ctx.moveTo(0, -size * 3.4)
      ctx.lineTo(size * 0.8, -size * 0.8)
      ctx.lineTo(size * 3.4, 0)
      ctx.lineTo(size * 0.8, size * 0.8)
      ctx.lineTo(0, size * 3.4)
      ctx.lineTo(-size * 0.8, size * 0.8)
      ctx.lineTo(-size * 3.4, 0)
      ctx.lineTo(-size * 0.8, -size * 0.8)
      ctx.closePath()
      ctx.fill()

      ctx.restore()
    }

    const drawCursorGlow = () => {
      if (!mouseVisible) return

      const glow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 110)
      glow.addColorStop(0, 'rgba(139, 92, 246, 0.13)')
      glow.addColorStop(0.35, 'rgba(96, 165, 250, 0.06)')
      glow.addColorStop(1, 'rgba(96, 165, 250, 0)')

      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(mouseX, mouseY, 110, 0, Math.PI * 2)
      ctx.fill()
    }

    const animate = (time) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      drawCursorGlow()

      particles = particles.filter((particle) => particle.life > 0)

      for (const particle of particles) {
        particle.prevX = particle.x
        particle.prevY = particle.y
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vx *= 0.985
        particle.vy *= 0.985
        particle.vy += 0.0025
        particle.life -= particle.decay
        particle.rotation += particle.spin
        drawStar(particle, time)
      }

      if (particles.length > 650) {
        particles.splice(0, particles.length - 650)
      }

      animationId = requestAnimationFrame(animate)
    }

    resize()
    animationId = requestAnimationFrame(animate)

    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerdown', handlePointerDown, { passive: true })

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [])

  return (
    <main className="app">
      <canvas ref={canvasRef} className="star-trail" aria-hidden="true" />

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
            <span>HN</span>
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
            <span>MOVE YOUR CURSOR</span>
            <span className="scroll-arrow">✦</span>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App