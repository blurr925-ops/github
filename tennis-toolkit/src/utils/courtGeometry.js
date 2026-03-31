// Court dimensions in normalized coordinates (0-1)
export const COURT = {
  width: 1,
  height: 1,
  singlesLeft: 0.15,
  singlesRight: 0.85,
  netY: 0.5,
  serviceLineNear: 0.65,
  serviceLineFar: 0.35,
  centerServiceLine: 0.5,
  baselineNear: 0.85,
  baselineFar: 0.15,
};

// Check if a tap point is inside a target zone
// Uses simple circular check - radius is in the same
// normalized coordinate space as x
export function isInZone(point, zone) {
  const dx = point.x - zone.x;
  const dy = point.y - zone.y;
  // Use the larger radius to be forgiving for young players
  return Math.sqrt(dx * dx + dy * dy) <= zone.radius;
}

export function getDistanceToZone(point, zone) {
  const dx = point.x - zone.x;
  const dy = point.y - zone.y;
  return Math.sqrt(dx * dx + dy * dy);
}
