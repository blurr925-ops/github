import { useCallback } from 'react';

const COURT_WIDTH = 300;
const COURT_HEIGHT = 600;

// Court layout constants (in SVG coords)
const MARGIN_X = 15;
const MARGIN_Y = 30;
const COURT_LEFT = MARGIN_X;
const COURT_RIGHT = COURT_WIDTH - MARGIN_X;
const COURT_TOP = MARGIN_Y;
const COURT_BOTTOM = COURT_HEIGHT - MARGIN_Y;
const COURT_W = COURT_RIGHT - COURT_LEFT;
const COURT_H = COURT_BOTTOM - COURT_TOP;

// Derived lines
const SINGLES_LEFT = COURT_LEFT + COURT_W * 0.1;
const SINGLES_RIGHT = COURT_RIGHT - COURT_W * 0.1;
const NET_Y = COURT_TOP + COURT_H * 0.5;
const SERVICE_NEAR = COURT_TOP + COURT_H * 0.65;
const SERVICE_FAR = COURT_TOP + COURT_H * 0.35;
const CENTER_X = COURT_LEFT + COURT_W * 0.5;

function toSvgX(normX) {
  return COURT_LEFT + normX * COURT_W;
}

function toSvgY(normY) {
  return COURT_TOP + normY * COURT_H;
}

function toNormX(svgX) {
  return (svgX - COURT_LEFT) / COURT_W;
}

function toNormY(svgY) {
  return (svgY - COURT_TOP) / COURT_H;
}

