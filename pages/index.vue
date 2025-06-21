<script lang="ts" setup>
import type { Stat } from "~/types";
import { useAlphabetStore } from "~/stores/useAlphabetStore";
const { isMobile } = useDevice();

const alphabetStore = useAlphabetStore();

const { words, definitions, isLoading, error, generateWords } =
  useWordGenerator();
// Game settings
const wordCount = ref(1);
const wordLength = ref(5);
const wordsVisible = ref(false);
const wordGuessed = ref(false);
const currentWord = ref(1);
const wordsToWin = ref(20);

// Stats
const reveals = ref(0);
const hints = ref(0);
const experienceThisRun = ref(0);
const coinsThisRun = ref(0);
const remainingGuesses = ref(20);
const wordsGuessed = ref(0);
const stats = computed<Stat[]>(() => [
  {
    icon: "material-symbols:help-center-rounded",
    value: reveals.value,
    type: "equipment",
    tooltip: "Reveals available",
  },
  {
    icon: "material-symbols:lightbulb-2",
    value: hints.value,
    type: "equipment",
    tooltip: "Hints available",
  },
  {
    icon: "material-symbols:stars-2",
    value: experienceThisRun.value,
    type: "progress",
    tooltip: "Experience earned this run",
  },
  {
    icon: "material-symbols:hexagon",
    value: coinsThisRun.value,
    type: "progress",
    tooltip: "Coins earned this run",
  },
  {
    icon: "material-symbols:swords",
    value: remainingGuesses.value,
    type: "stat",
    tooltip: "Remaining guesses",
  },
  {
    icon: "material-symbols:check-box",
    value: wordsGuessed.value,
    type: "stat",
    tooltip: "Words guessed",
  },
]);

// UI
const showingStats = ref(true);
const toggleStats = () => {
  showingStats.value = !showingStats.value;
};

const showingAlphabet = ref(true);
const wasFocused = ref(false);

const toggleAlphabet = () => {
  showingAlphabet.value = !showingAlphabet.value;
};

const handleUserFocused = (focused: boolean) => {
  if (isMobile) {
    // Adjust this breakpoint as needed
    if (focused) {
      if (showingAlphabet.value) {
        showingAlphabet.value = false;
        wasFocused.value = true;
      }
    } else {
      if (wasFocused.value) {
        showingAlphabet.value = true;
        wasFocused.value = false;
      }
    }
  }
};
const handleGuessAttempted = () => {
  remainingGuesses.value--;
};

const handleWordGuessed = (
  guessed: boolean,
  rewards: { experience: number; coins: number }
) => {
  if (guessed) {
    wordGuessed.value = true;
    wordsGuessed.value++;
    experienceThisRun.value += rewards.experience;
    coinsThisRun.value += rewards.coins;
  }

  if (wordsGuessed.value >= wordsToWin.value) {
    // Handle game win condition
  } else if (remainingGuesses.value <= 0) {
    // Handle game over condition
  } else {
    // Prepare for next word
    currentWord.value++;
    // You might want to generate a new word here
    // handleGenerateWords();
  }
};

const toggleWordVisibility = () => {
  wordsVisible.value = !wordsVisible.value;
};

const handleGenerateWords = () => {
  wordGuessed.value = false;
  generateWords(wordCount.value, wordLength.value);
  alphabetStore.resetAlphabet();
};

const runStatsWidth = ref(0);
const alphabetOverviewWidth = ref(0);

const calculateComponentWidths = () => {
  nextTick(() => {
    const runStatsElement = document.querySelector(".run-stats") as HTMLElement;
    const alphabetOverviewElement = document.querySelector(
      ".alphabet-overview"
    ) as HTMLElement;

    if (runStatsElement) {
      runStatsWidth.value = runStatsElement.offsetWidth;
    }
    if (alphabetOverviewElement) {
      alphabetOverviewWidth.value = alphabetOverviewElement.offsetWidth;
    }
  });
};

onUnmounted(() => {
  window.removeEventListener("resize", calculateComponentWidths);
});
onMounted(() => {
  calculateComponentWidths();
  window.addEventListener("resize", calculateComponentWidths);
  generateWords(wordCount.value, wordLength.value);
});
</script>

<template>
  <div class="column-flex gap-4 relative" :class="wordGuessed ? 'pb-30' : ''">
    <div class="text-center">
      <h1
        class="text-brand-yellow"
        @click="toggleWordVisibility"
        @dblclick="handleGenerateWords"
      >
        <span class="wordle capitalize text-brand-white">Wordle</span> Dungeon
      </h1>
      <p>{{ currentWord }} / {{ wordsToWin }}</p>
      <div v-if="wordsVisible" class="flex items-center justify-center gap-2">
        <p v-for="word in words" :key="word">{{ word }}</p>
      </div>
    </div>
    <section class="column-flex w-full">
      <div v-if="isLoading">Loading enemy...</div>
      <div v-else-if="error">{{ error }}</div>
      <WordGrid
        v-else
        :words="words"
        :definitions="definitions"
        :remaining-guesses="remainingGuesses"
        @guess-attempted="handleGuessAttempted"
        @word-guessed="handleWordGuessed"
        @user-focused="handleUserFocused"
      />
    </section>

    <RunStats
      class="run-stats fixed -translate-y-1/2 top-1/2 z-100 transition-all duration-300 min-w-14"
      :class="showingStats ? '' : 'opacity-50'"
      :style="{ left: showingStats ? '0' : `-${runStatsWidth}px` }"
      :stats="stats"
    >
      <UButton
        variant="outline"
        icon="material-symbols:arrow-forward-ios"
        class="absolute -translate-y-1/2 top-1/2 transition-all duration-300 -right-8"
        :class="showingStats ? '-rotate-180' : ''"
        @click="toggleStats"
      />
    </RunStats>

    <AlphabetOverview
      v-if="!wordGuessed"
      class="alphabet-overview fixed sm:-translate-y-1/2 sm:top-1/2 bottom-0 sm:bottom-[revert] z-100 transition-all duration-300"
      :class="showingAlphabet ? 'p-4 sm:p-0 right-0 sm:right-4' : 'opacity-50'"
      :style="{
        right: showingAlphabet ? '' : `-${alphabetOverviewWidth}px`,
      }"
    >
      <UButton
        variant="outline"
        icon="material-symbols:arrow-forward-ios"
        class="fixed sm:absolute transition-all right-4 bottom-4 sm:-translate-y-1/2 sm:top-1/2 sm:bottom-[revert] duration-300 sm:right-[revert]"
        :class="showingAlphabet ? 'sm:-left-8' : 'rotate-180 sm:-left-8'"
        @click="toggleAlphabet"
      />
    </AlphabetOverview>

    <WordExplained
      v-if="wordGuessed"
      :words="words"
      :definitions="definitions"
    />
    <div
      v-if="wordGuessed"
      class="fixed flex justify-center -translate-x-1/2 left-1/2 bottom-0 w-full z-100 p-4 bg-brand-black/95 sm:p-8"
    >
      <UButton
        class="font-bold w-full p-4 sm:w-fit min-w-40"
        :class="wordGuessed ? 'animate-bounce' : ''"
        color="primary"
        label="Continue"
        size="xl"
        @click="handleGenerateWords"
      />
    </div>
  </div>
</template>

<style scoped></style>
