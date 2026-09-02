import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

export interface MenuItemData {
  text: string;
  icon: string;
  action?: () => void;
  isActive?: boolean;
}

export interface FlowingMenuProps {
  items?: MenuItemData[];
  speed?: number;
  textColor?: string;
  bgColor?: string;
  marqueeBgColor?: string;
  marqueeTextColor?: string;
  borderColor?: string;
  isSidebarOpen?: boolean;
}

interface MenuItemProps extends MenuItemData {
  speed: number;
  textColor: string;
  marqueeBgColor: string;
  marqueeTextColor: string;
  borderColor: string;
  isFirst: boolean;
  isSidebarOpen: boolean;
}

export const FlowingMenu: React.FC<FlowingMenuProps> = ({
  items = [],
  speed = 15,
  textColor = '#8B9BB4',
  bgColor = 'transparent',
  marqueeBgColor = 'rgba(45, 212, 191, 0.1)', // Cyan accent subtle bg
  marqueeTextColor = '#2DD4BF', // Cyan accent
  borderColor = '#1C2538',
  isSidebarOpen = true
}) => {
  return (
    <div className="w-full flex-grow flex flex-col" style={{ backgroundColor: bgColor }}>
      <nav className="flex flex-col h-full m-0 p-0">
        {items.map((item, idx) => (
          <MenuItem
            key={idx}
            {...item}
            speed={speed}
            textColor={item.isActive ? '#ECA078' : textColor} // Highlight active item
            marqueeBgColor={marqueeBgColor}
            marqueeTextColor={marqueeTextColor}
            borderColor={borderColor}
            isFirst={idx === 0}
            isSidebarOpen={isSidebarOpen}
          />
        ))}
      </nav>
    </div>
  );
};

const MenuItem: React.FC<MenuItemProps> = ({
  text,
  icon,
  action,
  isActive,
  speed,
  textColor,
  marqueeBgColor,
  marqueeTextColor,
  borderColor,
  isFirst,
  isSidebarOpen
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeInnerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const [repetitions, setRepetitions] = useState(4);
  const animationDefaults = { duration: 0.4, ease: 'expo.out' };

  const findClosestEdge = (mouseX: number, mouseY: number, width: number, height: number): 'top' | 'bottom' => {
    const topEdgeDist = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY, 2);
    const bottomEdgeDist = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY - height, 2);
    return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
  };

  useEffect(() => {
    const calculateRepetitions = () => {
      if (!marqueeInnerRef.current) return;
      const marqueeContent = marqueeInnerRef.current.querySelector('.marquee-part') as HTMLElement;
      if (!marqueeContent) return;
      const contentWidth = marqueeContent.offsetWidth;
      const viewportWidth = window.innerWidth;
      const needed = Math.ceil(viewportWidth / (contentWidth || 100)) + 2;
      setRepetitions(Math.max(4, needed));
    };

    calculateRepetitions();
    window.addEventListener('resize', calculateRepetitions);
    return () => window.removeEventListener('resize', calculateRepetitions);
  }, [text, icon]);

  useEffect(() => {
    const setupMarquee = () => {
      if (!marqueeInnerRef.current) return;
      const marqueeContent = marqueeInnerRef.current.querySelector('.marquee-part') as HTMLElement;
      if (!marqueeContent) return;
      const contentWidth = marqueeContent.offsetWidth;
      if (contentWidth === 0) return;

      if (animationRef.current) {
        animationRef.current.kill();
      }

      animationRef.current = gsap.to(marqueeInnerRef.current, {
        x: -contentWidth,
        duration: speed,
        ease: 'none',
        repeat: -1
      });
    };

    const timer = setTimeout(setupMarquee, 100);
    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [text, icon, repetitions, speed, isSidebarOpen]);

  const handleMouseEnter = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isSidebarOpen || !itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);
    
    gsap.timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .set(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' }, 0);
  };

  const handleMouseLeave = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isSidebarOpen || !itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);
    
    gsap.timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .to(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0);
  };

  return (
    <div
      className={`relative overflow-hidden ${isActive ? 'bg-[var(--theme-bg-card)]/50' : 'hover:bg-[var(--theme-bg-card)]/30'} transition-colors duration-200`}
      ref={itemRef}
      style={{ borderTop: isFirst ? 'none' : `1px solid ${borderColor}` }}
    >
      {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ECA078] rounded-r z-20"></div>}
      
      <a
        className={`flex items-center py-4 cursor-pointer no-underline transition-opacity ${isSidebarOpen ? 'px-8 hover:opacity-0' : 'justify-center hover:opacity-100'}`}
        onClick={(e) => {
          e.preventDefault();
          if (action) action();
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ color: textColor }}
        title={!isSidebarOpen ? text : undefined}
      >
        <span className="material-symbols-outlined text-[20px] shrink-0" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>{icon}</span>
        {isSidebarOpen && (
          <span className="font-mono text-xs tracking-wider leading-snug truncate pl-3">
            {text}
          </span>
        )}
      </a>

      {isSidebarOpen && (
        <div
          className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none translate-y-[101%] z-10"
          ref={marqueeRef}
          style={{ backgroundColor: marqueeBgColor }}
        >
          <div className="h-full w-fit flex items-center" ref={marqueeInnerRef}>
            {[...Array(repetitions)].map((_, idx) => (
              <div className="marquee-part flex items-center flex-shrink-0 px-4" key={idx} style={{ color: marqueeTextColor }}>
                <span className="material-symbols-outlined text-[20px] mr-3">{icon}</span>
                <span className="whitespace-nowrap uppercase font-bold text-sm tracking-widest">{text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowingMenu;
