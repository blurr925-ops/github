import { useCallback } from 'react';

const WIDTH = 360;
const HEIGHT = 640;

// First-person perspective court - immersive full-screen view
const COURT = {
  nearLeft: 0,
  nearRight: 360,
  nearY: 580,
  farLeft: 110,
  farRight: 250,
  farY: 180,
  netNearLeft: 30,
  netNearRight: 330,
  netY: 350,
  serviceNearLeft: 15,
  serviceNearRight: 345,
  serviceNearY: 470,
  serviceFarLeft: 80,
  serviceFarRight: 280,
  serviceFarY: 260,
};

function interpX(leftNear, leftFar, rightNear, rightFar, depth, normalizedX) {
  const left = leftFar + (leftNear - leftFar) * depth;
  const right = rightFar + (rightNear - rightFar) * depth;
  return left + normalizedX * (right - left);
}

function interpY(depth) {
  return COURT.farY + (COURT.nearY - COURT.farY) * depth;
}

function toSvgCoords(normX, normY) {
  const svgY = interpY(normY);
  const svgX = interpX(
    COURT.nearLeft, COURT.farLeft,
    COURT.nearRight, COURT.farRight,
    normY, normX
  );
  return { x: svgX, y: svgY };
}

function toNormCoords(svgX, svgY) {
  const normY = Math.max(0, Math.min(1, (svgY - COURT.farY) / (COURT.nearY - COURT.farY)));
  const left = COURT.farLeft + (COURT.nearLeft - COURT.farLeft) * normY;
  const right = COURT.farRight + (COURT.nearRight - COURT.farRight) * normY;
  const normX = Math.max(0, Math.min(1, (svgX - left) / (right - left)));
  return { x: normX, y: normY };
}

function perspectiveScale(normY) {
  return 0.3 + 0.7 * normY;
}

