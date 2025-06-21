export interface WordDefinition {
  word: string;
  phonetic?: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
    }>;
  }>;
}

export interface Stat {
  icon: string;
  value: string | number;
  type: "stat" | "equipment" | "progress";
  tooltip?: string;
}

export interface Reward {
  experience: number;
  coins: number;
  guessNo: number;
}
