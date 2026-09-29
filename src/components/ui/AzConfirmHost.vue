<script setup>
// Renders the dialog for useConfirm(). Mounted once in App.vue.
import { computed } from "vue";
import { answerConfirm, confirmState } from "@/composables/useConfirm";

const open = computed({
  get: () => confirmState.open,
  set: (v) => {
    if (!v) answerConfirm(false);
  },
});
</script>

<template>
  <AzModal v-model:open="open" :title="confirmState.title || $t('common.confirm')" size="sm">
    <p v-if="confirmState.message" class="text-[15px] text-ink-2">{{ confirmState.message }}</p>
    <template #footer>
      <AzButton variant="quiet" @click="answerConfirm(false)">
        {{ confirmState.cancelText || $t("common.cancel") }}
      </AzButton>
      <AzButton :variant="confirmState.danger ? 'danger' : 'primary'" @click="answerConfirm(true)">
        {{ confirmState.confirmText || $t("common.confirm") }}
      </AzButton>
    </template>
  </AzModal>
</template>
