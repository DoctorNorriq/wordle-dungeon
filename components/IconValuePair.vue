<script lang="ts" setup>
defineProps<{
  icon: string;
  value: string | number;
  type: "stat" | "equipment" | "progress";
  tooltip?: string;
}>();
</script>

<template>
  <UTooltip
    :delay-duration="0"
    :content="{
      align: 'center',
      side: 'right',
    }"
    :text="`${tooltip} (${value})`"
    :disabled="!tooltip"
    arrow
  >
    <div class="flex items-center gap-1 text-brand-white">
      <Icon class="text-xl" :name="icon" />
      <p>{{ value }}</p>
    </div>
  </UTooltip>
</template>

<style scoped></style>
