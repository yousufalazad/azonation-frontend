<!-- Organisation settings: money currency, language and country, plus shortcuts to related setup pages -->
<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { CurrencyService } from "@/helpers/currency";
import { setLocale, LANGUAGES } from "@/i18n";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { Coins, Languages, Globe, ShieldCheck, IdCard, RefreshCw, Bell, UserX, ChevronRight } from "lucide-vue-next";

const auth = authStore;
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const loading = ref(true);
const saving = ref("");
const currencies = ref([]);
const languages = ref([]);
const countries = ref([]);
const pref = reactive({ currencyRecord: null, languageRecord: null, countryRecord: null });
const form = reactive({ currency_id: "", language_id: "", country_id: "" });

const on = (x) => !(x.is_active === 0 || x.is_active === "0");
const currencyOptions = computed(() => currencies.value.filter(on).map((c) => ({ value: c.id, label: `${c.currency_code} — ${c.currency_name}${c.currency_symbol ? ` (${c.currency_symbol})` : ""}` })));
const languageOptions = computed(() => languages.value.filter(on).map((l) => ({ value: l.id, label: l.language_name })));
const countryOptions = computed(() => countries.value.filter(on).map((c) => ({ value: c.id, label: c.name })).sort((a, b) => a.label.localeCompare(b.label)));

async function load() {
  const [cur, curPref, langs, userLang, ctrs, userCountry] = await Promise.all([
    auth.fetchProtectedApi("/api/currencies", {}, "GET"),
    auth.fetchProtectedApi("/api/fund-transaction-currencies", {}, "GET"),
    auth.fetchProtectedApi("/api/languages", {}, "GET"),
    auth.fetchProtectedApi("/api/user-languages/language-name/", {}, "GET"),
    auth.fetchPublicApi("/api/countries", {}, "GET"),
    auth.fetchProtectedApi("/api/user-countries/country-name/", {}, "GET"),
  ]);
  currencies.value = cur?.status ? cur.data : [];
  languages.value = langs?.status ? langs.data : [];
  countries.value = ctrs?.status ? ctrs.data : [];
  pref.currencyRecord = curPref?.status ? curPref.data : null;
  pref.languageRecord = userLang?.status ? userLang.data : null;
  pref.countryRecord = userCountry?.status ? userCountry.data : null;
  form.currency_id = pref.currencyRecord?.currency_id ?? "";
  form.language_id = pref.languageRecord?.language_id ?? "";
  form.country_id = pref.countryRecord?.country_id ?? "";
}

async function saveCurrency() {
  if (!form.currency_id || saving.value) return;
  saving.value = "currency";
  try {
    const payload = { currency_id: form.currency_id, is_active: true };
    const res = pref.currencyRecord?.id
      ? await auth.fetchProtectedApi(`/api/fund-transaction-currencies/${pref.currencyRecord.id}`, payload, "PUT")
      : await auth.fetchProtectedApi("/api/fund-transaction-currencies", payload, "POST");
    if (res?.status) {
      await CurrencyService.load();
      toast.success(t("orgSettings.currencySaved"));
      await load();
    } else toast.error(t("profilePage.saveFailed"));
  } finally {
    saving.value = "";
  }
}

async function saveLanguage() {
  if (!form.language_id || saving.value) return;
  saving.value = "language";
  try {
    const payload = { language_id: form.language_id, is_active: true };
    const res = pref.languageRecord?.id
      ? await auth.fetchProtectedApi(`/api/user-languages/${pref.languageRecord.id}`, payload, "PUT")
      : await auth.fetchProtectedApi("/api/user-languages", payload, "POST");
    if (res?.status) {
      // Switch the app to that language too, when the app has it
      const code = String(languages.value.find((l) => String(l.id) === String(form.language_id))?.language_code || "").toLowerCase();
      if (LANGUAGES.some((l) => l.code === code)) setLocale(code);
      toast.success(t("orgSettings.languageSaved"));
      await load();
    } else toast.error(t("profilePage.saveFailed"));
  } finally {
    saving.value = "";
  }
}

async function saveCountry() {
  if (!form.country_id || saving.value || String(form.country_id) === String(pref.countryRecord?.country_id)) return;
  const ok = await confirm({
    title: t("orgSettings.countryConfirmTitle"),
    message: t("orgSettings.countryConfirmText"),
    confirmText: t("orgSettings.changeCountry"),
  });
  if (!ok) {
    form.country_id = pref.countryRecord?.country_id ?? "";
    return;
  }
  saving.value = "country";
  try {
    const payload = { country_id: form.country_id, is_active: true };
    const res = pref.countryRecord?.id
      ? await auth.fetchProtectedApi(`/api/user-countries/${pref.countryRecord.id}`, payload, "PUT")
      : await auth.fetchProtectedApi("/api/user-countries", payload, "POST");
    if (res?.status) {
      toast.success(t("orgSettings.countrySaved"));
      await load();
    } else toast.error(t("profilePage.saveFailed"));
  } finally {
    saving.value = "";
  }
}

