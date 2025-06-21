<!-- components/LetterOverview.vue -->
<script lang="ts" setup>
import { useAlphabetStore } from "~/stores/useAlphabetStore";

const alphabetStore = useAlphabetStore();

const getLetterClass = (status: string) => {
  switch (status) {
    case "correct":
      return "bg-brand-yellow text-black border-brand-yellow";
    case "wrong-place":
      return "border-brand-yellow bg-brand-gray";
    case "incorrect":
      return "bg-brand-red border-brand-red text-white";
    default:
      return "bg-brand-gray text-white";
  }
};
</script>

<template>
  <div class="grid grid-cols-10 gap-1 w-fit">
    <div
      v-for="(status, letter) in alphabetStore.letters"
      :key="letter"
      class="w-8 h-8 flex items-center justify-center rounded border border-brand-gray"
      :class="getLetterClass(status)"
    >
      {{ letter }}
    </div>
    <slot />
  </div>
</template>
