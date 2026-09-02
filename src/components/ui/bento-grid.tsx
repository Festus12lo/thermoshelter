"use client";

import { cn } from "../../lib/utils";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { Cpu, Thermometer, Box, Radio } from "lucide-react";

export interface BentoItem {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    status?: string;
    tags?: string[];
    meta?: string;
    cta?: string;
    colSpan?: number;
    hasPersistentHover?: boolean;
}

interface BentoGridProps {
    items?: BentoItem[];
    onItemClick?: (id: string) => void;
    textAutoHide?: boolean;
    enableStars?: boolean;
    enableSpotlight?: boolean;
    enableBorderGlow?: boolean;
    disableAnimations?: boolean;
    spotlightRadius?: number;
    particleCount?: number;
    enableTilt?: boolean;
    glowColor?: string;
    clickEffect?: boolean;
    enableMagnetism?: boolean;
}

export const itemsSample: BentoItem[] = [
    {
        id: "material",
        title: "Material Synthesizer",
        meta: "v4.0.1",
        description:
            "AI-driven analysis of local regolith and composites for 3D printed shelter extrusion.",
        icon: <Cpu className="w-4 h-4 text-[#2DD4BF]" />,
        status: "Active",
        tags: ["Extrusion", "Local Matter", "AI"],
        colSpan: 2,
        hasPersistentHover: true,
    },
    {
        id: "thermal",
        title: "Thermal Core",
        meta: "Optimal",
        description: "Micro-HVAC control and ambient energy harvesting.",
        icon: <Thermometer className="w-4 h-4 text-[#ECA078]" />,
        status: "Running",
        tags: ["HVAC", "Energy"],
    },
    {
        id: "blueprint",
        title: "Blueprint Generator",
        meta: "Ready",
        description: "Dynamic CAD modeling adapted to environmental constraints and inhabitant count.",
        icon: <Box className="w-4 h-4 text-[#8B9BB4]" />,
        tags: ["CAD", "Geometry"],
        colSpan: 2,
    },
    {
        id: "mesh",
        title: "Mesh Network",
        meta: "Connected",
        description: "Encrypted local satellite comms for multi-shelter coordination.",
        icon: <Radio className="w-4 h-4 text-[#2DD4BF]" />,
        status: "Uplink",
        tags: ["Comms", "Satellite"],
    },
];

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
// We use a cyan color by default to match the theme
const DEFAULT_GLOW_COLOR = '45, 212, 191'; 
const MOBILE_BREAKPOINT = 768;

