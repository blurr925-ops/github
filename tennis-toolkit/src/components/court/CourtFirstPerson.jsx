import { useCallback } from 'react';

const WIDTH = 360;
const HEIGHT = 640;

// Third-person perspective — standing behind the baseline, seeing the full court
const COURT = {
  nearLeft: 10,
  nearRight: 350,
  nearY: 520,
  farLeft: 115,
  farRight: 245,
  farY: 140,
  netNearLeft: 45,
  netNearRight: 315,
  netY: 310,
  serviceNearLeft: 25,
  serviceNearRight: 335,
  serviceNearY: 420,
  serviceFarLeft: 80,
  serviceFarRight: 280,
  serviceFarY: 220,
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

  // YOUR PLAYER position — moves toward the ball
  const playerBaseX = WIDTH / 2;
  const playerX = ballPosition
    ? playerBaseX + (ballPosition.x - 0.5) * 200
    : playerBaseX;
  const playerY = COURT.nearY + 30;

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
      <rect x="0" y={COURT.farY - 50} width={WIDTH} height="60" fill="#0f2440" />
      {/* Stadium lights */}
      {[70, 180, 290].map((cx) => (
        <g key={cx}>
          <rect x={cx - 2} y={COURT.farY - 65} width="4" height="20" fill="#374151" />
          <circle cx={cx} cy={COURT.farY - 68} r="6" fill="#fef08a" opacity="0.7" />
          <circle cx={cx} cy={COURT.farY - 68} r="12" fill="#fef08a" opacity="0.1" />
        </g>
      ))}
      {/* Crowd */}
      {Array.from({ length: 22 }).map((_, i) => (
        <circle key={i} cx={16 * i + 8} cy={COURT.farY - 28 + (i % 3) * 5} r={3 + (i % 2)} fill={['#ef4444', '#3b82f6', '#f59e0b', '#22c55e', '#a855f7', '#f8fafc'][i % 6]} opacity="0.3" />
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

      {/* Net */}
      <line x1={COURT.netNearLeft - 10} y1={COURT.netY} x2={COURT.netNearRight + 10} y2={COURT.netY} stroke="#e5e7eb" strokeWidth="4" />
      <line x1={COURT.netNearLeft - 10} y1={COURT.netY} x2={COURT.netNearRight + 10} y2={COURT.netY} stroke="rgba(255,255,255,0.12)" strokeWidth="12" />
      {[-5, -2.5, 0, 2.5, 5].map((dy) => (
        <line key={dy} x1={COURT.netNearLeft} y1={COURT.netY + dy} x2={COURT.netNearRight} y2={COURT.netY + dy} stroke="white" strokeWidth="0.3" opacity="0.1" />
      ))}
      <rect x={COURT.netNearLeft - 14} y={COURT.netY - 14} width="6" height="28" rx="3" fill="#d1d5db" />
      <rect x={COURT.netNearRight + 8} y={COURT.netY - 14} width="6" height="28" rx="3" fill="#d1d5db" />
      <circle cx={COURT.netNearLeft - 11} cy={COURT.netY - 14} r="4" fill="#e5e7eb" />
      <circle cx={COURT.netNearRight + 11} cy={COURT.netY - 14} r="4" fill="#e5e7eb" />

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

      {/* YOUR PLAYER — from behind, moves to the ball */}
      <g style={{ transition: 'transform 0.25s ease-out' }} transform={`translate(${playerX - playerBaseX}, 0)`}>
        {/* Shadow */}
        <ellipse cx={playerBaseX} cy={playerY + 48} rx="22" ry="7" fill="rgba(0,0,0,0.35)" />
        {/* Shoes */}
        <ellipse cx={playerBaseX - 10} cy={playerY + 45} rx="8" ry="4" fill="#f8fafc" />
        <ellipse cx={playerBaseX + 10} cy={playerY + 45} rx="8" ry="4" fill="#f8fafc" />
        {/* Legs */}
        <line x1={playerBaseX - 8} y1={playerY + 26} x2={playerBaseX - 10} y2={playerY + 42} stroke="#1e293b" strokeWidth="7" strokeLinecap="round" />
        <line x1={playerBaseX + 8} y1={playerY + 26} x2={playerBaseX + 10} y2={playerY + 42} stroke="#1e293b" strokeWidth="7" strokeLinecap="round" />
        {/* Body - shirt */}
        <rect x={playerBaseX - 18} y={playerY - 10} width="36" height="38" rx="8" fill="#3b82f6" />
        {/* Collar */}
        <ellipse cx={playerBaseX} cy={playerY - 9} rx="10" ry="5" fill="#2563eb" />
        {/* Number on back */}
        <text x={playerBaseX} y={playerY + 16} textAnchor="middle" fontSize="18" fill="white" fontWeight="bold" opacity="0.6">7</text>
        {/* Left arm */}
        <line x1={playerBaseX - 18} y1={playerY + 4} x2={playerBaseX - 30} y2={playerY + 18} stroke="#fbbf24" strokeWidth="6" strokeLinecap="round" />
        {/* Right arm + racket */}
        <g style={{
          transformOrigin: `${playerBaseX + 18}px ${playerY + 4}px`,
          transition: 'transform 0.12s ease-out',
          transform: racketSwing ? 'rotate(-50deg)' : 'rotate(0deg)',
        }}>
          <line x1={playerBaseX + 18} y1={playerY + 4} x2={playerBaseX + 34} y2={playerY - 14} stroke="#fbbf24" strokeWidth="6" strokeLinecap="round" />
          {/* Racket handle */}
          <line x1={playerBaseX + 34} y1={playerY - 14} x2={playerBaseX + 44} y2={playerY - 32} stroke="#8B4513" strokeWidth="4" strokeLinecap="round" />
          {/* Racket head */}
          <ellipse cx={playerBaseX + 48} cy={playerY - 42} rx="10" ry="16" fill="none" stroke="#374151" strokeWidth="3" transform={`rotate(-15, ${playerBaseX + 48}, ${playerY - 42})`} />
          <ellipse cx={playerBaseX + 48} cy={playerY - 42} rx="8" ry="13" fill="none" stroke="#6b7280" strokeWidth="0.8" transform={`rotate(-15, ${playerBaseX + 48}, ${playerY - 42})`} />
          {/* Strings */}
          {[-5, 0, 5].map((dx) => (
            <line key={`v${dx}`} x1={playerBaseX + 48 + dx} y1={playerY - 55} x2={playerBaseX + 48 + dx} y2={playerY - 30} stroke="#9ca3af" strokeWidth="0.4" opacity="0.4" transform={`rotate(-15, ${playerBaseX + 48}, ${playerY - 42})`} />
          ))}
        </g>
        {/* Head */}
        <circle cx={playerBaseX} cy={playerY - 10 - 18} r="16" fill="#fbbf24" />
        {/* Hair (from behind) */}
        <ellipse cx={playerBaseX} cy={playerY - 32} rx="16" ry="12" fill="#92400e" />
        {/* Cap */}
        <ellipse cx={playerBaseX} cy={playerY - 36} rx="18" ry="6" fill="#2563eb" />
        <rect x={playerBaseX - 17} y={playerY - 40} width="34" height="8" rx="4" fill="#2563eb" />
      </g>

      {/* Dim overlay */}
      {dimmed && <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="rgba(0,0,0,0.5)" />}
    </svg>
  );
}

export { toNormCoords, perspectiveScale };
