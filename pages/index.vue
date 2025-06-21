<script lang="ts" setup>
import type { Stat } from "~/types";
import { useAlphabetStore } from "~/stores/useAlphabetStore";
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const { isMobile } = useDevice();

const alphabetStore = useAlphabetStore();

const { words, definitions, isLoading, error, generateWords } =
  useWordGenerator();

// User data
const username = ref("");
const password = ref("");
const selfDescription = ref("");
const updateMessage = ref("");
const initialUsername = computed(
  () => user.value?.user_metadata.username || ""
);
const editingUser = ref(false);
const editingPassword = ref(false);
const aboutToQuit = ref(false);

// Run settings
const runActive = ref(false);
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
    // Handle Run win condition
  } else if (remainingGuesses.value <= 0) {
    // Handle Run over condition
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

const updateUserMetadata = async () => {
  const { data, error } = await supabase.auth.updateUser({
    data: {
      username: username.value,
      selfDescription: selfDescription.value,
    },
  });

  if (error) {
    console.error("Error updating user metadata:", error);
    updateMessage.value = "Failed to update profile. Please try again.";
  } else {
    updateMessage.value = "Profile updated successfully!";
  }
};

// Function to update password
const updatePassword = async () => {
  const { data, error } = await supabase.auth.updateUser({
    password: password.value,
  });

  if (error) {
    console.error("Error updating password:", error);
    updateMessage.value = "Failed to update password. Please try again.";
  } else {
    updateMessage.value = "Password updated successfully!";
    password.value = ""; // Clear the password field
  }
};

// Function to start the Run
const startRun = () => {
  if (!user.value?.user_metadata.username) {
    updateUserMetadata();
  }
  runActive.value = true;
};

const endRun = () => {
  runActive.value = false;
  wordGuessed.value = false;
  currentWord.value = 1;
  wordsGuessed.value = 0;
  remainingGuesses.value = 20;
  wordsVisible.value = false;
  generateWords(wordCount.value, wordLength.value);
  aboutToQuit.value = false;
};

onUnmounted(() => {
  window.removeEventListener("resize", calculateComponentWidths);
});
onMounted(() => {
  if (user.value) {
    username.value = user.value.user_metadata.username || "";
    selfDescription.value = user.value.user_metadata.selfDescription || "";
    if (!user.value.user_metadata.username) {
      editingUser.value = true;
    }
  }
  calculateComponentWidths();
  window.addEventListener("resize", calculateComponentWidths);
  generateWords(wordCount.value, wordLength.value);
});
</script>

<template>
  <div class="column-flex gap-4 relative" :class="wordGuessed ? 'pb-30' : ''">
    <div v-if="runActive">
      <div class="text-center">
        <div class="flex items-center gap-2 justify-center">
          <h1
            class="text-brand-yellow"
            @click="toggleWordVisibility"
            @dblclick="handleGenerateWords"
          >
            <span class="wordle capitalize text-brand-white">Wordle</span>
            Dungeon
          </h1>
          <UTooltip
            :delay-duration="0"
            :content="{
              align: 'center',
              side: 'bottom',
            }"
            :text="
              aboutToQuit ? 'Cancel and continue your run' : 'End this run'
            "
            arrow
          >
            <Icon
              :name="
                aboutToQuit
                  ? 'material-symbols:door-open-rounded'
                  : 'material-symbols:door-front'
              "
              class="text-2xl"
              @click="aboutToQuit = !aboutToQuit"
            />
          </UTooltip>
        </div>
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
          class="transition-all duration-300"
          :class="aboutToQuit ? 'opacity-50' : ''"
          @guess-attempted="handleGuessAttempted"
          @word-guessed="handleWordGuessed"
          @user-focused="handleUserFocused"
        />
      </section>
      <RunStats
        class="run-stats fixed -translate-y-1/2 top-1/2 z-100 transition-all duration-300 min-w-14"
        :class="[
          showingStats ? '' : 'opacity-50',
          aboutToQuit ? 'opacity-50' : '',
        ]"
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
        :class="[
          showingAlphabet ? 'p-4 sm:p-0 right-0 sm:right-4' : 'opacity-50',
          aboutToQuit ? 'opacity-50' : '',
        ]"
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
      <div
        v-if="aboutToQuit"
        class="fixed -translate-1/2 left-1/2 top-1/2 bg-brand-gray p-4 rounded"
      >
        <p>Are you sure you want to end this run?</p>
        <div class="flex items-center justify-center gap-2 mt-4">
          <UButton label="Yes, end run" color="error" @click="endRun" />
          <UButton label="No, continue" @click="aboutToQuit = false" />
        </div>
      </div>
    </div>
    <div v-else class="w-full column-flex">
      <div class="flex items-center justify-center gap-2">
        <h1 class="text-center">
          {{
            initialUsername
              ? `Welcome, ${initialUsername}`
              : "Tell us about yourself, wordsmith"
          }}
        </h1>
        <UTooltip
          :delay-duration="0"
          :content="{
            align: 'center',
            side: 'bottom',
          }"
          :text="editingUser ? 'Stop editing' : 'Edit your user profile'"
          arrow
        >
          <Icon
            v-if="user?.user_metadata.username"
            :name="
              !editingUser
                ? 'material-symbols:person-edit-rounded'
                : 'material-symbols:close-rounded'
            "
            class="text-2xl"
            @click="editingUser = !editingUser"
          />
        </UTooltip>
      </div>

      <section v-if="editingUser" class="max-w-[600px] column-flex w-full">
        <form
          v-if="!editingPassword"
          class="w-full"
          @submit.prevent="updateUserMetadata"
        >
          <UInput
            v-model="username"
            variant="outline"
            color="primary"
            type="text"
            class="w-full mb-4"
            placeholder="Enter your name"
          />
          <UTextarea
            v-model="selfDescription"
            variant="outline"
            color="primary"
            class="w-full mb-4"
            placeholder="Describe yourself"
          />
          <UButton
            variant="outline"
            label="Update Profile"
            class="w-full mb-4"
            type="submit"
          />
        </form>
        <form v-else @submit.prevent="updatePassword" class="w-full">
          <UInput
            v-model="password"
            variant="outline"
            color="primary"
            type="password"
            class="w-full mb-4"
            placeholder="New password"
          />
          <UButton
            variant="outline"
            label="Update Password"
            class="w-full mb-4"
            type="submit"
          />
        </form>
        <p
          v-if="updateMessage"
          class="text-center mb-4"
          :class="
            updateMessage.includes('Failed')
              ? 'text-brand-red'
              : 'text-brand-white'
          "
        >
          {{ updateMessage }}
        </p>
        <UButton
          label="Finish Editing"
          class="w-full mb-4"
          @click="[(editingUser = false), (editingPassword = false)]"
        />
        <UButton
          v-if="!editingPassword"
          variant="link"
          label="Go to update password"
          class="w-full mb-4 lowercase"
          size="sm"
          @click="editingPassword = true"
        />
        <UButton
          v-else
          variant="link"
          label="Go to update profile"
          class="w-full mb-4 lowercase"
          size="sm"
          @click="editingPassword = false"
        />
      </section>
      <section v-else>
        <UButton
          variant="outline"
          label="Start Run"
          class="w-full mt-4"
          @click="startRun"
        />
      </section>
    </div>
  </div>
</template>

<style scoped></style>
