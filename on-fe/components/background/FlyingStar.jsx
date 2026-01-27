'use client';

import React, { useState, useEffect } from 'react';

export default function FlyingStar() {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const generateStars = () =>
      Array.from({ length: 100 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.2 + 0.05
      }));

    setStars(generateStars());

    const interval = setInterval(() => {
      setStars(prev =>
        prev.map(star => ({
          ...star,
          x: (star.x + star.speed) % 100,
          opacity: 0.2 + Math.sin(Date.now() * 0.001 + star.id) * 0.3
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full animate-pulse"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            boxShadow: `0 0 ${star.size * 2}px rgba(255,255,255,0.5)`
          }}
        />
      ))}
    </div>
  );
}
