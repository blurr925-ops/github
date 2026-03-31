// First-person court coordinates:
// x: 0 = your left, 1 = your right
// y: 0 = opponent's baseline (far/top), 1 = your baseline (near/bottom)
//
// You face the opponent (mirrored):
//   Your left = opponent's right
//   Your right = opponent's left
//
// Cross-court from YOUR LEFT goes diagonally to far RIGHT.
// Cross-court from YOUR RIGHT goes diagonally to far LEFT.
// Down-the-line from YOUR LEFT goes to far LEFT.
// Down-the-line from YOUR RIGHT goes to far RIGHT.

export const patterns = [
  {
    id: 'return-of-serve',
    name: 'Return of Serve',
    description: 'Your opponent serves to your backhand (left side). Where do you return it?',
    difficulty: 'green',
    ballPosition: { x: 0.3, y: 0.75 },
    correctZone: { x: 0.7, y: 0.25, radius: 0.28 },
    explanation: 'Nice! A deep cross-court return to the right side is the safest play. It gives you time to recover and pushes your opponent back.',
    hint: 'Hit it diagonally — cross-court from your left goes to the far right side!',
    view: 'firstperson',
  },
  {
    id: 'rally-crosscourt',
    name: 'Rally Cross-Court',
    description: 'You\'re in a forehand rally. The ball comes to your right side. Keep it cross-court — where do you hit?',
    difficulty: 'green',
    ballPosition: { x: 0.7, y: 0.7 },
    correctZone: { x: 0.3, y: 0.25, radius: 0.28 },
    explanation: 'Perfect! Cross-court from your forehand goes to the far left side. The net is lower in the middle and cross-court gives you the most room!',
    hint: 'Cross-court means diagonal — from your right side, aim for the far LEFT!',
    view: 'firstperson',
  },
  {
    id: 'serve-plus-1',
    name: 'Serve + 1',
    description: 'You served wide to your opponent\'s backhand. They\'re stretched over to YOUR left and return it back. Where is the open court?',
    difficulty: 'green',
    ballPosition: { x: 0.35, y: 0.65 },
    correctZone: { x: 0.8, y: 0.25, radius: 0.25 },
    explanation: 'Great thinking! Your opponent stretched to their backhand (your left), so the open court is on the right side. Attack it!',
    hint: 'Your opponent is stuck on the left side — where is all the empty space? Look right!',
    view: 'firstperson',
  },
  {
    id: 'short-ball-attack',
    name: 'Short Ball Attack',
    description: 'Your opponent hits a short ball to the middle. You run forward. Your opponent is standing on the right side of their baseline. Where do you hit?',
    difficulty: 'orange',
    ballPosition: { x: 0.5, y: 0.55 },
    correctZone: { x: 0.2, y: 0.2, radius: 0.25 },
    explanation: 'Awesome! Your opponent is on the right, so the open court is on the left. Attack the short ball to the open side!',
    hint: 'Your opponent is standing on the right — hit it to the empty space on the LEFT!',
    view: 'firstperson',
  },
  {
    id: 'approach-volley',
    name: 'Approach + Volley',
    description: 'You came to the net after hitting down the left side. Your opponent scrambles and hits it back to your left. Where do you volley?',
    difficulty: 'orange',
    ballPosition: { x: 0.3, y: 0.48 },
    correctZone: { x: 0.8, y: 0.2, radius: 0.25 },
    explanation: 'Great volley! Your opponent ran to the left to get your approach, so volley it to the open right side. Point won!',
    hint: 'Your opponent is on the left side — the open court is on the RIGHT!',
    view: 'firstperson',
  },
  {
    id: 'defensive-lob',
    name: 'Defensive Lob',
    description: 'Your opponent is at the net and hits a tough volley to your left. You\'re stretched wide and in trouble. What do you do?',
    difficulty: 'orange',
    ballPosition: { x: 0.1, y: 0.8 },
    correctZone: { x: 0.5, y: 0.12, radius: 0.28 },
    explanation: 'Smart play! A high, deep lob over your opponent\'s head gives you time to recover and gets them off the net!',
    hint: 'You\'re in trouble! Hit it HIGH and DEEP — lob it over your opponent\'s head to the back of the court!',
    view: 'firstperson',
  },
  {
    id: 'wrong-footing',
    name: 'Wrong-Footing',
    description: 'You\'ve been hitting to the right side. Your opponent starts running right early to cover it. Where do you hit instead?',
    difficulty: 'red',
    ballPosition: { x: 0.5, y: 0.65 },
    correctZone: { x: 0.25, y: 0.25, radius: 0.25 },
    explanation: 'Brilliant! Your opponent was running right but you hit it LEFT — behind them! They can\'t change direction in time!',
    hint: 'Your opponent is already running to the right... hit it to the LEFT where they just came from!',
    view: 'firstperson',
  },
];

export const difficultyColors = {
  green: { bg: 'bg-green-500', text: 'text-green-400', label: 'Green Stage' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-400', label: 'Orange Stage' },
  red: { bg: 'bg-red-500', text: 'text-red-400', label: 'Red Stage' },
};
