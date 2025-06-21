import { defineStore } from "pinia";

interface AlphabetState {
  letters: {
    [key: string]: "unused" | "correct" | "wrong-place" | "incorrect";
  };
}

export const useAlphabetStore = defineStore("alphabet", {
  state: (): AlphabetState => ({
    letters: Object.fromEntries(
      Array.from({ length: 26 }, (_, i) => [
        String.fromCharCode(65 + i),
        "unused" as const,
      ])
    ),
  }),

  actions: {
    updateLetter(
      letter: string,
      status: "correct" | "wrong-place" | "incorrect"
    ) {
      if (this.letters[letter] !== "correct") {
        this.letters[letter] = status;
      }
    },

    resetAlphabet() {
      for (const letter in this.letters) {
        this.letters[letter] = "unused";
      }
    },
  },
});
