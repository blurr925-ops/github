// First-person court coordinates:
// x: 0 = your left, 1 = your right
// y: 0 = opponent's baseline (far/top), 1 = your baseline (near/bottom)
//
// TENNIS SHOT DIRECTIONS (from first-person view):
//   Ball on YOUR RIGHT (forehand):
//     Cross-court → far LEFT  (x ≈ 0.25)
//     Down the line → far RIGHT (x ≈ 0.75)
//
//   Ball on YOUR LEFT (backhand):
//     Cross-court → far RIGHT (x ≈ 0.75)
//     Down the line → far LEFT  (x ≈ 0.25)
//
// Each rally is a sequence of steps. Get one wrong = point over.
// Get them all right = point won!

export const rallies = [
  {
    id: 'crosscourt-attack',
    name: 'Cross-Court to Attack',
    description: 'Build the rally cross-court, then attack the short ball!',
    difficulty: 'green',
    steps: [
      {
        description: 'You\'re rallying on your forehand side. Ball comes to your right.',
        ballPosition: { x: 0.7, y: 0.7 },
        correctZone: { x: 0.25, y: 0.2, radius: 0.25 },
        correctLabel: 'Cross-court',
        explanation: 'Keep it cross-court — safe and consistent!',
        wrongExplanation: 'In a rally, keep it cross-court! From your right, cross-court goes to the far left.',
      },
      {
        description: 'Good rally! Ball comes back to your right again.',
        ballPosition: { x: 0.65, y: 0.72 },
        correctZone: { x: 0.25, y: 0.22, radius: 0.25 },
        correctLabel: 'Cross-court',
        explanation: 'Great patience! Keep building the rally.',
        wrongExplanation: 'Stay patient! Keep rallying cross-court until you get a short ball.',
      },
      {
        description: 'Your opponent hits a SHORT ball! It lands near the service line. Attack it!',
        ballPosition: { x: 0.55, y: 0.5 },
        correctZone: { x: 0.75, y: 0.2, radius: 0.25 },
        correctLabel: 'Down the line!',
        explanation: 'Perfect! Short ball → attack down the line to the open court!',
        wrongExplanation: 'When you get a short ball after a cross-court rally, attack DOWN THE LINE (far right). Your opponent is stuck on the left!',
      },
    ],
  },
  {
    id: 'backhand-rally-attack',
    name: 'Backhand Rally to Attack',
    description: 'Rally cross-court on your backhand, wait for the opening!',
    difficulty: 'green',
    steps: [
      {
        description: 'Ball comes to your backhand (left side). Where do you hit?',
        ballPosition: { x: 0.3, y: 0.7 },
        correctZone: { x: 0.75, y: 0.2, radius: 0.25 },
        correctLabel: 'Cross-court',
        explanation: 'Good backhand cross-court!',
        wrongExplanation: 'From your backhand (left), cross-court goes to the far RIGHT.',
      },
      {
        description: 'Rally continues. Ball comes to your left again.',
        ballPosition: { x: 0.25, y: 0.72 },
        correctZone: { x: 0.75, y: 0.22, radius: 0.25 },
        correctLabel: 'Cross-court',
        explanation: 'Stay solid! Great rallying.',
        wrongExplanation: 'Keep it cross-court! From your left, aim for the far right.',
      },
      {
        description: 'SHORT BALL to the middle! Your opponent is on the right side. Attack!',
        ballPosition: { x: 0.45, y: 0.5 },
        correctZone: { x: 0.25, y: 0.2, radius: 0.25 },
        correctLabel: 'Down the line!',
        explanation: 'Brilliant! Down the line to the open court. Point won!',
        wrongExplanation: 'After a backhand cross-court rally, your opponent is on the right. Attack DOWN THE LINE to the far left — the open court!',
      },
    ],
  },
  {
    id: 'serve-and-rally',
    name: 'Return and Build',
    description: 'Return the serve deep, rally, then take your chance!',
    difficulty: 'green',
    steps: [
      {
        description: 'Your opponent serves to your backhand (left). Return it safely!',
        ballPosition: { x: 0.25, y: 0.78 },
        correctZone: { x: 0.7, y: 0.2, radius: 0.28 },
        correctLabel: 'Deep cross-court',
        explanation: 'Great return! Deep cross-court is the safest play.',
        wrongExplanation: 'On the return, go DEEP and CROSS-COURT. From your left, that means far right!',
      },
      {
        description: 'You\'re in the rally now. Ball comes to your right.',
        ballPosition: { x: 0.7, y: 0.68 },
        correctZone: { x: 0.25, y: 0.22, radius: 0.25 },
        correctLabel: 'Cross-court',
        explanation: 'Keep it cross-court. Build the point!',
        wrongExplanation: 'Stay cross-court! From your right, aim for the far left.',
      },
      {
        description: 'Your opponent is under pressure and hits it SHORT! Go for it!',
        ballPosition: { x: 0.5, y: 0.48 },
        correctZone: { x: 0.75, y: 0.18, radius: 0.25 },
        correctLabel: 'Attack down the line!',
        explanation: 'Amazing point! Return, rally, attack. That\'s how it\'s done!',
        wrongExplanation: 'Short ball = attack! Your opponent is on the left from the rally, so go DOWN THE LINE to the right!',
      },
    ],
  },
  {
    id: 'approach-volley',
    name: 'Approach and Finish',
    description: 'Attack the short ball, come to net, and finish with a volley!',
    difficulty: 'orange',
    steps: [
      {
        description: 'Cross-court rally on your forehand. Ball to your right.',
        ballPosition: { x: 0.7, y: 0.7 },
        correctZone: { x: 0.25, y: 0.2, radius: 0.25 },
        correctLabel: 'Cross-court',
        explanation: 'Good rally ball!',
        wrongExplanation: 'Start with a cross-court rally. From your right, aim far left.',
      },
      {
        description: 'SHORT BALL to the middle! Attack it and come to the net!',
        ballPosition: { x: 0.5, y: 0.5 },
        correctZone: { x: 0.75, y: 0.2, radius: 0.25 },
        correctLabel: 'Approach down the line',
        explanation: 'Great approach shot! Now get to the net!',
        wrongExplanation: 'Approach shots go DOWN THE LINE! From a cross-court rally, your opponent is left, so hit it to the right and follow it to net.',
      },
      {
        description: 'You\'re at the net! Your opponent scrambles and hits it to your LEFT. Where do you volley?',
        ballPosition: { x: 0.3, y: 0.42 },
        correctZone: { x: 0.75, y: 0.18, radius: 0.28 },
        correctLabel: 'Volley to open court!',
        explanation: 'Clinical finish! Approach, volley, point over. Champion play!',
        wrongExplanation: 'At the net, volley to the OPEN court — the opposite side from your opponent! They\'re on the left, so volley RIGHT!',
      },
    ],
  },
  {
    id: 'defensive-lob',
    name: 'Defend and Counter',
    description: 'Get out of trouble with a lob, then take control!',
    difficulty: 'orange',
    steps: [
      {
        description: 'You\'re rallying. Ball comes to your right.',
        ballPosition: { x: 0.7, y: 0.7 },
        correctZone: { x: 0.25, y: 0.22, radius: 0.25 },
        correctLabel: 'Cross-court',
        explanation: 'Good rally!',
        wrongExplanation: 'Keep it cross-court from your right — aim far left.',
      },
      {
        description: 'Your opponent rushes to the net and hits a tough volley wide to your LEFT! You\'re in trouble!',
        ballPosition: { x: 0.1, y: 0.82 },
        correctZone: { x: 0.5, y: 0.1, radius: 0.3 },
        correctLabel: 'LOB! High and deep!',
        explanation: 'Smart play! The lob gets you out of trouble!',
        wrongExplanation: 'When you\'re stretched wide and your opponent is at the net, LOB it HIGH and DEEP over their head! Aim for the back of the court!',
      },
      {
        description: 'Your opponent chases the lob and hits a weak ball to the middle. They\'re stuck at the back. Attack!',
        ballPosition: { x: 0.5, y: 0.55 },
        correctZone: { x: 0.2, y: 0.18, radius: 0.25 },
        correctLabel: 'Attack the open court!',
        explanation: 'What a point! Defended, lobbed, then attacked. Tennis IQ!',
        wrongExplanation: 'Your opponent ran back to get the lob — they\'re off balance. Attack to the open court on the LEFT!',
      },
    ],
  },
  {
    id: 'wrong-foot',
    name: 'The Wrong-Foot',
    description: 'Set up the pattern, then catch your opponent going the wrong way!',
    difficulty: 'red',
    steps: [
      {
        description: 'Backhand rally. Ball to your left.',
        ballPosition: { x: 0.3, y: 0.7 },
        correctZone: { x: 0.75, y: 0.22, radius: 0.25 },
        correctLabel: 'Cross-court',
        explanation: 'Good. Build the pattern.',
        wrongExplanation: 'Backhand cross-court goes to the far right. Build the pattern first!',
      },
      {
        description: 'Ball comes to your left again. Keep going cross-court!',
        ballPosition: { x: 0.28, y: 0.72 },
        correctZone: { x: 0.75, y: 0.2, radius: 0.25 },
        correctLabel: 'Cross-court again',
        explanation: 'Your opponent is now expecting cross-court every time...',
        wrongExplanation: 'Keep going cross-court to set the trap! Your opponent will start cheating that way.',
      },
      {
        description: 'Your opponent is already moving RIGHT to cover the cross-court. They\'re cheating early! Wrong-foot them!',
        ballPosition: { x: 0.35, y: 0.68 },
        correctZone: { x: 0.25, y: 0.22, radius: 0.25 },
        correctLabel: 'Behind them! Down the line!',
        explanation: 'GENIUS! They ran right but you went left — completely wrong-footed! That\'s high-level tennis!',
        wrongExplanation: 'Your opponent is running RIGHT. Hit it to the LEFT — behind them! They can\'t change direction!',
      },
    ],
  },
];

export const difficultyColors = {
  green: { bg: 'bg-green-500', text: 'text-green-400', label: 'Green Stage' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-400', label: 'Orange Stage' },
  red: { bg: 'bg-red-500', text: 'text-red-400', label: 'Red Stage' },
};
