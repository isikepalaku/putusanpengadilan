import { useEffect, useState } from 'react';

interface MorphingTextProps {
  texts: string[];
  className?: string;
}

export default function MorphingText({ texts, className = '' }: MorphingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % texts.length);
        setIsVisible(true);
      }, 200);
    }, 3000);

    return () => clearInterval(interval);
  }, [texts.length]);

  return (
    <div className={`relative h-[40px] ${className}`}>
      {isVisible && (
        <div
          key={currentIndex}
          className="absolute w-full text-center animate-morphing"
        >
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            {texts[currentIndex]}
          </span>
        </div>
      )}
    </div>
  );
}
