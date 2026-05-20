'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

// Tuned constants — keep count low so mobile stays smooth
const PARTICLE_COUNT = 110
const CONNECTION_DIST = 3.8 // world-unit threshold for drawing a line between two nodes
const SPREAD: [number, number, number] = [22, 14, 6]
const ACCENT_HEX = 0xe34d2a // design-token --accent

// iOS 13+ type shim for DeviceOrientationEvent.requestPermission
type DeviceOrientationEventWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

export function HeroBackground() {
  const mountRef = useRef<HTMLDivElement>(null)
  // Shared parallax target — written by mousemove OR deviceorientation, read each animation frame
  const parallaxRef = useRef({ x: 0, y: 0 })
  // Callback registered by the useEffect; called from the iOS permission button onClick
  const enableGyroRef = useRef<(() => void) | null>(null)
  // Show tilt-enable badge only on iOS (where requestPermission exists)
  const [showGyroBtn, setShowGyroBtn] = useState(false)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia('(pointer: coarse)').matches

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // ── Scene & camera ────────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.set(0, 0, 8)

    // Single group: particles + connection lines rotate together — no per-frame geo updates
    const group = new THREE.Group()
    scene.add(group)

    // ── Particle positions ────────────────────────────────────────────────────
    const pts: Array<THREE.Vector3> = []
    const pPositions = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = (Math.random() - 0.5) * SPREAD[0]
      const y = (Math.random() - 0.5) * SPREAD[1]
      const z = (Math.random() - 0.5) * SPREAD[2]
      pts.push(new THREE.Vector3(x, y, z))
      pPositions[i * 3] = x
      pPositions[i * 3 + 1] = y
      pPositions[i * 3 + 2] = z
    }

    const particleGeo = new THREE.BufferGeometry()
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3))
    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.8,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.42,
    })
    group.add(new THREE.Points(particleGeo, particleMat))

    // ── Connection lines (static topology) ───────────────────────────────────
    // Only connect nearby nodes; accent-orange at very low opacity
    const lineVerts: number[] = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        if (pts[i].distanceTo(pts[j]) < CONNECTION_DIST) {
          lineVerts.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z)
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry()
    lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lineVerts), 3))
    const lineMat = new THREE.LineBasicMaterial({
      color: ACCENT_HEX,
      transparent: true,
      opacity: 0.2,
    })
    group.add(new THREE.LineSegments(lineGeo, lineMat))

    // ── Input handlers ────────────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return
      parallaxRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2 // −1 … +1
      parallaxRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }

    const onOrientation = (e: DeviceOrientationEvent) => {
      if (prefersReducedMotion) return
      // gamma: left/right tilt (−90…+90°); beta: front/back tilt (−180…+180°)
      // Phones held upright sit at beta≈45°, so offset before normalising
      const gamma = e.gamma ?? 0
      const beta = e.beta ?? 45
      parallaxRef.current.x = Math.max(-1, Math.min(1, gamma / 45))
      parallaxRef.current.y = Math.max(-1, Math.min(1, (beta - 45) / 45))
    }

    if (isMobile) {
      const OrientationEvent = window.DeviceOrientationEvent as DeviceOrientationEventWithPermission
      if (typeof OrientationEvent.requestPermission === 'function') {
        // iOS 13+: permission required — expose callback for the button onClick
        enableGyroRef.current = () => {
          window.addEventListener('deviceorientation', onOrientation, { passive: true })
        }
        setShowGyroBtn(true)
      } else {
        // Android / older iOS: no permission gate
        window.addEventListener('deviceorientation', onOrientation, { passive: true })
      }
    } else {
      window.addEventListener('mousemove', onMouseMove, { passive: true })
    }

    // ── Resize ────────────────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      if (!mount) return
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    })
    ro.observe(mount)

    // ── Animation loop ────────────────────────────────────────────────────────
    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      if (!prefersReducedMotion) {
        // Slow ambient rotation of the whole network
        group.rotation.y += 0.00009
        group.rotation.x += 0.00004
        // Camera follows parallax target — lerp factor 0.04 ≈ 25 frames to settle
        camera.position.x += (parallaxRef.current.x * 1.5 - camera.position.x) * 0.04
        camera.position.y += (-parallaxRef.current.y * 1.0 - camera.position.y) * 0.04
      }
      renderer.render(scene, camera)
    }
    animate()

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
      if (isMobile) {
        window.removeEventListener('deviceorientation', onOrientation)
      } else {
        window.removeEventListener('mousemove', onMouseMove)
      }
      particleGeo.dispose()
      particleMat.dispose()
      lineGeo.dispose()
      lineMat.dispose()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  // Called from the iOS permission button — must be a React onClick to count as user activation
  const handleGrantGyro = () => {
    const OrientationEvent = window.DeviceOrientationEvent as DeviceOrientationEventWithPermission
    OrientationEvent.requestPermission?.()
      .then((state) => {
        if (state === 'granted') enableGyroRef.current?.()
      })
      .catch(() => {})
      .finally(() => setShowGyroBtn(false))
  }

  return (
    <>
      {/* Three.js canvas mount */}
      <div
        ref={mountRef}
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      />

      {/* iOS gyroscope permission badge — only rendered when requestPermission API is present */}
      {showGyroBtn && (
        <button
          type="button"
          onClick={handleGrantGyro}
          className="absolute bottom-6 right-4 z-10 flex items-center gap-1.5 rounded-full border border-hairline bg-surface-1/70 px-3 py-1.5 font-mono text-[11px] text-fg-3 backdrop-blur-sm transition-opacity hover:text-foreground"
          aria-label="Enable tilt parallax effect"
        >
          {/* Gyroscope icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2a10 10 0 0 1 7.39 16.76" />
            <path d="M12 22A10 10 0 0 1 4.61 5.24" />
            <path d="M2 12h4" />
            <path d="M18 12h4" />
          </svg>
          Enable tilt
        </button>
      )}

      {/* Radial vignette: centre clear, edges dissolve into canvas colour #0f0f10 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 85% 65% at 50% 45%, transparent 25%, var(--hero-vignette) 100%)',
        }}
        aria-hidden="true"
      />
    </>
  )
}
