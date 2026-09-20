import { useEffect, useRef, useState } from 'react'
import './App.css'

const backgroundImage = '/your-background-image.jpg'

function App() {
  const canvasRef = useRef(null)
  const appRef = useRef(null)
  const heroRef = useRef(null)
  const avatarRef = useRef(null)
  const [commandOpen, setCommandOpen] = useState(false)
  const [time, setTime] = useState('')
  const [secret, setSecret] = useState(false)
  const typedRef = useRef('')

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      setTime(
        new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'Asia/Ho_Chi_Minh',
        }).format(now),
      )
    }

    updateClock()
    const clockId = window.setInterval(updateClock, 1000)

    return () => window.clearInterval(clockId)
  }, [])

  useEffect(() => {
    const app = appRef.current
    const hero = heroRef.current
    if (!app || !hero) return

    const moveCursor = (event) => {
      app.style.setProperty('--cursor-x', `${event.clientX}px`)
      app.style.setProperty('--cursor-y', `${event.clientY}px`)
    }

    const tiltHero = (event) => {
      const rect = hero.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width
      const y = (event.clientY - rect.top) / rect.height
      const rotateY = (x - 0.5) * 3.5
      const rotateX = (0.5 - y) * 3

      hero.style.setProperty('--tilt-x', `${rotateX}deg`)
      hero.style.setProperty('--tilt-y', `${rotateY}deg`)
      hero.style.setProperty('--shine-x', `${x * 100}%`)
      hero.style.setProperty('--shine-y', `${y * 100}%`)
    }

    const resetTilt = () => {
      hero.style.setProperty('--tilt-x', '0deg')
      hero.style.setProperty('--tilt-y', '0deg')
      hero.style.setProperty('--shine-x', '50%')
      hero.style.setProperty('--shine-y', '50%')
    }

    window.addEventListener('pointermove', moveCursor, { passive: true })
    hero.addEventListener('pointermove', tiltHero, { passive: true })
    hero.addEventListener('pointerleave', resetTilt)

    return () => {
      window.removeEventListener('pointermove', moveCursor)
      hero.removeEventListener('pointermove', tiltHero)
      hero.removeEventListener('pointerleave', resetTilt)
    }
  }, [])

  useEffect(() => {
    const avatar = avatarRef.current
    if (!avatar) return

    const handleMove = (event) => {
      const rect = avatar.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 100
      const y = ((event.clientY - rect.top) / rect.height) * 100
      avatar.style.setProperty('--avatar-x', `${x}%`)
      avatar.style.setProperty('--avatar-y', `${y}%`)
    }

    const reset = () => {
      avatar.style.setProperty('--avatar-x', '50%')
      avatar.style.setProperty('--avatar-y', '50%')
    }

    avatar.addEventListener('pointermove', handleMove, { passive: true })
    avatar.addEventListener('pointerleave', reset)

    return () => {
      avatar.removeEventListener('pointermove', handleMove)
      avatar.removeEventListener('pointerleave', reset)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true })
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    let animationId = 0
    let width = window.innerWidth
    let height = window.innerHeight
    let dpr = 1
    let particles = []
    let bursts = []
    let mouseX = width / 2
    let mouseY = height / 2
    let spawnX = mouseX
    let spawnY = mouseY
    let mouseVisible = false
    let hasMoved = false

    const particleSprites = []
    const cursorGlow = document.createElement('canvas')
    cursorGlow.width = 220
    cursorGlow.height = 220
    const glowCtx = cursorGlow.getContext('2d')

    if (glowCtx) {
      const gradient = glowCtx.createRadialGradient(110, 110, 0, 110, 110, 110)
      gradient.addColorStop(0, 'rgba(167,139,250,0.2)')
      gradient.addColorStop(0.35, 'rgba(96,165,250,0.08)')
      gradient.addColorStop(1, 'rgba(96,165,250,0)')
      glowCtx.fillStyle = gradient
      glowCtx.fillRect(0, 0, 220, 220)
    }

    const makeStarSprite = (size, color) => {
      const scale = 4
      const canvasSize = Math.ceil(size * scale * 10)
      const sprite = document.createElement('canvas')
      sprite.width = canvasSize
      sprite.height = canvasSize
      const spriteCtx = sprite.getContext('2d')
      if (!spriteCtx) return sprite

      const center = canvasSize / 2
      const radius = size * scale * 3.8
      const glow = spriteCtx.createRadialGradient(center, center, 0, center, center, radius)
      glow.addColorStop(0, 'rgba(255,255,255,0.95)')
      glow.addColorStop(0.18, `${color}0.58)`)
      glow.addColorStop(1, `${color}0)`)
      spriteCtx.fillStyle = glow
      spriteCtx.beginPath()
      spriteCtx.arc(center, center, radius, 0, Math.PI * 2)
      spriteCtx.fill()

      spriteCtx.fillStyle = '#ffffff'
      spriteCtx.beginPath()
      spriteCtx.moveTo(center, center - size * scale * 2.9)
      spriteCtx.lineTo(center + size * scale * 0.7, center - size * scale * 0.7)
      spriteCtx.lineTo(center + size * scale * 2.9, center)
      spriteCtx.lineTo(center + size * scale * 0.7, center + size * scale * 0.7)
      spriteCtx.lineTo(center, center + size * scale * 2.9)
      spriteCtx.lineTo(center - size * scale * 0.7, center + size * scale * 0.7)
      spriteCtx.lineTo(center - size * scale * 2.9, center)
      spriteCtx.lineTo(center - size * scale * 0.7, center - size * scale * 0.7)
      spriteCtx.closePath()
      spriteCtx.fill()
      return sprite
    }

    const spriteData = [
      [0.8, 'rgba(167,139,250,'],
      [1.15, 'rgba(96,165,250,'],
      [1.5, 'rgba(103,232,249,'],
    ]

    spriteData.forEach(([size, color]) => {
      particleSprites.push({ sprite: makeStarSprite(size, color), size })
    })

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const addParticle = (x, y, vx, vy, burst = false) => {
      const direction = Math.random() * Math.PI * 2
      const speed = burst ? Math.random() * 3 + 0.8 : Math.random() * 0.7 + 0.18
      const sprite = particleSprites[Math.floor(Math.random() * particleSprites.length)]

      particles.push({
        x,
        y,
        vx: vx * (burst ? 0.02 : 0.08) + Math.cos(direction) * speed,
        vy: vy * (burst ? 0.02 : 0.08) + Math.sin(direction) * speed,
        life: burst ? 1 : 0.95,
        decay: burst ? Math.random() * 0.03 + 0.02 : Math.random() * 0.022 + 0.02,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.08,
        sprite: sprite.sprite,
        renderSize: sprite.size,
        twinkle: Math.random() * Math.PI * 2,
      })
    }

    const addBurst = (x, y) => {
      bursts.push({ x, y, radius: 8, life: 1 })
      for (let i = 0; i < 18; i += 1) addParticle(x, y, 0, 0, true)
    }

    const handlePointerMove = (event) => {
      if (event.pointerType && event.pointerType !== 'mouse') return
      mouseX = event.clientX
      mouseY = event.clientY
      mouseVisible = true
      hasMoved = true
    }

    const handlePointerDown = (event) => {
      if (event.pointerType && event.pointerType !== 'mouse') return
      addBurst(event.clientX, event.clientY)
    }

    const animate = (timeStamp) => {
      if (hasMoved) {
        const dx = mouseX - spawnX
        const dy = mouseY - spawnY
        const distance = Math.hypot(dx, dy)

        if (distance > 6) {
          const amount = Math.min(3, Math.max(1, Math.floor(distance / 16)))
          for (let i = 1; i <= amount; i += 1) {
            const progress = i / amount
            addParticle(spawnX + dx * progress, spawnY + dy * progress, dx, dy)
          }
          spawnX = mouseX
          spawnY = mouseY
        }
      }

      ctx.clearRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'lighter'

      if (mouseVisible && glowCtx) {
        ctx.globalAlpha = 0.95
        ctx.drawImage(cursorGlow, mouseX - 110, mouseY - 110)
      }

      bursts = bursts.filter((burst) => burst.life > 0)
      bursts.forEach((burst) => {
        burst.radius += 5
        burst.life -= 0.045
        ctx.globalAlpha = burst.life * 0.35
        ctx.strokeStyle = '#a78bfa'
        ctx.lineWidth = 1.4
        ctx.beginPath()
        ctx.arc(burst.x, burst.y, burst.radius, 0, Math.PI * 2)
        ctx.stroke()
      })

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const particle = particles[i]
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vx *= 0.987
        particle.vy *= 0.987
        particle.vy += 0.0018
        particle.life -= particle.decay
        particle.rotation += particle.spin

        if (particle.life <= 0) {
          particles.splice(i, 1)
          continue
        }

        const alpha = particle.life * (0.74 + Math.sin(timeStamp * 0.006 + particle.twinkle) * 0.26)
        ctx.globalAlpha = Math.max(0, alpha * 0.24)
        ctx.strokeStyle = '#a78bfa'
        ctx.lineWidth = Math.max(0.5, particle.renderSize * 0.5)
        ctx.beginPath()
        ctx.moveTo(particle.x - particle.vx * 2.4, particle.y - particle.vy * 2.4)
        ctx.lineTo(particle.x, particle.y)
        ctx.stroke()

        ctx.save()
        ctx.globalAlpha = Math.max(0, alpha)
        ctx.translate(particle.x, particle.y)
        ctx.rotate(particle.rotation)
        ctx.drawImage(particle.sprite, -particle.sprite.width / 2, -particle.sprite.height / 2)
        ctx.restore()
      }

      if (particles.length > 320) particles.splice(0, particles.length - 320)

      animationId = requestAnimationFrame(animate)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerdown', handlePointerDown, { passive: true })
    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase()

      if ((event.ctrlKey || event.metaKey) && key === 'k') {
        event.preventDefault()
        setCommandOpen((value) => !value)
        return
      }

      if (event.key === 'Escape') {
        setCommandOpen(false)
        return
      }

      typedRef.current = `${typedRef.current}${key}`.slice(-10)
      if (typedRef.current.endsWith('hello')) {
        setSecret(true)
        typedRef.current = ''
        window.setTimeout(() => setSecret(false), 3200)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const magneticEnter = (event) => {
    const button = event.currentTarget
    button.style.setProperty('--mx', '0px')
    button.style.setProperty('--my', '0px')
  }

  const magneticMove = (event) => {
    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    const x = event.clientX - (rect.left + rect.width / 2)
    const y = event.clientY - (rect.top + rect.height / 2)
    button.style.setProperty('--mx', `${x * 0.18}px`)
    button.style.setProperty('--my', `${y * 0.18}px`)
  }

  const magneticLeave = (event) => {
    const button = event.currentTarget
    button.style.setProperty('--mx', '0px')
    button.style.setProperty('--my', '0px')
  }

  const goTo = (href) => {
    window.open(href, '_blank', 'noopener,noreferrer')
    setCommandOpen(false)
  }

  return (
    <main ref={appRef} className="app">
      <div className="background-image" style={{ backgroundImage: `url('${backgroundImage}')` }} />
      <div className="background-overlay" />
      <div className="cursor-spotlight" />
      <canvas ref={canvasRef} className="star-trail" aria-hidden="true" />
      <div className="noise" />
      <div className="glow glow-1" />
      <div className="glow glow-2" />
      <div className="glow glow-3" />
      <div className="grid" />

      <section ref={heroRef} className="hero">
        <div className="hero-glare" />

        <div className="top-bar">
          <div className="status">
            <span className="status-dot" />
            Available for new projects
          </div>

          <button className="command-trigger" onClick={() => setCommandOpen(true)}>
            <span>⌘</span>
          </button>
        </div>

        <div className="content">
          <div ref={avatarRef} className="avatar">
            <span>HN</span>
          </div>

          <p className="eyebrow">
            <span className="line" />
            FIRST REACT PROJECT
            <span className="line" />
          </p>

          <h1 aria-label="Hello World">
            <span className="word-reveal">H</span>
            <span className="word-reveal delay-1">e</span>
            <span className="word-reveal delay-2">l</span>
            <span className="word-reveal delay-3">l</span>
            <span className="word-reveal delay-4">o</span>
            <span className="gradient-text"> World.</span>
          </h1>

          <p className="subtitle">A small beginning to a bigger journey.</p>

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
              className="button primary magnetic"
              onPointerMove={magneticMove}
              onPointerEnter={magneticEnter}
              onPointerLeave={magneticLeave}
            >
              <span>Explore React</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </a>

            <a
              href="https://github.com/hoangnguyen412"
              target="_blank"
              rel="noreferrer"
              className="button secondary magnetic"
              onPointerMove={magneticMove}
              onPointerEnter={magneticEnter}
              onPointerLeave={magneticLeave}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

          <div className="terminal-window">
            <div className="terminal-top">
              <div className="terminal-dots">
                <span />
                <span />
                <span />
              </div>
              <span>terminal</span>
              <span className="terminal-live">LIVE</span>
            </div>
            <div className="terminal-body">
              <p><span className="prompt">$</span> npm run dev</p>
              <p className="terminal-dim">✓ React initialized</p>
              <p className="terminal-dim">✓ Vite server ready</p>
              <p className="terminal-success">✓ Hello World loaded</p>
            </div>
          </div>
        </div>

        <div className="bottom-bar">
          <div className="system-status">
            <span className="muted">Built with</span>
            <span className="react-label">React.js</span>
            <span className="separator">•</span>
            <span className="muted">HCMC</span>
            <span className="clock">{time}</span>
          </div>

          <div className="scroll">
            <span>MOVE YOUR CURSOR</span>
            <span className="scroll-arrow">✦</span>
          </div>
        </div>
      </section>

      {commandOpen && (
        <div className="command-backdrop" onClick={() => setCommandOpen(false)}>
          <div className="command-palette" onClick={(event) => event.stopPropagation()}>
            <div className="command-search">
              <span>⌕</span>
              <span>Quick actions</span>
              <kbd>ESC</kbd>
            </div>
            <button onClick={() => goTo('https://react.dev/')}>
              <span>Explore React</span>
              <span>↗</span>
            </button>
            <button onClick={() => goTo('https://github.com/hoangnguyen412')}>
              <span>Open GitHub</span>
              <span>↗</span>
            </button>
            <button onClick={() => setCommandOpen(false)}>
              <span>Close menu</span>
              <span>ESC</span>
            </button>
          </div>
        </div>
      )}

      {secret && <div className="secret-toast">You found the secret.</div>}
    </main>
  )
}

export default App
