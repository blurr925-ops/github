// Court dimensions in normalized coordinates (0-1)
// Based on standard tennis court proportions
export const COURT = {
  // Outer bounds
  width: 1,
  height: 1,

  // Singles sidelines (relative to court width)
  singlesLeft: 0.15,
  singlesRight: 0.85,

  // Net position (relative to court height)
  netY: 0.5,

  // Service boxes
  serviceLineNear: 0.65,
  serviceLineFar: 0.35,
  centerServiceLine: 0.5,

  // Baselines
  baselineNear: 0.85,
  baselineFar: 0.15,
};

export function isInZone(point, zone) {
  const dx = point.x - zone.x;
  const dy = point.y - zone.y;
  return Math.sqrt(dx * dx + dy * dy) <= zone.radius;
}

export function getDistanceToZone(point, zone) {
  const dx = point.x - zone.x;
  const dy = point.y - zone.y;
  return Math.sqrt(dx * dx + dy * dy);
}
