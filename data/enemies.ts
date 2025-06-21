// Idé: tilføj senere factions, såsom Grammar Nazis, Punctuation Pirates, Internet Warriors etc.

export interface Reward {
  experience: number;
  coins: number;
  guessNo: number;
}

export interface Enemy {
  type: string;
  baseRewards: Reward[];
}

export const enemies: Enemy[] = [
  {
    type: "Analphabetic Wizard",
    baseRewards: [
      { experience: 100, coins: 50, guessNo: 1 },
      { experience: 80, coins: 40, guessNo: 2 },
      { experience: 60, coins: 30, guessNo: 3 },
      { experience: 40, coins: 20, guessNo: 4 },
      { experience: 20, coins: 10, guessNo: 5 },
    ],
  },
  {
    type: "Werewolf with Glasses",
    baseRewards: [
      { experience: 120, coins: 60, guessNo: 1 },
      { experience: 100, coins: 50, guessNo: 2 },
      { experience: 80, coins: 40, guessNo: 3 },
      { experience: 60, coins: 30, guessNo: 4 },
      { experience: 40, coins: 20, guessNo: 5 },
    ],
  },
  {
    type: "Dyslexic Dragon",
    baseRewards: [
      { experience: 150, coins: 75, guessNo: 1 },
      { experience: 120, coins: 60, guessNo: 2 },
      { experience: 90, coins: 45, guessNo: 3 },
      { experience: 60, coins: 30, guessNo: 4 },
      { experience: 30, coins: 15, guessNo: 5 },
    ],
  },
  {
    type: "Spelling Bee Champion",
    baseRewards: [
      { experience: 80, coins: 40, guessNo: 1 },
      { experience: 65, coins: 32, guessNo: 2 },
      { experience: 50, coins: 25, guessNo: 3 },
      { experience: 35, coins: 17, guessNo: 4 },
      { experience: 20, coins: 10, guessNo: 5 },
    ],
  },
  {
    type: "Grammar Nazi",
    baseRewards: [
      { experience: 200, coins: 100, guessNo: 1 },
      { experience: 160, coins: 80, guessNo: 2 },
      { experience: 120, coins: 60, guessNo: 3 },
      { experience: 80, coins: 40, guessNo: 4 },
      { experience: 40, coins: 20, guessNo: 5 },
    ],
  },
];
