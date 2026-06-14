"use client";

import React, { useEffect, useRef, useCallback } from 'react';

// --- Types ---
interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  angle: number;
}

interface BackgroundParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  phase: number;
}

interface MouseState {
  x: number;
  y: number;
  isActive: boolean;
}

// --- Configuration Constants ---
const PARTICLE_DENSITY = 0.00014;
const BG_PARTICLE_DENSITY = 0.00008;
const MOUSE_RADIUS = 180;
const RETURN_SPEED = 0.08;
const DAMPING = 0.90;
const REPULSION_STRENGTH = 1.2;

const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

const getAdaptiveProfile = () => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const compactViewport = window.innerWidth < 1024;

  return {
    reducedMotion,
    finePointer,
    compactViewport,
    pixelRatio: Math.min(window.devicePixelRatio || 1, reducedMotion ? 1 : 1.5),
    particleScale: reducedMotion ? 0.32 : compactViewport ? 0.55 : 1,
    backgroundScale: reducedMotion ? 0.4 : compactViewport ? 0.7 : 1,
    mouseRadius: reducedMotion ? 110 : compactViewport ? 140 : MOUSE_RADIUS,
    repulsionStrength: reducedMotion
      ? 0.45
      : compactViewport
        ? REPULSION_STRENGTH * 0.8
        : REPULSION_STRENGTH,
  };
};

export function ParticleEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const particlesRef = useRef<Particle[]>([]);
  const backgroundParticlesRef = useRef<BackgroundParticle[]>([]);
  const mouseRef = useRef<MouseState>({ x: -1000, y: -1000, isActive: false });
  const frameIdRef = useRef<number>(0);
  const isDocumentVisibleRef = useRef(true);
  const profileRef = useRef({
    reducedMotion: false,
    finePointer: true,
    compactViewport: false,
    pixelRatio: 1,
    particleScale: 1,
    backgroundScale: 1,
    mouseRadius: MOUSE_RADIUS,
    repulsionStrength: REPULSION_STRENGTH,
  });

  const initParticles = useCallback((width: number, height: number) => {
    const profile = profileRef.current;
    const particleCount = Math.floor(
      width * height * PARTICLE_DENSITY * profile.particleScale
    );
    const newParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;

      newParticles.push({
        x,
        y,
        originX: x,
        originY: y,
        vx: 0,
        vy: 0,
        size: randomRange(1.2, 3),
        // Sayt ekotizimiga mos ranglar (Cyan, Purple, White)
        color: Math.random() > 0.8 ? 'rgba(6, 182, 212, 1)' : (Math.random() > 0.5 ? 'rgba(168, 85, 247, 1)' : 'rgba(255, 255, 255, 1)'),
        angle: Math.random() * Math.PI * 2,
      });
    }
    particlesRef.current = newParticles;

    const bgCount = Math.floor(
      width * height * BG_PARTICLE_DENSITY * profile.backgroundScale
    );
    const newBgParticles: BackgroundParticle[] = [];

    for (let i = 0; i < bgCount; i++) {
      newBgParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.24,
        vy: (Math.random() - 0.5) * 0.24,
        size: randomRange(0.7, 1.8),
        alpha: randomRange(0.18, 0.52),
        phase: Math.random() * Math.PI * 2
      });
    }
    backgroundParticlesRef.current = newBgParticles;
  }, []);

  const animate = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (!isDocumentVisibleRef.current) return;

    const { mouseRadius, repulsionStrength, reducedMotion } = profileRef.current;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const pulseSpeed = 0.0008;
    const pulseOpacity = reducedMotion
      ? 0.035
      : Math.sin(time * pulseSpeed) * 0.03 + 0.05;

    const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, Math.max(width, height) * 0.7
    );
    gradient.addColorStop(0, `rgba(6, 182, 212, ${pulseOpacity})`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const bgParticles = backgroundParticlesRef.current;
    ctx.fillStyle = "#ffffff";

    for (let i = 0; i < bgParticles.length; i++) {
      const p = bgParticles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      const twinkle = Math.sin(time * 0.002 + p.phase) * 0.5 + 0.5;
      const currentAlpha = p.alpha * (0.3 + 0.7 * twinkle);

      ctx.globalAlpha = currentAlpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    const particles = particlesRef.current;
    const mouse = mouseRef.current;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const distSq = dx * dx + dy * dy;

      // Kvadrat orqali taqqoslash kompyuter uchun Math.sqrt dan ko'ra ancha yengil
      if (mouse.isActive && distSq > 0.0001 && distSq < mouseRadius * mouseRadius) {
        const distance = Math.sqrt(distSq);
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const force = (mouseRadius - distance) / mouseRadius;

        const repulsion = force * repulsionStrength;
        p.vx -= forceDirectionX * repulsion * 5;
        p.vy -= forceDirectionY * repulsion * 5;
      }

      const springDx = p.originX - p.x;
      const springDy = p.originY - p.y;

      p.vx += springDx * RETURN_SPEED;
      p.vy += springDy * RETURN_SPEED;
    }

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.vx *= DAMPING;
      p.vy *= DAMPING;
      p.x += p.vx;
      p.y += p.vy;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      
      const velocity = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      const opacity = Math.min(0.3 + velocity * 0.1, 1);

      ctx.fillStyle = p.color === 'rgba(255, 255, 255, 1)'
        ? `rgba(255, 255, 255, ${opacity})`
        : p.color;

      ctx.fill();
    }

  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        profileRef.current = getAdaptiveProfile();
        const { width, height } = containerRef.current.getBoundingClientRect();
        const dpr = profileRef.current.pixelRatio;

        canvasRef.current.width = width * dpr;
        canvasRef.current.height = height * dpr;
        canvasRef.current.style.width = `${width}px`;
        canvasRef.current.style.height = `${height}px`;

        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        initParticles(width, height);
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [initParticles]);

  useEffect(() => {
    const runFrame = (time: number) => {
      if (isDocumentVisibleRef.current) {
        animate(time);
      }
      frameIdRef.current = requestAnimationFrame(runFrame);
    };

    frameIdRef.current = requestAnimationFrame(runFrame);
    return () => cancelAnimationFrame(frameIdRef.current);
  }, [animate]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      isDocumentVisibleRef.current = !document.hidden;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!profileRef.current.finePointer) return;
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        isActive: true,
      };
    };
    const handlePointerLeave = () => {
      mouseRef.current.isActive = false;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    window.addEventListener('blur', handlePointerLeave);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('blur', handlePointerLeave);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden bg-transparent">
      <canvas ref={canvasRef} className="block w-full h-full pointer-events-none" />
    </div>
  );
}
