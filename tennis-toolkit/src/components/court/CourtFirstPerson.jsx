import { useCallback } from 'react';

const WIDTH = 360;
const HEIGHT = 640;

// First-person perspective — low camera behind baseline, strong vanishing point
const COURT = {
  nearLeft: -60,
  nearRight: 420,
  nearY: 600,
  farLeft: 148,
  farRight: 212,
  farY: 95,
  netNearLeft: 20,
  netNearRight: 340,
  netY: 260,
  serviceNearLeft: -20,
  serviceNearRight: 380,
  serviceNearY: 440,
  serviceFarLeft: 120,
  serviceFarRight: 240,
  serviceFarY: 175,
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
  return {
    x: interpX(COURT.nearLeft, COURT.farLeft, COURT.nearRight, COURT.farRight, normY, normX),
    y: interpY(normY),
  };
}

function toNormCoords(svgX, svgY) {
  const normY = Math.max(0, Math.min(1, (svgY - COURT.farY) / (COURT.nearY - COURT.farY)));
  const left = COURT.farLeft + (COURT.nearLeft - COURT.farLeft) * normY;
  const right = COURT.farRight + (COURT.nearRight - COURT.farRight) * normY;
  const normX = Math.max(0, Math.min(1, (svgX - left) / (right - left)));
  return { x: normX, y: normY };
}