const shortcuts = computed(() => [
  { to: { name: "administrator" }, icon: ShieldCheck, title: t("orgSettings.admins"), text: t("orgSettings.adminsText") },
  { to: { name: "org-membership-type" }, icon: IdCard, title: t("nav.membershipType"), text: t("orgSettings.typesText") },
  { to: { name: "org-membership-renewal-cycle" }, icon: RefreshCw, title: t("nav.renewalCycle"), text: t("orgSettings.cycleText") },
  { to: { name: "user-notifications" }, icon: Bell, title: t("accountNav.notifications"), text: t("orgSettings.notificationsText") },
]);

onMounted(async () => {
  await load();
  loading.value = false;
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <AzPageHeader :title="t('accountNav.settings')" :description="t('orgSettings.description')" />

    <AzSkeleton v-if="loading" :lines="4" height="4rem" />

    <template v-else>
      <AzCard :padded="false">
        <div class="divide-y divide-line">
          <form class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-end" @submit.prevent="saveCurrency">
            <div class="flex items-start gap-3 sm:w-64">
              <Coins class="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <div><p class="font-semibold text-ink">{{ t('orgSettings.currency') }}</p><p class="text-sm text-ink-muted">{{ t('orgSettings.currencyHelp') }}</p></div>
            </div>
            <div class="flex-1"><AzSelect v-model="form.currency_id" :label="t('orgSettings.currency')" :options="currencyOptions" :placeholder="t('meetingForm.choose')" /></div>
            <AzButton type="submit" variant="secondary" :loading="saving === 'currency'" :disabled="String(form.currency_id) === String(pref.currencyRecord?.currency_id ?? '')">{{ t('common.save') }}</AzButton>
          </form>
          <form class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-end" @submit.prevent="saveLanguage">
            <div class="flex items-start gap-3 sm:w-64">
              <Languages class="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <div><p class="font-semibold text-ink">{{ t('orgSettings.language') }}</p><p class="text-sm text-ink-muted">{{ t('orgSettings.languageHelp') }}</p></div>
            </div>
            <div class="flex-1"><AzSelect v-model="form.language_id" :label="t('orgSettings.language')" :options="languageOptions" :placeholder="t('meetingForm.choose')" /></div>
            <AzButton type="submit" variant="secondary" :loading="saving === 'language'" :disabled="String(form.language_id) === String(pref.languageRecord?.language_id ?? '')">{{ t('common.save') }}</AzButton>
          </form>
          <form class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-end" @submit.prevent="saveCountry">
            <div class="flex items-start gap-3 sm:w-64">
              <Globe class="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <div><p class="font-semibold text-ink">{{ t('profilePage.country') }}</p><p class="text-sm text-ink-muted">{{ t('orgSettings.countryHelp') }}</p></div>
            </div>
            <div class="flex-1"><AzSelect v-model="form.country_id" :label="t('profilePage.country')" :options="countryOptions" :placeholder="t('meetingForm.choose')" /></div>
            <AzButton type="submit" variant="secondary" :loading="saving === 'country'" :disabled="String(form.country_id) === String(pref.countryRecord?.country_id ?? '')">{{ t('common.save') }}</AzButton>
          </form>
        </div>
      </AzCard>

      <section>
        <h2 class="mb-3 text-lg font-semibold text-ink">{{ t('orgSettings.moreSetup') }}</h2>
        <ul class="grid gap-3 sm:grid-cols-2">
          <li v-for="s in shortcuts" :key="s.title">
            <RouterLink :to="s.to" class="flex h-full items-start gap-3 rounded-card border border-line bg-surface p-4 shadow-card hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
              <component :is="s.icon" class="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <span class="min-w-0 flex-1"><span class="block font-semibold text-ink">{{ s.title }}</span><span class="block text-sm text-ink-muted">{{ s.text }}</span></span>
              <ChevronRight class="h-5 w-5 shrink-0 text-ink-muted" aria-hidden="true" />
            </RouterLink>
          </li>
        </ul>
      </section>

      <AzCard>
        <div class="flex items-start gap-3">
          <UserX class="mt-0.5 h-5 w-5 shrink-0 text-ink-muted" aria-hidden="true" />
          <div>
            <p class="font-semibold text-ink">{{ t('orgSettings.closeTitle') }}</p>
            <p class="text-sm text-ink-muted">{{ t('orgSettings.closeText') }}</p>
            <AzButton class="mt-3" variant="secondary" size="sm" :to="{ name: 'support', query: { new: 'account' } }">{{ t('orgSettings.contactSupport') }}</AzButton>
          </div>
        </div>
      </AzCard>
    </template>
  </div>
</template>