export default function CourtBirdEye({
  ballPosition,
  targetZone,
  showTarget = false,
  onTap,
  result,
  tapPosition,
}) {
  const handleClick = useCallback(
    (e) => {
      if (!onTap) return;
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const scaleX = COURT_WIDTH / rect.width;
      const scaleY = COURT_HEIGHT / rect.height;
      const svgX = (e.clientX - rect.left) * scaleX;
      const svgY = (e.clientY - rect.top) * scaleY;
      const normX = Math.max(0, Math.min(1, toNormX(svgX)));
      const normY = Math.max(0, Math.min(1, toNormY(svgY)));
      onTap({ x: normX, y: normY });
    },
    [onTap]
  );

  const ballSvgX = ballPosition ? toSvgX(ballPosition.x) : 0;
  const ballSvgY = ballPosition ? toSvgY(ballPosition.y) : 0;

  const zoneSvgX = targetZone ? toSvgX(targetZone.x) : 0;
  const zoneSvgY = targetZone ? toSvgY(targetZone.y) : 0;
  const zoneSvgRx = targetZone ? targetZone.radius * COURT_W : 0;
  const zoneSvgRy = targetZone ? targetZone.radius * COURT_W * 2 : 0; // scale for 1:2 aspect

  const tapSvgX = tapPosition ? toSvgX(tapPosition.x) : 0;
  const tapSvgY = tapPosition ? toSvgY(tapPosition.y) : 0;

  return (
    <svg
      viewBox={`0 0 ${COURT_WIDTH} ${COURT_HEIGHT}`}
      className="w-full max-w-sm mx-auto rounded-xl overflow-hidden touch-none select-none"
      onClick={handleClick}
      style={{ cursor: onTap ? 'crosshair' : 'default' }}
    >
      <defs>
        <filter id="greenGlow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="ballShadow">
          <feDropShadow dx="1" dy="1" stdDeviation="1.5" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Background */}
      <rect x="0" y="0" width={COURT_WIDTH} height={COURT_HEIGHT} fill="#1a5c2a" />

      {/* Doubles court area */}
      <rect
        x={COURT_LEFT}
        y={COURT_TOP}
        width={COURT_W}
        height={COURT_H}
        fill="#1e7a35"
      />

      {/* Service boxes - slightly lighter */}
      <rect
        x={SINGLES_LEFT}
        y={SERVICE_FAR}
        width={(SINGLES_RIGHT - SINGLES_LEFT) / 2}
        height={SERVICE_NEAR - SERVICE_FAR}
        fill="#22883d"
      />
      <rect
        x={CENTER_X}
        y={SERVICE_FAR}
        width={(SINGLES_RIGHT - SINGLES_LEFT) / 2}
        height={SERVICE_NEAR - SERVICE_FAR}
        fill="#22883d"
      />

      {/* Court lines - white */}
      {/* Baselines */}
      <line x1={COURT_LEFT} y1={COURT_TOP} x2={COURT_RIGHT} y2={COURT_TOP} stroke="white" strokeWidth="2" />
      <line x1={COURT_LEFT} y1={COURT_BOTTOM} x2={COURT_RIGHT} y2={COURT_BOTTOM} stroke="white" strokeWidth="2" />

      {/* Doubles sidelines */}
      <line x1={COURT_LEFT} y1={COURT_TOP} x2={COURT_LEFT} y2={COURT_BOTTOM} stroke="white" strokeWidth="2" />
      <line x1={COURT_RIGHT} y1={COURT_TOP} x2={COURT_RIGHT} y2={COURT_BOTTOM} stroke="white" strokeWidth="2" />

      {/* Singles sidelines */}
      <line x1={SINGLES_LEFT} y1={COURT_TOP} x2={SINGLES_LEFT} y2={COURT_BOTTOM} stroke="white" strokeWidth="1.5" />
      <line x1={SINGLES_RIGHT} y1={COURT_TOP} x2={SINGLES_RIGHT} y2={COURT_BOTTOM} stroke="white" strokeWidth="1.5" />

      {/* Service lines */}
      <line x1={SINGLES_LEFT} y1={SERVICE_FAR} x2={SINGLES_RIGHT} y2={SERVICE_FAR} stroke="white" strokeWidth="1.5" />
      <line x1={SINGLES_LEFT} y1={SERVICE_NEAR} x2={SINGLES_RIGHT} y2={SERVICE_NEAR} stroke="white" strokeWidth="1.5" />

      {/* Center service line */}
      <line x1={CENTER_X} y1={SERVICE_FAR} x2={CENTER_X} y2={SERVICE_NEAR} stroke="white" strokeWidth="1.5" />

      {/* Center marks */}
      <line x1={CENTER_X} y1={COURT_TOP} x2={CENTER_X} y2={COURT_TOP + 8} stroke="white" strokeWidth="1.5" />
      <line x1={CENTER_X} y1={COURT_BOTTOM - 8} x2={CENTER_X} y2={COURT_BOTTOM} stroke="white" strokeWidth="1.5" />

      {/* Net */}
      <line x1={COURT_LEFT - 5} y1={NET_Y} x2={COURT_RIGHT + 5} y2={NET_Y} stroke="white" strokeWidth="2.5" strokeDasharray="4 3" />
      {/* Net posts */}
      <circle cx={COURT_LEFT - 5} cy={NET_Y} r="3" fill="white" />
      <circle cx={COURT_RIGHT + 5} cy={NET_Y} r="3" fill="white" />

      {/* Target zone */}
      {showTarget && targetZone && (
        <ellipse
          cx={zoneSvgX}
          cy={zoneSvgY}
          rx={zoneSvgRx}
          ry={zoneSvgRy}
          fill="rgba(34, 197, 94, 0.25)"
          stroke="#22c55e"
          strokeWidth="2"
          strokeDasharray="6 3"
          filter="url(#greenGlow)"
        />
      )}

      {/* Correct result - green highlight with checkmark */}
      {result === 'correct' && targetZone && (
        <g>
          <ellipse
            cx={zoneSvgX}
            cy={zoneSvgY}
            rx={zoneSvgRx}
            ry={zoneSvgRy}
            fill="rgba(34, 197, 94, 0.35)"
            stroke="#22c55e"
            strokeWidth="3"
            filter="url(#greenGlow)"
          />
          <text
            x={zoneSvgX}
            y={zoneSvgY + 6}
            textAnchor="middle"
            fontSize="22"
            fill="white"
            fontWeight="bold"
          >
            ✓
          </text>
        </g>
      )}

      {/* Wrong result - orange highlight where tapped */}
      {result === 'wrong' && tapPosition && (
        <g>
          <circle
            cx={tapSvgX}
            cy={tapSvgY}
            r="14"
            fill="rgba(249, 115, 22, 0.4)"
            stroke="#f97316"
            strokeWidth="2.5"
          />
          <text
            x={tapSvgX}
            y={tapSvgY + 5}
            textAnchor="middle"
            fontSize="16"
            fill="white"
            fontWeight="bold"
          >
            ✕
          </text>
        </g>
      )}

      {/* Tennis ball */}
      {ballPosition && (
        <g filter="url(#ballShadow)">
          <circle cx={ballSvgX} cy={ballSvgY} r="8" fill="#CCFF00" />
          <path
            d={`M ${ballSvgX - 4} ${ballSvgY - 6} Q ${ballSvgX} ${ballSvgY} ${ballSvgX - 4} ${ballSvgY + 6}`}
            stroke="#a3cc00"
            strokeWidth="1"
            fill="none"
          />
          <path
            d={`M ${ballSvgX + 4} ${ballSvgY - 6} Q ${ballSvgX} ${ballSvgY} ${ballSvgX + 4} ${ballSvgY + 6}`}
            stroke="#a3cc00"
            strokeWidth="1"
            fill="none"
          />
        </g>
      )}

      {/* "You" label near bottom */}
      <text x={CENTER_X} y={COURT_BOTTOM + 20} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.5)" fontWeight="500">
        YOU
      </text>
      {/* Opponent label near top */}
      <text x={CENTER_X} y={COURT_TOP - 12} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.5)" fontWeight="500">
        OPPONENT
      </text>
    </svg>
  );
}
