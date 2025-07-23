<script lang="ts" setup>
import type { WordDefinition, Reward } from "~/types";
import { enemies, type Enemy } from "~/data/enemies";

import { useAlphabetStore } from "~/stores/useAlphabetStore";

const props = defineProps<{
  words: string[];
  definitions: WordDefinition[];
  remainingGuesses: number;
}>();

const emit = defineEmits(["wordGuessed", "guessAttempted", "userFocused"]);

const inputValues = ref(
  props.words.map(() => [Array(props.words[0].length).fill("")])
);
const lockedGuesses = ref(props.words.map(() => [false]));
const guessResults = ref<
  Array<Array<("correct" | "wrong-place" | "incorrect")[] | null>>
>(props.words.map(() => [null]));
const currentGuessIndex = ref(props.words.map(() => 0));
const errorMessage = ref("");

const currentEnemy = ref<Enemy>(
  enemies[Math.floor(Math.random() * enemies.length)]
);

const enemyType = computed(() => currentEnemy.value.type);
const wordGuessed = ref(false);

const getRewardForGuesses = (guesses: number): Reward => {
  const reward =
    currentEnemy.value.baseRewards.find((r) => r.guessNo === guesses) ||
    currentEnemy.value.baseRewards[currentEnemy.value.baseRewards.length - 1];
  return reward;
};

const potentialRewards = computed(() => {
  return props.words.map((_, wordIndex) => {
    const nextGuessNumber = Math.min(currentGuessNumber.value[wordIndex], 5);
    const reward = getRewardForGuesses(nextGuessNumber);
    const multiplier = 1;
    return {
      experience: Math.round(reward.experience * multiplier),
      coins: Math.round(reward.coins * multiplier),
    };
  });
});

const currentGuessNumber = computed(() => {
  return props.words.map(
    (_, wordIndex) => currentGuessIndex.value[wordIndex] + 1
  );
});

const isValidWord = async (word: string) => {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    return response.ok;
  } catch (e) {
    console.error("Error checking word validity:", e);
    return false;
  }
};

const handleInput = (
  wordIndex: number,
  guessIndex: number,
  letterIndex: number,
  event: Event
) => {
  const input = event.target as HTMLInputElement;
  const value = input.value.slice(-1).toUpperCase();
  inputValues.value[wordIndex][guessIndex][letterIndex] = value;

  // Move focus to the next input if available
  if (letterIndex < props.words[wordIndex].length - 1) {
    const nextInput =
      input.parentElement?.nextElementSibling?.querySelector("input");
    if (nextInput) {
      nextInput.focus();
      (nextInput as HTMLInputElement).select(); // Auto-select the text in the next input
    }
  }
};

const handleKeydown = (
  wordIndex: number,
  guessIndex: number,
  letterIndex: number,
  event: KeyboardEvent
) => {
  errorMessage.value = "";
  if (event.key === "Backspace" || event.key === "Delete") {
    event.preventDefault();
    inputValues.value[wordIndex][guessIndex][letterIndex] = "";
    if (letterIndex > 0) {
      const prevInput = (
        event.target as HTMLInputElement
      ).parentElement?.previousElementSibling?.querySelector("input");
      if (prevInput) {
        prevInput.focus();
        (prevInput as HTMLInputElement).select();
      }
    }
  } else if (event.key === "Enter") {
    event.preventDefault();
    const currentGuess = inputValues.value[wordIndex][guessIndex];
    if (currentGuess.every((letter) => letter !== "")) {
      lockGuess(wordIndex);
    }
  }
};

const handleFocus = (event: FocusEvent) => {
  const input = event.target as HTMLInputElement;
  input.select(); // Auto-select the text when the input is focused
  emit("userFocused", true);
};

const handleBlur = () => {
  emit("userFocused", false);
};

const alphabetStore = useAlphabetStore();

