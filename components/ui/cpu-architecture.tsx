"use client"

import React from "react"
import { cn } from "@/lib/utils"

export interface CpuArchitectureSvgProps {
  className?: string
  width?: string
  height?: string
  text?: string
  showCpuConnections?: boolean
  lineMarkerSize?: number
  animateText?: boolean
  animateLines?: boolean
  animateMarkers?: boolean
}

export default function CpuArchitecture({
  className,
  width = "100%",
  height = "100%",
  text = "EKOTIZIM",
  showCpuConnections = true,
  animateText = true,
  lineMarkerSize = 18,
  animateLines = true,
  animateMarkers = true,
}: CpuArchitectureSvgProps) {
  return (
    <svg
      className={cn("overflow-visible text-slate-200 dark:text-slate-800", className)}
      width={width}
      height={height}
      viewBox="0 0 200 105"
    >
      {/* Paths */}
      <g
        stroke="currentColor"
        fill="none"
        strokeWidth="0.38"
        strokeDasharray="100 100"
        pathLength="100"
        markerStart="url(#cpu-circle-marker)"
      >
        {/* 1st - Frontend */}
        <path
          strokeDasharray="100 100"
          pathLength="100"
          d="M 10 20 h 79.5 q 5 0 5 5 v 30"
        />
        {/* 2nd - Backend */}
        <path
          strokeDasharray="100 100"
          pathLength="100"
          d="M 180 10 h -69.7 q -5 0 -5 5 v 30"
        />
        {/* 3rd - AI Mentor */}
        <path d="M 130 20 v 21.8 q 0 5 -5 5 h -10" />
        {/* 4th - Shop */}
        <path d="M 170 77 v -18.8 q 0 -5 -5 -5 h -50" />
        {/* 5th - Oflayn */}
        <path
          strokeDasharray="100 100"
          pathLength="100"
          d="M 135 66 h 15 q 5 0 5 5 v 8 q 0 5 -5 5 h -39.8 q -5 0 -5 -5 v -19"
        />
        {/* 6th - Sertifikat */}
        <path d="M 94.8 93 v -34" />
        {/* 7th - Amaliy Loyiha */}
        <path d="M 88 86 v -13 q 0 -5 -5 -5 h -10 q -5 0 -5 -5 v -5 q 0 -5 5 -5 h 14" />
        {/* 8th - UI/UX */}
        <path d="M 30 30 h 25 q 5 0 5 5 v 6.5 q 0 5 5 5 h 20" />
        
        {/* Animation For Path Starting */}
        {animateLines && (
          <animate
            attributeName="stroke-dashoffset"
            from="100"
            to="0"
            dur="1.5s"
            fill="freeze"
            calcMode="spline"
            keySplines="0.25,0.1,0.5,1"
            keyTimes="0; 1"
          />
        )}
      </g>

      {/* KINGS ROADMAP TEXTS */}
      <g className="font-semibold tracking-wide" style={{ fontSize: '3.5px' }}>
        <text x="10" y="18" fill="#00E8ED">ONLINE KURSLAR</text>
        <text x="180" y="8" textAnchor="end" fill="#FFD800">KARYERA MARKAZI</text>
        <text x="130" y="18" textAnchor="middle" fill="#8b5cf6">AI MENTOR</text>
        <text x="170" y="83" textAnchor="end" fill="#10b981">MARKETPLACE</text>
        <text x="135" y="64" fill="#22c55e">OFLAYN MARKAZLAR</text>
        <text x="95" y="97" textAnchor="middle" fill="#f97316">SERTIFIKATSIYA</text>
        <text x="86" y="90" textAnchor="end" fill="#06b6d4">PORTFOLIO LOYIHALAR</text>
        <text x="30" y="28" fill="#f43f5e">HAMJAMIYAT</text>
      </g>

      {/* Light Nodes */}
      <g mask="url(#cpu-mask-1)"><circle className="cpu-architecture" cx="0" cy="0" r="8" fill="url(#cpu-blue-grad)" /></g>
      <g mask="url(#cpu-mask-2)"><circle className="cpu-architecture" cx="0" cy="0" r="8" fill="url(#cpu-yellow-grad)" /></g>
      <g mask="url(#cpu-mask-3)"><circle className="cpu-architecture" cx="0" cy="0" r="8" fill="url(#cpu-purple-grad)" /></g>
      <g mask="url(#cpu-mask-4)"><circle className="cpu-architecture" cx="0" cy="0" r="8" fill="url(#cpu-emerald-grad)" /></g>
      <g mask="url(#cpu-mask-5)"><circle className="cpu-architecture" cx="0" cy="0" r="8" fill="url(#cpu-green-grad)" /></g>
      <g mask="url(#cpu-mask-6)"><circle className="cpu-architecture" cx="0" cy="0" r="8" fill="url(#cpu-orange-grad)" /></g>
      <g mask="url(#cpu-mask-7)"><circle className="cpu-architecture" cx="0" cy="0" r="8" fill="url(#cpu-cyan-grad)" /></g>
      <g mask="url(#cpu-mask-8)"><circle className="cpu-architecture" cx="0" cy="0" r="8" fill="url(#cpu-rose-grad)" /></g>

      {/* Central Box */}
      <g>
        {showCpuConnections && (
          <g fill="url(#cpu-connection-gradient)">
            <rect x="92.5" y="36.5" width="2.8" height="5.5" rx="0.7" />
            <rect x="104.5" y="36.5" width="2.8" height="5.5" rx="0.7" />
            <rect x="116.2" y="44" width="2.8" height="5.5" rx="0.7" transform="rotate(90 116.25 45.5)" />
            <rect x="123.2" y="44" width="2.8" height="5.5" rx="0.7" transform="rotate(90 116.25 45.5)" />
            <rect x="104.5" y="15.2" width="2.8" height="5.5" rx="0.7" transform="rotate(180 105.25 39.5)" />
            <rect x="116" y="15.2" width="2.8" height="5.5" rx="0.7" transform="rotate(180 105.25 39.5)" />
            <rect x="79.8" y="-14" width="2.8" height="5.5" rx="0.7" transform="rotate(270 115.25 19.5)" />
            <rect x="87.2" y="-14" width="2.8" height="5.5" rx="0.7" transform="rotate(270 115.25 19.5)" />
          </g>
        )}
        {/* Main Center Rectangle */}
        <rect x="84" y="39" width="32" height="22" rx="4.5" fill="#181818" filter="url(#cpu-light-shadow)" stroke="#333" strokeWidth="0.5" />
        
        {/* KINGS Text */}
        <text
          x="100"
          y="53"
          fontSize="7.4"
          textAnchor="middle"
          fill={animateText ? "url(#cpu-text-gradient)" : "white"}
          fontWeight="800"
        >
          {text}
        </text>
      </g>

      {/* Masks & Defs */}
      <defs>
        <mask id="cpu-mask-1"><path d="M 10 20 h 79.5 q 5 0 5 5 v 24" strokeWidth="0.5" stroke="white" /></mask>
        <mask id="cpu-mask-2"><path d="M 180 10 h -69.7 q -5 0 -5 5 v 24" strokeWidth="0.5" stroke="white" /></mask>
        <mask id="cpu-mask-3"><path d="M 130 20 v 21.8 q 0 5 -5 5 h -10" strokeWidth="0.5" stroke="white" /></mask>
        <mask id="cpu-mask-4"><path d="M 170 80 v -21.8 q 0 -5 -5 -5 h -50" strokeWidth="0.5" stroke="white" /></mask>
        <mask id="cpu-mask-5"><path d="M 135 65 h 15 q 5 0 5 5 v 10 q 0 5 -5 5 h -39.8 q -5 0 -5 -5 v -20" strokeWidth="0.5" stroke="white" /></mask>
        <mask id="cpu-mask-6"><path d="M 94.8 95 v -36" strokeWidth="0.5" stroke="white" /></mask>
        <mask id="cpu-mask-7"><path d="M 88 88 v -15 q 0 -5 -5 -5 h -10 q -5 0 -5 -5 v -5 q 0 -5 5 -5 h 14" strokeWidth="0.5" stroke="white" /></mask>
        <mask id="cpu-mask-8"><path d="M 30 30 h 25 q 5 0 5 5 v 6.5 q 0 5 5 5 h 20" strokeWidth="0.5" stroke="white" /></mask>
        
        {/* Gradients */}
        <radialGradient id="cpu-blue-grad" fx="1">
          <stop offset="0%" stopColor="#00E8ED" />
          <stop offset="50%" stopColor="#08F" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="cpu-yellow-grad" fx="1">
          <stop offset="0%" stopColor="#FFD800" />
          <stop offset="50%" stopColor="#FFD800" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="cpu-purple-grad" fx="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="cpu-emerald-grad" fx="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="cpu-green-grad" fx="1">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="cpu-orange-grad" fx="1">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="cpu-cyan-grad" fx="1">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="cpu-rose-grad" fx="1">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>

        <filter id="cpu-light-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="1.5" dy="1.5" stdDeviation="2" floodColor="#00E8ED" floodOpacity="0.2" />
        </filter>
        
        <marker id="cpu-circle-marker" viewBox="0 0 10 10" refX="5" refY="5" markerWidth={lineMarkerSize} markerHeight={lineMarkerSize}>
          <circle id="innerMarkerCircle" cx="5" cy="5" r="2" fill="currentColor" stroke="currentColor" strokeWidth="0.5">
            {animateMarkers && <animate attributeName="r" values="0; 3; 2" dur="0.5s" />}
          </circle>
        </marker>
        
        <linearGradient id="cpu-connection-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4F4F4F" />
          <stop offset="60%" stopColor="#121214" />
        </linearGradient>
        
        <linearGradient id="cpu-text-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#666666">
            <animate attributeName="offset" values="-2; -1; 0" dur="5s" repeatCount="indefinite" calcMode="spline" keyTimes="0; 0.5; 1" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
          </stop>
          <stop offset="25%" stopColor="white">
            <animate attributeName="offset" values="-1; 0; 1" dur="5s" repeatCount="indefinite" calcMode="spline" keyTimes="0; 0.5; 1" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
          </stop>
          <stop offset="50%" stopColor="#666666">
            <animate attributeName="offset" values="0; 1; 2;" dur="5s" repeatCount="indefinite" calcMode="spline" keyTimes="0; 0.5; 1" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
          </stop>
        </linearGradient>
      </defs>
    </svg>
  )
}
