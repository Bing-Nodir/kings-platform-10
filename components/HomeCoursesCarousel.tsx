"use client";

import {
  Children,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface HomeCoursesCarouselProps {
  children: ReactNode;
  variant?: "default" | "vintage";
}

const AUTO_SCROLL_PIXELS_PER_SECOND = 18;
const POINTER_DRAG_THRESHOLD = 6;

export default function HomeCoursesCarousel({
  children,
  variant = "default",
}: HomeCoursesCarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const pointerStartXRef = useRef(0);
  const pointerStartScrollLeftRef = useRef(0);
  const draggedDistanceRef = useRef(0);
  const isPointerDownRef = useRef(false);
  const isHoveringRef = useRef(false);
  const isVisibleRef = useRef(false);
  const prefersReducedMotionRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const isVintage = variant === "vintage";

  const courseCards = useMemo(() => Children.toArray(children), [children]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotionRef.current = mediaQuery.matches;

    const handleMotionChange = () => {
      prefersReducedMotionRef.current = mediaQuery.matches;
    };

    mediaQuery.addEventListener("change", handleMotionChange);
    return () => mediaQuery.removeEventListener("change", handleMotionChange);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || courseCards.length === 0) {
      return undefined;
    }

    const resetToMiddleCopy = () => {
      const segmentWidth = viewport.scrollWidth / 3;
      if (segmentWidth > 0) {
        viewport.scrollLeft = segmentWidth;
      }
    };

    const normalizeScrollPosition = () => {
      const segmentWidth = viewport.scrollWidth / 3;
      if (segmentWidth <= 0) return;

      if (viewport.scrollLeft >= segmentWidth * 2) {
        viewport.scrollLeft -= segmentWidth;
      } else if (viewport.scrollLeft <= 0) {
        viewport.scrollLeft += segmentWidth;
      }
    };

    resetToMiddleCopy();

    const handleResize = () => resetToMiddleCopy();
    window.addEventListener("resize", handleResize);

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          lastFrameRef.current = null;
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(viewport);

    const tick = (time: number) => {
      const previousTime = lastFrameRef.current ?? time;
      const deltaSeconds = Math.min((time - previousTime) / 1000, 0.05);
      lastFrameRef.current = time;

      if (
        isVisibleRef.current &&
        !prefersReducedMotionRef.current &&
        !isPointerDownRef.current
      ) {
        const hoverScale = isHoveringRef.current ? 0.45 : 1;
        viewport.scrollLeft += AUTO_SCROLL_PIXELS_PER_SECOND * deltaSeconds * hoverScale;
        normalizeScrollPosition();
      }

      animationRef.current = window.requestAnimationFrame(tick);
    };

    animationRef.current = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current);
      }
    };
  }, [courseCards.length]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (!viewport || (event.pointerType === "mouse" && event.button !== 0)) {
      return;
    }

    isPointerDownRef.current = true;
    draggedDistanceRef.current = 0;
    pointerStartXRef.current = event.clientX;
    pointerStartScrollLeftRef.current = viewport.scrollLeft;
    setIsDragging(true);
    viewport.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (!viewport || !isPointerDownRef.current) return;

    const deltaX = event.clientX - pointerStartXRef.current;
    draggedDistanceRef.current = Math.max(draggedDistanceRef.current, Math.abs(deltaX));
    viewport.scrollLeft = pointerStartScrollLeftRef.current - deltaX;

    const segmentWidth = viewport.scrollWidth / 3;
    if (segmentWidth > 0) {
      if (viewport.scrollLeft >= segmentWidth * 2) {
        viewport.scrollLeft -= segmentWidth;
        pointerStartScrollLeftRef.current -= segmentWidth;
      } else if (viewport.scrollLeft <= 0) {
        viewport.scrollLeft += segmentWidth;
        pointerStartScrollLeftRef.current += segmentWidth;
      }
    }
  };

  const endPointerDrag = (event: PointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    isPointerDownRef.current = false;
    setIsDragging(false);

    if (viewport.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div
      className="relative -mx-4 overflow-hidden px-4 md:-mx-8 md:px-8"
      onPointerEnter={() => {
        isHoveringRef.current = true;
      }}
      onPointerLeave={() => {
        isHoveringRef.current = false;
      }}
    >
      <div
        className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r to-transparent ${
          isVintage ? "from-[#0d0906]/95" : "from-gray-50/95 dark:from-gray-950/95"
        }`}
      />
      <div
        className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l to-transparent ${
          isVintage ? "from-[#0d0906]/95" : "from-gray-50/95 dark:from-gray-950/95"
        }`}
      />
      <div
        ref={viewportRef}
        aria-label="Bizning kurslar karuseli"
        className={`flex touch-pan-y select-none gap-6 overflow-x-auto pb-10 pt-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onClickCapture={(event) => {
          if (draggedDistanceRef.current > POINTER_DRAG_THRESHOLD) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
        onPointerCancel={endPointerDrag}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPointerDrag}
      >
        {[0, 1, 2].map((copyIndex) =>
          courseCards.map((card, index) => (
            <div
              aria-hidden={copyIndex !== 1}
              className={`w-[320px] shrink-0 transition-transform duration-500 ease-out hover:-translate-y-2 hover:scale-[1.015] hover:[transform:perspective(1100px)_rotateX(1.2deg)_translateY(-0.5rem)_scale(1.015)] md:w-[380px] ${
                copyIndex === 1 ? "" : "pointer-events-none"
              } ${isVintage ? "drop-shadow-[0_26px_60px_rgba(0,0,0,0.34)]" : ""}`}
              key={`${copyIndex}-${index}`}
            >
              {card}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
