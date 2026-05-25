'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const SPREAD: [number, number, number] = [22, 14, 6]
const CONNECTION_DIST = 4.2

// 3 depth layers — [particle count, pixel size, opacity, hex color]
// Far: many small dim stars; Mid: balanced; Near: few large bright stars
const STAR_LAYERS: Array<[number, number, number, number]> = [
  [55, 1.2, 0.3, 0xffffff], // far
  [38, 2.2, 0.65, 0xffffff], // mid
  [17, 3.8, 0.92, 0xffffff], // near
]
const TOTAL_PARTICLES = STAR_LAYERS.reduce((s, l) => s + l[0], 0) // 110

// Accent colors
const ACCENT_HEX = 0xe34d2a // --accent orange — connection lines
const STATUS_OK_HEX = 0x22c55e // --status-ok green — accent nodes
const COLD_BLUE_HEX = 0xb8d4ff // cool blue-white — space depth tint

export function HeroBackground() {
  const mountRef = useRef<HTMLDivElement>(null)
  const parallaxRef = useRef({ x: 0, y: 0 })

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

    const group = new THREE.Group()
    scene.add(group)

    // ── Build all particle positions ──────────────────────────────────────────
    const pts: THREE.Vector3[] = []
    for (let i = 0; i < TOTAL_PARTICLES; i++) {
      pts.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * SPREAD[0],
          (Math.random() - 0.5) * SPREAD[1],
          (Math.random() - 0.5) * SPREAD[2]
        )
      )
    }

    // Track everything that needs disposal
    const disposables: Array<THREE.BufferGeometry | THREE.Material> = []

    // ── 3 depth-layered star groups ───────────────────────────────────────────
    let offset = 0
    for (const [count, size, opacity, color] of STAR_LAYERS) {
      const pos = new Float32Array(count * 3)
      for (let i = 0; i < count; i++) {
        pos[i * 3] = pts[offset + i].x
        pos[i * 3 + 1] = pts[offset + i].y
        pos[i * 3 + 2] = pts[offset + i].z
      }
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      const mat = new THREE.PointsMaterial({
        color,
        size,
        sizeAttenuation: false,
        transparent: true,
        opacity,
      })
      group.add(new THREE.Points(geo, mat))
      disposables.push(geo, mat)
      offset += count
    }

    // ── Green accent nodes — every 11th particle (~9 of 110) ─────────────────
    const greenIdx = pts.reduce<number[]>((acc, _, i) => {
      if (i % 11 === 5) acc.push(i)
      return acc
    }, [])
    const greenPos = new Float32Array(greenIdx.length * 3)
    greenIdx.forEach((idx, j) => {
      greenPos[j * 3] = pts[idx].x
      greenPos[j * 3 + 1] = pts[idx].y
      greenPos[j * 3 + 2] = pts[idx].z
    })
    const greenGeo = new THREE.BufferGeometry()
    greenGeo.setAttribute('position', new THREE.BufferAttribute(greenPos, 3))
    const greenMat = new THREE.PointsMaterial({
      color: STATUS_OK_HEX,
      size: 3.2,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.82,
    })
    group.add(new THREE.Points(greenGeo, greenMat))
    disposables.push(greenGeo, greenMat)

    // ── Blue-white cold stars — every 22nd particle (~5 of 110) ──────────────
    const blueIdx = pts.reduce<number[]>((acc, _, i) => {
      if (i % 22 === 3) acc.push(i)
      return acc
    }, [])
    const bluePos = new Float32Array(blueIdx.length * 3)
    blueIdx.forEach((idx, j) => {
      bluePos[j * 3] = pts[idx].x
      bluePos[j * 3 + 1] = pts[idx].y
      bluePos[j * 3 + 2] = pts[idx].z
    })
    const blueGeo = new THREE.BufferGeometry()
    blueGeo.setAttribute('position', new THREE.BufferAttribute(bluePos, 3))
    const blueMat = new THREE.PointsMaterial({
      color: COLD_BLUE_HEX,
      size: 2.8,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.6,
    })
    group.add(new THREE.Points(blueGeo, blueMat))
    disposables.push(blueGeo, blueMat)

    // ── Connection lines ──────────────────────────────────────────────────────
    const lineVerts: number[] = []
    for (let i = 0; i < TOTAL_PARTICLES; i++) {
      for (let j = i + 1; j < TOTAL_PARTICLES; j++) {
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
      opacity: 0.42,
    })
    group.add(new THREE.LineSegments(lineGeo, lineMat))
    disposables.push(lineGeo, lineMat)

    // ── Input handlers ────────────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return
      parallaxRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      parallaxRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }

    const initialScrollY = window.scrollY
    const onScroll = () => {
      if (prefersReducedMotion) return
      const scrollRange = Math.max(1, Math.min(window.innerHeight, mount.clientHeight))
      const progress = Math.max(-1, Math.min(1, (window.scrollY - initialScrollY) / scrollRange))
      parallaxRef.current.x = 0
      parallaxRef.current.y = progress
    }

    if (isMobile) {
      onScroll()
      window.addEventListener('scroll', onScroll, { passive: true })
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
        group.rotation.y += 0.00009
        group.rotation.x += 0.00004
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
        window.removeEventListener('scroll', onScroll)
      } else {
        window.removeEventListener('mousemove', onMouseMove)
      }
      disposables.forEach((d) => d.dispose())
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
