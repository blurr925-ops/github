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
// Perspective-aware: zones at the far end of the court (low y) get a
// larger effective radius since they appear much smaller on screen.
export function isInZone(point, zone) {
  // Reject taps on the player's side of the net — shots must land on opponent's half
  if (point.y > 0.5) return false;
  // Enforce depth accuracy — a "deep" zone can't accept taps inside the service box
  // Max 0.18 difference in y (depth) between tap and target
  if (Math.abs(point.y - zone.y) > 0.18) return false;
  const dx = point.x - zone.x;
  const dy = point.y - zone.y;
  // Scale radius inversely with perspective compression, capped at 0.30
  const perspScale = 0.28 + 0.72 * zone.y;
  const effectiveRadius = Math.min(zone.radius / perspScale, 0.30);
  return Math.sqrt(dx * dx + dy * dy) <= effectiveRadius;
}

export function getDistanceToZone(point, zone) {
  const dx = point.x - zone.x;
  const dy = point.y - zone.y;
  return Math.sqrt(dx * dx + dy * dy);
}
