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
  // ============ GREEN (Beginner) ============
  {
    id: 'rally-and-attack',
    name: 'Rally & Attack',
    category: 'rally',
    description: 'Keep the ball deep cross-court until you get a short ball, then attack down the line!',
    difficulty: 'green',
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
    difficulty: 'green',
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
    difficulty: 'green',
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

  // ============ ORANGE (Intermediate) ============
  {
    id: 'approach-and-volley',
    name: 'Approach & Volley',
    category: 'attack',
    description: 'Hit an approach shot down the line on a short ball, rush the net, and finish with a volley!',
    difficulty: 'orange',
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
    difficulty: 'orange',
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
    difficulty: 'orange',
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
    difficulty: 'orange',
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

  // ============ RED (Advanced) ============
  {
    id: 'wrong-foot',
    name: 'The Wrong-Foot',
    category: 'rally',
    description: 'Hit two cross-courts to build the pattern, then go behind your opponent!',
    difficulty: 'red',
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
        explanation: 'Good. Your opponent is starting to expect cross-court...',
        wrongExplanation: 'Deep ball on your left — rally it cross-court to the far right!',
        opponentPosition: { x: 0.5, y: 0.08 },
      },
      {
        // SETUP: Opponent at x:0.8 (chased your cross-court right). Hits back to your left.
        // From x:0.8, cross-court goes to your left → ball at x:0.3
        // DEPTH: y:0.86 = deep → cross-court again (setting the trap)
        // TARGET: Cross-court from left = far right (x:0.8) again
        // OPPONENT AFTER: stays at x:0.8, starts cheating right
        description: 'Deep ball to your backhand again. One more cross-court!',
        ballPosition: { x: 0.28, y: 0.86 },
        correctZone: { x: 0.8, y: 0.1, radius: 0.25 },
        correctLabel: 'Cross-court again!',
        explanation: 'They\'re cheating to the right now... time to spring the trap!',
        wrongExplanation: 'Keep going cross-court to the far right — set the trap!',
        opponentPosition: { x: 0.8, y: 0.08 },
      },
      {
        // SETUP: Opponent at x:0.85 (cheating far right, expecting cross-court)
        // Ball deep to your left again
        // TACTIC: Wrong-foot! Go BEHIND them to the LEFT
        // TARGET: DTL from left = far left (x:0.2) — opponent is running right!
        description: 'Your opponent is already moving right. Wrong-foot them!',
        ballPosition: { x: 0.35, y: 0.84 },
        correctZone: { x: 0.2, y: 0.1, radius: 0.25 },
        correctLabel: 'Behind them!',
        explanation: 'GENIUS! They ran right but you went left — completely wrong-footed!',
        wrongExplanation: 'Your opponent is cheating RIGHT — hit it to the LEFT, behind them!',
        opponentPosition: { x: 0.85, y: 0.08 },
      },
    ],
  },
  {
    id: 'serve-wide-attack',
    name: 'Serve Wide & Dominate',
    category: 'serve',
    description: 'Serve wide to stretch the opponent, attack the short return, approach, then volley!',
    difficulty: 'red',
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
    difficulty: 'red',
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
];

export const difficultyColors = {
  green: { bg: 'bg-green-500', text: 'text-green-400', label: 'Green Stage' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-400', label: 'Orange Stage' },
  red: { bg: 'bg-red-500', text: 'text-red-400', label: 'Red Stage' },
};
