'use client'

import { useEffect, useRef } from 'react'

const NODES = [
  { x: 80, y: 95 },
  { x: 250, y: 50 },
  { x: 420, y: 130 },
  { x: 590, y: 65 },
  { x: 750, y: 145 },
  { x: 920, y: 60 },
  { x: 1060, y: 125 },
  { x: 1180, y: 210 },
  { x: 45, y: 300 },
  { x: 185, y: 365 },
  { x: 355, y: 315 },
  { x: 505, y: 405 },
  { x: 655, y: 330 },
  { x: 815, y: 390 },
  { x: 975, y: 315 },
  { x: 1125, y: 370 },
  { x: 130, y: 545 },
  { x: 305, y: 595 },
  { x: 465, y: 530 },
  { x: 620, y: 600 },
  { x: 790, y: 545 },
  { x: 955, y: 585 },
  { x: 1095, y: 530 },
]

const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [0, 8],
  [1, 9],
  [2, 10],
  [3, 11],
  [4, 12],
  [5, 13],
  [6, 14],
  [7, 15],
  [8, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [12, 13],
  [13, 14],
  [14, 15],
  [8, 16],
  [9, 17],
  [10, 18],
  [11, 19],
  [12, 20],
  [13, 21],
  [14, 22],
  [16, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [20, 21],
  [21, 22],
  [0, 9],
  [2, 11],
  [5, 13],
  [9, 18],
  [11, 20],
  [13, 22],
]

const JOURNALIST_NODE_INDEXES = [1, 4, 9, 13, 18, 21]
const GROUP_NODE_INDEXES = [2, 6, 11, 16, 22]
const AVATAR_NODE_INDEXES = new Set([...JOURNALIST_NODE_INDEXES, ...GROUP_NODE_INDEXES])

export function NetworkBackground() {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const activeParticles: SVGCircleElement[] = []
    let timeout = 0

    function spawnParticle() {
      if (!svg) return
      const edge = EDGES[Math.floor(Math.random() * EDGES.length)]
      const a = NODES[edge[0]]
      const b = NODES[edge[1]]

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('r', '2.8')
      circle.setAttribute('fill', 'var(--net-travel)')
      circle.style.filter = 'blur(0.4px)'
      svg.appendChild(circle)
      activeParticles.push(circle)

      const duration = 1600 + Math.random() * 1200
      const start = performance.now()

      function tick(now: number) {
        const t = Math.min((now - start) / duration, 1)
        // Ease in-out quad
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
        circle.setAttribute('cx', String(a.x + (b.x - a.x) * ease))
        circle.setAttribute('cy', String(a.y + (b.y - a.y) * ease))
        const opacity = t < 0.1 ? t * 10 : t > 0.9 ? (1 - t) * 10 : 1
        circle.setAttribute('opacity', String(opacity * 0.95))
        if (t < 1) {
          requestAnimationFrame(tick)
        } else {
          circle.remove()
          const idx = activeParticles.indexOf(circle)
          if (idx !== -1) activeParticles.splice(idx, 1)
        }
      }
      requestAnimationFrame(tick)
    }

    function scheduleNext() {
      spawnParticle()
      timeout = window.setTimeout(scheduleNext, 300 + Math.random() * 500)
    }
    timeout = window.setTimeout(scheduleNext, 800)

    return () => {
      clearTimeout(timeout)
      activeParticles.forEach((c) => c.remove())
    }
  }, [])

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{
        maskImage: 'radial-gradient(ellipse 95% 90% at 50% 50%, black 25%, transparent 82%)',
        WebkitMaskImage: 'radial-gradient(ellipse 95% 90% at 50% 50%, black 25%, transparent 82%)',
      }}
    >
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 690"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Edges with staggered fade animation */}
        {EDGES.map(([a, b], i) => (
          <line
            key={i}
            className="net-edge"
            x1={NODES[a].x}
            y1={NODES[a].y}
            x2={NODES[b].x}
            y2={NODES[b].y}
            stroke="var(--net-edge)"
            strokeWidth="0.9"
            style={{ animationDelay: `${(i * 0.19) % 5}s` }}
          />
        ))}

        {/* Nodes: ring pulse + core pulse */}
        {NODES.map((n, i) => {
          if (AVATAR_NODE_INDEXES.has(i)) return null
          return (
            <g key={i}>
              <circle
                className="net-ring"
                cx={n.x}
                cy={n.y}
                r={8}
                fill="none"
                stroke="var(--net-dot-core)"
                strokeWidth="1.2"
                style={{ animationDelay: `${(i * 0.41) % 3.5}s` }}
              />
              <circle cx={n.x} cy={n.y} r={5} fill="var(--net-dot-outer)" />
              <circle
                className="net-node"
                cx={n.x}
                cy={n.y}
                r={2.5}
                fill="var(--net-dot-core)"
                style={{ animationDelay: `${(i * 0.23) % 3.5}s` }}
              />
            </g>
          )
        })}

        {/* Some nodes show journalist avatars to reinforce a human network */}
        {JOURNALIST_NODE_INDEXES.map((nodeIndex, i) => {
          const n = NODES[nodeIndex]

          return (
            <g key={`journalist-${nodeIndex}`} transform={`translate(${n.x}, ${n.y})`}>
              <circle
                className="net-ring"
                r={9.5}
                fill="none"
                stroke="var(--net-dot-core)"
                strokeWidth="1.4"
                style={{ animationDelay: `${(i * 0.31) % 3.5}s` }}
              />
              <circle cx="0" cy="-3.1" r="2.7" fill="var(--net-avatar, #8A0018)" opacity="0.95" />
              <path
                d="M -5.5 5.7 C -4.0 2.1 4.0 2.1 5.5 5.7"
                fill="none"
                stroke="var(--net-avatar, #8A0018)"
                strokeWidth="2.0"
                strokeLinecap="round"
                opacity="0.95"
              />
            </g>
          )
        })}

        {/* A few extra nodes show grouped user icons */}
        {GROUP_NODE_INDEXES.map((nodeIndex, i) => {
          const n = NODES[nodeIndex]

          return (
            <g key={`group-${nodeIndex}`} transform={`translate(${n.x}, ${n.y})`}>
              <circle
                className="net-ring"
                r={10.5}
                fill="none"
                stroke="var(--net-dot-core)"
                strokeWidth="1.4"
                style={{ animationDelay: `${(i * 0.37) % 3.5}s` }}
              />
              <circle
                cx="-3.6"
                cy="-2.9"
                r="2.0"
                fill="var(--net-avatar, #8A0018)"
                opacity="0.92"
              />
              <circle cx="3.6" cy="-2.9" r="2.0" fill="var(--net-avatar, #8A0018)" opacity="0.92" />
              <circle cx="0" cy="-1.0" r="2.3" fill="var(--net-avatar, #8A0018)" opacity="0.96" />
              <path
                d="M -7.8 6.0 C -6.1 2.9 -1.7 2.9 0 6.0"
                fill="none"
                stroke="var(--net-avatar, #8A0018)"
                strokeWidth="1.7"
                strokeLinecap="round"
                opacity="0.9"
              />
              <path
                d="M 0 6.0 C 1.7 2.9 6.1 2.9 7.8 6.0"
                fill="none"
                stroke="var(--net-avatar, #8A0018)"
                strokeWidth="1.7"
                strokeLinecap="round"
                opacity="0.9"
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
