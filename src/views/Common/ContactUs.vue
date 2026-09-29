<!-- Public Contact us page: anyone can send the Azonation team a message.
     Signed-in organisations are pointed to Help and support, where they can follow the conversation. -->
<script setup>
import { computed, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import Header from "./Header.vue";
import Footer from "./Footer.vue";
import { CheckCircle2, Mail } from "lucide-vue-next";

const auth = authStore;
const { t } = useI18n();

const form = reactive({ name: "", email: "", subject: "", message: "", website: "" });
const tried = ref(false);
const sending = ref(false);
const sent = ref(false);
const failed = ref(false);

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const errors = computed(() => ({
  name: tried.value && !form.name.trim() ? t("contactPage.nameRequired") : "",
  email: tried.value && !emailOk(form.email) ? t("contactPage.emailInvalid") : "",
  subject: tried.value && !form.subject.trim() ? t("support.subjectRequired") : "",
  message: tried.value && !form.message.trim() ? t("support.messageRequired") : "",
}));
const isOrg = computed(() => auth.isAuthenticated && auth.user?.type === "organisation");

async function submit() {
  tried.value = true;
  failed.value = false;
  if (Object.values(errors.value).some(Boolean) || sending.value) return;
  sending.value = true;
  try {
    const res = await auth.fetchPublicApi("/api/contact", { ...form }, "POST");
    if (res?.status) sent.value = true;
    else failed.value = true;
  } finally {
    sending.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-canvas">
    <Header />

    <main class="flex-grow px-4 pt-[100px]">
      <div class="mx-auto flex max-w-2xl flex-col gap-6 py-10">
        <AzPageHeader :title="t('contactPage.title')" :description="t('contactPage.description')" />

        <AzCard v-if="isOrg">
          <p class="text-sm text-ink-2">{{ t('contactPage.signedIn') }}</p>
          <AzButton class="mt-3" variant="secondary" size="sm" :to="{ name: 'support' }">{{ t('support.title') }}</AzButton>
        </AzCard>

        <AzCard v-if="sent">
          <div class="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 class="h-12 w-12 text-success" aria-hidden="true" />
            <h2 class="text-xl font-semibold text-ink">{{ t('contactPage.sentTitle') }}</h2>
            <p class="max-w-md text-ink-2">{{ t('contactPage.sentText', { email: form.email.trim() }) }}</p>
          </div>
        </AzCard>

        <AzCard v-else>
          <form class="flex flex-col gap-5" novalidate @submit.prevent="submit">
            <div class="grid gap-5 sm:grid-cols-2">
              <AzInput v-model="form.name" :label="t('contactPage.name')" autocomplete="name" maxlength="120" :error="errors.name" required />
              <AzInput v-model="form.email" type="email" :label="t('contactPage.email')" autocomplete="email" maxlength="190" :error="errors.email" required />
            </div>
            <AzInput v-model="form.subject" :label="t('support.subject')" maxlength="150" :error="errors.subject" required autocomplete="off" />
            <AzTextarea v-model="form.message" :label="t('support.message')" :rows="6" maxlength="5000" :error="errors.message" required />
            <!-- Left empty by people; bots fill it in -->
            <input v-model="form.website" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" class="hidden" />
            <p v-if="failed" class="text-sm text-danger" role="alert">{{ t('contactPage.failed') }}</p>
            <div class="flex justify-end">
              <AzButton type="submit" :loading="sending">
                <template #icon><Mail class="h-[18px] w-[18px]" /></template>
                {{ t('support.send') }}
              </AzButton>
            </div>
          </form>
        </AzCard>
      </div>
    </main>

    <Footer />
  </div>
</template>
