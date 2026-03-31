// First-person court coordinates:
// x: 0 = your left, 1 = your right
// y: 0 = opponent's baseline (far/top), 1 = your baseline (near/bottom)
// Ball position: where the ball is coming to you
// Correct zone: where you should hit it (on opponent's side)

export const patterns = [
  {
    id: 'return-of-serve',
    name: 'Return of Serve',
    description: 'Your opponent serves to your backhand side. Where do you return it?',
    difficulty: 'green',
    ballPosition: { x: 0.3, y: 0.75 },
    correctZone: { x: 0.65, y: 0.2, radius: 0.15 },
    explanation: 'Nice! A deep cross-court return is the safest play. It gives you time to recover and pushes your opponent back.',
    hint: 'Try hitting it deep and cross-court — the longest diagonal is the safest shot.',
    view: 'firstperson',
  },
  {
    id: 'rally-crosscourt',
    name: 'Rally Cross-Court',
    description: 'Your opponent hits a forehand to your forehand side. You\'re in a cross-court rally. Where do you hit?',
    difficulty: 'green',
    ballPosition: { x: 0.7, y: 0.7 },
    correctZone: { x: 0.7, y: 0.18, radius: 0.14 },
    explanation: 'Perfect! Keep the rally going cross-court. The net is lower in the middle and cross-court is the longest distance — more room for your shot!',
    hint: 'The safest rally shot goes back the same way it came — cross-court!',
    view: 'firstperson',
  },
  {
    id: 'serve-plus-1',
    name: 'Serve + 1',
    description: 'You served wide and your opponent returns it down the middle. Where do you hit your next shot?',
    difficulty: 'green',
    ballPosition: { x: 0.5, y: 0.65 },
    correctZone: { x: 0.2, y: 0.2, radius: 0.14 },
    explanation: 'Great thinking! Your opponent had to stretch wide to return, so the open court is on the other side. Attack it!',
    hint: 'Your opponent stretched wide to return your serve — where did they leave space?',
    view: 'firstperson',
  },
  {
    id: 'short-ball-attack',
    name: 'Short Ball Attack',
    description: 'Your opponent hits a short ball that lands near the service line. You move forward. Where do you hit it?',
    difficulty: 'orange',
    ballPosition: { x: 0.5, y: 0.55 },
    correctZone: { x: 0.15, y: 0.12, radius: 0.13 },
    explanation: 'Awesome! When you get a short ball, move forward and attack it to the open corner. Take charge of the point!',
    hint: 'Move forward and look for the open corner. Hit it away from your opponent!',
    view: 'firstperson',
  },
  {
    id: 'approach-volley',
    name: 'Approach + Volley',
    description: 'You hit an approach shot and came to the net. Your opponent hits it to your left side. Where do you volley?',
    difficulty: 'orange',
    ballPosition: { x: 0.3, y: 0.5 },
    correctZone: { x: 0.8, y: 0.15, radius: 0.13 },
    explanation: 'Great volley! Punch it into the open court away from your opponent. Point won!',
    hint: 'At the net, hit the volley into the space your opponent can\'t reach — the opposite side!',
    view: 'firstperson',
  },
  {
    id: 'defensive-lob',
    name: 'Defensive Lob',
    description: 'Your opponent is at the net and hits a tough volley to your backhand side. You\'re stretched wide. Where do you hit?',
    difficulty: 'orange',
    ballPosition: { x: 0.15, y: 0.8 },
    correctZone: { x: 0.6, y: 0.08, radius: 0.16 },
    explanation: 'Smart play! A lob over your opponent\'s head when they\'re at the net gives you time to recover. Hit it deep!',
    hint: 'When you\'re in trouble and your opponent is at the net, try hitting it HIGH and DEEP over their head.',
    view: 'firstperson',
  },
  {
    id: 'wrong-footing',
    name: 'Wrong-Footing',
    description: 'Your opponent is already moving to cover the open court on their left. Where do you hit the ball?',
    difficulty: 'red',
    ballPosition: { x: 0.5, y: 0.65 },
    correctZone: { x: 0.75, y: 0.2, radius: 0.13 },
    explanation: 'Brilliant! Hitting behind your opponent catches them wrong-footed. They were already running the other way!',
    hint: 'If your opponent is already running one way... what if you hit it where they just came from?',
    view: 'firstperson',
  },
];

export const difficultyColors = {
  green: { bg: 'bg-green-500', text: 'text-green-400', label: 'Green Stage' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-400', label: 'Orange Stage' },
  red: { bg: 'bg-red-500', text: 'text-red-400', label: 'Red Stage' },
};
