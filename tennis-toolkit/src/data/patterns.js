// First-person court coordinates:
// x: 0 = your left, 1 = your right
// y: 0 = opponent's baseline (far/top), 1 = your baseline (near/bottom)
// Net is at approximately y ≈ 0.42
//
// TENNIS SHOT DIRECTIONS (from first-person view):
//   Ball on YOUR RIGHT (forehand for right-hander):
//     Cross-court → far LEFT  (x ≈ 0.2-0.3)
//     Down the line → far RIGHT (x ≈ 0.7-0.8)
//
//   Ball on YOUR LEFT (backhand for right-hander):
//     Cross-court → far RIGHT (x ≈ 0.7-0.8)
//     Down the line → far LEFT  (x ≈ 0.2-0.3)
//
// OPPONENT TRACKING: After you hit to position X on the far side,
// the opponent moves to approximately X to play the ball.
//
// Each rally is a sequence of steps. Get one wrong = point over.
// Get them all right = point won!

export const rallies = [
  // ============ GREEN (Beginner) ============
  {
    id: 'rally-and-attack',
    name: 'Rally & Attack',
    description: 'Keep the ball cross-court until you get a short ball, then pounce!',
    difficulty: 'green',
    steps: [
      {
        // Ball on your right → cross-court goes far left
        // Opponent starts center, will move to ~x:0.25 to play it
        description: 'Ball comes to your forehand (right side). Start the rally!',
        ballPosition: { x: 0.7, y: 0.7 },
        correctZone: { x: 0.25, y: 0.2, radius: 0.25 },
        correctLabel: 'Cross-court!',
        explanation: 'From your right, cross-court goes to the far left. Smart and safe!',
        wrongExplanation: 'From your right side, cross-court goes to the far LEFT. Stay patient!',
        opponentPosition: { x: 0.5, y: 0.15 },
      },
      {
        // Opponent played from x:0.25 (far left), hit a short ball to middle
        // Opponent is still at x:0.25 — open court is on the RIGHT
        description: 'Your opponent hits a SHORT ball to the middle! They\'re stuck on the left. Attack!',
        ballPosition: { x: 0.5, y: 0.5 },
        correctZone: { x: 0.75, y: 0.2, radius: 0.25 },
        correctLabel: 'Attack the open court!',
        explanation: 'Short ball = attack the open side! Your opponent was stuck left, you went right!',
        wrongExplanation: 'Your opponent is stuck on the LEFT. The open court is on the RIGHT — attack it there!',
        opponentPosition: { x: 0.25, y: 0.25 },
      },
    ],
  },
  {
    id: 'backhand-battle',
    name: 'Backhand Battle',
    description: 'Win the backhand rally and find the opening!',
    difficulty: 'green',
    steps: [
      {
        // Ball on your left → cross-court goes far right
        // Opponent starts center, will move to ~x:0.75 to play it
        description: 'Ball comes to your backhand (left side). Where do you hit?',
        ballPosition: { x: 0.3, y: 0.7 },
        correctZone: { x: 0.75, y: 0.2, radius: 0.25 },
        correctLabel: 'Cross-court!',
        explanation: 'Backhand cross-court goes to the far right. Solid!',
        wrongExplanation: 'From your LEFT (backhand), cross-court goes to the far RIGHT.',
        opponentPosition: { x: 0.5, y: 0.15 },
      },
      {
        // Opponent played from x:0.75 (far right), hit a weak short ball
        // Opponent is at x:0.75 — open court is on the LEFT
        description: 'Your opponent is pulled wide RIGHT and hits a weak short ball. Open court is on the LEFT!',
        ballPosition: { x: 0.45, y: 0.5 },
        correctZone: { x: 0.25, y: 0.2, radius: 0.25 },
        correctLabel: 'Attack the open court!',
        explanation: 'You read the open court perfectly. Point won!',
        wrongExplanation: 'Your opponent is stuck on the RIGHT side. The open court is on the LEFT — hit it there!',
        opponentPosition: { x: 0.75, y: 0.25 },
      },
    ],
  },
  {
    id: 'return-deep',
    name: 'Return & Recover',
    description: 'Return the serve safely, then take control of the rally!',
    difficulty: 'green',
    steps: [
      {
        // Serve to your backhand (left) → return cross-court goes far right
        // Opponent serves from center, will move to ~x:0.7 to cover your return
        description: 'Your opponent serves to your backhand (left). Return it safely!',
        ballPosition: { x: 0.2, y: 0.8 },
        correctZone: { x: 0.7, y: 0.18, radius: 0.28 },
        correctLabel: 'Deep cross-court!',
        explanation: 'Great return! Deep cross-court is the safest play on a return.',
        wrongExplanation: 'On the return, go DEEP CROSS-COURT. From your left, that means far right!',
        opponentPosition: { x: 0.5, y: 0.12 },
      },
      {
        // Opponent played from x:0.7 (far right), under pressure, hits short
        // Opponent is at x:0.7 — open court is on the LEFT
        description: 'Your opponent scrambles and hits it SHORT! They\'re stuck on the right. Attack the open side!',
        ballPosition: { x: 0.5, y: 0.48 },
        correctZone: { x: 0.25, y: 0.18, radius: 0.25 },
        correctLabel: 'Attack the open court!',
        explanation: 'Return deep, wait for the weak reply, attack the open court. Textbook tennis!',
        wrongExplanation: 'Your opponent is stuck on the RIGHT from chasing your return. The open court is on the LEFT — hit it there!',
        opponentPosition: { x: 0.7, y: 0.2 },
      },
    ],
  },

  // ============ ORANGE (Intermediate) ============
  {
    id: 'approach-and-volley',
    name: 'Approach & Volley',
    description: 'Hit an approach shot, rush the net, and finish with a volley!',
    difficulty: 'orange',
    steps: [
      {
        // Short ball on your right → approach down the line to far right
        // Opponent is on the left side. After our DTL, they scramble to ~x:0.75
        description: 'Short ball to your forehand (right)! Hit an approach shot and come to net!',
        ballPosition: { x: 0.6, y: 0.5 },
        correctZone: { x: 0.75, y: 0.18, radius: 0.25 },
        correctLabel: 'Approach down the line!',
        explanation: 'Approach shots go DOWN THE LINE — then follow the ball to the net!',
        wrongExplanation: 'Approach shots should go DOWN THE LINE. Ball on your right = aim far right, then rush to net!',
        opponentPosition: { x: 0.3, y: 0.15 },
      },
      {
        // You're at the net. Opponent scrambled right, tries to pass you to your LEFT
        // Ball on your left at the net → volley cross-court to far right (open court)
        description: 'You\'re at the net! Your opponent tries to pass you to your LEFT. Volley it away!',
        ballPosition: { x: 0.3, y: 0.4 },
        correctZone: { x: 0.75, y: 0.15, radius: 0.28 },
        correctLabel: 'Volley to open court!',
        explanation: 'Clinical! Approach down the line, then volley cross-court to finish. Champion play!',
        wrongExplanation: 'At the net, volley to the OPEN court! Ball on your left → volley cross-court to the far RIGHT!',
        opponentPosition: { x: 0.7, y: 0.2 },
      },
    ],
  },
  {
    id: 'drop-shot-surprise',
    name: 'Drop Shot Surprise',
    description: 'Push your opponent deep, then sneak in a cheeky drop shot!',
    difficulty: 'orange',
    steps: [
      {
        // Ball on your right → deep cross-court to far left
        // Pushes opponent deep behind x:0.25
        description: 'Forehand rally — ball to your right. Push them deep!',
        ballPosition: { x: 0.7, y: 0.7 },
        correctZone: { x: 0.25, y: 0.12, radius: 0.25 },
        correctLabel: 'Deep cross-court!',
        explanation: 'Deep and heavy! Your opponent is being pushed further and further back...',
        wrongExplanation: 'Hit it DEEP cross-court to push your opponent behind the baseline! From your right, aim far left.',
        opponentPosition: { x: 0.5, y: 0.12 },
      },
      {
        // Opponent is WAY behind the baseline at far left (x:0.25, y:0.05)
        // Drop shot lands just past the net on opponent's side (y ≈ 0.32)
        description: 'Your opponent is stuck WAY behind the baseline! They\'ll never reach a short ball!',
        ballPosition: { x: 0.55, y: 0.65 },
        correctZone: { x: 0.5, y: 0.32, radius: 0.22 },
        correctLabel: 'Drop shot!',
        explanation: 'Sneaky! They were so far back they couldn\'t reach it. Love that touch!',
        wrongExplanation: 'Your opponent is way behind the baseline — hit a DROP SHOT just over the net! They\'ll never get there!',
        opponentPosition: { x: 0.25, y: 0.05 },
      },
    ],
  },
  {
    id: 'passing-shot',
    name: 'The Passing Shot',
    description: 'Your opponent charges the net — blast it past them!',
    difficulty: 'orange',
    steps: [
      {
        // Ball on your right → cross-court to far left
        // Opponent starts center, moves to ~x:0.25
        description: 'You\'re rallying cross-court. Ball comes to your right.',
        ballPosition: { x: 0.7, y: 0.7 },
        correctZone: { x: 0.25, y: 0.2, radius: 0.25 },
        correctLabel: 'Cross-court!',
        explanation: 'Good rally ball! But watch out — your opponent is moving forward...',
        wrongExplanation: 'Keep it cross-court from your right — aim for the far left.',
        opponentPosition: { x: 0.5, y: 0.15 },
      },
      {
        // Opponent charges net from the left side (x:0.35, y:0.35)
        // They're covering the cross-court (left side)
        // Ball on your right → pass them DOWN THE LINE to far right
        description: 'Your opponent charges to the net! They\'re covering the cross-court side. Ball to your right — pass them!',
        ballPosition: { x: 0.65, y: 0.6 },
        correctZone: { x: 0.8, y: 0.18, radius: 0.25 },
        correctLabel: 'Passing shot down the line!',
        explanation: 'BOOM! Right past them down the line! They couldn\'t touch it!',
        wrongExplanation: 'Your opponent is at the net covering the LEFT side. Pass them DOWN THE LINE to the far RIGHT!',
        opponentPosition: { x: 0.35, y: 0.35 },
      },
    ],
  },
  {
    id: 'defend-and-lob',
    name: 'Defend & Lob',
    description: 'You\'re in trouble — use a lob to escape and turn the tables!',
    difficulty: 'orange',
    steps: [
      {
        // Opponent is at net. Smashes a volley wide to your LEFT
        // You're stretched — lob it HIGH and DEEP over their head
        // Lob goes to far right side so opponent chases right
        description: 'Your opponent rushes to the net and smashes a volley wide to your LEFT! You\'re stretched!',
        ballPosition: { x: 0.1, y: 0.85 },
        correctZone: { x: 0.6, y: 0.1, radius: 0.28 },
        correctLabel: 'LOB! High and deep!',
        explanation: 'Smart play! A high lob over their head buys you time!',
        wrongExplanation: 'When you\'re stretched wide and your opponent is at the net, LOB it HIGH and DEEP over their head to the back of the court!',
        opponentPosition: { x: 0.45, y: 0.35 },
      },
      {
        // Opponent chased the lob to far right (x:0.65) and hit a weak ball back
        // Opponent is at x:0.7, deep — open court is on the LEFT
        description: 'Your lob worked! They chased it back and hit a weak ball to the middle. They\'re stuck on the right!',
        ballPosition: { x: 0.5, y: 0.55 },
        correctZone: { x: 0.2, y: 0.18, radius: 0.25 },
        correctLabel: 'Attack the open court!',
        explanation: 'Defended, lobbed, then attacked the open court. Tennis IQ through the roof!',
        wrongExplanation: 'Your opponent chased the lob to the RIGHT and is stuck there. The open court is on the LEFT — attack it!',
        opponentPosition: { x: 0.7, y: 0.12 },
      },
    ],
  },

  // ============ RED (Advanced) ============
  {
    id: 'wrong-foot',
    name: 'The Wrong-Foot',
    description: 'Set up the pattern, then catch your opponent going the wrong way!',
    difficulty: 'red',
    steps: [
      {
        // Ball on your left → cross-court goes far right
        // Opponent starts center, moves to ~x:0.75
        description: 'Backhand rally. Ball to your left. Build the pattern!',
        ballPosition: { x: 0.3, y: 0.7 },
        correctZone: { x: 0.75, y: 0.22, radius: 0.25 },
        correctLabel: 'Cross-court!',
        explanation: 'Good. Your opponent is starting to expect cross-court every time...',
        wrongExplanation: 'Backhand cross-court goes to the far RIGHT. Build the pattern first!',
        opponentPosition: { x: 0.5, y: 0.15 },
      },
      {
        // Opponent played from x:0.75, hit it back to your left
        // Ball on your left again → cross-court to far right again
        // Opponent is at x:0.75, already expecting cross-court
        description: 'Ball to your left again. One more cross-court to set the trap!',
        ballPosition: { x: 0.28, y: 0.72 },
        correctZone: { x: 0.75, y: 0.2, radius: 0.25 },
        correctLabel: 'Cross-court again!',
        explanation: 'They\'re cheating to the right now... time to spring the trap!',
        wrongExplanation: 'Keep going cross-court to set the trap! Your opponent will start cheating that direction.',
        opponentPosition: { x: 0.75, y: 0.15 },
      },
      {
        // Opponent is cheating far right (x:0.8) expecting cross-court
        // Ball on your left → WRONG FOOT: down the line to far LEFT
        // Opponent running right, ball goes behind them to the left
        description: 'Your opponent is already moving RIGHT expecting cross-court. Wrong-foot them!',
        ballPosition: { x: 0.35, y: 0.68 },
        correctZone: { x: 0.25, y: 0.22, radius: 0.25 },
        correctLabel: 'Behind them!',
        explanation: 'GENIUS! They ran right but you went left — completely wrong-footed!',
        wrongExplanation: 'Your opponent is running RIGHT. Hit it to the LEFT — behind them! They can\'t change direction!',
        opponentPosition: { x: 0.8, y: 0.15 },
      },
    ],
  },
  {
    id: 'serve-wide-attack',
    name: 'Serve Wide & Dominate',
    description: 'A wide serve opens the court — take over and finish at the net!',
    difficulty: 'red',
    steps: [
      {
        // You served wide to the LEFT. Opponent is stretched far left (x:0.15)
        // Ball comes back to middle — open court is on the RIGHT
        description: 'You served wide! Your opponent barely got it back. The right side is wide open!',
        ballPosition: { x: 0.5, y: 0.65 },
        correctZone: { x: 0.8, y: 0.22, radius: 0.25 },
        correctLabel: 'Attack the open court!',
        explanation: 'Great read! You spotted the open court and went for it!',
        wrongExplanation: 'After a wide serve, your opponent is stretched far LEFT. The open court is on the RIGHT — attack it!',
        opponentPosition: { x: 0.15, y: 0.15 },
      },
      {
        // Opponent scrambled toward x:0.8 to play your shot, hits a weak short ball
        // Approach down the line from right → far right
        description: 'Weak reply comes back short to your right. Move forward and approach!',
        ballPosition: { x: 0.6, y: 0.5 },
        correctZone: { x: 0.75, y: 0.18, radius: 0.25 },
        correctLabel: 'Approach down the line!',
        explanation: 'Perfect approach shot! Now rush to the net!',
        wrongExplanation: 'Short ball = approach DOWN THE LINE! Ball on your right, aim far right, then follow it to the net!',
        opponentPosition: { x: 0.55, y: 0.2 },
      },
      {
        // You're at the net. Opponent tries to pass you to your LEFT
        // Ball on your left at net → volley cross-court to far right
        // Opponent is on the left side
        description: 'You\'re at the net! Your opponent tries to pass you to your LEFT. Finish it!',
        ballPosition: { x: 0.25, y: 0.4 },
        correctZone: { x: 0.8, y: 0.15, radius: 0.25 },
        correctLabel: 'Volley cross-court!',
        explanation: 'UNSTOPPABLE! Serve wide, attack, approach, volley — total domination!',
        wrongExplanation: 'Ball on your LEFT at the net → volley CROSS-COURT to the far RIGHT! That\'s where the open court is!',
        opponentPosition: { x: 0.2, y: 0.22 },
      },
    ],
  },
  {
    id: 'counter-attack',
    name: 'The Counter-Attack',
    description: 'Your opponent is blasting big shots — stay strong and turn defense into attack!',
    difficulty: 'red',
    steps: [
      {
        // Big shot to your backhand (left) → deep cross-court to far right
        // Opponent at center, will move to ~x:0.75
        description: 'Big forehand blasted to your backhand! Ball flying to your left. Stay in it!',
        ballPosition: { x: 0.15, y: 0.78 },
        correctZone: { x: 0.75, y: 0.2, radius: 0.25 },
        correctLabel: 'Deep cross-court!',
        explanation: 'Solid defense! Deep cross-court buys you time.',
        wrongExplanation: 'Under pressure on your backhand (left), go DEEP CROSS-COURT to the far right!',
        opponentPosition: { x: 0.5, y: 0.12 },
      },
      {
        // Opponent played from x:0.75 (far right), attacks your backhand again
        // Ball on your left → THIS TIME go down the line to far LEFT
        // Opponent at x:0.75 expecting cross-court — catches them off guard
        description: 'They attack your backhand AGAIN from the right! This time, flip the script!',
        ballPosition: { x: 0.2, y: 0.75 },
        correctZone: { x: 0.25, y: 0.2, radius: 0.25 },
        correctLabel: 'Down the line!',
        explanation: 'They expected cross-court but you went down the line! Caught them off guard!',
        wrongExplanation: 'Your opponent is on the RIGHT expecting cross-court. Go DOWN THE LINE to the far LEFT to surprise them!',
        opponentPosition: { x: 0.75, y: 0.15 },
      },
      {
        // Opponent scrambled to x:0.25 (far left) to get the DTL, hits weak short ball
        // Opponent is at x:0.25 — open court is on the RIGHT
        description: 'Your opponent scrambles and hits a weak short ball. They\'re stuck on the left. End it!',
        ballPosition: { x: 0.45, y: 0.5 },
        correctZone: { x: 0.8, y: 0.18, radius: 0.25 },
        correctLabel: 'Finish to the open court!',
        explanation: 'WHAT A COMEBACK! Defended, changed direction, then attacked the open court. Champion tennis!',
        wrongExplanation: 'Your opponent scrambled to the LEFT. The open court is on the RIGHT — finish the point there!',
        opponentPosition: { x: 0.25, y: 0.25 },
      },
    ],
  },
];

export const difficultyColors = {
  green: { bg: 'bg-green-500', text: 'text-green-400', label: 'Green Stage' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-400', label: 'Orange Stage' },
  red: { bg: 'bg-red-500', text: 'text-red-400', label: 'Red Stage' },
};
