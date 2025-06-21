<script lang="ts" setup>
import type { WordDefinition } from "~/types";

defineProps<{
  words: string[];
  definitions: WordDefinition[];
}>();
</script>

<template>
  <article class="w-full p-4">
    <div v-for="(word, index) in words" :key="word">
      <h2 class="uppercase trade-winds">{{ word }}</h2>
      <div v-if="definitions[index]">
        <p v-if="definitions[index].phonetic" class="mb-2">
          Phonetic: {{ definitions[index].phonetic }}
        </p>
        <div
          v-for="(meaning, meaningIndex) in definitions[index].meanings"
          :key="meaningIndex"
          class="mb-2"
        >
          <h3>{{ meaning.partOfSpeech }}</h3>
          <ul>
            <li
              v-for="(def, defIndex) in meaning.definitions"
              :key="defIndex"
              class="mb-2"
            >
              {{ def.definition }}
              <p v-if="def.example" class="text-sm italic">
                Example: {{ def.example }}
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped></style>