const lockGuess = async (wordIndex: number) => {
  const currentGuess = currentGuessIndex.value[wordIndex];
  const guessWord = inputValues.value[wordIndex][currentGuess]
    .join("")
    .toLowerCase();
  const correctWord = props.words[wordIndex].toLowerCase();

  // Check for duplicate guess
  const isDuplicate = inputValues.value[wordIndex]
    .slice(0, currentGuess)
    .some((guess) => guess.join("").toLowerCase() === guessWord);

  if (isDuplicate) {
    errorMessage.value =
      "You've already guessed this word. Try a different one.";
    return;
  }

  console.log("Guessed word:", guessWord);
  console.log("Correct word:", correctWord);

  if (guessWord.length !== correctWord.length) {
    errorMessage.value = "Please fill in all letters before submitting.";
    return;
  }

  // If the guess matches the target word exactly, accept it regardless of dictionary validation
  const isExactMatch = guessWord === correctWord;

  // Only check dictionary if it's not an exact match
  let isValid = isExactMatch;
  if (!isExactMatch) {
    isValid = await isValidWord(guessWord);
  }

  if (!isValid) {
    errorMessage.value = "This is not a valid word. Please try again.";
    return;
  }

  errorMessage.value = "";
  lockedGuesses.value[wordIndex][currentGuess] = true;

  let allCorrect = true;
  // Step 1: First pass - mark correct positions
  const results = guessWord.split("").map((letter, index) => {
    if (letter === correctWord[index]) {
      return "correct";
    }
    return null;
  });

  // Step 2: Count remaining letters in the target word
  const letterCounts: Record<string, number> = {};
  correctWord.split("").forEach((letter, index) => {
    if (results[index] !== "correct") {
      letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    }
  });

  // Step 3: Second pass - mark wrong-place and incorrect letters
  guessWord.split("").forEach((letter, index) => {
    if (results[index] === "correct") {
      return; // Skip letters already marked as correct
    }

    if (letterCounts[letter] && letterCounts[letter] > 0) {
      // Letter exists in the target word and we haven't used all occurrences yet
      results[index] = "wrong-place";
      letterCounts[letter]--;
    } else {
      // Letter doesn't exist or all occurrences have been accounted for
      results[index] = "incorrect";
    }
  });

  // Update alphabet store and check if all correct
  results.forEach((result, index) => {
    const letter = guessWord[index].toUpperCase();
    alphabetStore.updateLetter(letter, result);
    if (result !== "correct") {
      allCorrect = false;
    }
  });

  guessResults.value[wordIndex][currentGuess] = results;

  console.log("All correct:", allCorrect);
  emit("guessAttempted");

  // The rest of the function remains the same...
  if (allCorrect) {
    console.log("Word guessed correctly!");
    const finalReward = getRewardForGuesses(
      Math.min(currentGuessNumber.value[wordIndex], 5)
    );
    emit("wordGuessed", true, finalReward);
    wordGuessed.value = true;
  } else if (currentGuess === props.remainingGuesses - 1) {
    console.log("Out of guesses!");
    emit("wordGuessed", false, {
      experience: 0,
      coins: 0,
      guessNo: 0,
    } as Reward);
  } else {
    console.log("Incorrect guess, adding new row");
    currentGuessIndex.value[wordIndex]++;
    inputValues.value[wordIndex].push(
      Array(props.words[wordIndex].length).fill("")
    );
    lockedGuesses.value[wordIndex].push(false);
    guessResults.value[wordIndex].push(null);

    // Move focus to the first input of the new row
    nextTick(() => {
      const nextRowFirstInput = document.querySelector(
        `[data-word-index="${wordIndex}"][data-guess-index="${currentGuessIndex.value[wordIndex]}"][data-letter-index="0"]`
      ) as HTMLInputElement | null;
      if (nextRowFirstInput) {
        nextRowFirstInput.focus();
        nextRowFirstInput.select();
      }
    });
  }
};

const getInputClass = (
  wordIndex: number,
  guessIndex: number,
  letterIndex: number
) => {
  if (!guessResults.value[wordIndex][guessIndex]) return "border-gray-300";
  switch (guessResults.value[wordIndex][guessIndex][letterIndex]) {
    case "correct":
      return "bg-brand-yellow border-brand-yellow text-brand-black";
    case "wrong-place":
      return "border-brand-yellow";
    default:
      return "border-brand-red";
  }
};

// Reset when words change
watch(
  () => props.words,
  () => {
    inputValues.value = props.words.map(() => [
      Array(props.words[0].length).fill(""),
    ]);
    lockedGuesses.value = props.words.map(() => [false]);
    guessResults.value = props.words.map(() => [null]);
    currentGuessIndex.value = props.words.map(() => 0);
    errorMessage.value = "";
    alphabetStore.resetAlphabet();
    wordGuessed.value = false;
  },
  { deep: true }
);
</script>

<template>
  <div class="column-flex gap-8 w-full px-4">
    <div
      v-for="(word, wordIndex) in props.words"
      :key="wordIndex"
      class="column-flex"
    >
      <UTooltip
        :delay-duration="0"
        :content="{
          align: 'center',
          side: 'bottom',
        }"
        :text="`Guess #${currentGuessNumber[wordIndex]}: XP: ${potentialRewards[wordIndex].experience}, Coins: ${potentialRewards[wordIndex].coins}`"
        arrow
        ><div
          class="flex items-center gap-2 mb-2"
          :class="wordGuessed ? 'text-brand-red line-through' : ''"
        >
          <Icon
            name="material-symbols:sentiment-extremely-dissatisfied"
            class="text-xl"
          />
          <p class="text-center trade-winds">
            {{ enemyType }}
          </p>
          <Icon
            name="material-symbols:sentiment-extremely-dissatisfied"
            class="text-xl"
          />
        </div>
      </UTooltip>
      <div class="column-flex gap-2">
        <div
          v-for="(guess, guessIndex) in inputValues[wordIndex]"
          :key="guessIndex"
        >
          <div class="flex gap-2 justify-center">
            <div v-for="(_, letterIndex) in word" :key="letterIndex">
              <input
                v-model="inputValues[wordIndex][guessIndex][letterIndex]"
                type="text"
                maxlength="1"
                class="w-8 h-8 sm:w-16 sm:h-16 text-center sm:text-2xl uppercase border-2"
                :class="getInputClass(wordIndex, guessIndex, letterIndex)"
                :disabled="lockedGuesses[wordIndex][guessIndex]"
                :data-word-index="wordIndex"
                :data-guess-index="guessIndex"
                :data-letter-index="letterIndex"
                @input="handleInput(wordIndex, guessIndex, letterIndex, $event)"
                @keydown="
                  handleKeydown(wordIndex, guessIndex, letterIndex, $event)
                "
                @focus="handleFocus"
                @blur="handleBlur"
              />
            </div>
          </div>
        </div>
      </div>
      <UButton
        v-if="!lockedGuesses[wordIndex][currentGuessIndex[wordIndex]]"
        variant="outline"
        class="mt-2"
        @click="lockGuess(wordIndex)"
      >
        Lock Guess #{{ currentGuessNumber[wordIndex] }}
      </UButton>
      <p v-if="errorMessage" class="mt-2 text-red-500">{{ errorMessage }}</p>
    </div>
  </div>
</template>
