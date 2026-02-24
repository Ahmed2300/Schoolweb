import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const CustomCursor = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [cursorVariant, setCursorVariant] = useState('default');

    useEffect(() => {
        const mouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: e.clientX,
                y: e.clientY,
            });
        };

        window.addEventListener('mousemove', mouseMove);

        return () => {
            window.removeEventListener('mousemove', mouseMove);
        };
    }, []);

    const variants = {
        default: {
            x: mousePosition.x - 16,
            y: mousePosition.y - 16,
            width: 32,
            height: 32,
            backgroundColor: '#AF0C15', // crimson color
            mixBlendMode: 'normal' as any, // start with normal to test visibility
        },
        pointer: {
            x: mousePosition.x - 24,
            y: mousePosition.y - 24,
            width: 48,
            height: 48,
            backgroundColor: 'rgba(255, 255, 255, 1)',
            mixBlendMode: 'difference' as any,
        },
    };

    useEffect(() => {
        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // You can add more specific tags or classes here
            if (
                target.tagName.toLowerCase() === 'a' ||
                target.tagName.toLowerCase() === 'button' ||
                target.closest('a') ||
                target.closest('button')
            ) {
                setCursorVariant('pointer');
            } else {
                setCursorVariant('default');
            }
        };

        window.addEventListener('mouseover', handleMouseOver);
        window.addEventListener('mouseout', () => setCursorVariant('default'));

        return () => {
            window.removeEventListener('mouseover', handleMouseOver);
            window.removeEventListener('mouseout', () => setCursorVariant('default'));
        };
    }, []);

    return (
        <motion.div
            className="custom-cursor"
            variants={variants}
            animate={cursorVariant}
            transition={{
                type: 'spring',
                stiffness: 500,
                damping: 28,
                mass: 0.5,
            }}
        />
    );
};