export default function CourtFirstPerson({
  ballPosition,
  targetZone,
  showTarget = false,
  onTap,
  result,
  tapPosition,
  swipeLine,
  opponentPosition,
  dimmed = false,
}) {
  const handleClick = useCallback(
    (e) => {
      if (!onTap) return;
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const scaleX = WIDTH / rect.width;
      const scaleY = HEIGHT / rect.height;
      const svgX = (e.clientX - rect.left) * scaleX;
      const svgY = (e.clientY - rect.top) * scaleY;
      const norm = toNormCoords(svgX, svgY);
      onTap(norm);
    },
    [onTap]
  );

  const ball = ballPosition ? toSvgCoords(ballPosition.x, ballPosition.y) : null;
  const ballScale = ballPosition ? perspectiveScale(ballPosition.y) : 1;
  const zone = targetZone ? toSvgCoords(targetZone.x, targetZone.y) : null;
  const zoneScale = targetZone ? perspectiveScale(targetZone.y) : 1;
  const zoneR = targetZone ? targetZone.radius * 200 * zoneScale : 0;
  const tap = tapPosition ? toSvgCoords(tapPosition.x, tapPosition.y) : null;

  const swipeStart = swipeLine?.start ? toSvgCoords(swipeLine.start.x, swipeLine.start.y) : null;
  const swipeEnd = swipeLine?.end ? toSvgCoords(swipeLine.end.x, swipeLine.end.y) : null;

  const opponent = opponentPosition ? toSvgCoords(opponentPosition.x, opponentPosition.y) : null;
  const oppScale = opponentPosition ? perspectiveScale(opponentPosition.y) : 1;

  const courtPath = `M ${COURT.nearLeft} ${COURT.nearY} L ${COURT.farLeft} ${COURT.farY} L ${COURT.farRight} ${COURT.farY} L ${COURT.nearRight} ${COURT.nearY} Z`;

  const centerNear = (COURT.serviceNearLeft + COURT.serviceNearRight) / 2;
  const centerFar = (COURT.serviceFarLeft + COURT.serviceFarRight) / 2;

  // Singles sidelines
  const singlesInset = 0.07;
  const sNearLeft = COURT.nearLeft + (COURT.nearRight - COURT.nearLeft) * singlesInset;
  const sNearRight = COURT.nearRight - (COURT.nearRight - COURT.nearLeft) * singlesInset;
  const sFarLeft = COURT.farLeft + (COURT.farRight - COURT.farLeft) * singlesInset;
  const sFarRight = COURT.farRight - (COURT.farRight - COURT.farLeft) * singlesInset;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full rounded-2xl overflow-hidden touch-none select-none"
      onClick={handleClick}
      style={{ cursor: onTap ? 'crosshair' : 'default' }}
    >
      <defs>
        <filter id="fpGreenGlow">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="fpBallShadow">
          <feDropShadow dx="1" dy="3" stdDeviation="3" floodOpacity="0.6" />
        </filter>
        <filter id="fpBallGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="40%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>
        <linearGradient id="courtGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#166534" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14532d" />
          <stop offset="100%" stopColor="#1a5c2a" />
        </linearGradient>
        <radialGradient id="ballGrad" cx="0.35" cy="0.35" r="0.65">
          <stop offset="0%" stopColor="#e6ff33" />
          <stop offset="100%" stopColor="#a3cc00" />
        </radialGradient>
      </defs>

      {/* Sky */}
      <rect x="0" y="0" width={WIDTH} height={COURT.farY + 10} fill="url(#skyGrad)" />

      {/* Clouds */}
      <ellipse cx="60" cy="60" rx="50" ry="18" fill="white" opacity="0.25" />
      <ellipse cx="90" cy="55" rx="40" ry="15" fill="white" opacity="0.2" />
      <ellipse cx="280" cy="90" rx="45" ry="16" fill="white" opacity="0.2" />
      <ellipse cx="310" cy="85" rx="35" ry="12" fill="white" opacity="0.15" />
      <ellipse cx="180" cy="40" rx="35" ry="12" fill="white" opacity="0.15" />

      {/* Distant trees / backdrop */}
      <rect x="0" y={COURT.farY - 25} width={WIDTH} height="35" fill="#0d4a1f" rx="0" />
      {[30, 70, 120, 165, 210, 260, 310, 340].map((x, i) => (
        <ellipse key={i} cx={x} cy={COURT.farY - 18} rx={14 + (i % 3) * 4} ry={18 + (i % 2) * 6} fill={i % 2 === 0 ? '#166534' : '#14532d'} />
      ))}

      {/* Ground around court */}
      <rect x="0" y={COURT.farY} width={WIDTH} height={HEIGHT - COURT.farY} fill="url(#groundGrad)" />

      {/* Court surface */}
      <path d={courtPath} fill="url(#courtGrad)" />
      {/* Court surface texture lines */}
      {[0.2, 0.4, 0.6, 0.8].map((t) => {
        const y = COURT.farY + (COURT.nearY - COURT.farY) * t;
        const leftX = COURT.farLeft + (COURT.nearLeft - COURT.farLeft) * t;
        const rightX = COURT.farRight + (COURT.nearRight - COURT.farRight) * t;
        return <line key={t} x1={leftX} y1={y} x2={rightX} y2={y} stroke="#1a7a3a" strokeWidth="0.5" opacity="0.3" />;
      })}

      {/* Court lines */}
      <line x1={COURT.farLeft} y1={COURT.farY} x2={COURT.farRight} y2={COURT.farY} stroke="white" strokeWidth="2.5" />
      <line x1={COURT.nearLeft} y1={COURT.nearY} x2={COURT.nearRight} y2={COURT.nearY} stroke="white" strokeWidth="3" />

      {/* Doubles sidelines */}
      <line x1={COURT.nearLeft} y1={COURT.nearY} x2={COURT.farLeft} y2={COURT.farY} stroke="white" strokeWidth="2" />
      <line x1={COURT.nearRight} y1={COURT.nearY} x2={COURT.farRight} y2={COURT.farY} stroke="white" strokeWidth="2" />

      {/* Singles sidelines */}
      <line x1={sNearLeft} y1={COURT.nearY} x2={sFarLeft} y2={COURT.farY} stroke="white" strokeWidth="1.5" opacity="0.8" />
      <line x1={sNearRight} y1={COURT.nearY} x2={sFarRight} y2={COURT.farY} stroke="white" strokeWidth="1.5" opacity="0.8" />

      {/* Service lines */}
      <line x1={COURT.serviceFarLeft} y1={COURT.serviceFarY} x2={COURT.serviceFarRight} y2={COURT.serviceFarY} stroke="white" strokeWidth="2" />
      <line x1={COURT.serviceNearLeft} y1={COURT.serviceNearY} x2={COURT.serviceNearRight} y2={COURT.serviceNearY} stroke="white" strokeWidth="2" />

      {/* Center service line */}
      <line x1={centerFar} y1={COURT.serviceFarY} x2={centerNear} y2={COURT.serviceNearY} stroke="white" strokeWidth="1.5" opacity="0.8" />

      {/* Center mark */}
      <line x1={centerNear} y1={COURT.nearY} x2={centerNear} y2={COURT.nearY - 15} stroke="white" strokeWidth="2" />

      {/* Net */}
      <line x1={COURT.netNearLeft - 10} y1={COURT.netY} x2={COURT.netNearRight + 10} y2={COURT.netY} stroke="#e5e7eb" strokeWidth="4" />
      <line x1={COURT.netNearLeft - 10} y1={COURT.netY} x2={COURT.netNearRight + 10} y2={COURT.netY} stroke="rgba(255,255,255,0.15)" strokeWidth="12" />
      {/* Net mesh lines */}
      {[-8, -4, 0, 4, 8].map((dy) => (
        <line key={dy} x1={COURT.netNearLeft} y1={COURT.netY + dy} x2={COURT.netNearRight} y2={COURT.netY + dy} stroke="white" strokeWidth="0.3" opacity="0.15" />
      ))}
      {/* Net posts */}
      <rect x={COURT.netNearLeft - 14} y={COURT.netY - 14} width="6" height="28" rx="3" fill="#d1d5db" />
      <rect x={COURT.netNearRight + 8} y={COURT.netY - 14} width="6" height="28" rx="3" fill="#d1d5db" />
      {/* Post caps */}
      <circle cx={COURT.netNearLeft - 11} cy={COURT.netY - 14} r="4" fill="#e5e7eb" />
      <circle cx={COURT.netNearRight + 11} cy={COURT.netY - 14} r="4" fill="#e5e7eb" />

      {/* Opponent figure - more detailed */}
      {opponent && (
        <g opacity="0.85">
          {/* Shadow */}
          <ellipse
            cx={opponent.x}
            cy={opponent.y + 16 * oppScale}
            rx={10 * oppScale}
            ry={3 * oppScale}
            fill="rgba(0,0,0,0.3)"
          />
          {/* Legs */}
          <line x1={opponent.x - 3 * oppScale} y1={opponent.y + 10 * oppScale} x2={opponent.x - 5 * oppScale} y2={opponent.y + 16 * oppScale} stroke="#f97316" strokeWidth={3 * oppScale} strokeLinecap="round" />
          <line x1={opponent.x + 3 * oppScale} y1={opponent.y + 10 * oppScale} x2={opponent.x + 5 * oppScale} y2={opponent.y + 16 * oppScale} stroke="#f97316" strokeWidth={3 * oppScale} strokeLinecap="round" />
          {/* Body */}
          <rect
            x={opponent.x - 7 * oppScale}
            y={opponent.y - 4 * oppScale}
            width={14 * oppScale}
            height={16 * oppScale}
            rx={4 * oppScale}
            fill="#f97316"
          />
          {/* Arm with racket */}
          <line x1={opponent.x + 6 * oppScale} y1={opponent.y + 2 * oppScale} x2={opponent.x + 16 * oppScale} y2={opponent.y - 4 * oppScale} stroke="#f97316" strokeWidth={2.5 * oppScale} strokeLinecap="round" />
          <ellipse cx={opponent.x + 18 * oppScale} cy={opponent.y - 6 * oppScale} rx={4 * oppScale} ry={6 * oppScale} fill="none" stroke="#94a3b8" strokeWidth={1.5 * oppScale} />
          {/* Head */}
          <circle
            cx={opponent.x}
            cy={opponent.y - 4 * oppScale - 8 * oppScale}
            r={8 * oppScale}
            fill="#fb923c"
          />
          {/* Cap visor */}
          <ellipse
            cx={opponent.x}
            cy={opponent.y - 12 * oppScale - 3 * oppScale}
            rx={9 * oppScale}
            ry={3 * oppScale}
            fill="#ea580c"
          />
        </g>
      )}

      {/* Target zone */}
      {showTarget && zone && (
        <ellipse
          cx={zone.x}
          cy={zone.y}
          rx={zoneR}
          ry={zoneR * 0.45}
          fill="rgba(34, 197, 94, 0.25)"
          stroke="#22c55e"
          strokeWidth="3"
          strokeDasharray="8 4"
          filter="url(#fpGreenGlow)"
        />
      )}

      {/* Correct result */}
      {result === 'correct' && zone && (
        <g>
          <ellipse
            cx={zone.x}
            cy={zone.y}
            rx={zoneR}
            ry={zoneR * 0.45}
            fill="rgba(34, 197, 94, 0.35)"
            stroke="#22c55e"
            strokeWidth="3"
            filter="url(#fpGreenGlow)"
          />
          <text x={zone.x} y={zone.y + 8} textAnchor="middle" fontSize="28" fill="white" fontWeight="bold">
            ✓
          </text>
        </g>
      )}

      {/* Wrong result */}
      {result === 'wrong' && tap && (
        <g>
          <circle cx={tap.x} cy={tap.y} r="20" fill="rgba(239, 68, 68, 0.4)" stroke="#ef4444" strokeWidth="3" />
          <text x={tap.x} y={tap.y + 6} textAnchor="middle" fontSize="22" fill="white" fontWeight="bold">
            ✕
          </text>
        </g>
      )}

      {/* Shot trajectory arrow */}
      {result === 'correct' && ball && zone && (
        <line
          x1={ball.x}
          y1={ball.y}
          x2={zone.x}
          y2={zone.y}
          stroke="#CCFF00"
          strokeWidth="3"
          strokeDasharray="10 5"
          opacity="0.9"
          markerEnd="url(#arrowhead)"
        />
      )}
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#CCFF00" />
        </marker>
      </defs>

      {/* Swipe line */}
      {swipeLine && swipeStart && swipeEnd && (
        <line
          x1={swipeStart.x}
          y1={swipeStart.y}
          x2={swipeEnd.x}
          y2={swipeEnd.y}
          stroke={result === 'wrong' ? '#ef4444' : '#CCFF00'}
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.7"
          strokeDasharray={result === 'wrong' ? '6 4' : 'none'}
        />
      )}

      {/* Ball shadow on court */}
      {ball && (
        <ellipse
          cx={ball.x}
          cy={ball.y + 8 * ballScale}
          rx={8 * ballScale}
          ry={3 * ballScale}
          fill="rgba(0,0,0,0.25)"
        />
      )}

      {/* Tennis ball */}
      {ball && (
        <g filter="url(#fpBallGlow)">
          <circle cx={ball.x} cy={ball.y} r={12 * ballScale} fill="url(#ballGrad)" filter="url(#fpBallShadow)" />
          {/* Ball seam curves */}
          <path
            d={`M ${ball.x - 5 * ballScale} ${ball.y - 7 * ballScale} Q ${ball.x} ${ball.y} ${ball.x - 5 * ballScale} ${ball.y + 7 * ballScale}`}
            stroke="#7a9e00"
            strokeWidth={1.2 * ballScale}
            fill="none"
          />
          <path
            d={`M ${ball.x + 5 * ballScale} ${ball.y - 7 * ballScale} Q ${ball.x} ${ball.y} ${ball.x + 5 * ballScale} ${ball.y + 7 * ballScale}`}
            stroke="#7a9e00"
            strokeWidth={1.2 * ballScale}
            fill="none"
          />
        </g>
      )}

      {/* Player's racket at bottom - first person view */}
      <g opacity="0.7">
        {/* Racket handle */}
        <line x1={WIDTH / 2 + 40} y1={HEIGHT} x2={WIDTH / 2 + 15} y2={HEIGHT - 60} stroke="#8B4513" strokeWidth="7" strokeLinecap="round" />
        {/* Grip tape */}
        <line x1={WIDTH / 2 + 38} y1={HEIGHT - 5} x2={WIDTH / 2 + 30} y2={HEIGHT - 25} stroke="#654321" strokeWidth="8" strokeLinecap="round" />
        {/* Racket head */}
        <ellipse cx={WIDTH / 2 + 8} cy={HEIGHT - 85} rx="28" ry="38" fill="none" stroke="#374151" strokeWidth="4" transform="rotate(-15, ${WIDTH / 2 + 8}, ${HEIGHT - 85})" />
        <ellipse cx={WIDTH / 2 + 8} cy={HEIGHT - 85} rx="24" ry="34" fill="none" stroke="#6b7280" strokeWidth="1" transform="rotate(-15, ${WIDTH / 2 + 8}, ${HEIGHT - 85})" />
        {/* String pattern - vertical */}
        {[-16, -8, 0, 8, 16].map((dx) => (
          <line key={`v${dx}`} x1={WIDTH / 2 + 8 + dx} y1={HEIGHT - 115} x2={WIDTH / 2 + 8 + dx} y2={HEIGHT - 55} stroke="#9ca3af" strokeWidth="0.5" opacity="0.5" transform={`rotate(-15, ${WIDTH / 2 + 8}, ${HEIGHT - 85})`} />
        ))}
        {/* String pattern - horizontal */}
        {[-26, -16, -6, 4, 14, 24].map((dy) => (
          <line key={`h${dy}`} x1={WIDTH / 2 - 16} y1={HEIGHT - 85 + dy} x2={WIDTH / 2 + 32} y2={HEIGHT - 85 + dy} stroke="#9ca3af" strokeWidth="0.5" opacity="0.5" transform={`rotate(-15, ${WIDTH / 2 + 8}, ${HEIGHT - 85})`} />
        ))}
        {/* Player's hand hint */}
        <ellipse cx={WIDTH / 2 + 32} cy={HEIGHT - 18} rx="12" ry="8" fill="#d4a574" opacity="0.5" />
      </g>

      {/* Dimming overlay */}
      {dimmed && (
        <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="rgba(0,0,0,0.4)" />
      )}
    </svg>
  );
}

export { toNormCoords, perspectiveScale };
