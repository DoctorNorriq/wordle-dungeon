<script lang="ts" setup>
import type { Stat } from "~/types";
const props = defineProps<{
  stats: Stat[];
}>();
const statsByType = computed(() => {
  return {
    equipment: props.stats.filter((s) => s.type === "equipment"),
    progress: props.stats.filter((s) => s.type === "progress"),
    stat: props.stats.filter((s) => s.type === "stat"),
  };
});
</script>
<template>
  <div class="flex-col flex w-fit bg-brand-gray rounded-tr rounded-br">
    <div v-if="statsByType.equipment.length" class="flex flex-col gap-2 p-2">
      <IconValuePair
        v-for="stat in statsByType.equipment"
        :key="`${stat.icon}-${stat.value}`"
        :icon="stat.icon"
        :value="stat.value"
        :type="stat.type"
        :tooltip="stat.tooltip"
      />
    </div>
    <div
      v-if="statsByType.equipment.length"
      class="w-full h-px my-1 bg-brand-black"
    ></div>

    <div v-if="statsByType.progress.length" class="flex flex-col gap-2 p-2">
      <IconValuePair
        v-for="stat in statsByType.progress"
        :key="`${stat.icon}-${stat.value}`"
        :icon="stat.icon"
        :value="stat.value"
        :type="stat.type"
        :tooltip="stat.tooltip"
      />
    </div>
    <div
      v-if="statsByType.progress.length"
      class="w-full h-px my-1 bg-brand-black"
    ></div>

    <div v-if="statsByType.stat.length" class="flex flex-col gap-2 p-2">
      <IconValuePair
        v-for="stat in statsByType.stat"
        :key="`${stat.icon}-${stat.value}`"
        :icon="stat.icon"
        :value="stat.value"
        :type="stat.type"
        :tooltip="stat.tooltip"
      />
    </div>
    <slot />
  </div>
</template>
<style scoped></style>
