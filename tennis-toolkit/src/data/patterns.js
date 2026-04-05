// Court coordinate system:
// x: 0 = your left, 1 = your right
// y: 0 = opponent's baseline (far/top), 1 = your baseline (near/bottom)
//
// KEY DEPTHS (mapped from court geometry):
//   Net:                  y ≈ 0.45
//   Opponent service line: y ≈ 0.21
//   Your service line:     y ≈ 0.74
//
//   Deep ball (near your baseline):     y: 0.85-0.95
//   Medium depth:                       y: 0.75-0.84
//   Short ball (inside your service box): y: 0.55-0.73
//   At the net / volley position:       y: 0.45-0.55
//   Opponent's side (targets):          y: 0.05-0.20
//
// TACTICAL RULES:
//   1. Deep ball → rally cross-court (safe, rebuild)
//   2. Short ball → attack down the line (approach)
//   3. At the net → volley to open court
//   4. Opponent at net → pass down the line or lob
//   5. Opponent cheating/wrong-footed → go behind them
//
// SHOT DIRECTIONS (first-person view):
//   Ball on YOUR RIGHT:  cross-court → far LEFT (x≈0.2-0.3), DTL → far RIGHT (x≈0.7-0.8)
//   Ball on YOUR LEFT:   cross-court → far RIGHT (x≈0.7-0.8), DTL → far LEFT (x≈0.2-0.3)
//
// OPPONENT TRACKING: The opponent is at the position they just hit from,
// or slightly recovering toward center.

