import { useEffect, RefObject } from 'react';

/**
 * Hook to automatically resize a textarea based on its content
 * @param ref Reference to the textarea element
 * @param value The current value of the textarea
 */
export function useAutoResize(
  ref: RefObject<HTMLTextAreaElement>,
  value: string
): void {
  useEffect(() => {
    const textarea = ref.current;
    if (!textarea) return;

    const resize = () => {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    };

    resize();
    
    // Add resize on window resize
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [value, ref]);
}