import { useCallback } from 'react';

const WIDTH = 360;
const HEIGHT = 700;

// Ultra-low viewpoint — like you're crouching on the baseline
const COURT = {
  nearLeft: -40,
  nearRight: 400,
  nearY: 650,
  farLeft: 120,
  farRight: 240,
  farY: 200,
  netNearLeft: 20,
  netNearRight: 340,
  netY: 380,
  serviceNearLeft: -10,
  serviceNearRight: 370,
  serviceNearY: 520,
  serviceFarLeft: 85,
  serviceFarRight: 275,
  serviceFarY: 285,
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
  return 0.25 + 0.75 * normY;
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

  const racketStyle = racketSwing
    ? { transition: 'transform 0.12s ease-out', transform: 'rotate(-30deg) translateX(-20px) translateY(-25px)' }
    : { transition: 'transform 0.3s ease-out', transform: 'rotate(0deg)' };

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full h-full touch-none select-none"
      onClick={handleClick}
      style={{ cursor: onTap ? 'crosshair' : 'default' }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id="ballGlow"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id="shadow"><feDropShadow dx="1" dy="3" stdDeviation="3" floodOpacity="0.6" /></filter>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e3a5f" />
          <stop offset="30%" stopColor="#2563eb" />
          <stop offset="70%" stopColor="#60a5fa" />
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
      <rect x="0" y="0" width={WIDTH} height={COURT.farY + 20} fill="url(#sky)" />

      {/* Stadium backdrop */}
      <rect x="0" y={COURT.farY - 45} width={WIDTH} height="55" fill="#0f2440" />
      {/* Stadium lights */}
      {[60, 180, 300].map((cx) => (
        <g key={cx}>
          <rect x={cx - 2} y={COURT.farY - 60} width="4" height="22" fill="#374151" />
          <circle cx={cx} cy={COURT.farY - 63} r="7" fill="#fef08a" opacity="0.7" />
          <circle cx={cx} cy={COURT.farY - 63} r="14" fill="#fef08a" opacity="0.1" />
        </g>
      ))}
      {/* Crowd */}
      {Array.from({ length: 24 }).map((_, i) => (
        <circle key={i} cx={15 * i + 7} cy={COURT.farY - 25 + (i % 3) * 5} r={3 + (i % 2)} fill={['#ef4444', '#3b82f6', '#f59e0b', '#22c55e', '#a855f7', '#f8fafc'][i % 6]} opacity="0.3" />
      ))}

      {/* Ground */}
      <rect x="0" y={COURT.farY} width={WIDTH} height={HEIGHT - COURT.farY} fill="#0a3d1a" />

      {/* Court surface */}
      <path d={courtPath} fill="url(#court)" />

      {/* Court lines */}
      <line x1={COURT.farLeft} y1={COURT.farY} x2={COURT.farRight} y2={COURT.farY} stroke="white" strokeWidth="2.5" />
      <line x1={COURT.nearLeft} y1={COURT.nearY} x2={COURT.nearRight} y2={COURT.nearY} stroke="white" strokeWidth="3.5" />
      <line x1={COURT.nearLeft} y1={COURT.nearY} x2={COURT.farLeft} y2={COURT.farY} stroke="white" strokeWidth="2" />
      <line x1={COURT.nearRight} y1={COURT.nearY} x2={COURT.farRight} y2={COURT.farY} stroke="white" strokeWidth="2" />
      <line x1={sNL} y1={COURT.nearY} x2={sFL} y2={COURT.farY} stroke="white" strokeWidth="1.5" opacity="0.7" />
      <line x1={sNR} y1={COURT.nearY} x2={sFR} y2={COURT.farY} stroke="white" strokeWidth="1.5" opacity="0.7" />
      <line x1={COURT.serviceFarLeft} y1={COURT.serviceFarY} x2={COURT.serviceFarRight} y2={COURT.serviceFarY} stroke="white" strokeWidth="2" />
      <line x1={COURT.serviceNearLeft} y1={COURT.serviceNearY} x2={COURT.serviceNearRight} y2={COURT.serviceNearY} stroke="white" strokeWidth="2" />
      <line x1={cFar} y1={COURT.serviceFarY} x2={cNear} y2={COURT.serviceNearY} stroke="white" strokeWidth="1.5" opacity="0.7" />
      <line x1={cNear} y1={COURT.nearY} x2={cNear} y2={COURT.nearY - 18} stroke="white" strokeWidth="2" />

      {/* Net */}
      <line x1={COURT.netNearLeft - 12} y1={COURT.netY} x2={COURT.netNearRight + 12} y2={COURT.netY} stroke="#e5e7eb" strokeWidth="5" />
      <line x1={COURT.netNearLeft - 12} y1={COURT.netY} x2={COURT.netNearRight + 12} y2={COURT.netY} stroke="rgba(255,255,255,0.12)" strokeWidth="16" />
      {[-7, -3.5, 0, 3.5, 7].map((dy) => (
        <line key={dy} x1={COURT.netNearLeft} y1={COURT.netY + dy} x2={COURT.netNearRight} y2={COURT.netY + dy} stroke="white" strokeWidth="0.3" opacity="0.1" />
      ))}
      <rect x={COURT.netNearLeft - 17} y={COURT.netY - 18} width="7" height="36" rx="3.5" fill="#d1d5db" />
      <rect x={COURT.netNearRight + 10} y={COURT.netY - 18} width="7" height="36" rx="3.5" fill="#d1d5db" />
      <circle cx={COURT.netNearLeft - 13.5} cy={COURT.netY - 18} r="5" fill="#e5e7eb" />
      <circle cx={COURT.netNearRight + 13.5} cy={COURT.netY - 18} r="5" fill="#e5e7eb" />

      {/* Opponent */}
      {opp && (() => {
        const s = oppSc * 2.2;
        return (
        <g opacity="0.95">
          {/* Shadow */}
          <ellipse cx={opp.x} cy={opp.y + 36 * s} rx={16 * s} ry={5 * s} fill="rgba(0,0,0,0.35)" />
          {/* Shoes */}
          <ellipse cx={opp.x - 8 * s} cy={opp.y + 34 * s} rx={6 * s} ry={3 * s} fill="#f8fafc" />
          <ellipse cx={opp.x + 8 * s} cy={opp.y + 34 * s} rx={6 * s} ry={3 * s} fill="#f8fafc" />
          {/* Legs */}
          <line x1={opp.x - 6 * s} y1={opp.y + 20 * s} x2={opp.x - 8 * s} y2={opp.y + 32 * s} stroke="#1e293b" strokeWidth={5 * s} strokeLinecap="round" />
          <line x1={opp.x + 6 * s} y1={opp.y + 20 * s} x2={opp.x + 8 * s} y2={opp.y + 32 * s} stroke="#1e293b" strokeWidth={5 * s} strokeLinecap="round" />
          {/* Body - shirt */}
          <rect x={opp.x - 14 * s} y={opp.y - 8 * s} width={28 * s} height={30 * s} rx={6 * s} fill="#ef4444" />
          {/* Shirt collar */}
          <ellipse cx={opp.x} cy={opp.y - 7 * s} rx={8 * s} ry={4 * s} fill="#dc2626" />
          {/* Left arm */}
          <line x1={opp.x - 14 * s} y1={opp.y + 2 * s} x2={opp.x - 24 * s} y2={opp.y + 14 * s} stroke="#fbbf24" strokeWidth={4.5 * s} strokeLinecap="round" />
          {/* Right arm + racket */}
          <line x1={opp.x + 14 * s} y1={opp.y + 2 * s} x2={opp.x + 30 * s} y2={opp.y - 10 * s} stroke="#fbbf24" strokeWidth={4.5 * s} strokeLinecap="round" />
          <line x1={opp.x + 30 * s} y1={opp.y - 10 * s} x2={opp.x + 40 * s} y2={opp.y - 24 * s} stroke="#78716c" strokeWidth={3 * s} strokeLinecap="round" />
          <ellipse cx={opp.x + 43 * s} cy={opp.y - 30 * s} rx={8 * s} ry={12 * s} fill="none" stroke="#a8a29e" strokeWidth={2.5 * s} transform={`rotate(-20, ${opp.x + 43 * s}, ${opp.y - 30 * s})`} />
          {/* Head */}
          <circle cx={opp.x} cy={opp.y - 8 * s - 14 * s} r={14 * s} fill="#fbbf24" />
          {/* Eyes */}
          <circle cx={opp.x - 4 * s} cy={opp.y - 23 * s} r={1.5 * s} fill="#1e293b" />
          <circle cx={opp.x + 4 * s} cy={opp.y - 23 * s} r={1.5 * s} fill="#1e293b" />
          {/* Cap */}
          <ellipse cx={opp.x} cy={opp.y - 22 * s - 8 * s} rx={16 * s} ry={5 * s} fill="#dc2626" />
          <rect x={opp.x - 15 * s} y={opp.y - 30 * s - 4 * s} width={30 * s} height={8 * s} rx={4 * s} fill="#dc2626" />
        </g>
        );
      })()}

      {/* Target zone */}
      {showTarget && zone && (
        <ellipse cx={zone.x} cy={zone.y} rx={zoneR} ry={zoneR * 0.4} fill="rgba(34,197,94,0.25)" stroke="#22c55e" strokeWidth="3" strokeDasharray="8 4" filter="url(#glow)" />
      )}

      {/* Correct */}
      {result === 'correct' && zone && (
        <g>
          <ellipse cx={zone.x} cy={zone.y} rx={zoneR} ry={zoneR * 0.4} fill="rgba(34,197,94,0.35)" stroke="#22c55e" strokeWidth="3" filter="url(#glow)" />
        </g>
      )}

      {/* Wrong */}
      {result === 'wrong' && tap && (
        <g>
          <circle cx={tap.x} cy={tap.y} r="24" fill="rgba(239,68,68,0.4)" stroke="#ef4444" strokeWidth="3" />
          <text x={tap.x} y={tap.y + 7} textAnchor="middle" fontSize="24" fill="white" fontWeight="bold">✕</text>
        </g>
      )}

      {/* Shot trajectory */}
      {result === 'correct' && ball && zone && (
        <line x1={ball.x} y1={ball.y} x2={zone.x} y2={zone.y} stroke="#CCFF00" strokeWidth="4" strokeDasharray="10 5" opacity="0.9" />
      )}

      {/* Wrong trajectory */}
      {swA && swB && result === 'wrong' && (
        <line x1={swA.x} y1={swA.y} x2={swB.x} y2={swB.y} stroke="#ef4444" strokeWidth="3" strokeDasharray="6 4" opacity="0.5" />
      )}

      {/* Ball shadow */}
      {ball && <ellipse cx={ball.x} cy={ball.y + 12 * ballSc} rx={10 * ballSc} ry={3 * ballSc} fill="rgba(0,0,0,0.3)" />}

      {/* Tennis ball */}
      {ball && (
        <g filter="url(#ballGlow)">
          <circle cx={ball.x} cy={ball.y} r={14 * ballSc} fill="url(#ballG)" filter="url(#shadow)" />
          <path d={`M ${ball.x - 6 * ballSc} ${ball.y - 9 * ballSc} Q ${ball.x} ${ball.y} ${ball.x - 6 * ballSc} ${ball.y + 9 * ballSc}`} stroke="#7a9e00" strokeWidth={1.2 * ballSc} fill="none" />
          <path d={`M ${ball.x + 6 * ballSc} ${ball.y - 9 * ballSc} Q ${ball.x} ${ball.y} ${ball.x + 6 * ballSc} ${ball.y + 9 * ballSc}`} stroke="#7a9e00" strokeWidth={1.2 * ballSc} fill="none" />
        </g>
      )}

      {/* YOUR RACKET + ARM — first person */}
      <g style={racketStyle}>
        <line x1="320" y1={HEIGHT + 40} x2="245" y2={HEIGHT - 75} stroke="#d4a574" strokeWidth="20" strokeLinecap="round" />
        <rect x="232" y={HEIGHT - 86} width="26" height="11" rx="5" fill="#ef4444" />
        <line x1="245" y1={HEIGHT - 80} x2="212" y2={HEIGHT - 130} stroke="#8B4513" strokeWidth="11" strokeLinecap="round" />
        {[0, 9, 18, 27].map((d) => (
          <line key={d} x1={243 - d * 0.8} y1={HEIGHT - 84 - d} x2={247 - d * 0.8} y2={HEIGHT - 84 - d} stroke="#a0764a" strokeWidth="2" opacity="0.5" />
        ))}
        <ellipse cx="198" cy={HEIGHT - 168} rx="36" ry="48" fill="none" stroke="#1f2937" strokeWidth="5.5" transform={`rotate(-10, 198, ${HEIGHT - 168})`} />
        <ellipse cx="198" cy={HEIGHT - 168} rx="32" ry="44" fill="rgba(0,0,0,0.03)" stroke="#374151" strokeWidth="1.5" transform={`rotate(-10, 198, ${HEIGHT - 168})`} />
        {[-22, -13, -4, 5, 14, 22].map((dx) => (
          <line key={`v${dx}`} x1={198 + dx} y1={HEIGHT - 210} x2={198 + dx} y2={HEIGHT - 126} stroke="#9ca3af" strokeWidth="0.6" opacity="0.35" transform={`rotate(-10, 198, ${HEIGHT - 168})`} />
        ))}
        {[-36, -26, -16, -6, 4, 14, 24, 34].map((dy) => (
          <line key={`h${dy}`} x1="164" y1={HEIGHT - 168 + dy} x2="232" y2={HEIGHT - 168 + dy} stroke="#9ca3af" strokeWidth="0.6" opacity="0.35" transform={`rotate(-10, 198, ${HEIGHT - 168})`} />
        ))}
        <ellipse cx="243" cy={HEIGHT - 77} rx="15" ry="11" fill="#d4a574" />
      </g>

      {/* Dim overlay */}
      {dimmed && <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="rgba(0,0,0,0.5)" />}
    </svg>
  );
}

export { toNormCoords, perspectiveScale };