function perspectiveScale(normY) {
  return 0.15 + 0.85 * normY;
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
  playerPos,
  dimmed = false,
  racketSwing = false,
}) {
  const handleClick = useCallback(
    (e) => {
      if (!onTap) return;
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const svgX = (e.clientX - rect.left) * (WIDTH / rect.width);
      const svgY = (e.clientY - rect.top) * (HEIGHT / rect.height);
      onTap(toNormCoords(svgX, svgY));
    },
    [onTap]
  );

  const ball = ballPosition ? toSvgCoords(ballPosition.x, ballPosition.y) : null;
  const ballSc = ballPosition ? perspectiveScale(ballPosition.y) : 1;
  const zone = targetZone ? toSvgCoords(targetZone.x, targetZone.y) : null;
  const zoneSc = targetZone ? perspectiveScale(targetZone.y) : 1;
  const zoneR = targetZone ? targetZone.radius * 180 * zoneSc : 0;
  const tap = tapPosition ? toSvgCoords(tapPosition.x, tapPosition.y) : null;
  const swA = swipeLine?.start ? toSvgCoords(swipeLine.start.x, swipeLine.start.y) : null;
  const swB = swipeLine?.end ? toSvgCoords(swipeLine.end.x, swipeLine.end.y) : null;
  const opp = opponentPosition ? toSvgCoords(opponentPosition.x, opponentPosition.y) : null;
  const oppSc = opponentPosition ? perspectiveScale(opponentPosition.y) : 1;

  const courtPath = `M ${COURT.nearLeft} ${COURT.nearY} L ${COURT.farLeft} ${COURT.farY} L ${COURT.farRight} ${COURT.farY} L ${COURT.nearRight} ${COURT.nearY} Z`;

  const cNear = (COURT.serviceNearLeft + COURT.serviceNearRight) / 2;
  const cFar = (COURT.serviceFarLeft + COURT.serviceFarRight) / 2;

  const si = 0.07;
  const sNL = COURT.nearLeft + (COURT.nearRight - COURT.nearLeft) * si;
  const sNR = COURT.nearRight - (COURT.nearRight - COURT.nearLeft) * si;
  const sFL = COURT.farLeft + (COURT.farRight - COURT.farLeft) * si;
  const sFR = COURT.farRight - (COURT.farRight - COURT.farLeft) * si;

  // YOUR PLAYER position — uses explicit playerPos or falls back to ball position
  const pPos = playerPos || ballPosition;
  const playerBaseX = WIDTH / 2;
  const playerNormY = pPos
    ? Math.min(1.12, pPos.y + 0.12)
    : 1.12;
  const playerSvgY = COURT.farY + (COURT.nearY - COURT.farY) * playerNormY;
  const playerSvgX = pPos
    ? interpX(COURT.nearLeft, COURT.farLeft, COURT.nearRight, COURT.farRight, playerNormY, pPos.x)
    : playerBaseX;
  const playerScale = perspectiveScale(playerNormY) * 1.3;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full h-full touch-none select-none"
      onClick={handleClick}
      style={{ cursor: onTap ? 'crosshair' : 'default' }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id="ballGlow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id="shadow"><feDropShadow dx="1" dy="3" stdDeviation="3" floodOpacity="0.5" /></filter>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e3a5f" />
          <stop offset="40%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </linearGradient>
        <linearGradient id="court" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14532d" />
          <stop offset="100%" stopColor="#166534" />
        </linearGradient>
        <radialGradient id="ballG" cx="0.35" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#f0ff44" />
          <stop offset="100%" stopColor="#a3cc00" />
        </radialGradient>
      </defs>

      {/* Sky */}
      <rect x="0" y="0" width={WIDTH} height={COURT.farY + 10} fill="url(#sky)" />

      {/* Stadium backdrop */}
      <rect x="0" y={COURT.farY - 40} width={WIDTH} height="50" fill="#0f2440" />
      {/* Stadium lights */}
      {[70, 180, 290].map((cx) => (
        <g key={cx}>
          <rect x={cx - 2} y={COURT.farY - 52} width="3" height="16" fill="#374151" />
          <circle cx={cx} cy={COURT.farY - 54} r="4" fill="#fef08a" opacity="0.7" />
          <circle cx={cx} cy={COURT.farY - 54} r="8" fill="#fef08a" opacity="0.1" />
        </g>
      ))}
      {/* Crowd */}
      {Array.from({ length: 22 }).map((_, i) => (
        <circle key={i} cx={16 * i + 8} cy={COURT.farY - 20 + (i % 3) * 4} r={2 + (i % 2)} fill={['#ef4444', '#3b82f6', '#f59e0b', '#22c55e', '#a855f7', '#f8fafc'][i % 6]} opacity="0.3" />
      ))}

      {/* Ground around court */}
      <rect x="0" y={COURT.farY} width={WIDTH} height={HEIGHT - COURT.farY} fill="#0a3d1a" />

      {/* Court surface */}
      <path d={courtPath} fill="url(#court)" />

      {/* Court lines */}
      <line x1={COURT.farLeft} y1={COURT.farY} x2={COURT.farRight} y2={COURT.farY} stroke="white" strokeWidth="2" />
      <line x1={COURT.nearLeft} y1={COURT.nearY} x2={COURT.nearRight} y2={COURT.nearY} stroke="white" strokeWidth="3" />
      <line x1={COURT.nearLeft} y1={COURT.nearY} x2={COURT.farLeft} y2={COURT.farY} stroke="white" strokeWidth="1.5" />
      <line x1={COURT.nearRight} y1={COURT.nearY} x2={COURT.farRight} y2={COURT.farY} stroke="white" strokeWidth="1.5" />
      <line x1={sNL} y1={COURT.nearY} x2={sFL} y2={COURT.farY} stroke="white" strokeWidth="1" opacity="0.7" />
      <line x1={sNR} y1={COURT.nearY} x2={sFR} y2={COURT.farY} stroke="white" strokeWidth="1" opacity="0.7" />
      <line x1={COURT.serviceFarLeft} y1={COURT.serviceFarY} x2={COURT.serviceFarRight} y2={COURT.serviceFarY} stroke="white" strokeWidth="1.5" />
      <line x1={COURT.serviceNearLeft} y1={COURT.serviceNearY} x2={COURT.serviceNearRight} y2={COURT.serviceNearY} stroke="white" strokeWidth="1.5" />
      <line x1={cFar} y1={COURT.serviceFarY} x2={cNear} y2={COURT.serviceNearY} stroke="white" strokeWidth="1" opacity="0.7" />
      <line x1={cNear} y1={COURT.nearY} x2={cNear} y2={COURT.nearY - 14} stroke="white" strokeWidth="1.5" />

      {/* Net — prominent from first-person view */}
      <line x1={COURT.netNearLeft - 15} y1={COURT.netY} x2={COURT.netNearRight + 15} y2={COURT.netY} stroke="#e5e7eb" strokeWidth="5" />
      <line x1={COURT.netNearLeft - 15} y1={COURT.netY} x2={COURT.netNearRight + 15} y2={COURT.netY} stroke="rgba(255,255,255,0.15)" strokeWidth="18" />
      {[-7, -3.5, 0, 3.5, 7].map((dy) => (
        <line key={dy} x1={COURT.netNearLeft} y1={COURT.netY + dy} x2={COURT.netNearRight} y2={COURT.netY + dy} stroke="white" strokeWidth="0.4" opacity="0.12" />
      ))}
      <rect x={COURT.netNearLeft - 16} y={COURT.netY - 18} width="7" height="36" rx="3" fill="#d1d5db" />
      <rect x={COURT.netNearRight + 9} y={COURT.netY - 18} width="7" height="36" rx="3" fill="#d1d5db" />
      <circle cx={COURT.netNearLeft - 12} cy={COURT.netY - 18} r="5" fill="#e5e7eb" />
      <circle cx={COURT.netNearRight + 13} cy={COURT.netY - 18} r="5" fill="#e5e7eb" />

      {/* OPPONENT */}
      {opp && (() => {
        const s = oppSc * 1.8;
        return (
        <g opacity="0.95">
          <ellipse cx={opp.x} cy={opp.y + 30 * s} rx={12 * s} ry={4 * s} fill="rgba(0,0,0,0.3)" />
          <ellipse cx={opp.x - 6 * s} cy={opp.y + 28 * s} rx={5 * s} ry={2.5 * s} fill="#f8fafc" />
          <ellipse cx={opp.x + 6 * s} cy={opp.y + 28 * s} rx={5 * s} ry={2.5 * s} fill="#f8fafc" />
          <line x1={opp.x - 5 * s} y1={opp.y + 16 * s} x2={opp.x - 6 * s} y2={opp.y + 26 * s} stroke="#1e293b" strokeWidth={4 * s} strokeLinecap="round" />
          <line x1={opp.x + 5 * s} y1={opp.y + 16 * s} x2={opp.x + 6 * s} y2={opp.y + 26 * s} stroke="#1e293b" strokeWidth={4 * s} strokeLinecap="round" />
          <rect x={opp.x - 11 * s} y={opp.y - 6 * s} width={22 * s} height={24 * s} rx={5 * s} fill="#ef4444" />
          <ellipse cx={opp.x} cy={opp.y - 5 * s} rx={6 * s} ry={3 * s} fill="#dc2626" />
          <line x1={opp.x - 11 * s} y1={opp.y + 2 * s} x2={opp.x - 20 * s} y2={opp.y + 11 * s} stroke="#fbbf24" strokeWidth={3.5 * s} strokeLinecap="round" />
          <line x1={opp.x + 11 * s} y1={opp.y + 2 * s} x2={opp.x + 24 * s} y2={opp.y - 8 * s} stroke="#fbbf24" strokeWidth={3.5 * s} strokeLinecap="round" />
          <line x1={opp.x + 24 * s} y1={opp.y - 8 * s} x2={opp.x + 32 * s} y2={opp.y - 20 * s} stroke="#78716c" strokeWidth={2.5 * s} strokeLinecap="round" />
          <ellipse cx={opp.x + 35 * s} cy={opp.y - 25 * s} rx={6 * s} ry={9 * s} fill="none" stroke="#a8a29e" strokeWidth={2 * s} transform={`rotate(-20, ${opp.x + 35 * s}, ${opp.y - 25 * s})`} />
          <circle cx={opp.x} cy={opp.y - 6 * s - 12 * s} r={12 * s} fill="#fbbf24" />
          <circle cx={opp.x - 3 * s} cy={opp.y - 19 * s} r={1.2 * s} fill="#1e293b" />
          <circle cx={opp.x + 3 * s} cy={opp.y - 19 * s} r={1.2 * s} fill="#1e293b" />
          <ellipse cx={opp.x} cy={opp.y - 18 * s - 7 * s} rx={13 * s} ry={4 * s} fill="#dc2626" />
          <rect x={opp.x - 12 * s} y={opp.y - 25 * s - 3 * s} width={24 * s} height={6 * s} rx={3 * s} fill="#dc2626" />
        </g>
        );
      })()}

      {/* Target zone */}
      {showTarget && zone && (
        <ellipse cx={zone.x} cy={zone.y} rx={zoneR} ry={zoneR * 0.4} fill="rgba(34,197,94,0.25)" stroke="#22c55e" strokeWidth="3" strokeDasharray="8 4" filter="url(#glow)" />
      )}

      {/* Correct */}
      {result === 'correct' && zone && (
        <ellipse cx={zone.x} cy={zone.y} rx={zoneR} ry={zoneR * 0.4} fill="rgba(34,197,94,0.35)" stroke="#22c55e" strokeWidth="3" filter="url(#glow)" />
      )}

      {/* Wrong */}
      {result === 'wrong' && tap && (
        <g>
          <circle cx={tap.x} cy={tap.y} r="20" fill="rgba(239,68,68,0.4)" stroke="#ef4444" strokeWidth="3" />
          <text x={tap.x} y={tap.y + 6} textAnchor="middle" fontSize="22" fill="white" fontWeight="bold">✕</text>
        </g>
      )}

      {/* Shot trajectory */}
      {result === 'correct' && ball && zone && (
        <line x1={ball.x} y1={ball.y} x2={zone.x} y2={zone.y} stroke="#CCFF00" strokeWidth="3.5" strokeDasharray="10 5" opacity="0.9" />
      )}

      {/* Wrong trajectory */}
      {swA && swB && result === 'wrong' && (
        <line x1={swA.x} y1={swA.y} x2={swB.x} y2={swB.y} stroke="#ef4444" strokeWidth="3" strokeDasharray="6 4" opacity="0.5" />
      )}

      {/* Ball shadow */}
      {ball && <ellipse cx={ball.x} cy={ball.y + 10 * ballSc} rx={9 * ballSc} ry={3 * ballSc} fill="rgba(0,0,0,0.3)" />}

      {/* Tennis ball */}
      {ball && (
        <g filter="url(#ballGlow)">
          <circle cx={ball.x} cy={ball.y} r={12 * ballSc} fill="url(#ballG)" filter="url(#shadow)" />
          <path d={`M ${ball.x - 5 * ballSc} ${ball.y - 8 * ballSc} Q ${ball.x} ${ball.y} ${ball.x - 5 * ballSc} ${ball.y + 8 * ballSc}`} stroke="#7a9e00" strokeWidth={1 * ballSc} fill="none" />
          <path d={`M ${ball.x + 5 * ballSc} ${ball.y - 8 * ballSc} Q ${ball.x} ${ball.y} ${ball.x + 5 * ballSc} ${ball.y + 8 * ballSc}`} stroke="#7a9e00" strokeWidth={1 * ballSc} fill="none" />
        </g>
      )}

      {/* YOUR PLAYER — moves to the ball position (X and Y) */}
      {(() => {
        const px = playerSvgX;
        const py = playerSvgY;
        const s = playerScale;
        return (
        <g style={{
          transition: 'transform 0.35s ease-out',
          transform: `translate(${px}px, ${py}px)`,
        }}>
          {/* Shadow */}
          <ellipse cx={0} cy={48 * s} rx={22 * s} ry={7 * s} fill="rgba(0,0,0,0.35)" />
          {/* Shoes */}
          <ellipse cx={-10 * s} cy={45 * s} rx={8 * s} ry={4 * s} fill="#f8fafc" />
          <ellipse cx={10 * s} cy={45 * s} rx={8 * s} ry={4 * s} fill="#f8fafc" />
          {/* Legs */}
          <line x1={-8 * s} y1={26 * s} x2={-10 * s} y2={42 * s} stroke="#1e293b" strokeWidth={7 * s} strokeLinecap="round" />
          <line x1={8 * s} y1={26 * s} x2={10 * s} y2={42 * s} stroke="#1e293b" strokeWidth={7 * s} strokeLinecap="round" />
          {/* Body - shirt */}
          <rect x={-18 * s} y={-10 * s} width={36 * s} height={38 * s} rx={8 * s} fill="#3b82f6" />
          {/* Collar */}
          <ellipse cx={0} cy={-9 * s} rx={10 * s} ry={5 * s} fill="#2563eb" />
          {/* Number on back */}
          <text x={0} y={16 * s} textAnchor="middle" fontSize={18 * s} fill="white" fontWeight="bold" opacity="0.6">7</text>
          {/* Left arm */}
          <line x1={-18 * s} y1={4 * s} x2={-30 * s} y2={18 * s} stroke="#fbbf24" strokeWidth={6 * s} strokeLinecap="round" />
          {/* Right arm + racket */}
          <g style={{
            transformOrigin: `${18 * s}px ${4 * s}px`,
            transition: 'transform 0.12s ease-out',
            transform: racketSwing ? 'rotate(-50deg)' : 'rotate(0deg)',
          }}>
            <line x1={18 * s} y1={4 * s} x2={34 * s} y2={-14 * s} stroke="#fbbf24" strokeWidth={6 * s} strokeLinecap="round" />
            <line x1={34 * s} y1={-14 * s} x2={44 * s} y2={-32 * s} stroke="#8B4513" strokeWidth={4 * s} strokeLinecap="round" />
            <ellipse cx={48 * s} cy={-42 * s} rx={10 * s} ry={16 * s} fill="none" stroke="#374151" strokeWidth={3 * s} transform={`rotate(-15, ${48 * s}, ${-42 * s})`} />
          </g>
          {/* Head */}
          <circle cx={0} cy={-28 * s} r={16 * s} fill="#fbbf24" />
          {/* Hair (from behind) */}
          <ellipse cx={0} cy={-32 * s} rx={16 * s} ry={12 * s} fill="#92400e" />
          {/* Cap */}
          <ellipse cx={0} cy={-36 * s} rx={18 * s} ry={6 * s} fill="#2563eb" />
          <rect x={-17 * s} y={-40 * s} width={34 * s} height={8 * s} rx={4 * s} fill="#2563eb" />
        </g>
        );
      })()}

      {/* Dim overlay */}
      {dimmed && <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="rgba(0,0,0,0.5)" />}
    </svg>
  );
}

export { toNormCoords, perspectiveScale };
