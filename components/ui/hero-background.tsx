'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Tuned constants — keep count low so mobile stays smooth
const PARTICLE_COUNT = 110
const CONNECTION_DIST = 3.8 // world-unit threshold for drawing a line between two nodes
const SPREAD: [number, number, number] = [22, 14, 6]
const ACCENT_HEX = 0xe34d2a // design-token --accent

export function HeroBackground() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

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

    // ── Mouse parallax ────────────────────────────────────────────────────────
    const isMobile = window.matchMedia('(pointer: coarse)').matches
    let mouseX = 0
    let mouseY = 0
    const onMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2 // −1 … +1
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2
    }
    const onOrientation = (e: DeviceOrientationEvent) => {
      if (prefersReducedMotion) return
      const gamma = e.gamma ?? 0
      const beta = e.beta ?? 45
      mouseX = Math.max(-1, Math.min(1, gamma / 45))
      mouseY = Math.max(-1, Math.min(1, (beta - 45) / 45))
    }

    let onTouchForGyroPermission: (() => void) | null = null
    const requestGyroPermission = () => {
      if (!('DeviceOrientationEvent' in window)) return

      const orientationEvent = window.DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<string>
      }

      if (typeof orientationEvent.requestPermission === 'function') {
        onTouchForGyroPermission = () => {
          orientationEvent
            .requestPermission?.()
            .then((state) => {
              if (state === 'granted') {
                window.addEventListener('deviceorientation', onOrientation, { passive: true })
              }
            })
            .catch(() => {
              // Permission denied or unavailable: keep ambient animation only.
            })
          if (onTouchForGyroPermission) {
            window.removeEventListener('touchstart', onTouchForGyroPermission)
            onTouchForGyroPermission = null
          }
        }
        window.addEventListener('touchstart', onTouchForGyroPermission, {
          once: true,
          passive: true,
        })
        return
      }

      window.addEventListener('deviceorientation', onOrientation, { passive: true })
    }

    if (isMobile) {
      requestGyroPermission()
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
        // Camera follows mouse — subtle depth parallax (lerp factor 0.04 = ~25 frames to settle)
        camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.04
        camera.position.y += (-mouseY * 1.0 - camera.position.y) * 0.04
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
        if (onTouchForGyroPermission) {
          window.removeEventListener('touchstart', onTouchForGyroPermission)
        }
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

  return (
    <>
      {/* Three.js canvas mount */}
      <div
        ref={mountRef}
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      />
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