export const rallies = [
  // ============ GREEN (Beginner) ============
  {
    id: 'rally-and-attack',
    name: 'Rally & Attack',
    description: 'Keep the ball deep cross-court until you get a short ball, then attack down the line!',
    difficulty: 'green',
    steps: [
      {
        // Deep ball to your right (y:0.88 = near baseline)
        // Deep ball → rally cross-court to far left
        // Opponent at center baseline
        description: 'Deep ball to your forehand. Rally cross-court.',
        ballPosition: { x: 0.7, y: 0.88 },
        correctZone: { x: 0.25, y: 0.12, radius: 0.25 },
        correctLabel: 'Deep cross-court!',
        explanation: 'Deep ball = rally cross-court. Smart and patient!',
        wrongExplanation: 'That ball was deep near your baseline — rally it cross-court to the far left. Stay patient!',
        opponentPosition: { x: 0.5, y: 0.1 },
      },
      {
        // Opponent hit from far left (x:0.25), sends a short ball to your right
        // Short ball (y:0.62 = inside service box) → attack DTL to far right
        // Opponent stuck at x:0.25 — DTL goes to the open court
        description: 'Short ball to your right! Attack it.',
        ballPosition: { x: 0.65, y: 0.62 },
        correctZone: { x: 0.75, y: 0.12, radius: 0.25 },
        correctLabel: 'Attack down the line!',
        explanation: 'Short ball = step in and attack down the line! Your opponent couldn\'t recover.',
        wrongExplanation: 'That was a short ball on your right — attack DOWN THE LINE to the far right!',
        opponentPosition: { x: 0.25, y: 0.12 },
      },
    ],
  },
  {
    id: 'backhand-battle',
    name: 'Backhand Battle',
    description: 'Rally deep on the backhand side, wait for the short ball, then attack down the line!',
    difficulty: 'green',
    steps: [
      {
        // Deep ball to your left (y:0.87 = near baseline)
        // Deep ball → cross-court to far right
        // Opponent at center
        description: 'Deep ball to your backhand. Rally cross-court.',
        ballPosition: { x: 0.3, y: 0.87 },
        correctZone: { x: 0.75, y: 0.12, radius: 0.25 },
        correctLabel: 'Deep cross-court!',
        explanation: 'Backhand cross-court, deep and solid. Keep building!',
        wrongExplanation: 'That ball was deep on your left — rally it cross-court to the far right. Be patient!',
        opponentPosition: { x: 0.5, y: 0.1 },
      },
      {
        // Opponent hit from far right (x:0.75), sends a short ball to your left
        // Short ball (y:0.6) → attack DTL to far left
        // Opponent at x:0.75 — DTL goes to open court on the left
        description: 'Short ball to your left! Attack it.',
        ballPosition: { x: 0.35, y: 0.6 },
        correctZone: { x: 0.25, y: 0.12, radius: 0.25 },
        correctLabel: 'Attack down the line!',
        explanation: 'Short ball on your left — you attacked down the line into the open court!',
        wrongExplanation: 'That was a short ball on your left — attack DOWN THE LINE to the far left!',
        opponentPosition: { x: 0.75, y: 0.12 },
      },
    ],
  },
  {
    id: 'return-deep',
    name: 'Return & Recover',
    description: 'Return the serve deep cross-court, then punish the weak reply down the line!',
    difficulty: 'green',
    steps: [
      {
        // Serve arrives deep to your left (y:0.9 — serves push you back)
        // Deep ball → return cross-court to far right
        // Server at center baseline
        description: 'Serve comes deep to your backhand. Return it safely.',
        ballPosition: { x: 0.2, y: 0.9 },
        correctZone: { x: 0.7, y: 0.1, radius: 0.28 },
        correctLabel: 'Deep cross-court return!',
        explanation: 'Great return! Deep cross-court puts the server under pressure.',
        wrongExplanation: 'On the return, go DEEP CROSS-COURT. From your left, that means the far right!',
        opponentPosition: { x: 0.5, y: 0.08 },
      },
      {
        // Opponent hit from far right (x:0.7), sends a short ball to your left
        // Short ball (y:0.6) → attack DTL to far left
        // Opponent at x:0.7 — DTL and open court both on the left
        description: 'Weak short reply to your left. Attack it!',
        ballPosition: { x: 0.38, y: 0.6 },
        correctZone: { x: 0.25, y: 0.12, radius: 0.25 },
        correctLabel: 'Attack down the line!',
        explanation: 'Return deep, wait for the short ball, attack down the line. Textbook!',
        wrongExplanation: 'That was a short ball on your left — attack DOWN THE LINE to the far left!',
        opponentPosition: { x: 0.7, y: 0.12 },
      },
    ],
  },

  // ============ ORANGE (Intermediate) ============
  {
    id: 'approach-and-volley',
    name: 'Approach & Volley',
    description: 'Hit an approach shot down the line on a short ball, rush the net, and finish with a volley!',
    difficulty: 'orange',
    steps: [
      {
        // Short ball to your right (y:0.6 = inside service box)
        // Short ball → approach DTL to far right
        // Opponent on the left side
        description: 'Short ball to your forehand. Approach the net!',
        ballPosition: { x: 0.65, y: 0.6 },
        correctZone: { x: 0.75, y: 0.12, radius: 0.25 },
        correctLabel: 'Approach down the line!',
        explanation: 'Approach shots go DOWN THE LINE — then follow the ball to the net!',
        wrongExplanation: 'Short ball on your right — approach DOWN THE LINE to the far right, then rush to the net!',
        opponentPosition: { x: 0.3, y: 0.1 },
      },
      {
        // You're at net. Opponent scrambled right (x:0.7) to get the DTL approach
        // They try to pass you to your LEFT — ball at net height on your left
        // Volley cross-court to far right (open court behind them)
        description: 'You\'re at the net! Opponent tries to pass you. Put it away!',
        ballPosition: { x: 0.3, y: 0.5 },
        correctZone: { x: 0.75, y: 0.1, radius: 0.28 },
        correctLabel: 'Volley to open court!',
        explanation: 'Approach DTL, then volley cross-court to finish. Champion play!',
        wrongExplanation: 'At the net, volley to the OPEN court! Ball on your left — volley cross-court to the far right!',
        opponentPosition: { x: 0.7, y: 0.15 },
      },
    ],
  },
  {
    id: 'drop-shot-surprise',
    name: 'Drop Shot Surprise',
    description: 'Push your opponent deep behind the baseline, then drop it short!',
    difficulty: 'orange',
    steps: [
      {
        // Deep ball to your right (y:0.88)
        // Deep ball → deep cross-court to push opponent back
        // Opponent at center
        description: 'Deep ball to your forehand. Push them back!',
        ballPosition: { x: 0.7, y: 0.88 },
        correctZone: { x: 0.25, y: 0.08, radius: 0.25 },
        correctLabel: 'Deep cross-court!',
        explanation: 'Deep and heavy! Your opponent is being pushed further back...',
        wrongExplanation: 'Hit it DEEP cross-court to push your opponent behind the baseline!',
        opponentPosition: { x: 0.5, y: 0.08 },
      },
      {
        // Opponent is way behind baseline (y:0.03, x:0.25)
        // Medium ball comes back (y:0.8) — not super short, but opponent is way deep
        // Drop shot lands just past the net on opponent's side (y:0.38)
        description: 'Your opponent is way behind the baseline. Surprise them!',
        ballPosition: { x: 0.55, y: 0.8 },
        correctZone: { x: 0.5, y: 0.38, radius: 0.22 },
        correctLabel: 'Drop shot!',
        explanation: 'Sneaky! They were so far back they couldn\'t reach it!',
        wrongExplanation: 'Your opponent is way behind the baseline — hit a DROP SHOT just over the net! Aim short!',
        opponentPosition: { x: 0.25, y: 0.03 },
      },
    ],
  },
  {
    id: 'passing-shot',
    name: 'The Passing Shot',
    description: 'Your opponent charges the net — blast it past them down the line!',
    difficulty: 'orange',
    steps: [
      {
        // Deep ball to your right (y:0.87)
        // Deep ball → cross-court to far left
        // Opponent at center
        description: 'Deep ball to your forehand. Start the rally.',
        ballPosition: { x: 0.7, y: 0.87 },
        correctZone: { x: 0.25, y: 0.12, radius: 0.25 },
        correctLabel: 'Deep cross-court!',
        explanation: 'Good rally ball! But watch out — your opponent is coming forward...',
        wrongExplanation: 'Deep ball on your right — rally it cross-court to the far left.',
        opponentPosition: { x: 0.5, y: 0.1 },
      },
      {
        // Opponent approaches net from the left side (x:0.35, y:0.38)
        // They're covering the cross-court side
        // Deep-ish ball on your right (y:0.82) — pass them DTL to far right
        description: 'Your opponent rushes to the net! They\'re covering the cross-court side. Pass them!',
        ballPosition: { x: 0.65, y: 0.82 },
        correctZone: { x: 0.8, y: 0.12, radius: 0.25 },
        correctLabel: 'Passing shot down the line!',
        explanation: 'BOOM! Right past them down the line! They couldn\'t touch it!',
        wrongExplanation: 'Your opponent is at the net covering the left side — pass them DOWN THE LINE to the far right!',
        opponentPosition: { x: 0.35, y: 0.38 },
      },
    ],
  },
  {
    id: 'defend-and-lob',
    name: 'Defend & Lob',
    description: 'You\'re stretched wide with the opponent at the net — lob them, then attack!',
    difficulty: 'orange',
    steps: [
      {
        // Opponent at net, smashes volley wide to your LEFT
        // Ball very wide and deep (y:0.92, x:0.1) — you're stretched
        // Stretched + opponent at net → LOB high and deep over their head
        description: 'Opponent at the net smashes it wide! You\'re stretched. Stay alive!',
        ballPosition: { x: 0.1, y: 0.92 },
        correctZone: { x: 0.6, y: 0.06, radius: 0.28 },
        correctLabel: 'LOB! High and deep!',
        explanation: 'Smart play! A high lob over their head buys you time!',
        wrongExplanation: 'You\'re stretched wide and the opponent is at the net — LOB it HIGH and DEEP over their head!',
        opponentPosition: { x: 0.45, y: 0.38 },
      },
      {
        // Opponent chased lob to far right (x:0.6), hits a short ball to your left
        // Short ball (y:0.6) on your left → attack DTL to far left
        // Opponent at x:0.6 recovering — open court on the left
        description: 'Your lob worked! Weak short ball back. Finish the point!',
        ballPosition: { x: 0.35, y: 0.6 },
        correctZone: { x: 0.2, y: 0.12, radius: 0.25 },
        correctLabel: 'Attack down the line!',
        explanation: 'Defended, lobbed, then attacked down the line. Tennis IQ!',
        wrongExplanation: 'Short ball on your left — attack DOWN THE LINE to the far left!',
        opponentPosition: { x: 0.6, y: 0.1 },
      },
    ],
  },

  // ============ RED (Advanced) ============
  {
    id: 'wrong-foot',
    name: 'The Wrong-Foot',
    description: 'Hit two cross-courts to build the pattern, then go behind your opponent!',
    difficulty: 'red',
    steps: [
      {
        // Deep ball to your left (y:0.87)
        // Deep ball → cross-court to far right
        // Opponent at center, will move to x:0.75
        description: 'Deep ball to your backhand. Build the pattern.',
        ballPosition: { x: 0.3, y: 0.87 },
        correctZone: { x: 0.75, y: 0.12, radius: 0.25 },
        correctLabel: 'Cross-court!',
        explanation: 'Good. Your opponent is starting to expect cross-court...',
        wrongExplanation: 'Deep ball on your left — rally it cross-court to the far right. Build the pattern!',
        opponentPosition: { x: 0.5, y: 0.1 },
      },
      {
        // Deep ball to your left again (y:0.86)
        // Cross-court again to set the trap
        // Opponent at x:0.75 (hit from there, recovering)
        description: 'Deep ball to your backhand again. One more cross-court!',
        ballPosition: { x: 0.28, y: 0.86 },
        correctZone: { x: 0.75, y: 0.12, radius: 0.25 },
        correctLabel: 'Cross-court again!',
        explanation: 'They\'re cheating to the right now... time to spring the trap!',
        wrongExplanation: 'Keep going cross-court to set the trap — one more to the far right!',
        opponentPosition: { x: 0.7, y: 0.1 },
      },
      {
        // Deep ball to your left (y:0.84)
        // Opponent is cheating far right (x:0.82) expecting cross-court
        // WRONG FOOT: go behind them DTL to far LEFT
        description: 'Your opponent is already moving right. Wrong-foot them!',
        ballPosition: { x: 0.35, y: 0.84 },
        correctZone: { x: 0.25, y: 0.12, radius: 0.25 },
        correctLabel: 'Behind them!',
        explanation: 'GENIUS! They ran right but you went left — completely wrong-footed!',
        wrongExplanation: 'Your opponent is cheating to the RIGHT — hit it to the LEFT, behind them!',
        opponentPosition: { x: 0.82, y: 0.1 },
      },
    ],
  },
  {
    id: 'serve-wide-attack',
    name: 'Serve Wide & Dominate',
    description: 'Your wide serve stretches the opponent — attack the short return down the line, then volley!',
    difficulty: 'red',
    steps: [
      {
        // You served wide left. Opponent is stretched far left (x:0.15)
        // Serve return comes back short to your right (y:0.65 — inside service box)
        // Short ball on right → attack DTL to far right (open court)
        description: 'Your wide serve stretched them! Weak return comes back short. Attack!',
        ballPosition: { x: 0.6, y: 0.65 },
        correctZone: { x: 0.8, y: 0.12, radius: 0.25 },
        correctLabel: 'Attack down the line!',
        explanation: 'Serve wide, short return, attack DTL! You\'re in control!',
        wrongExplanation: 'Short ball on your right after the wide serve — attack DOWN THE LINE to the far right!',
        opponentPosition: { x: 0.15, y: 0.1 },
      },
      {
        // Opponent scrambled right to chase the DTL (x:0.75), hits a short ball back
        // Short ball on your right (y:0.6) → approach DTL again
        description: 'They scrambled but sent back another short ball. Approach the net!',
        ballPosition: { x: 0.65, y: 0.6 },
        correctZone: { x: 0.75, y: 0.12, radius: 0.25 },
        correctLabel: 'Approach down the line!',
        explanation: 'Perfect approach shot! Now rush to the net!',
        wrongExplanation: 'Short ball on your right — approach DOWN THE LINE and follow it to the net!',
        opponentPosition: { x: 0.55, y: 0.12 },
      },
      {
        // You're at net. Opponent at right side (x:0.7), tries to pass you left
        // Ball at net height on your left → volley cross-court to open court (right)
        description: 'You\'re at the net! Opponent tries to pass you. Finish it!',
        ballPosition: { x: 0.25, y: 0.5 },
        correctZone: { x: 0.8, y: 0.1, radius: 0.25 },
        correctLabel: 'Volley cross-court!',
        explanation: 'UNSTOPPABLE! Serve wide, attack, approach, volley — total domination!',
        wrongExplanation: 'Ball on your left at the net — volley CROSS-COURT to the far right! That\'s the open court!',
        opponentPosition: { x: 0.7, y: 0.15 },
      },
    ],
  },
  {
    id: 'counter-attack',
    name: 'The Counter-Attack',
    description: 'Defend deep cross-court under pressure, change direction, then attack the short ball!',
    difficulty: 'red',
    steps: [
      {
        // Big shot deep to your left (y:0.92 — pushed way back)
        // Deep ball → defend cross-court to far right
        // Opponent at center
        description: 'Big shot pushes you deep on your backhand. Stay in the point!',
        ballPosition: { x: 0.15, y: 0.92 },
        correctZone: { x: 0.75, y: 0.1, radius: 0.25 },
        correctLabel: 'Deep cross-court!',
        explanation: 'Solid defense! Deep cross-court buys you time.',
        wrongExplanation: 'Under pressure deep on your left — go DEEP CROSS-COURT to the far right! Stay alive!',
        opponentPosition: { x: 0.5, y: 0.08 },
      },
      {
        // Opponent hit from far right (x:0.75), attacks your backhand again
        // Deep ball to your left (y:0.88) — opponent cheating right expecting cross-court
        // Counter-attack: go behind them DTL to far LEFT
        description: 'They attack your backhand again! They\'re expecting cross-court. Surprise them!',
        ballPosition: { x: 0.2, y: 0.88 },
        correctZone: { x: 0.25, y: 0.12, radius: 0.25 },
        correctLabel: 'Down the line!',
        explanation: 'They expected cross-court but you went down the line! Caught them off guard!',
        wrongExplanation: 'Your opponent is on the RIGHT expecting cross-court — go DOWN THE LINE to the far left!',
        opponentPosition: { x: 0.75, y: 0.08 },
      },
      {
        // Opponent scrambled to far left (x:0.25) to chase the DTL
        // Hits a short ball to your right (y:0.6) — they're off balance
        // Short ball on right → attack DTL to far right (open court)
        description: 'They scrambled and hit a short ball. They\'re stuck on the left. End it!',
        ballPosition: { x: 0.6, y: 0.6 },
        correctZone: { x: 0.8, y: 0.12, radius: 0.25 },
        correctLabel: 'Finish down the line!',
        explanation: 'WHAT A COMEBACK! Defended, changed direction, attacked the short ball. Champion tennis!',
        wrongExplanation: 'Short ball on your right — finish it DOWN THE LINE to the far right!',
        opponentPosition: { x: 0.25, y: 0.15 },
      },
    ],
  },
];

export const difficultyColors = {
  green: { bg: 'bg-green-500', text: 'text-green-400', label: 'Green Stage' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-400', label: 'Orange Stage' },
  red: { bg: 'bg-red-500', text: 'text-red-400', label: 'Red Stage' },
};
