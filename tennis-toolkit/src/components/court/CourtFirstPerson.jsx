import { useCallback } from 'react';

const WIDTH = 360;
const HEIGHT = 640;

// TV broadcast angle — elevated camera behind baseline, full court visible
// Like watching from the stands behind the player
const COURT = {
  nearLeft: -10,
  nearRight: 370,
  nearY: 510,        // near baseline visible
  farLeft: 130,
  farRight: 230,
  farY: 135,         // far baseline visible
  netNearLeft: 40,
  netNearRight: 320,
  netY: 295,         // net in the middle
  serviceNearLeft: 10,
  serviceNearRight: 350,
  serviceNearY: 410,
  serviceFarLeft: 100,
  serviceFarRight: 260,
  serviceFarY: 210,
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
  return 0.28 + 0.72 * normY;
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
  shotType = null,       // 'topspin' | 'slice' | 'approach' — shows spin/height cues
  ballMoving = false,    // true during animations — shows speed trail
  ballFrom = null,       // {x, y} normalized — where ball came from, for trail direction
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

  // Player position
  const pPos = playerPos || ballPosition;
  const playerBaseX = WIDTH / 2;
  const playerNormY = pPos
    ? Math.min(1.1, pPos.y + 0.1)
    : 1.1;
  const playerSvgY = COURT.farY + (COURT.nearY - COURT.farY) * playerNormY;
  const playerSvgX = pPos
    ? interpX(COURT.nearLeft, COURT.farLeft, COURT.nearRight, COURT.farRight, playerNormY, pPos.x)
    : playerBaseX;
  const playerScale = perspectiveScale(playerNormY) * 1.8;

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
          <stop offset="0%" stopColor="#6CB4EE" />
          <stop offset="100%" stopColor="#A8D8EA" />
        </linearGradient>
        <linearGradient id="court" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a5276" />
          <stop offset="100%" stopColor="#1e6091" />
        </linearGradient>
        <radialGradient id="ballG" cx="0.35" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#f0ff44" />
          <stop offset="100%" stopColor="#a3cc00" />
        </radialGradient>
        <linearGradient id="tealShirt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id="redShirt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect x="0" y="0" width={WIDTH} height={COURT.farY + 5} fill="url(#sky)" />

      {/* Stadium back wall */}
      <rect x="0" y={COURT.farY - 55} width={WIDTH} height="65" fill="#2856A3" />
      {/* Branding strip */}
      <rect x="0" y={COURT.farY - 28} width={WIDTH} height="16" fill="#1a4080" />
      {/* Crowd rows */}
      {[0, 1, 2].map((row) => (
        <g key={row}>
          {Array.from({ length: 24 }).map((_, i) => (
            <circle
              key={i}
              cx={15 * i + 4}
              cy={COURT.farY - 34 - row * 7 + (i % 2) * 2}
              r={2 - row * 0.3}
              fill={['#ef4444', '#3b82f6', '#f59e0b', '#22c55e', '#a855f7', '#f8fafc', '#fb923c', '#ec4899'][i % 8]}
              opacity={0.45 - row * 0.08}
            />
          ))}
        </g>
      ))}

      {/* Green surround */}
      <rect x="0" y={COURT.farY} width={WIDTH} height={HEIGHT - COURT.farY} fill="#2d8c4e" />

      {/* Court surface — blue hard court */}
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
      <rect x={COURT.netNearLeft - 10} y={COURT.netY - 4} width={COURT.netNearRight - COURT.netNearLeft + 20} height="4" fill="white" opacity="0.95" />
      <rect x={COURT.netNearLeft - 5} y={COURT.netY} width={COURT.netNearRight - COURT.netNearLeft + 10} height="10" fill="rgba(255,255,255,0.1)" />
      <line x1={COURT.netNearLeft - 10} y1={COURT.netY + 10} x2={COURT.netNearRight + 10} y2={COURT.netY + 10} stroke="white" strokeWidth="1" opacity="0.3" />
      {/* Net posts */}
      <rect x={COURT.netNearLeft - 10} y={COURT.netY - 8} width="4" height="22" rx="2" fill="#c0c0c0" />
      <rect x={COURT.netNearRight + 6} y={COURT.netY - 8} width="4" height="22" rx="2" fill="#c0c0c0" />

      {/* OPPONENT — cartoon style, red outfit, facing us */}
      {opp && (() => {
        const s = oppSc * 1.8;
        const ox = opp.x;
        const oy = opp.y;
        return (
        <g>
          {/* Ground shadow */}
          <ellipse cx={ox} cy={oy + 32 * s} rx={16 * s} ry={5 * s} fill="rgba(0,0,0,0.25)" />
          {/* Shoes — red with white sole */}
          <ellipse cx={ox - 7 * s} cy={oy + 30 * s} rx={7 * s} ry={3.5 * s} fill="#ef4444" />
          <ellipse cx={ox - 7 * s} cy={oy + 31.5 * s} rx={7 * s} ry={2 * s} fill="#f8fafc" />
          <ellipse cx={ox + 7 * s} cy={oy + 30 * s} rx={7 * s} ry={3.5 * s} fill="#ef4444" />
          <ellipse cx={ox + 7 * s} cy={oy + 31.5 * s} rx={7 * s} ry={2 * s} fill="#f8fafc" />
          {/* White socks */}
          <line x1={ox - 6 * s} y1={oy + 24 * s} x2={ox - 7 * s} y2={oy + 28 * s} stroke="#f8fafc" strokeWidth={5 * s} strokeLinecap="round" />
          <line x1={ox + 6 * s} y1={oy + 24 * s} x2={ox + 7 * s} y2={oy + 28 * s} stroke="#f8fafc" strokeWidth={5 * s} strokeLinecap="round" />
          {/* Legs — skin tone */}
          <line x1={ox - 5 * s} y1={oy + 17 * s} x2={ox - 6 * s} y2={oy + 25 * s} stroke="#e8b896" strokeWidth={5 * s} strokeLinecap="round" />
          <line x1={ox + 5 * s} y1={oy + 17 * s} x2={ox + 6 * s} y2={oy + 25 * s} stroke="#e8b896" strokeWidth={5 * s} strokeLinecap="round" />
          {/* Shorts — dark red */}
          <path d={`M ${ox - 12 * s} ${oy + 10 * s} Q ${ox} ${oy + 20 * s} ${ox + 12 * s} ${oy + 10 * s} L ${ox + 10 * s} ${oy + 18 * s} Q ${ox} ${oy + 22 * s} ${ox - 10 * s} ${oy + 18 * s} Z`} fill="#b91c1c" />
          {/* Body — red polo shirt */}
          <path d={`M ${ox - 13 * s} ${oy - 8 * s} Q ${ox - 14 * s} ${oy + 12 * s} ${ox - 12 * s} ${oy + 12 * s} Q ${ox} ${oy + 15 * s} ${ox + 12 * s} ${oy + 12 * s} Q ${ox + 14 * s} ${oy + 12 * s} ${ox + 13 * s} ${oy - 8 * s} Z`} fill="#ef4444" />
          {/* White collar */}
          <path d={`M ${ox - 8 * s} ${oy - 8 * s} Q ${ox} ${oy - 5 * s} ${ox + 8 * s} ${oy - 8 * s} Q ${ox} ${oy - 11 * s} ${ox - 8 * s} ${oy - 8 * s}`} fill="#f8fafc" />
          {/* White belt stripe */}
          <rect x={ox - 12 * s} y={oy + 9 * s} width={24 * s} height={3 * s} rx={1.5 * s} fill="#f8fafc" opacity="0.6" />
          {/* Left arm (their left = our right) — free hand */}
          <line x1={ox + 13 * s} y1={oy - 2 * s} x2={ox + 22 * s} y2={oy + 10 * s} stroke="#e8b896" strokeWidth={4.5 * s} strokeLinecap="round" />
          {/* Red wristband — left */}
          <line x1={ox + 21 * s} y1={oy + 8.5 * s} x2={ox + 23 * s} y2={oy + 11.5 * s} stroke="#b91c1c" strokeWidth={3 * s} strokeLinecap="round" />
          {/* Right arm (their right = our left) — racket hand */}
          <line x1={ox - 13 * s} y1={oy - 2 * s} x2={ox - 24 * s} y2={oy - 10 * s} stroke="#e8b896" strokeWidth={4.5 * s} strokeLinecap="round" />
          {/* Red wristband — right */}
          <line x1={ox - 22 * s} y1={oy - 8.5 * s} x2={ox - 25 * s} y2={oy - 11 * s} stroke="#b91c1c" strokeWidth={3 * s} strokeLinecap="round" />
          {/* Racket handle */}
          <line x1={ox - 24 * s} y1={oy - 10 * s} x2={ox - 30 * s} y2={oy - 22 * s} stroke="#c08040" strokeWidth={2.5 * s} strokeLinecap="round" />
          {/* Racket grip tape */}
          <line x1={ox - 24 * s} y1={oy - 10 * s} x2={ox - 26 * s} y2={oy - 14 * s} stroke="#f8fafc" strokeWidth={3 * s} strokeLinecap="round" />
          {/* Racket head — with strings */}
          <ellipse cx={ox - 33 * s} cy={oy - 28 * s} rx={6.5 * s} ry={10 * s} fill="rgba(255,255,255,0.15)" stroke="#1e293b" strokeWidth={2 * s} transform={`rotate(20, ${ox - 33 * s}, ${oy - 28 * s})`} />
          {/* String pattern (simplified) */}
          <line x1={ox - 33 * s} y1={oy - 36 * s} x2={ox - 33 * s} y2={oy - 20 * s} stroke="#f8fafc" strokeWidth={0.5 * s} opacity="0.4" />
          <line x1={ox - 38 * s} y1={oy - 28 * s} x2={ox - 28 * s} y2={oy - 28 * s} stroke="#f8fafc" strokeWidth={0.5 * s} opacity="0.4" />
          {/* Head — bigger for cartoon feel */}
          <circle cx={ox} cy={oy - 20 * s} r={13 * s} fill="#e8b896" />
          {/* Ears */}
          <ellipse cx={ox - 12 * s} cy={oy - 19 * s} rx={3 * s} ry={4 * s} fill="#daa06d" />
          <ellipse cx={ox + 12 * s} cy={oy - 19 * s} rx={3 * s} ry={4 * s} fill="#daa06d" />
          {/* Hair — styled brown */}
          <ellipse cx={ox} cy={oy - 27 * s} rx={14 * s} ry={9 * s} fill="#6b3a2a" />
          <ellipse cx={ox - 3 * s} cy={oy - 32 * s} rx={8 * s} ry={5 * s} fill="#7a4433" />
          <ellipse cx={ox + 4 * s} cy={oy - 31 * s} rx={6 * s} ry={4 * s} fill="#6b3a2a" />
          {/* Red headband */}
          <rect x={ox - 13 * s} y={oy - 27 * s} width={26 * s} height={4 * s} rx={2 * s} fill="#ef4444" />
          {/* Eyes — big cartoon eyes */}
          <ellipse cx={ox - 4 * s} cy={oy - 18 * s} rx={3.5 * s} ry={4 * s} fill="#f8fafc" />
          <ellipse cx={ox + 4 * s} cy={oy - 18 * s} rx={3.5 * s} ry={4 * s} fill="#f8fafc" />
          <circle cx={ox - 3.5 * s} cy={oy - 17.5 * s} r={2 * s} fill="#1a3a5c" />
          <circle cx={ox + 4.5 * s} cy={oy - 17.5 * s} r={2 * s} fill="#1a3a5c" />
          {/* Eye highlights */}
          <circle cx={ox - 2.5 * s} cy={oy - 18.5 * s} r={0.7 * s} fill="#f8fafc" />
          <circle cx={ox + 5.5 * s} cy={oy - 18.5 * s} r={0.7 * s} fill="#f8fafc" />
          {/* Eyebrows */}
          <line x1={ox - 6 * s} y1={oy - 22 * s} x2={ox - 2 * s} y2={oy - 23 * s} stroke="#4a2a1a" strokeWidth={1.5 * s} strokeLinecap="round" />
          <line x1={ox + 2 * s} y1={oy - 23 * s} x2={ox + 6 * s} y2={oy - 22 * s} stroke="#4a2a1a" strokeWidth={1.5 * s} strokeLinecap="round" />
          {/* Nose */}
          <ellipse cx={ox} cy={oy - 14.5 * s} rx={1.5 * s} ry={1 * s} fill="#daa06d" />
          {/* Mouth — determined smile */}
          <path d={`M ${ox - 4 * s} ${oy - 12 * s} Q ${ox} ${oy - 10 * s} ${ox + 4 * s} ${oy - 12 * s}`} stroke="#c0705a" strokeWidth={1.2 * s} fill="none" strokeLinecap="round" />
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

      {/* Speed trail — motion lines behind ball when moving */}
      {ball && ballMoving && ballFrom && (() => {
        const from = toSvgCoords(ballFrom.x, ballFrom.y);
        const dx = ball.x - from.x;
        const dy = ball.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 5) return null;
        const ux = dx / len;
        const uy = dy / len;
        // Perpendicular for spread
        const px = -uy;
        const py = ux;
        const trailLen = Math.min(len * 0.4, 50);
        return (
          <g opacity="0.5">
            {[0, -1, 1].map((offset) => {
              const spread = offset * 4 * ballSc;
              const sx = ball.x - ux * trailLen + px * spread;
              const sy = ball.y - uy * trailLen + py * spread;
              return (
                <line
                  key={offset}
                  x1={sx} y1={sy}
                  x2={ball.x + px * spread * 0.3} y2={ball.y + py * spread * 0.3}
                  stroke="#CCFF00"
                  strokeWidth={2 * ballSc}
                  strokeLinecap="round"
                  opacity={offset === 0 ? 0.6 : 0.3}
                />
              );
            })}
          </g>
        );
      })()}

      {/* Ball shadow — height varies by shot type */}
      {ball && (() => {
        // Topspin = high bounce (shadow far), slice = low skid (shadow close), default = medium
        const heightGap = shotType === 'topspin' ? 22 : shotType === 'slice' ? 5 : 10;
        const shadowSize = shotType === 'topspin' ? 7 : shotType === 'slice' ? 10 : 9;
        return (
          <ellipse
            cx={ball.x}
            cy={ball.y + heightGap * ballSc}
            rx={shadowSize * ballSc}
            ry={3 * ballSc}
            fill="rgba(0,0,0,0.3)"
          />
        );
      })()}

      {/* Tennis ball */}
      {ball && (
        <g filter="url(#ballGlow)">
          <circle cx={ball.x} cy={ball.y} r={12 * ballSc} fill="url(#ballG)" filter="url(#shadow)" />
          {/* Seam lines */}
          <path d={`M ${ball.x - 5 * ballSc} ${ball.y - 8 * ballSc} Q ${ball.x} ${ball.y} ${ball.x - 5 * ballSc} ${ball.y + 8 * ballSc}`} stroke="#7a9e00" strokeWidth={1 * ballSc} fill="none" />
          <path d={`M ${ball.x + 5 * ballSc} ${ball.y - 8 * ballSc} Q ${ball.x} ${ball.y} ${ball.x + 5 * ballSc} ${ball.y + 8 * ballSc}`} stroke="#7a9e00" strokeWidth={1 * ballSc} fill="none" />
        </g>
      )}

      {/* Spin indicator — arrows around ball */}
      {ball && shotType && shotType !== 'approach' && (() => {
        const r = 16 * ballSc;
        if (shotType === 'topspin') {
          // Forward spin — curved arrow going over the top (clockwise from viewer)
          return (
            <g opacity="0.7">
              <path
                d={`M ${ball.x - r * 0.6} ${ball.y - r * 0.8}
                    A ${r * 0.8} ${r * 0.8} 0 0 1 ${ball.x + r * 0.6} ${ball.y - r * 0.8}`}
                stroke="#ff6b35" strokeWidth={2 * ballSc} fill="none"
                strokeLinecap="round"
              />
              {/* Arrowhead */}
              <polygon
                points={`${ball.x + r * 0.6},${ball.y - r * 0.8}
                         ${ball.x + r * 0.3},${ball.y - r * 1.1}
                         ${ball.x + r * 0.9},${ball.y - r * 0.6}`}
                fill="#ff6b35"
              />
            </g>
          );
        }
        // Slice — backspin arrow going under (counter-clockwise)
        return (
          <g opacity="0.7">
            <path
              d={`M ${ball.x + r * 0.6} ${ball.y + r * 0.8}
                  A ${r * 0.8} ${r * 0.8} 0 0 1 ${ball.x - r * 0.6} ${ball.y + r * 0.8}`}
              stroke="#38bdf8" strokeWidth={2 * ballSc} fill="none"
              strokeLinecap="round"
            />
            {/* Arrowhead */}
            <polygon
              points={`${ball.x - r * 0.6},${ball.y + r * 0.8}
                       ${ball.x - r * 0.3},${ball.y + r * 1.1}
                       ${ball.x - r * 0.9},${ball.y + r * 0.6}`}
              fill="#38bdf8"
            />
          </g>
        );
      })()}

      {/* YOUR PLAYER — cartoon style, teal outfit, back view */}
      {(() => {
        const px = playerSvgX;
        const py = playerSvgY;
        const s = playerScale;
        return (
        <g style={{
          transition: 'transform 0.35s ease-out',
          transform: `translate(${px}px, ${py}px)`,
        }}>
          {/* Ground shadow */}
          <ellipse cx={0} cy={48 * s} rx={22 * s} ry={7 * s} fill="rgba(0,0,0,0.25)" />
          {/* Shoes — cyan with white sole and orange accent */}
          <ellipse cx={-10 * s} cy={46 * s} rx={8 * s} ry={4 * s} fill="#22d3ee" />
          <ellipse cx={-10 * s} cy={47.5 * s} rx={8 * s} ry={2.5 * s} fill="#f8fafc" />
          <ellipse cx={-10 * s} cy={48.5 * s} rx={7 * s} ry={1.2 * s} fill="#f59e0b" />
          <ellipse cx={10 * s} cy={46 * s} rx={8 * s} ry={4 * s} fill="#22d3ee" />
          <ellipse cx={10 * s} cy={47.5 * s} rx={8 * s} ry={2.5 * s} fill="#f8fafc" />
          <ellipse cx={10 * s} cy={48.5 * s} rx={7 * s} ry={1.2 * s} fill="#f59e0b" />
          {/* White socks */}
          <line x1={-9 * s} y1={38 * s} x2={-10 * s} y2={43 * s} stroke="#f8fafc" strokeWidth={6 * s} strokeLinecap="round" />
          <line x1={9 * s} y1={38 * s} x2={10 * s} y2={43 * s} stroke="#f8fafc" strokeWidth={6 * s} strokeLinecap="round" />
          {/* Legs — skin tone */}
          <line x1={-7 * s} y1={26 * s} x2={-9 * s} y2={39 * s} stroke="#e8b896" strokeWidth={6 * s} strokeLinecap="round" />
          <line x1={7 * s} y1={26 * s} x2={9 * s} y2={39 * s} stroke="#e8b896" strokeWidth={6 * s} strokeLinecap="round" />
          {/* Shorts — dark teal */}
          <path d={`M ${-14 * s} ${16 * s} Q ${0} ${14 * s} ${14 * s} ${16 * s} L ${12 * s} ${28 * s} Q ${0} ${31 * s} ${-12 * s} ${28 * s} Z`} fill="#0e7490" />
          {/* Cyan trim on shorts */}
          <path d={`M ${-12 * s} ${27 * s} Q ${0} ${30 * s} ${12 * s} ${27 * s}`} stroke="#22d3ee" strokeWidth={1.5 * s} fill="none" />
          {/* Body — teal polo shirt (back view) */}
          <path d={`M ${-15 * s} ${-10 * s} Q ${-17 * s} ${10 * s} ${-14 * s} ${18 * s} Q ${0} ${21 * s} ${14 * s} ${18 * s} Q ${17 * s} ${10 * s} ${15 * s} ${-10 * s} Z`} fill="#0891b2" />
          {/* Shirt side seams */}
          <line x1={-15 * s} y1={-5 * s} x2={-14 * s} y2={16 * s} stroke="#0e7490" strokeWidth={0.8 * s} opacity="0.4" />
          <line x1={15 * s} y1={-5 * s} x2={14 * s} y2={16 * s} stroke="#0e7490" strokeWidth={0.8 * s} opacity="0.4" />
          {/* White collar (back view) */}
          <path d={`M ${-10 * s} ${-10 * s} Q ${0} ${-8 * s} ${10 * s} ${-10 * s}`} stroke="#f8fafc" strokeWidth={3 * s} fill="none" strokeLinecap="round" />
          {/* White belt stripe */}
          <rect x={-14 * s} y={15 * s} width={28 * s} height={3 * s} rx={1.5 * s} fill="#f8fafc" opacity="0.5" />
          {/* Left arm — skin + teal sleeve + wristband */}
          <line x1={-15 * s} y1={-2 * s} x2={-20 * s} y2={6 * s} stroke="#0891b2" strokeWidth={6.5 * s} strokeLinecap="round" />
          <line x1={-20 * s} y1={6 * s} x2={-28 * s} y2={18 * s} stroke="#e8b896" strokeWidth={5.5 * s} strokeLinecap="round" />
          {/* Teal wristband — left */}
          <line x1={-27 * s} y1={16 * s} x2={-29 * s} y2={19 * s} stroke="#0e7490" strokeWidth={3.5 * s} strokeLinecap="round" />
          {/* Right arm + racket — with swing animation */}
          <g style={{
            transformOrigin: `${15 * s}px ${-2 * s}px`,
            transition: 'transform 0.12s ease-out',
            transform: racketSwing ? 'rotate(-50deg)' : 'rotate(0deg)',
          }}>
            {/* Teal sleeve */}
            <line x1={15 * s} y1={-2 * s} x2={20 * s} y2={6 * s} stroke="#0891b2" strokeWidth={6.5 * s} strokeLinecap="round" />
            {/* Arm skin */}
            <line x1={20 * s} y1={6 * s} x2={32 * s} y2={-10 * s} stroke="#e8b896" strokeWidth={5.5 * s} strokeLinecap="round" />
            {/* Teal wristband — right */}
            <line x1={30 * s} y1={-8 * s} x2={33 * s} y2={-12 * s} stroke="#0e7490" strokeWidth={3.5 * s} strokeLinecap="round" />
            {/* Racket handle — wooden/gold */}
            <line x1={33 * s} y1={-12 * s} x2={42 * s} y2={-28 * s} stroke="#c08040" strokeWidth={3 * s} strokeLinecap="round" />
            {/* Grip tape */}
            <line x1={33 * s} y1={-12 * s} x2={36 * s} y2={-17 * s} stroke="#f8fafc" strokeWidth={3.5 * s} strokeLinecap="round" />
            {/* Racket head — with strings */}
            <ellipse cx={46 * s} cy={-38 * s} rx={10 * s} ry={16 * s} fill="rgba(255,255,255,0.1)" stroke="#1a3a5c" strokeWidth={2.5 * s} transform={`rotate(-15, ${46 * s}, ${-38 * s})`} />
            {/* String lines */}
            <line x1={46 * s} y1={-50 * s} x2={46 * s} y2={-26 * s} stroke="#f8fafc" strokeWidth={0.5 * s} opacity="0.35" />
            <line x1={43 * s} y1={-49 * s} x2={43 * s} y2={-27 * s} stroke="#f8fafc" strokeWidth={0.5 * s} opacity="0.25" />
            <line x1={49 * s} y1={-49 * s} x2={49 * s} y2={-27 * s} stroke="#f8fafc" strokeWidth={0.5 * s} opacity="0.25" />
            <line x1={38 * s} y1={-38 * s} x2={54 * s} y2={-38 * s} stroke="#f8fafc" strokeWidth={0.5 * s} opacity="0.35" />
            <line x1={38 * s} y1={-42 * s} x2={54 * s} y2={-42 * s} stroke="#f8fafc" strokeWidth={0.5 * s} opacity="0.25" />
            <line x1={38 * s} y1={-34 * s} x2={54 * s} y2={-34 * s} stroke="#f8fafc" strokeWidth={0.5 * s} opacity="0.25" />
          </g>
          {/* Head — bigger for cartoon proportions (back view) */}
          <circle cx={0} cy={-26 * s} r={16 * s} fill="#e8b896" />
          {/* Ears */}
          <ellipse cx={-15 * s} cy={-24 * s} rx={3.5 * s} ry={4.5 * s} fill="#daa06d" />
          <ellipse cx={15 * s} cy={-24 * s} rx={3.5 * s} ry={4.5 * s} fill="#daa06d" />
          {/* Hair — styled brown, back view, messy/spiky */}
          <ellipse cx={0} cy={-32 * s} rx={16 * s} ry={11 * s} fill="#6b3a2a" />
          {/* Hair spikes on top */}
          <ellipse cx={-5 * s} cy={-40 * s} rx={5 * s} ry={6 * s} fill="#7a4433" />
          <ellipse cx={4 * s} cy={-39 * s} rx={6 * s} ry={5 * s} fill="#6b3a2a" />
          <ellipse cx={-2 * s} cy={-42 * s} rx={4 * s} ry={5 * s} fill="#8b5a3a" />
          {/* Hair sides */}
          <ellipse cx={-13 * s} cy={-30 * s} rx={5 * s} ry={8 * s} fill="#6b3a2a" />
          <ellipse cx={13 * s} cy={-30 * s} rx={5 * s} ry={8 * s} fill="#6b3a2a" />
          {/* Teal headband */}
          <rect x={-16 * s} y={-32 * s} width={32 * s} height={4.5 * s} rx={2 * s} fill="#0891b2" />
          {/* Headband knot at back */}
          <circle cx={0} cy={-30 * s} r={3 * s} fill="#0e7490" />
        </g>
        );
      })()}

      {/* Dim overlay */}
      {dimmed && <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="rgba(0,0,0,0.5)" />}
    </svg>
  );
}

export { toNormCoords, perspectiveScale };
