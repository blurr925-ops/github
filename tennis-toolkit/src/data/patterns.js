// Court coordinate system (from player's perspective, behind baseline):
// x: 0 = your left, 1 = your right
// y: 0 = opponent's baseline (far/top), 1 = your baseline (near/bottom)
//
// KEY DEPTHS:
//   Opponent's baseline:    y = 0.0
//   Opponent's service line: y ≈ 0.21
//   Net:                    y ≈ 0.45
//   Your service line:      y ≈ 0.74
//   Your baseline:          y = 1.0
//
// DEPTH RULES:
//   Deep ball (y: 0.82-0.95) → rally cross-court
//   Short ball (y: 0.55-0.73) → attack down the line
//   At net (y: 0.45-0.55) → volley to open court
//
// OPPONENT TRACKING (critical!):
//   Step 1: opponent is where they start (center or context-specific)
//   Step N: opponent is at approximately the x-position you hit to in step N-1
//   The correct zone must send the ball AWAY from the opponent
//
// SHOT DIRECTIONS:
//   From YOUR RIGHT: cross-court → far LEFT (x≈0.2), DTL → far RIGHT (x≈0.8)
//   From YOUR LEFT:  cross-court → far RIGHT (x≈0.8), DTL → far LEFT (x≈0.2)

export const rallies = [

  {
    id: 'rally-and-attack',
    name: 'Rally & Attack',
    category: 'rally',
    description: 'Keep the ball deep cross-court until you get a short ball, then attack down the line!',

    steps: [
      {
        // SETUP: Opponent rallying from center, hits deep to your right
        // DEPTH: y:0.88 = deep → rally cross-court
        // TARGET: Cross-court from right = far left (x:0.2)
        // OPPONENT AFTER: moves to x:0.2 to retrieve
        description: 'Deep ball to your forehand.',
        ballPosition: { x: 0.7, y: 0.88 },
        correctZone: { x: 0.2, y: 0.1, radius: 0.25 },
        correctLabel: 'Deep cross-court!',
        explanation: 'Deep ball = rally cross-court. Patient and smart!',
        wrongExplanation: 'That ball was deep near your baseline — rally it cross-court to the far left!',
        opponentPosition: { x: 0.5, y: 0.08 },
      },
      {
        // SETUP: Opponent is at x:0.2 (ran to get your cross-court). Hits a short ball to your right.
        // From x:0.2, cross-court goes to your right → ball at x:0.65
        // DEPTH: y:0.62 = short ball → attack DTL
        // TARGET: DTL from right = far right (x:0.8) — AWAY from opponent at x:0.2
        description: 'Short ball to your right!',
        ballPosition: { x: 0.65, y: 0.62 },
        correctZone: { x: 0.8, y: 0.1, radius: 0.25 },
        correctLabel: 'Attack down the line!',
        explanation: 'Short ball = step in and attack down the line!',
        wrongExplanation: 'That was a short ball on your right — attack DOWN THE LINE to the far right!',
        opponentPosition: { x: 0.2, y: 0.1 },
      },
    ],
  },
  {
    id: 'backhand-battle',
    name: 'Backhand Battle',
    category: 'rally',
    description: 'Rally deep on the backhand side, wait for the short ball, then attack down the line!',

    steps: [
      {
        // SETUP: Opponent at center, hits deep to your left
        // DEPTH: y:0.87 = deep → cross-court
        // TARGET: Cross-court from left = far right (x:0.8)
        // OPPONENT AFTER: moves to x:0.8
        description: 'Deep ball to your backhand.',
        ballPosition: { x: 0.3, y: 0.87 },
        correctZone: { x: 0.8, y: 0.1, radius: 0.25 },
        correctLabel: 'Deep cross-court!',
        explanation: 'Backhand cross-court, deep and solid!',
        wrongExplanation: 'Deep ball on your left — rally it cross-court to the far right!',
        opponentPosition: { x: 0.5, y: 0.08 },
      },
      {
        // SETUP: Opponent at x:0.8 (ran right to get your cross-court). Hits short to your left.
        // From x:0.8, cross-court goes to your left → ball at x:0.35
        // DEPTH: y:0.6 = short → attack DTL
        // TARGET: DTL from left = far left (x:0.2) — AWAY from opponent at x:0.8
        description: 'Short ball to your left!',
        ballPosition: { x: 0.35, y: 0.6 },
        correctZone: { x: 0.2, y: 0.1, radius: 0.25 },
        correctLabel: 'Attack down the line!',
        explanation: 'Short ball on your left — attacked down the line into the open court!',
        wrongExplanation: 'Short ball on your left — attack DOWN THE LINE to the far left!',
        opponentPosition: { x: 0.8, y: 0.1 },
      },
    ],
  },
  {
    id: 'return-deep',
    name: 'Return & Recover',
    category: 'return',
    description: 'Return the serve deep cross-court, then punish the weak reply down the line!',

    steps: [
      {
        // SETUP: Opponent served, ball deep to your left
        // DEPTH: y:0.9 = deep → return cross-court
        // TARGET: Cross-court from left = far right (x:0.75)
        // OPPONENT AFTER: moves to x:0.75
        description: 'Deep serve to your backhand.',
        ballPosition: { x: 0.2, y: 0.9 },
        correctZone: { x: 0.75, y: 0.08, radius: 0.28 },
        correctLabel: 'Deep cross-court return!',
        explanation: 'Great return! Deep cross-court puts the server under pressure.',
        wrongExplanation: 'On the return, go DEEP CROSS-COURT — from your left, aim far right!',
        opponentPosition: { x: 0.5, y: 0.06 },
      },
      {
        // SETUP: Opponent at x:0.75 (chased your return). Hits weak short ball to your left.
        // From x:0.75, cross-court goes to your left → ball at x:0.35
        // DEPTH: y:0.6 = short → attack DTL
        // TARGET: DTL from left = far left (x:0.2) — AWAY from opponent at x:0.75
        description: 'Weak short reply to your left.',
        ballPosition: { x: 0.35, y: 0.6 },
        correctZone: { x: 0.2, y: 0.1, radius: 0.25 },
        correctLabel: 'Attack down the line!',
        explanation: 'Return deep, wait for the short ball, attack down the line!',
        wrongExplanation: 'Short ball on your left — attack DOWN THE LINE to the far left!',
        opponentPosition: { x: 0.75, y: 0.1 },
      },
    ],
  },


  {
    id: 'approach-and-volley',
    name: 'Approach & Volley',
    category: 'attack',
    description: 'Hit an approach shot down the line on a short ball, rush the net, and finish with a volley!',

    steps: [
      {
        // SETUP: Opponent at center, hits a short ball to your right
        // DEPTH: y:0.6 = short → approach DTL
        // TARGET: DTL from right = far right (x:0.8) — AWAY from center opponent
        // OPPONENT AFTER: scrambles to x:0.8 to chase it
        description: 'Short ball to your forehand. Approach the net!',
        ballPosition: { x: 0.65, y: 0.6 },
        correctZone: { x: 0.8, y: 0.1, radius: 0.25 },
        correctLabel: 'Approach down the line!',
        explanation: 'Approach shots go DOWN THE LINE — then follow the ball to the net!',
        wrongExplanation: 'Short ball on your right — approach DOWN THE LINE to the far right!',
        opponentPosition: { x: 0.5, y: 0.08 },
      },
      {
        // SETUP: Opponent scrambled to x:0.8 to get your DTL approach
        // From x:0.8 (their left), cross-court pass goes to your LEFT
        // You're at the net on the RIGHT side (followed your approach)
        // TARGET: Volley to OPEN court = far LEFT (x:0.2) — AWAY from opponent at x:0.8
        description: 'You\'re at the net! Opponent tries to pass you. Put it away!',
        ballPosition: { x: 0.3, y: 0.5 },
        correctZone: { x: 0.2, y: 0.08, radius: 0.28 },
        correctLabel: 'Volley to open court!',
        explanation: 'Approach DTL, volley to the open court. Champion play!',
        wrongExplanation: 'Your opponent is on the RIGHT — volley to the OPEN court on the far LEFT!',
        opponentPosition: { x: 0.8, y: 0.12 },
      },
    ],
  },
  {
    id: 'drop-shot-surprise',
    name: 'Drop Shot Surprise',
    category: 'rally',
    description: 'Push your opponent deep behind the baseline, then drop it short!',

    steps: [
      {
        // SETUP: Opponent at center, hits deep to your right
        // DEPTH: y:0.88 = deep → cross-court to push them back
        // TARGET: Cross-court from right = far left (x:0.2), deep (y:0.06)
        // OPPONENT AFTER: pushed back to x:0.2, behind baseline
        description: 'Deep ball to your forehand. Push them back!',
        ballPosition: { x: 0.7, y: 0.88 },
        correctZone: { x: 0.2, y: 0.06, radius: 0.25 },
        correctLabel: 'Deep cross-court!',
        explanation: 'Deep and heavy! Your opponent is being pushed back...',
        wrongExplanation: 'Hit it DEEP cross-court to push your opponent behind the baseline!',
        opponentPosition: { x: 0.5, y: 0.06 },
      },
      {
        // SETUP: Opponent at x:0.2, WAY behind baseline (y:0.02)
        // They hit a medium ball back from deep
        // TACTIC: Opponent is far back → drop shot just over the net
        // TARGET: Drop shot (y:0.38 = just past net on their side)
        description: 'Your opponent is way behind the baseline. Surprise them!',
        ballPosition: { x: 0.55, y: 0.8 },
        correctZone: { x: 0.5, y: 0.38, radius: 0.22 },
        correctLabel: 'Drop shot!',
        explanation: 'Sneaky! They were so far back they couldn\'t reach it!',
        wrongExplanation: 'Your opponent is way behind the baseline — hit a DROP SHOT just over the net!',
        opponentPosition: { x: 0.2, y: 0.02 },
      },
    ],
  },
  {
    id: 'passing-shot',
    name: 'The Passing Shot',
    category: 'defend',
    description: 'Your opponent charges the net — blast it past them down the line!',

    steps: [
      {
        // SETUP: Opponent at center, hits deep to your right
        // DEPTH: y:0.87 = deep → cross-court
        // TARGET: Cross-court from right = far left (x:0.2)
        // OPPONENT AFTER: moves to x:0.2, then approaches the net
        description: 'Deep ball to your forehand. Start the rally.',
        ballPosition: { x: 0.7, y: 0.87 },
        correctZone: { x: 0.2, y: 0.1, radius: 0.25 },
        correctLabel: 'Deep cross-court!',
        explanation: 'Good rally ball! But watch out — your opponent is coming forward...',
        wrongExplanation: 'Deep ball on your right — rally it cross-court to the far left!',
        opponentPosition: { x: 0.5, y: 0.08 },
      },
      {
        // SETUP: Opponent was at x:0.2, hits an approach and charges net
        // They approach on the LEFT side of the net (x:0.3, y:0.4)
        // From x:0.2, DTL approach goes to your right → ball at x:0.65
        // DEPTH: y:0.82 = deep-ish, but opponent at net → PASS them
        // TARGET: DTL from right = far right (x:0.8) — passes them on the right side
        description: 'Your opponent rushes to the net! Pass them!',
        ballPosition: { x: 0.65, y: 0.82 },
        correctZone: { x: 0.8, y: 0.1, radius: 0.25 },
        correctLabel: 'Passing shot down the line!',
        explanation: 'BOOM! Right past them down the line!',
        wrongExplanation: 'Your opponent is at the net on the LEFT — pass them DOWN THE LINE to the far right!',
        opponentPosition: { x: 0.3, y: 0.4 },
      },
    ],
  },
  {
    id: 'defend-and-lob',
    name: 'Defend & Lob',
    category: 'defend',
    description: 'You\'re stretched wide with the opponent at the net — lob them, then attack the short ball!',

    steps: [
      {
        // SETUP: Opponent at net, slightly left (x:0.4), smashes wide to your left
        // You're stretched, deep — LOB over their head
        // TARGET: Lob deep to far right (x:0.7) — over their head and away
        // OPPONENT AFTER: turns and chases lob to x:0.7
        description: 'Opponent at the net smashes it wide to your left! Stay alive!',
        ballPosition: { x: 0.1, y: 0.92 },
        correctZone: { x: 0.7, y: 0.05, radius: 0.28 },
        correctLabel: 'LOB! High and deep!',
        explanation: 'Smart play! A high lob over their head buys you time!',
        wrongExplanation: 'Stretched wide with the opponent at the net — LOB it HIGH and DEEP over their head!',
        opponentPosition: { x: 0.4, y: 0.4 },
      },
      {
        // SETUP: Opponent chased lob to x:0.7 (far right). Hits weak short ball.
        // From x:0.7, cross-court goes to your left → ball at x:0.35
        // DEPTH: y:0.6 = short → attack DTL
        // TARGET: DTL from left = far left (x:0.2) — AWAY from opponent at x:0.7
        description: 'Your lob worked! Weak short ball back. Finish the point!',
        ballPosition: { x: 0.35, y: 0.6 },
        correctZone: { x: 0.2, y: 0.1, radius: 0.25 },
        correctLabel: 'Attack down the line!',
        explanation: 'Defended, lobbed, then attacked down the line. Tennis IQ!',
        wrongExplanation: 'Short ball on your left — attack DOWN THE LINE to the far left!',
        opponentPosition: { x: 0.7, y: 0.08 },
      },
    ],
  },


  {
    id: 'wrong-foot',
    name: 'The Wrong-Foot',
    category: 'rally',
    description: 'Build a cross-court pattern so your opponent commits early — then go behind them!',

    steps: [
      {
        // SETUP: Opponent at center, hits deep to your left
        // DEPTH: y:0.87 = deep → cross-court
        // TARGET: Cross-court from left = far right (x:0.8)
        // OPPONENT AFTER: moves to x:0.8
        description: 'Deep ball to your backhand. Build the pattern.',
        ballPosition: { x: 0.3, y: 0.87 },
        correctZone: { x: 0.8, y: 0.1, radius: 0.25 },
        correctLabel: 'Cross-court!',
        explanation: 'Good. Your opponent is starting to read a pattern...',
        wrongExplanation: 'Deep ball on your left — rally it cross-court to the far right!',
        opponentPosition: { x: 0.5, y: 0.08 },
      },
      {
        // SETUP: Opponent at x:0.8 (chased your cross-court right). Hits back to your left.
        // From x:0.8, cross-court goes to your left → ball at x:0.3
        // DEPTH: y:0.86 = deep → cross-court again (setting the trap)
        // TARGET: Cross-court from left = far right (x:0.8) again
        // OPPONENT AFTER: recovers to center (x:0.55) — they know the pattern now
        description: 'Deep ball to your backhand again. One more cross-court to set the trap!',
        ballPosition: { x: 0.28, y: 0.86 },
        correctZone: { x: 0.8, y: 0.1, radius: 0.25 },
        correctLabel: 'Cross-court again!',
        explanation: 'The trap is set! They expect cross-court every time now...',
        wrongExplanation: 'Keep going cross-court to the far right — set the trap!',
        opponentPosition: { x: 0.8, y: 0.08 },
      },
      {
        // SETUP: Opponent RECOVERED to center (x:0.55) — good position
        // BUT they're anticipating cross-court and will COMMIT right
        // Ball deep to your left again
        // TACTIC: Wrong-foot! They dive right expecting cross-court, you go LEFT behind them
        // opponentReaction shows them diving right as ball goes left
        description: 'Your opponent expects cross-court again. Catch them out!',
        ballPosition: { x: 0.32, y: 0.85 },
        correctZone: { x: 0.2, y: 0.1, radius: 0.25 },
        correctLabel: 'Wrong-footed!',
        explanation: 'GENIUS! They committed right but you went left — completely wrong-footed!',
        wrongExplanation: 'Your opponent is expecting cross-court RIGHT — go BEHIND them to the LEFT!',
        opponentPosition: { x: 0.55, y: 0.08 },
        opponentReaction: { x: 0.95, y: 0.06 },
      },
    ],
  },
  {
    id: 'serve-wide-attack',
    name: 'Serve Wide & Dominate',
    category: 'serve',
    description: 'Serve wide to stretch the opponent, attack the short return, approach, then volley!',

    steps: [
      {
        // SERVE STEP: Player serves from ad side (left) — tap where to aim
        // CORRECT: Wide serve into the LEFT service box (x:0.2, y:0.33) — stretches opponent wide
        // WRONG: T serve near center (x:0.5) — doesn't stretch them
        // OPPONENT AFTER: scrambles wide to x:0.15
        isServe: true,
        description: 'You\'re serving from the deuce side. Aim your serve!',
        ballPosition: { x: 0.62, y: 0.98 },
        correctZone: { x: 0.2, y: 0.33, radius: 0.18 },
        correctLabel: 'Wide serve!',
        explanation: 'Great serve! Wide to stretch your opponent — they\'re in trouble!',
        wrongExplanation: 'Serve WIDE into the LEFT service box to stretch your opponent!',
        opponentPosition: { x: 0.5, y: 0.0 },
      },
      {
        // SETUP: You served wide left. Opponent stretched to x:0.15
        // They hit a short return to your right (cross-court from their position)
        // DEPTH: y:0.65 = short → attack DTL
        // TARGET: DTL from right = far right (x:0.8) — AWAY from opponent at x:0.15
        // OPPONENT AFTER: scrambles from x:0.15 to x:0.8
        description: 'Your wide serve stretched them! Short return to your right. Attack!',
        ballPosition: { x: 0.6, y: 0.65 },
        correctZone: { x: 0.8, y: 0.1, radius: 0.25 },
        correctLabel: 'Attack down the line!',
        explanation: 'Serve wide, short return, attack DTL into the open court!',
        wrongExplanation: 'Short ball on your right — attack DOWN THE LINE to the far right!',
        opponentPosition: { x: 0.15, y: 0.08 },
      },
      {
        // SETUP: Opponent scrambled to x:0.8 to chase your DTL. Hits weak short ball.
        // From x:0.8, cross-court goes to your left → ball at x:0.35
        // DEPTH: y:0.6 = short → approach DTL
        // TARGET: DTL from left = far left (x:0.2) — AWAY from opponent at x:0.8
        // OPPONENT AFTER: scrambles from x:0.8 to x:0.2
        description: 'They scrambled but sent back another short ball to your left. Approach!',
        ballPosition: { x: 0.35, y: 0.6 },
        correctZone: { x: 0.2, y: 0.1, radius: 0.25 },
        correctLabel: 'Approach down the line!',
        explanation: 'Perfect approach shot! Now rush to the net!',
        wrongExplanation: 'Short ball on your left — approach DOWN THE LINE to the far left!',
        opponentPosition: { x: 0.8, y: 0.1 },
      },
      {
        // SETUP: Opponent scrambled to x:0.2 to chase your approach. Tries to pass you.
        // From x:0.2 (their right), cross-court pass goes to your RIGHT
        // You're at net on the LEFT (followed your approach)
        // TARGET: Volley to OPEN court = far RIGHT (x:0.8) — AWAY from opponent at x:0.2
        description: 'You\'re at the net! Opponent tries to pass you. Finish it!',
        ballPosition: { x: 0.7, y: 0.5 },
        correctZone: { x: 0.8, y: 0.08, radius: 0.25 },
        correctLabel: 'Volley to open court!',
        explanation: 'UNSTOPPABLE! Serve wide, attack, approach, volley — total domination!',
        wrongExplanation: 'Your opponent is on the LEFT — volley to the OPEN court on the far RIGHT!',
        opponentPosition: { x: 0.2, y: 0.12 },
      },
    ],
  },
  {
    id: 'counter-attack',
    name: 'The Counter-Attack',
    category: 'attack',
    description: 'Defend deep cross-court under pressure, change direction, then attack the short ball!',

    steps: [
      {
        // SETUP: Opponent attacks from center, big shot deep to your left
        // DEPTH: y:0.92 = very deep → defend cross-court
        // TARGET: Cross-court from left = far right (x:0.8)
        // OPPONENT AFTER: moves to x:0.8
        description: 'Big shot pushes you deep on your backhand. Stay in the point!',
        ballPosition: { x: 0.15, y: 0.92 },
        correctZone: { x: 0.8, y: 0.08, radius: 0.25 },
        correctLabel: 'Deep cross-court!',
        explanation: 'Solid defense! Deep cross-court buys you time.',
        wrongExplanation: 'Under pressure on your left — go DEEP CROSS-COURT to the far right!',
        opponentPosition: { x: 0.5, y: 0.06 },
      },
      {
        // SETUP: Opponent at x:0.8 (chased your cross-court). Attacks your backhand again.
        // From x:0.8, cross-court goes to your left → ball at x:0.2
        // DEPTH: y:0.88 = deep, but opponent is cheating right
        // TACTIC: Go BEHIND them DTL to far left
        // TARGET: DTL from left = far left (x:0.2) — opponent at x:0.8, catches them off guard
        description: 'They attack your backhand again! They\'re expecting cross-court.',
        ballPosition: { x: 0.2, y: 0.88 },
        correctZone: { x: 0.2, y: 0.1, radius: 0.25 },
        correctLabel: 'Down the line!',
        explanation: 'They expected cross-court but you went down the line!',
        wrongExplanation: 'Your opponent is on the RIGHT — go DOWN THE LINE to the far left!',
        opponentPosition: { x: 0.8, y: 0.06 },
      },
      {
        // SETUP: Opponent scrambled from x:0.8 to x:0.2 (chased your DTL). Hits weak short ball.
        // From x:0.2, cross-court goes to your right → ball at x:0.65
        // DEPTH: y:0.6 = short → attack DTL
        // TARGET: DTL from right = far right (x:0.8) — AWAY from opponent at x:0.2
        description: 'They scrambled and hit a short ball. End it!',
        ballPosition: { x: 0.65, y: 0.6 },
        correctZone: { x: 0.8, y: 0.1, radius: 0.25 },
        correctLabel: 'Finish down the line!',
        explanation: 'WHAT A COMEBACK! Defended, changed direction, attacked the short ball!',
        wrongExplanation: 'Short ball on your right — finish it DOWN THE LINE to the far right!',
        opponentPosition: { x: 0.2, y: 0.12 },
      },
    ],
  },

  // ============ NEW PATTERNS ============

  // --- SERVE ---
  {
    id: 'serve-down-the-t',
    name: 'Serve Down the T',
    category: 'serve',
    description: 'Jam your opponent with a T serve, then punish the weak return!',

    steps: [
      {
        // SERVE: Deuce side, T serve to center of left service box
        isServe: true,
        description: 'You\'re serving from the deuce side. Jam them down the T!',
        ballPosition: { x: 0.62, y: 0.98 },
        correctZone: { x: 0.45, y: 0.33, radius: 0.18 },
        correctLabel: 'T serve!',
        explanation: 'Right down the T! Your opponent is jammed — weak return coming...',
        wrongExplanation: 'Aim for the T — the CENTER of the service box!',
        opponentPosition: { x: 0.5, y: 0.0 },
      },
      {
        // Opponent jammed at center (x:0.45), returns short to your right
        // Short → attack DTL right, away from center opponent
        description: 'Weak return from a jammed opponent. Put it away!',
        ballPosition: { x: 0.55, y: 0.65 },
        correctZone: { x: 0.8, y: 0.1, radius: 0.25 },
        correctLabel: 'Attack the open court!',
        explanation: 'T serve jams them, weak return, attack into the open court!',
        wrongExplanation: 'Your opponent is stuck in the MIDDLE — attack to the far RIGHT!',
        opponentPosition: { x: 0.45, y: 0.08 },
      },
    ],
  },
  {
    id: 'serve-and-rally',
    name: 'Serve & Stay Back',
    category: 'serve',
    description: 'Serve wide, but the return is deep — be patient, rally, then attack when the short ball comes!',

    steps: [
      {
        // SERVE: Deuce side, wide serve
        isServe: true,
        description: 'You\'re serving from the deuce side. Go wide!',
        ballPosition: { x: 0.62, y: 0.98 },
        correctZone: { x: 0.2, y: 0.33, radius: 0.18 },
        correctLabel: 'Wide serve!',
        explanation: 'Good serve! But watch the return — it might be deep...',
        wrongExplanation: 'Serve WIDE into the LEFT of the service box!',
        opponentPosition: { x: 0.5, y: 0.0 },
      },
      {
        // Opponent stretched to x:0.15 but hits a DEEP return (y:0.88)
        // DEEP → must rally cross-court, NOT attack
        description: 'Good return from your opponent — it\'s deep! Don\'t over-attack.',
        ballPosition: { x: 0.6, y: 0.88 },
        correctZone: { x: 0.2, y: 0.08, radius: 0.25 },
        correctLabel: 'Smart! Deep cross-court.',
        explanation: 'Patient play! The return was deep so you rallied — wait for a better ball.',
        wrongExplanation: 'That return was DEEP near your baseline — rally it cross-court, don\'t attack!',
        opponentPosition: { x: 0.15, y: 0.08 },
      },
      {
        // Opponent recovered to x:0.25. Hits a short ball to your right.
        // Short → NOW attack DTL right
        description: 'Now you get a short ball! This time, attack!',
        ballPosition: { x: 0.6, y: 0.62 },
        correctZone: { x: 0.8, y: 0.1, radius: 0.25 },
        correctLabel: 'Attack down the line!',
        explanation: 'That\'s the difference — deep ball = rally, short ball = ATTACK!',
        wrongExplanation: 'THIS ball is short — NOW you can attack DOWN THE LINE to the far right!',
        opponentPosition: { x: 0.25, y: 0.1 },
      },
    ],
  },

  // --- RETURN ---
  {
    id: 'punish-second-serve',
    name: 'Punish the Second Serve',
    category: 'return',
    description: 'A weak second serve lands short — step inside the baseline and attack it!',

    steps: [
      {
        // Weak second serve lands short (y:0.7 = inside service line)
        // Short → step in and attack DTL right
        description: 'Weak second serve to your forehand. Step in and punish it!',
        ballPosition: { x: 0.65, y: 0.7 },
        correctZone: { x: 0.8, y: 0.1, radius: 0.25 },
        correctLabel: 'Aggressive return!',
        explanation: 'Short second serve = step in and attack! Put pressure on the server.',
        wrongExplanation: 'That second serve was SHORT — step in and attack DOWN THE LINE to the far right!',
        opponentPosition: { x: 0.5, y: 0.06 },
      },
      {
        // Opponent scrambles to x:0.8, panics, hits short again to your left
        // Short → finish DTL left, away from opponent at x:0.8
        description: 'Your opponent is scrambling! Finish the point.',
        ballPosition: { x: 0.35, y: 0.62 },
        correctZone: { x: 0.2, y: 0.1, radius: 0.25 },
        correctLabel: 'Winner down the line!',
        explanation: 'Punish the weak serve, then finish into the open court!',
        wrongExplanation: 'Your opponent is on the RIGHT — finish it to the far LEFT!',
        opponentPosition: { x: 0.8, y: 0.1 },
      },
    ],
  },
  {
    id: 'return-and-build',
    name: 'Return & Build',
    category: 'return',
    description: 'Return the deep serve, rally patiently — don\'t attack until the short ball comes!',

    steps: [
      {
        // Deep first serve to your left (y:0.9)
        // Deep → return cross-court from left → right
        description: 'Deep first serve to your backhand. Get it back deep!',
        ballPosition: { x: 0.2, y: 0.9 },
        correctZone: { x: 0.75, y: 0.08, radius: 0.28 },
        correctLabel: 'Deep return!',
        explanation: 'Solid return! Now stay patient...',
        wrongExplanation: 'Deep serve — return it DEEP CROSS-COURT to the far right!',
        opponentPosition: { x: 0.5, y: 0.06 },
      },
      {
        // Opponent at x:0.75, hits deep to your left again (y:0.87)
        // STILL DEEP → rally cross-court again (patience!)
        description: 'Another deep ball. Stay patient — don\'t force it!',
        ballPosition: { x: 0.3, y: 0.87 },
        correctZone: { x: 0.8, y: 0.08, radius: 0.25 },
        correctLabel: 'Patient cross-court!',
        explanation: 'Good discipline! That ball was deep — wait for the right one.',
        wrongExplanation: 'That ball is still DEEP — rally cross-court, don\'t attack yet!',
        opponentPosition: { x: 0.75, y: 0.08 },
      },
      {
        // Opponent at x:0.8, hits SHORT ball to your left (y:0.6)
        // Short → NOW attack DTL left, away from opponent at x:0.8
        description: 'Short ball at last! Now attack!',
        ballPosition: { x: 0.35, y: 0.6 },
        correctZone: { x: 0.2, y: 0.1, radius: 0.25 },
        correctLabel: 'Attack down the line!',
        explanation: 'That\'s the one! Two patient rallies, then punish the short ball!',
        wrongExplanation: 'THIS ball is short — attack DOWN THE LINE to the far left!',
        opponentPosition: { x: 0.8, y: 0.1 },
      },
    ],
  },

  // --- RALLY ---
  {
    id: 'stay-patient',
    name: 'Stay Patient',
    category: 'rally',
    description: 'Three deep balls in a row — keep rallying cross-court until you get the short ball to attack!',

    steps: [
      {
        // Deep ball right → cross-court left
        description: 'Deep ball to your forehand. Rally it cross-court.',
        ballPosition: { x: 0.7, y: 0.88 },
        correctZone: { x: 0.2, y: 0.1, radius: 0.25 },
        correctLabel: 'Deep cross-court!',
        explanation: 'Good. That was deep — cross-court is the right choice.',
        wrongExplanation: 'That ball was DEEP — rally it cross-court to the far left!',
        opponentPosition: { x: 0.5, y: 0.08 },
      },
      {
        // Opponent at x:0.2, hits deep to your right (y:0.87)
        // STILL DEEP → cross-court again
        description: 'Another deep one. Keep rallying!',
        ballPosition: { x: 0.65, y: 0.87 },
        correctZone: { x: 0.2, y: 0.08, radius: 0.25 },
        correctLabel: 'Still deep — cross-court!',
        explanation: 'Patient! Two deep balls, two cross-courts. Keep waiting...',
        wrongExplanation: 'Still DEEP near your baseline — rally cross-court again!',
        opponentPosition: { x: 0.2, y: 0.08 },
      },
      {
        // Opponent recovers to x:0.3, hits ANOTHER deep one (y:0.86)
        // STILL DEEP → cross-court AGAIN
        description: 'Deep again! Don\'t get tempted — stay patient!',
        ballPosition: { x: 0.68, y: 0.86 },
        correctZone: { x: 0.2, y: 0.08, radius: 0.25 },
        correctLabel: 'Great patience!',
        explanation: 'Three deep balls, three cross-courts. That\'s elite discipline!',
        wrongExplanation: 'That ball is STILL deep — keep rallying cross-court! Don\'t attack yet!',
        opponentPosition: { x: 0.3, y: 0.08 },
      },
      {
        // Opponent at x:0.2, finally hits SHORT (y:0.62)
        // Short → attack DTL right, away from opponent at x:0.2
        description: 'Short ball! NOW is the time!',
        ballPosition: { x: 0.6, y: 0.62 },
        correctZone: { x: 0.8, y: 0.1, radius: 0.25 },
        correctLabel: 'Attack down the line!',
        explanation: 'THAT\'S how you do it! Patient, patient, patient... ATTACK!',
        wrongExplanation: 'THIS one is short — NOW attack DOWN THE LINE to the far right!',
        opponentPosition: { x: 0.2, y: 0.1 },
      },
    ],
  },
  {
    id: 'switch-direction',
    name: 'Switch & Attack',
    category: 'rally',
    description: 'Rally cross-court on both sides, then recognise the short ball and attack!',

    steps: [
      {
        // Deep ball LEFT → cross-court right
        description: 'Deep ball to your backhand. Rally cross-court.',
        ballPosition: { x: 0.3, y: 0.88 },
        correctZone: { x: 0.8, y: 0.1, radius: 0.25 },
        correctLabel: 'Cross-court right!',
        explanation: 'Good rally ball. Now get ready for the reply...',
        wrongExplanation: 'Deep ball on your left — rally it cross-court to the far right!',
        opponentPosition: { x: 0.5, y: 0.08 },
      },
      {
        // Opponent at x:0.8, hits deep to your RIGHT (y:0.86)
        // DEEP → cross-court from right → left
        description: 'Deep ball to your forehand now. Keep rallying!',
        ballPosition: { x: 0.7, y: 0.86 },
        correctZone: { x: 0.2, y: 0.08, radius: 0.25 },
        correctLabel: 'Cross-court left!',
        explanation: 'Moving your opponent side to side. Stay patient...',
        wrongExplanation: 'That\'s still a DEEP ball — rally cross-court to the far left!',
        opponentPosition: { x: 0.8, y: 0.08 },
      },
      {
        // Opponent at x:0.2, hits SHORT ball to your right (y:0.6)
        // Short → attack DTL right, away from opponent at x:0.2
        description: 'Short ball to your forehand! Time to attack!',
        ballPosition: { x: 0.6, y: 0.6 },
        correctZone: { x: 0.8, y: 0.1, radius: 0.25 },
        correctLabel: 'Attack down the line!',
        explanation: 'Rally, rally, then ATTACK the short ball!',
        wrongExplanation: 'That ball is SHORT — attack DOWN THE LINE to the far right!',
        opponentPosition: { x: 0.2, y: 0.1 },
      },
    ],
  },

  // --- ATTACK ---
  {
    id: 'recognise-short-ball',
    name: 'Read the Depth',
    category: 'attack',
    description: 'Two deep balls then a short one — can you tell the difference and attack at the right time?',

    steps: [
      {
        // Deep ball LEFT → must rally cross-court (NOT attack)
        description: 'Ball to your backhand. What do you do?',
        ballPosition: { x: 0.3, y: 0.89 },
        correctZone: { x: 0.8, y: 0.1, radius: 0.25 },
        correctLabel: 'Rally cross-court!',
        explanation: 'Correct! That ball was DEEP — cross-court is the smart play.',
        wrongExplanation: 'Look at the depth — that ball is DEEP near your baseline. Rally cross-court!',
        opponentPosition: { x: 0.5, y: 0.08 },
      },
      {
        // Opponent at x:0.8, deep ball to your RIGHT (y:0.86) → rally again
        description: 'Ball to your forehand. Deep or short?',
        ballPosition: { x: 0.65, y: 0.86 },
        correctZone: { x: 0.2, y: 0.08, radius: 0.25 },
        correctLabel: 'Still deep — rally!',
        explanation: 'Right again! Still deep — keep it cross-court.',
        wrongExplanation: 'That ball is still DEEP — rally cross-court, don\'t attack yet!',
        opponentPosition: { x: 0.8, y: 0.08 },
      },
      {
        // Opponent at x:0.2, SHORT ball RIGHT (y:0.6) → NOW attack
        description: 'Ball to your forehand again. What about this one?',
        ballPosition: { x: 0.6, y: 0.6 },
        correctZone: { x: 0.8, y: 0.1, radius: 0.25 },
        correctLabel: 'Short ball — attack!',
        explanation: 'You spotted it! Deep = rally, short = ATTACK down the line!',
        wrongExplanation: 'This one is SHORT inside the service line — attack DOWN THE LINE!',
        opponentPosition: { x: 0.2, y: 0.1 },
      },
    ],
  },
  {
    id: 'approach-volley-overhead',
    name: 'Approach, Volley, Smash',
    category: 'attack',
    description: 'Approach the net on a short ball, put away the volley — or smash the lob!',

    steps: [
      {
        // Short ball right → approach DTL
        description: 'Short ball to your forehand. Approach the net!',
        ballPosition: { x: 0.65, y: 0.6 },
        correctZone: { x: 0.8, y: 0.1, radius: 0.25 },
        correctLabel: 'Approach down the line!',
        explanation: 'Great approach! Now get to the net...',
        wrongExplanation: 'Short ball on your right — approach DOWN THE LINE to the far right!',
        opponentPosition: { x: 0.5, y: 0.08 },
      },
      {
        // Opponent at x:0.8, tries cross-court pass. You volley to open court.
        description: 'At the net! Opponent tries to pass you cross-court.',
        ballPosition: { x: 0.3, y: 0.5 },
        correctZone: { x: 0.2, y: 0.08, radius: 0.28 },
        correctLabel: 'Volley to open court!',
        explanation: 'Great volley! But your opponent gets it back — and lobs you!',
        wrongExplanation: 'Opponent is on the RIGHT — volley to the OPEN court on the far LEFT!',
        opponentPosition: { x: 0.8, y: 0.12 },
      },
      {
        // Opponent scrambled to x:0.2, throws up a lob. You're at net.
        // Lob lands around net area (y:0.48) — overhead smash to open court right
        description: 'They lob you! Smash it away!',
        ballPosition: { x: 0.45, y: 0.48 },
        correctZone: { x: 0.8, y: 0.08, radius: 0.28 },
        correctLabel: 'SMASH!',
        explanation: 'Approach, volley, SMASH! Complete net domination!',
        wrongExplanation: 'Opponent is on the LEFT — smash it to the OPEN court on the far RIGHT!',
        opponentPosition: { x: 0.2, y: 0.1 },
      },
    ],
  },

  // --- DEFEND ---
  {
    id: 'reset-and-recover',
    name: 'Reset & Recover',
    category: 'defend',
    description: 'Pushed wide under pressure — defend deep to get back in the rally, then attack when you can!',

    steps: [
      {
        // Pushed wide to your left, very deep
        // Under pressure → defend cross-court right
        description: 'Big shot pushes you wide to your backhand! Get it back deep.',
        ballPosition: { x: 0.1, y: 0.92 },
        correctZone: { x: 0.75, y: 0.08, radius: 0.28 },
        correctLabel: 'Deep cross-court!',
        explanation: 'Great defense! Deep cross-court gives you time to recover.',
        wrongExplanation: 'You\'re under pressure — go DEEP CROSS-COURT to the far right to stay in the point!',
        opponentPosition: { x: 0.5, y: 0.06 },
      },
      {
        // Opponent at x:0.75, hits deep to your right (y:0.87)
        // Deep → rally cross-court from right → left
        description: 'You\'re back in the rally. Keep building.',
        ballPosition: { x: 0.7, y: 0.87 },
        correctZone: { x: 0.2, y: 0.1, radius: 0.25 },
        correctLabel: 'Deep cross-court!',
        explanation: 'Solid! You\'ve recovered your position. Keep waiting...',
        wrongExplanation: 'Deep ball — rally it cross-court to the far left!',
        opponentPosition: { x: 0.75, y: 0.08 },
      },
      {
        // Opponent at x:0.2, hits short ball to your right
        // Short → attack DTL right
        description: 'Short ball to your forehand! You\'ve earned this — attack!',
        ballPosition: { x: 0.6, y: 0.62 },
        correctZone: { x: 0.8, y: 0.1, radius: 0.25 },
        correctLabel: 'Attack down the line!',
        explanation: 'Defended, recovered, then attacked the short ball. Complete point!',
        wrongExplanation: 'Short ball — attack DOWN THE LINE to the far right!',
        opponentPosition: { x: 0.2, y: 0.1 },
      },
    ],
  },
  {
    id: 'scramble-and-counter',
    name: 'Scramble & Counter',
    category: 'defend',
    description: 'Your opponent attacks you from side to side — survive the pressure, then counter-attack!',

    steps: [
      {
        // Big shot pushes you deep right
        // Deep → defend cross-court left
        description: 'Powerful shot to your forehand corner! Stay in the point!',
        ballPosition: { x: 0.85, y: 0.93 },
        correctZone: { x: 0.2, y: 0.08, radius: 0.25 },
        correctLabel: 'Deep cross-court!',
        explanation: 'Great scramble! Deep cross-court keeps you alive.',
        wrongExplanation: 'Under pressure — go DEEP CROSS-COURT to stay in the point!',
        opponentPosition: { x: 0.5, y: 0.06 },
      },
      {
        // Opponent at x:0.2, attacks deep to your LEFT (y:0.91)
        // Deep → defend cross-court right
        description: 'They attack the other side! Scramble and get it back!',
        ballPosition: { x: 0.15, y: 0.91 },
        correctZone: { x: 0.8, y: 0.08, radius: 0.25 },
        correctLabel: 'Great scramble!',
        explanation: 'Still alive! Side to side — your defence is holding!',
        wrongExplanation: 'Deep and wide — scramble it DEEP CROSS-COURT to stay in the rally!',
        opponentPosition: { x: 0.2, y: 0.06 },
      },
      {
        // Opponent at x:0.8, attacks deep right AGAIN (y:0.9)
        // Deep → defend cross-court left
        description: 'Another big shot to your forehand! Keep fighting!',
        ballPosition: { x: 0.82, y: 0.9 },
        correctZone: { x: 0.2, y: 0.08, radius: 0.25 },
        correctLabel: 'Still defending!',
        explanation: 'Incredible defence! Three big shots and you\'re still in this...',
        wrongExplanation: 'Still under pressure — keep going DEEP CROSS-COURT!',
        opponentPosition: { x: 0.8, y: 0.06 },
      },
      {
        // Opponent at x:0.2, finally hits a shorter ball to your right (y:0.6)
        // Short → counter-attack DTL right, away from opponent at x:0.2
        description: 'Their attack runs out of steam — short ball! Counter-attack!',
        ballPosition: { x: 0.6, y: 0.6 },
        correctZone: { x: 0.8, y: 0.1, radius: 0.25 },
        correctLabel: 'Counter-attack!',
        explanation: 'INCREDIBLE! Three huge defences then you counter-attacked the short ball!',
        wrongExplanation: 'Short ball at last — counter-attack DOWN THE LINE to the far right!',
        opponentPosition: { x: 0.2, y: 0.1 },
      },
    ],
  },

  // ============ 8-SHOT PATTERNS ============

  {
    id: 'marathon-rally',
    name: 'The Marathon Rally',
    category: 'rally',
    description: 'A long baseline rally — stay patient through 6 deep balls, then approach and finish at the net!',

    steps: [
      {
        // Step 1: Opp center. Deep RIGHT. XC left.
        description: 'Deep ball to your forehand. Start the rally.',
        ballPosition: { x: 0.7, y: 0.88 },
        correctZone: { x: 0.2, y: 0.1, radius: 0.25 },
        correctLabel: 'Cross-court!',
        explanation: 'Good start. Deep ball = cross-court. Stay patient...',
        wrongExplanation: 'Deep ball — rally it cross-court to the far left!',
        opponentPosition: { x: 0.5, y: 0.08 },
      },
      {
        // Step 2: Opp at 0.2 hits XC to your right. Deep. XC left again.
        description: 'Deep again. Keep rallying!',
        ballPosition: { x: 0.65, y: 0.87 },
        correctZone: { x: 0.2, y: 0.08, radius: 0.25 },
        correctLabel: 'Patient cross-court!',
        explanation: 'Two deep balls, two cross-courts. Good discipline.',
        wrongExplanation: 'Still deep — keep rallying cross-court!',
        opponentPosition: { x: 0.2, y: 0.08 },
      },
      {
        // Step 3: Opp recovered to 0.25, hits DTL to your left. Deep. XC right.
        description: 'Switched to your backhand. Deep ball — what do you do?',
        ballPosition: { x: 0.28, y: 0.85 },
        correctZone: { x: 0.8, y: 0.08, radius: 0.25 },
        correctLabel: 'Cross-court right!',
        explanation: 'Direction changed but the ball is still deep — cross-court is correct.',
        wrongExplanation: 'Deep ball on your left — rally cross-court to the far right!',
        opponentPosition: { x: 0.25, y: 0.08 },
      },
      {
        // Step 4: Opp at 0.8 hits XC to your left. Deep. XC right again.
        description: 'Deep to your backhand again. Stay in the rally!',
        ballPosition: { x: 0.3, y: 0.86 },
        correctZone: { x: 0.8, y: 0.08, radius: 0.25 },
        correctLabel: 'Still rallying!',
        explanation: 'Four shots deep. Your patience is being tested...',
        wrongExplanation: 'Deep ball — don\'t attack! Rally cross-court to the far right!',
        opponentPosition: { x: 0.8, y: 0.08 },
      },
      {
        // Step 5: Opp at 0.75 hits DTL to your right. Deep. XC left.
        description: 'Back to your forehand. Deep again — don\'t get tempted!',
        ballPosition: { x: 0.7, y: 0.84 },
        correctZone: { x: 0.2, y: 0.08, radius: 0.25 },
        correctLabel: 'Five deep — still patient!',
        explanation: 'Five deep balls and you haven\'t forced it once. Elite patience.',
        wrongExplanation: 'STILL deep — rally cross-court to the far left! Wait for the short ball!',
        opponentPosition: { x: 0.75, y: 0.08 },
      },
      {
        // Step 6: Opp at 0.2 hits XC to your right. Deep. XC left.
        description: 'One more deep ball. Hold your nerve!',
        ballPosition: { x: 0.68, y: 0.85 },
        correctZone: { x: 0.2, y: 0.08, radius: 0.25 },
        correctLabel: 'Incredible patience!',
        explanation: 'SIX deep rallies! Your opponent is starting to tire...',
        wrongExplanation: 'Deep! Keep going cross-court — the short ball is coming!',
        opponentPosition: { x: 0.2, y: 0.08 },
      },
      {
        // Step 7: Opp at 0.25 hits SHORT to your right. Approach DTL right.
        description: 'SHORT BALL! Approach the net!',
        ballPosition: { x: 0.6, y: 0.6 },
        correctZone: { x: 0.8, y: 0.1, radius: 0.25 },
        correctLabel: 'Approach down the line!',
        explanation: 'After six patient rallies — you earned this! Approach the net!',
        wrongExplanation: 'That\'s the short ball — approach DOWN THE LINE to the far right!',
        opponentPosition: { x: 0.25, y: 0.1 },
      },
      {
        // Step 8: Opp scrambles to 0.8, tries pass to your left. Volley open court.
        description: 'At the net! Opponent tries to pass you. Finish it!',
        ballPosition: { x: 0.3, y: 0.5 },
        correctZone: { x: 0.2, y: 0.08, radius: 0.28 },
        correctLabel: 'Volley winner!',
        explanation: 'WHAT A POINT! Six patient rallies, approach, volley — textbook tennis!',
        wrongExplanation: 'Opponent is on the RIGHT — volley to the OPEN court on the far LEFT!',
        opponentPosition: { x: 0.8, y: 0.12 },
      },
    ],
  },
  {
    id: 'serve-and-construct',
    name: 'Serve & Construct',
    category: 'serve',
    description: 'Serve wide, rally patiently through deep returns, then approach the net and finish with a smash!',

    steps: [
      {
        // Serve: Deuce side, wide
        isServe: true,
        description: 'Serving from the deuce side. Go wide!',
        ballPosition: { x: 0.62, y: 0.98 },
        correctZone: { x: 0.2, y: 0.33, radius: 0.18 },
        correctLabel: 'Wide serve!',
        explanation: 'Good serve! But don\'t rush — build the point.',
        wrongExplanation: 'Serve WIDE into the left service box!',
        opponentPosition: { x: 0.5, y: 0.0 },
      },
      {
        // Opp stretched to 0.15. DEEP return to right. Must rally, not attack.
        description: 'Deep return! Don\'t rush — rally cross-court.',
        ballPosition: { x: 0.6, y: 0.88 },
        correctZone: { x: 0.2, y: 0.08, radius: 0.25 },
        correctLabel: 'Patient cross-court!',
        explanation: 'Smart. The return was deep — rally and wait.',
        wrongExplanation: 'That return is DEEP — rally cross-court, don\'t attack!',
        opponentPosition: { x: 0.15, y: 0.08 },
      },
      {
        // Opp recovered to 0.25. Deep to your right. XC left.
        description: 'Another deep ball. Keep building.',
        ballPosition: { x: 0.65, y: 0.86 },
        correctZone: { x: 0.2, y: 0.08, radius: 0.25 },
        correctLabel: 'Cross-court again!',
        explanation: 'Two rallies after the serve. Patience pays off...',
        wrongExplanation: 'Still deep — rally cross-court to the far left!',
        opponentPosition: { x: 0.25, y: 0.08 },
      },
      {
        // Opp at 0.2. Hits DTL to your left. Deep. XC right.
        description: 'Switched to your backhand. Still deep!',
        ballPosition: { x: 0.3, y: 0.85 },
        correctZone: { x: 0.8, y: 0.08, radius: 0.25 },
        correctLabel: 'Cross-court right!',
        explanation: 'Deep ball on the backhand — cross-court is the right call.',
        wrongExplanation: 'Deep ball on your left — cross-court to the far right!',
        opponentPosition: { x: 0.2, y: 0.08 },
      },
      {
        // Opp at 0.8. Deep to your left. XC right.
        description: 'Deep again to your backhand. One more rally!',
        ballPosition: { x: 0.32, y: 0.87 },
        correctZone: { x: 0.8, y: 0.08, radius: 0.25 },
        correctLabel: 'Still patient!',
        explanation: 'Four rallies after the serve. The opening is coming...',
        wrongExplanation: 'Deep — rally cross-court to the far right!',
        opponentPosition: { x: 0.8, y: 0.08 },
      },
      {
        // Opp at 0.75. SHORT ball to your right. Approach DTL.
        description: 'Short ball to your forehand! Approach!',
        ballPosition: { x: 0.6, y: 0.6 },
        correctZone: { x: 0.8, y: 0.1, radius: 0.25 },
        correctLabel: 'Approach down the line!',
        explanation: 'Finally the short ball! Rush to the net!',
        wrongExplanation: 'Short ball — approach DOWN THE LINE to the far right!',
        opponentPosition: { x: 0.75, y: 0.1 },
      },
      {
        // Opp scrambles to 0.8. Passes XC to your left. Volley open court.
        description: 'At the net! Opponent tries a cross-court pass.',
        ballPosition: { x: 0.3, y: 0.5 },
        correctZone: { x: 0.2, y: 0.08, radius: 0.28 },
        correctLabel: 'Volley to open court!',
        explanation: 'Great volley! But they get one more ball back...',
        wrongExplanation: 'Opponent is on the RIGHT — volley to the OPEN court on the LEFT!',
        opponentPosition: { x: 0.8, y: 0.12 },
      },
      {
        // Opp scrambles to 0.2. Throws up a lob. Smash to open court right.
        description: 'Desperate lob! Put it away with a smash!',
        ballPosition: { x: 0.45, y: 0.48 },
        correctZone: { x: 0.8, y: 0.08, radius: 0.28 },
        correctLabel: 'SMASH!',
        explanation: 'INCREDIBLE POINT! Serve, 4 patient rallies, approach, volley, SMASH!',
        wrongExplanation: 'Opponent is on the LEFT — smash to the OPEN court on the RIGHT!',
        opponentPosition: { x: 0.2, y: 0.1 },
      },
    ],
  },
  {
    id: 'the-great-escape',
    name: 'The Great Escape',
    category: 'defend',
    description: 'Under heavy attack from side to side — survive, get back in the rally, then turn defence into attack!',

    steps: [
      {
        // Big shot deep LEFT. Defend XC right.
        description: 'Huge shot to your backhand corner! Scramble!',
        ballPosition: { x: 0.1, y: 0.93 },
        correctZone: { x: 0.8, y: 0.08, radius: 0.25 },
        correctLabel: 'Great defence!',
        explanation: 'Deep cross-court under pressure. Stay alive!',
        wrongExplanation: 'Under pressure — go DEEP CROSS-COURT to the far right!',
        opponentPosition: { x: 0.5, y: 0.06 },
      },
      {
        // Opp at 0.8. Big shot deep RIGHT. Defend XC left.
        description: 'They attack the other corner! Get it back!',
        ballPosition: { x: 0.85, y: 0.92 },
        correctZone: { x: 0.2, y: 0.08, radius: 0.25 },
        correctLabel: 'Still alive!',
        explanation: 'Side to side but you\'re hanging in there!',
        wrongExplanation: 'Scramble it DEEP CROSS-COURT to the far left!',
        opponentPosition: { x: 0.8, y: 0.06 },
      },
      {
        // Opp at 0.2. Big shot deep LEFT again. Defend XC right.
        description: 'Back to your backhand! They won\'t let up!',
        ballPosition: { x: 0.15, y: 0.91 },
        correctZone: { x: 0.8, y: 0.08, radius: 0.25 },
        correctLabel: 'Incredible scramble!',
        explanation: 'Three big shots defended. The pressure is easing...',
        wrongExplanation: 'Still under attack — go DEEP CROSS-COURT to the far right!',
        opponentPosition: { x: 0.2, y: 0.06 },
      },
      {
        // Opp at 0.8. Hits deep but less aggressive to your RIGHT. Rally XC left.
        description: 'The pressure eases slightly. Deep ball to your forehand.',
        ballPosition: { x: 0.72, y: 0.87 },
        correctZone: { x: 0.2, y: 0.08, radius: 0.25 },
        correctLabel: 'Solid rally ball!',
        explanation: 'Back in the rally now. Keep building...',
        wrongExplanation: 'Deep ball — rally cross-court to the far left!',
        opponentPosition: { x: 0.8, y: 0.08 },
      },
      {
        // Opp at 0.2. Deep to your right. Rally XC left.
        description: 'Deep to your forehand. Stay patient!',
        ballPosition: { x: 0.65, y: 0.86 },
        correctZone: { x: 0.2, y: 0.08, radius: 0.25 },
        correctLabel: 'Patient cross-court!',
        explanation: 'Recovered from the attack. Now you\'re dictating...',
        wrongExplanation: 'Still deep — rally cross-court to the far left!',
        opponentPosition: { x: 0.2, y: 0.08 },
      },
      {
        // Opp at 0.25. Deep to your left. XC right.
        description: 'Deep to your backhand. Nearly there...',
        ballPosition: { x: 0.3, y: 0.85 },
        correctZone: { x: 0.8, y: 0.08, radius: 0.25 },
        correctLabel: 'Building nicely!',
        explanation: 'You\'ve turned defence into a rally. Wait for it...',
        wrongExplanation: 'Deep ball — rally cross-court to the far right!',
        opponentPosition: { x: 0.25, y: 0.08 },
      },
      {
        // Opp at 0.8. SHORT ball to your left. Attack DTL left.
        description: 'Short ball! After all that defending — attack!',
        ballPosition: { x: 0.35, y: 0.6 },
        correctZone: { x: 0.2, y: 0.1, radius: 0.25 },
        correctLabel: 'Attack down the line!',
        explanation: 'From scrambling to attacking! One more to finish...',
        wrongExplanation: 'Short ball on your left — attack DOWN THE LINE to the far left!',
        opponentPosition: { x: 0.8, y: 0.1 },
      },
      {
        // Opp scrambles to 0.2. Short ball to your right. Finish DTL right.
        description: 'They\'re scrambling now! Finish the point!',
        ballPosition: { x: 0.6, y: 0.62 },
        correctZone: { x: 0.8, y: 0.1, radius: 0.25 },
        correctLabel: 'WINNER!',
        explanation: 'THE GREAT ESCAPE! Defended 3 attacks, rallied back, then won with 2 winners!',
        wrongExplanation: 'Your opponent is on the LEFT — finish it DOWN THE LINE to the far right!',
        opponentPosition: { x: 0.2, y: 0.12 },
      },
    ],
  },
];

