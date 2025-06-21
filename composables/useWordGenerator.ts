import type { WordDefinition } from "~/types";

export function useWordGenerator() {
  const words = ref<string[]>([]);
  const definitions = ref<WordDefinition[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function generateWords(count: number = 1, length: number = 5) {
    isLoading.value = true;
    error.value = null;
    words.value = [];
    definitions.value = [];

    try {
      // Fetch random words
      const wordResponse = await fetch(
        `https://random-word-api.vercel.app/api?words=${count}&length=${length}`
      );
      const newWords = await wordResponse.json();
      words.value = newWords;

      // Fetch definitions for each word
      for (const word of newWords) {
        try {
          const definitionResponse = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
          );
          const data = await definitionResponse.json();
          if (Array.isArray(data) && data.length > 0) {
            definitions.value.push(data[0]);
          } else {
            definitions.value.push({
              word,
              meanings: [
                {
                  partOfSpeech: "unknown",
                  definitions: [{ definition: "No definition found" }],
                },
              ],
            });
          }
        } catch (e) {
          console.error(`Failed to fetch definition for ${word}:`, e);
          definitions.value.push({
            word,
            meanings: [
              {
                partOfSpeech: "unknown",
                definitions: [{ definition: "Failed to fetch definition" }],
              },
            ],
          });
        }
      }
    } catch (e) {
      error.value = "Failed to generate words";
      console.error(e);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    words,
    definitions,
    isLoading,
    error,
    generateWords,
  };
}
