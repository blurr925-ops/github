import { useState, useEffect } from 'react';

const EMOJIS = ['🎾', '🏆', '⭐', '🎉', '✨', '💪'];
const PARTICLE_COUNT = 12;

export default function Confetti({ active, onComplete }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const newParticles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      x: 30 + Math.random() * 40,
      delay: Math.random() * 0.3,
      duration: 0.8 + Math.random() * 0.6,
      angle: -60 + Math.random() * 120,
      distance: 60 + Math.random() * 80,
    }));

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, 1800);

    return () => clearTimeout(timer);
  }, [active, onComplete]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute text-2xl"
          style={{
            left: `${p.x}%`,
            top: '50%',
            animation: `confetti-burst ${p.duration}s ${p.delay}s ease-out forwards`,
            '--angle': `${p.angle}deg`,
            '--distance': `${p.distance}px`,
          }}
        >
          {p.emoji}
        </div>
      ))}
      <style>{`
        @keyframes confetti-burst {
          0% {
            transform: translate(0, 0) scale(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            opacity: 1;
            transform: translate(
              calc(cos(var(--angle)) * var(--distance)),
              calc(sin(var(--angle)) * var(--distance) - 40px)
            ) scale(1.2) rotate(180deg);
          }
          100% {
            opacity: 0;
            transform: translate(
              calc(cos(var(--angle)) * var(--distance) * 1.5),
              calc(sin(var(--angle)) * var(--distance) + 60px)
            ) scale(0.5) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
