import { useCallback } from 'react';

const WIDTH = 360;
const HEIGHT = 480;

// First-person perspective court - looking from baseline across the net
// Uses trapezoid shape to create depth illusion
const COURT = {
  // Near baseline (bottom of screen - where you stand)
  nearLeft: 20,
  nearRight: 340,
  nearY: 440,
  // Far baseline (top of screen - opponent side)
  farLeft: 100,
  farRight: 260,
  farY: 80,
  // Net line
  netNearLeft: 50,
  netNearRight: 310,
  netY: 240,
  // Service line (your side)
  serviceNearLeft: 40,
  serviceNearRight: 320,
  serviceNearY: 340,
  // Service line (far side)
  serviceFarLeft: 70,
  serviceFarRight: 290,
  serviceFarY: 160,
};

// Interpolate between near and far for a given depth (0=far baseline, 1=near baseline)
function interpX(leftNear, leftFar, rightNear, rightFar, depth, normalizedX) {
  const left = leftFar + (leftNear - leftFar) * depth;
  const right = rightFar + (rightNear - rightFar) * depth;
  return left + normalizedX * (right - left);
}

function interpY(depth) {
  return COURT.farY + (COURT.nearY - COURT.farY) * depth;
}

// Convert normalized (0-1) coords to first-person SVG coords
// x: 0=left, 1=right
// y: 0=far baseline (opponent), 1=near baseline (you)
function toSvgCoords(normX, normY) {
  const svgY = interpY(normY);
  const svgX = interpX(
    COURT.nearLeft, COURT.farLeft,
    COURT.nearRight, COURT.farRight,
    normY, normX
  );
  return { x: svgX, y: svgY };
}

// Convert SVG click coords back to normalized
function toNormCoords(svgX, svgY) {
  const normY = Math.max(0, Math.min(1, (svgY - COURT.farY) / (COURT.nearY - COURT.farY)));
  const left = COURT.farLeft + (COURT.nearLeft - COURT.farLeft) * normY;
  const right = COURT.farRight + (COURT.nearRight - COURT.farRight) * normY;
  const normX = Math.max(0, Math.min(1, (svgX - left) / (right - left)));
  return { x: normX, y: normY };
}

