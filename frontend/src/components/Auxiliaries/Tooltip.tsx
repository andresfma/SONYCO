import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  children: React.ReactNode;
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ 
  children, 
  text, 
  position = 'top' 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const calculateTooltipPosition = () => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = triggerRect.left + scrollX + triggerRect.width / 2;
        y = triggerRect.top + scrollY - 8; // 8px de margen
        break;
      case 'bottom':
        x = triggerRect.left + scrollX + triggerRect.width / 2;
        y = triggerRect.bottom + scrollY + 8;
        break;
      case 'left':
        x = triggerRect.left + scrollX - 8;
        y = triggerRect.top + scrollY + triggerRect.height / 2;
        break;
      case 'right':
        x = triggerRect.right + scrollX + 8;
        y = triggerRect.top + scrollY + triggerRect.height / 2;
        break;
    }

    setTooltipPosition({ x, y });
  };

  useEffect(() => {
    if (isVisible) {
      calculateTooltipPosition();
      
      // Recalcular si la ventana se redimensiona o hace scroll
      const handleReposition = () => {
        if (isVisible) {
          calculateTooltipPosition();
        }
      };

      window.addEventListener('scroll', handleReposition, true);
      window.addEventListener('resize', handleReposition);

      return () => {
        window.removeEventListener('scroll', handleReposition, true);
        window.removeEventListener('resize', handleReposition);
      };
    }
  }, [isVisible, position]);

  const getTransformClasses = () => {
    switch (position) {
      case 'top':
        return 'transform -translate-x-1/2 -translate-y-full';
      case 'bottom':
        return 'transform -translate-x-1/2';
      case 'left':
        return 'transform -translate-x-full -translate-y-1/2';
      case 'right':
        return 'transform -translate-y-1/2';
      default:
        return 'transform -translate-x-1/2 -translate-y-full';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-black';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-black';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-black';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-black';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-black';
    }
  };

  const tooltipContent = isVisible ? (
    <div 
      className={`fixed z-[99999] ${getTransformClasses()}`}
      style={{
        left: `${tooltipPosition.x}px`,
        top: `${tooltipPosition.y}px`,
        pointerEvents: 'none' // Para que no interfiera con otros elementos
      }}
    >
      <div className="bg-black text-white text-xs rounded-md py-1 px-2 whitespace-nowrap shadow-lg">
        {text}
      </div>
      {/* Flecha del tooltip */}
      <div className={`absolute w-0 h-0 border-4 ${getArrowClasses()}`}></div>
    </div>
  ) : null;

  return (
    <>
      <div 
        ref={triggerRef}
        className="relative inline-block"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {/* Renderizar el tooltip en un portal al final del body */}
      {typeof document !== 'undefined' && tooltipContent && 
        createPortal(tooltipContent, document.body)
      }
    </>
  );
}