const createParticleElement = (x: number, y: number, color: string = DEFAULT_GLOW_COLOR): HTMLDivElement => {
  const el = document.createElement('div');
  el.className = 'particle';
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

const ParticleCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  disableAnimations?: boolean;
  style?: React.CSSProperties;
  particleCount?: number;
  glowColor?: string;
  enableTilt?: boolean;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
  onClick?: () => void;
}> = ({
  children,
  className = '',
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = false,
  enableMagnetism = false,
  onClick
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const timeoutsRef = useRef<number[]>([]);
  const isHoveredRef = useRef(false);
  const magnetismAnimationRef = useRef<gsap.core.Tween | null>(null);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();
    particlesRef.current.forEach(particle => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'back.in(1.7)',
        onComplete: () => {
          particle.parentNode?.removeChild(particle);
        }
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;
    const { width, height } = cardRef.current.getBoundingClientRect();

    for (let i = 0; i < particleCount; i++) {
      const timeoutId = window.setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;
        const x = Math.random() * width;
        const y = Math.random() * height;
        const particle = createParticleElement(x, y, glowColor);
        cardRef.current.appendChild(particle);
        particlesRef.current.push(particle);

        gsap.fromTo(particle, 
          { scale: 0, opacity: 0 }, 
          { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
        );

        gsap.to(particle, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: 'none',
          repeat: -1,
          yoyo: true
        });
      }, i * 100);
      timeoutsRef.current.push(timeoutId);
    }
  }, [particleCount, glowColor]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;
    const element = cardRef.current;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();
      gsap.to(element, { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: 0.3, ease: 'power2.out' });
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;
        gsap.to(element, { rotateX, rotateY, duration: 0.1, ease: 'power2.out', transformPerspective: 1000 });
      }

      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.05;
        const magnetY = (y - centerY) * 0.05;
        magnetismAnimationRef.current = gsap.to(element, { x: magnetX, y: magnetY, duration: 0.3, ease: 'power2.out' });
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!clickEffect) return;
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: rgba(${glowColor}, 0.5);
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        z-index: 1000;
      `;
      element.appendChild(ripple);
      gsap.fromTo(ripple, { scale: 0, opacity: 1 }, { scale: 50, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => ripple.remove() });
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('click', handleClick);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('click', handleClick);
      clearAllParticles();
    };
  }, [animateParticles, clearAllParticles, disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor]);

  return (
    <div 
      ref={cardRef} 
      className={className} 
      style={{ ...style, position: 'relative', overflow: 'hidden' }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const BentoGrid: React.FC<BentoGridProps> = ({
  items = itemsSample,
  onItemClick,
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = true,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = true
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const shouldDisableAnimations = disableAnimations || isMobile;

  useEffect(() => {
    if (!enableSpotlight || shouldDisableAnimations) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!gridRef.current) return;
      const cards = gridRef.current.querySelectorAll('.bento-card');
      
      cards.forEach(card => {
        const rect = (card as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
        (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
        (card as HTMLElement).style.setProperty('--spotlight-radius', `${spotlightRadius}px`);
        (card as HTMLElement).style.setProperty('--glow-color', `rgba(${glowColor}, 0.15)`);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enableSpotlight, shouldDisableAnimations, spotlightRadius, glowColor]);

  return (
    <div className="w-full">
      <style>
        {`
          .bento-grid {
            display: grid;
            gap: 0.75rem;
            width: 100%;
            grid-template-columns: repeat(1, 1fr);
          }
          
          @media (min-width: 768px) {
            .bento-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }

          .bento-card {
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.75rem;
            position: relative;
            overflow: hidden;
            transition: border-color 0.3s ease;
            cursor: pointer;
            backdrop-filter: blur(16px);
          }

          .bento-card:hover {
            border-color: rgba(${glowColor}, 0.3);
          }

          .spotlight-overlay {
            position: absolute;
            inset: 0;
            pointer-events: none;
            background: radial-gradient(
              var(--spotlight-radius) circle at var(--mouse-x) var(--mouse-y),
              var(--glow-color),
              transparent 80%
            );
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          .bento-card:hover .spotlight-overlay {
            opacity: 1;
          }

          .border-glow {
            position: absolute;
            inset: 0;
            pointer-events: none;
            border-radius: inherit;
            padding: 1px;
            background: radial-gradient(
              var(--spotlight-radius) circle at var(--mouse-x) var(--mouse-y),
              rgba(${glowColor}, 0.8),
              transparent 40%
            );
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          .bento-card:hover .border-glow {
            opacity: 1;
          }
        `}
      </style>
      
      <div ref={gridRef} className="bento-grid">
        {items.map((item, index) => {
          const isWide = item.colSpan === 2;

          const Content = (
            <div className="bento-card h-full w-full p-4 flex flex-col justify-between group">
              <div className="spotlight-overlay" />
              {enableBorderGlow && <div className="border-glow" />}
              
              <div className="relative z-10 flex flex-col space-y-3 h-full pointer-events-none">
                  <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-all duration-300 border border-white/10">
                          {item.icon}
                      </div>
                      <span
                          className={cn(
                              "text-[10px] uppercase tracking-wider font-mono px-2 py-1 rounded-md backdrop-blur-sm",
                              "bg-black/30 text-[#8B9BB4] border border-white/10",
                              "transition-colors duration-300 group-hover:text-white"
                          )}
                      >
                          {item.status || "Active"}
                      </span>
                  </div>

                  <div className="space-y-2 pt-2 flex-grow">
                      <h3 className="font-semibold text-white tracking-tight text-[15px] font-sans flex items-center">
                          {item.title}
                          {item.meta && (
                              <span className="ml-2 text-xs text-[#8B9BB4] font-mono">
                                  {item.meta}
                              </span>
                          )}
                      </h3>
                      <p className={`text-sm text-[#8B9BB4] leading-snug font-sans ${textAutoHide ? 'line-clamp-2' : ''}`}>
                          {item.description}
                      </p>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                      <div className="flex items-center space-x-2 text-[10px] uppercase font-mono text-[#8B9BB4]">
                          {item.tags?.map((tag, i) => (
                              <span
                                  key={i}
                                  className="px-2 py-1 rounded-md bg-black/30 border border-white/10 backdrop-blur-sm transition-all duration-200"
                              >
                                  {tag}
                              </span>
                          ))}
                      </div>
                      <span className="text-xs font-mono uppercase tracking-wider text-[#ECA078] opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.cta || "Explore →"}
                      </span>
                  </div>
              </div>
            </div>
          );

          if (enableStars) {
            return (
              <ParticleCard
                key={index}
                className={cn(`card-${index}`, isWide ? 'md:col-span-2' : 'col-span-1')}
                particleCount={particleCount}
                glowColor={glowColor}
                enableTilt={enableTilt}
                enableMagnetism={enableMagnetism}
                clickEffect={clickEffect}
                disableAnimations={shouldDisableAnimations}
                onClick={() => onItemClick?.(item.id)}
              >
                {Content}
              </ParticleCard>
            );
          }

          return (
            <div 
              key={index} 
              className={cn(`card-${index}`, isWide ? 'md:col-span-2' : 'col-span-1')}
              onClick={() => onItemClick?.(item.id)}
            >
              {Content}
            </div>
          );
        })}
      </div>
    </div>
  );
};