// Scale a radius for perspective (smaller when further away)
function perspectiveScale(normY) {
  return 0.4 + 0.6 * normY;
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

  // Convert positions to SVG coords
  const ball = ballPosition ? toSvgCoords(ballPosition.x, ballPosition.y) : null;
  const zone = targetZone ? toSvgCoords(targetZone.x, targetZone.y) : null;
  const zoneScale = targetZone ? perspectiveScale(targetZone.y) : 1;
  const zoneR = targetZone ? targetZone.radius * 200 * zoneScale : 0;
  const tap = tapPosition ? toSvgCoords(tapPosition.x, tapPosition.y) : null;

  // Swipe line coords
  const swipeStart = swipeLine?.start ? toSvgCoords(swipeLine.start.x, swipeLine.start.y) : null;
  const swipeEnd = swipeLine?.end ? toSvgCoords(swipeLine.end.x, swipeLine.end.y) : null;

  // Opponent position
  const opponent = opponentPosition ? toSvgCoords(opponentPosition.x, opponentPosition.y) : null;
  const oppScale = opponentPosition ? perspectiveScale(opponentPosition.y) : 1;

  // Court outline points (trapezoid)
  const courtPath = `M ${COURT.nearLeft} ${COURT.nearY} L ${COURT.farLeft} ${COURT.farY} L ${COURT.farRight} ${COURT.farY} L ${COURT.nearRight} ${COURT.nearY} Z`;

  // Net
  const netPath = `M ${COURT.netNearLeft} ${COURT.netY} L ${COURT.netNearRight} ${COURT.netY}`;

  // Service lines
  const serviceNearPath = `M ${COURT.serviceNearLeft} ${COURT.serviceNearY} L ${COURT.serviceNearRight} ${COURT.serviceNearY}`;
  const serviceFarPath = `M ${COURT.serviceFarLeft} ${COURT.serviceFarY} L ${COURT.serviceFarRight} ${COURT.serviceFarY}`;

  // Center service line
  const centerNear = (COURT.serviceNearLeft + COURT.serviceNearRight) / 2;
  const centerNet = (COURT.netNearLeft + COURT.netNearRight) / 2;
  const centerFar = (COURT.serviceFarLeft + COURT.serviceFarRight) / 2;

  // Singles sidelines (slightly inside doubles)
  const singlesInset = 0.08;
  const sNearLeft = COURT.nearLeft + (COURT.nearRight - COURT.nearLeft) * singlesInset;
  const sNearRight = COURT.nearRight - (COURT.nearRight - COURT.nearLeft) * singlesInset;
  const sFarLeft = COURT.farLeft + (COURT.farRight - COURT.farLeft) * singlesInset;
  const sFarRight = COURT.farRight - (COURT.farRight - COURT.farLeft) * singlesInset;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full max-w-sm mx-auto rounded-xl overflow-hidden touch-none select-none"
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
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.5" />
        </filter>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a90d9" />
          <stop offset="100%" stopColor="#87CEEB" />
        </linearGradient>
        <linearGradient id="courtGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a6b30" />
          <stop offset="100%" stopColor="#22883d" />
        </linearGradient>
      </defs>

      {/* Sky background */}
      <rect x="0" y="0" width={WIDTH} height={COURT.farY} fill="url(#skyGrad)" />

      {/* Ground behind court */}
      <rect x="0" y={COURT.farY} width={WIDTH} height={HEIGHT - COURT.farY} fill="#1a5c2a" />

      {/* Court surface */}
      <path d={courtPath} fill="url(#courtGrad)" />

      {/* Court lines */}
      {/* Baselines */}
      <line x1={COURT.farLeft} y1={COURT.farY} x2={COURT.farRight} y2={COURT.farY} stroke="white" strokeWidth="2" />
      <line x1={COURT.nearLeft} y1={COURT.nearY} x2={COURT.nearRight} y2={COURT.nearY} stroke="white" strokeWidth="2.5" />

      {/* Doubles sidelines */}
      <line x1={COURT.nearLeft} y1={COURT.nearY} x2={COURT.farLeft} y2={COURT.farY} stroke="white" strokeWidth="1.5" />
      <line x1={COURT.nearRight} y1={COURT.nearY} x2={COURT.farRight} y2={COURT.farY} stroke="white" strokeWidth="1.5" />

      {/* Singles sidelines */}
      <line x1={sNearLeft} y1={COURT.nearY} x2={sFarLeft} y2={COURT.farY} stroke="white" strokeWidth="1" opacity="0.7" />
      <line x1={sNearRight} y1={COURT.nearY} x2={sFarRight} y2={COURT.farY} stroke="white" strokeWidth="1" opacity="0.7" />

      {/* Service lines */}
      <path d={serviceFarPath} stroke="white" strokeWidth="1.5" fill="none" />
      <path d={serviceNearPath} stroke="white" strokeWidth="1.5" fill="none" />

      {/* Center service line */}
      <line x1={centerFar} y1={COURT.serviceFarY} x2={centerNear} y2={COURT.serviceNearY} stroke="white" strokeWidth="1" opacity="0.7" />

      {/* Center marks */}
      <line x1={centerNear} y1={COURT.nearY} x2={centerNear} y2={COURT.nearY - 12} stroke="white" strokeWidth="1.5" />

      {/* Net */}
      <line x1={COURT.netNearLeft - 8} y1={COURT.netY} x2={COURT.netNearRight + 8} y2={COURT.netY} stroke="white" strokeWidth="3" />
      <line x1={COURT.netNearLeft - 8} y1={COURT.netY} x2={COURT.netNearRight + 8} y2={COURT.netY} stroke="rgba(255,255,255,0.3)" strokeWidth="8" />
      {/* Net posts */}
      <rect x={COURT.netNearLeft - 12} y={COURT.netY - 8} width="5" height="16" rx="2" fill="white" opacity="0.8" />
      <rect x={COURT.netNearRight + 7} y={COURT.netY - 8} width="5" height="16" rx="2" fill="white" opacity="0.8" />

      {/* Opponent figure */}
      {opponent && (
        <g opacity="0.6">
          {/* Body (rectangle) */}
          <rect
            x={opponent.x - 5 * oppScale}
            y={opponent.y - 2 * oppScale}
            width={10 * oppScale}
            height={18 * oppScale}
            rx={3 * oppScale}
            fill="#f97316"
          />
          {/* Head (circle) */}
          <circle
            cx={opponent.x}
            cy={opponent.y - 2 * oppScale - 7 * oppScale}
            r={7 * oppScale}
            fill="#f97316"
          />
        </g>
      )}

      {/* Target zone */}
      {showTarget && zone && (
        <ellipse
          cx={zone.x}
          cy={zone.y}
          rx={zoneR}
          ry={zoneR * 0.5}
          fill="rgba(34, 197, 94, 0.3)"
          stroke="#22c55e"
          strokeWidth="2.5"
          strokeDasharray="6 3"
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
            ry={zoneR * 0.5}
            fill="rgba(34, 197, 94, 0.4)"
            stroke="#22c55e"
            strokeWidth="3"
            filter="url(#fpGreenGlow)"
          />
          <text x={zone.x} y={zone.y + 6} textAnchor="middle" fontSize="24" fill="white" fontWeight="bold">
            ✓
          </text>
        </g>
      )}

      {/* Wrong result */}
      {result === 'wrong' && tap && (
        <g>
          <circle cx={tap.x} cy={tap.y} r="16" fill="rgba(249, 115, 22, 0.5)" stroke="#f97316" strokeWidth="2.5" />
          <text x={tap.x} y={tap.y + 5} textAnchor="middle" fontSize="18" fill="white" fontWeight="bold">
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
          strokeWidth="2.5"
          strokeDasharray="8 4"
          opacity="0.8"
          markerEnd="url(#arrowhead)"
        />
      )}
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#CCFF00" />
        </marker>
      </defs>

      {/* Swipe line */}
      {swipeLine && swipeStart && swipeEnd && (
        <line
          x1={swipeStart.x}
          y1={swipeStart.y}
          x2={swipeEnd.x}
          y2={swipeEnd.y}
          stroke="#CCFF00"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.7"
        />
      )}

      {/* Tennis ball */}
      {ball && (
        <g filter="url(#fpBallShadow)">
          <circle cx={ball.x} cy={ball.y} r={10 * perspectiveScale(ballPosition.y)} fill="#CCFF00" />
          <path
            d={`M ${ball.x - 4} ${ball.y - 5} Q ${ball.x} ${ball.y} ${ball.x - 4} ${ball.y + 5}`}
            stroke="#a3cc00"
            strokeWidth="1"
            fill="none"
          />
          <path
            d={`M ${ball.x + 4} ${ball.y - 5} Q ${ball.x} ${ball.y} ${ball.x + 4} ${ball.y + 5}`}
            stroke="#a3cc00"
            strokeWidth="1"
            fill="none"
          />
        </g>
      )}

      {/* Player silhouette at bottom */}
      <g opacity="0.15">
        <ellipse cx={WIDTH / 2} cy={HEIGHT - 10} rx="30" ry="8" fill="white" />
        <rect x={WIDTH / 2 - 8} y={HEIGHT - 50} width="16" height="35" rx="4" fill="white" />
        <circle cx={WIDTH / 2} cy={HEIGHT - 58} r="10" fill="white" />
      </g>
    </svg>
  );
}

// Export coordinate helpers for use in hit detection
export { toNormCoords, perspectiveScale };
