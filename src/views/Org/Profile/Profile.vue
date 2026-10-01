<!-- Profile for organisations (logo, organisation name) and members (photo, first and last name):
     username, email, phone and address too. Each part is edited in place. -->
<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { useAccountRoutes } from "@/composables/useAccountRoutes";
import { Camera, Pencil } from "lucide-vue-next";

const auth = authStore;
const { t } = useI18n();
const toast = useToast();

const userId = computed(() => auth.user?.id);
const isOrg = computed(() => auth.user?.type === "organisation");
const displayName = computed(() => (isOrg.value ? auth.user?.org_name : [auth.user?.first_name, auth.user?.last_name].filter(Boolean).join(" ")) || "");
const accountRoutes = useAccountRoutes();
const settingsRoute = computed(() => ({ name: accountRoutes.value.settings }));
const editing = ref(""); // "name" | "username" | "email" | "phone" | "address" | ""
const saving = ref(false);
const errors = reactive({});
const loading = ref(true);

// ---- Logo ----
const logoUrl = ref("");
const logoInput = ref(null);
const uploadingLogo = ref(false);
async function loadLogo() {
  const res = isOrg.value
    ? await auth.fetchProtectedApi("/api/org-profile/logo", {}, "GET")
    : await auth.fetchProtectedApi(`/api/profileimage/${userId.value}`, {}, "GET");
  logoUrl.value = res?.status ? res.data?.image || "" : "";
}
async function onLogo(e) {
  const file = e.target.files?.[0];
  e.target.value = "";
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) return toast.error(t("profilePage.logoTooBig"));
  const fd = new FormData();
  fd.append("image", file);
  uploadingLogo.value = true;
  try {
    const res = await auth.uploadProtectedApi(isOrg.value ? `/api/org-profile/logo/${userId.value}` : `/api/profileimage/${userId.value}`, fd, "POST");
    if (res?.status) {
      logoUrl.value = res.data.image;
      toast.success(isOrg.value ? t("profilePage.logoSaved") : t("profilePage.photoSaved"));
    } else {
      toast.error(t("profilePage.saveFailed"));
    }
  } finally {
    uploadingLogo.value = false;
  }
}

// ---- Name, username, email ----
const form = reactive({ org_name: "", first_name: "", last_name: "", username: "", email: "" });
function startEdit(part) {
  Object.keys(errors).forEach((k) => delete errors[k]);
  Object.assign(form, {
    org_name: auth.user?.org_name || "", first_name: auth.user?.first_name || "", last_name: auth.user?.last_name || "",
    username: auth.user?.username || "", email: auth.user?.email || "",
  });
  if (part === "phone") Object.assign(phoneForm, phone.value);
  if (part === "address") Object.assign(addressForm, address.value);
  editing.value = part;
}
const firstError = (res) => {
  const e = res?.errors;
  if (e?.errors) return Object.values(e.errors)[0]?.[0];
  return e?.message || res?.message || "";
};

// Members have a first and last name instead of an organisation name
async function savePersonName() {
  const first = form.first_name.trim();
  const last = form.last_name.trim();
  if (!first) errors.first_name = t("profilePage.needFirstName");
  if (!last) errors.last_name = t("profilePage.needLastName");
  if (!first || !last) return;
  saving.value = true;
  try {
    const res = await auth.fetchProtectedApi(`/api/update-first-last-name/${userId.value}`, { first_name: first, last_name: last }, "PUT");
    if (res?.status) {
      auth.user = { ...auth.user, first_name: first, last_name: last };
      toast.success(t("profilePage.saved"));
      editing.value = "";
    } else {
      errors.first_name = firstError(res) || t("profilePage.saveFailed");
    }
  } finally {
    saving.value = false;
  }
}

async function saveAccountField(part) {
  if (part === "name" && !isOrg.value) return savePersonName();
  const map = {
    name: { url: "update-name", key: "org_name", need: "profilePage.needName" },
    username: { url: "update-username", key: "username", need: "profilePage.needUsername" },
    email: { url: "update-email", key: "email", need: "profilePage.needEmail" },
  }[part];
  const value = form[map.key].trim();
  if (!value) return (errors[map.key] = t(map.need));
  if (part === "username" && !/^[a-zA-Z0-9._-]{3,30}$/.test(value)) return (errors.username = t("profilePage.badUsername"));
  if (part === "email" && !/^\S+@\S+\.\S+$/.test(value)) return (errors.email = t("founders.badEmail"));
  saving.value = true;
  try {
    const res = await auth.fetchProtectedApi(`/api/${map.url}/${userId.value}`, { [map.key]: value }, "PUT");
    if (res?.status) {
      auth.user = { ...auth.user, [map.key]: value };
      toast.success(t("profilePage.saved"));
      editing.value = "";
    } else {
      errors[map.key] = firstError(res) || t("profilePage.saveFailed");
    }
  } finally {
    saving.value = false;
  }
}

// ---- Phone ----
const phone = ref({ id: null, dialing_code_id: "", phone_number: "", phone_type: 1, status: 0, dialing_code: "" });
const phoneForm = reactive({ ...phone.value });
const dialingCodes = ref([]);
const dialingOptions = computed(() => dialingCodes.value.map((d) => ({ value: d.id, label: `${d.name} (${d.dialing_code})` })));
const phoneTypeOptions = computed(() => [1, 2, 3, 4].map((v) => ({ value: v, label: t(`profilePage.phoneType_${v}`) })));
const visibilityOptions = computed(() => [0, 3, 2, 1].map((v) => ({ value: v, label: t(`profilePage.visibility_${v}`) })));

async function savePhone() {
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (!phoneForm.dialing_code_id) errors.dialing_code_id = t("profilePage.needCountryCode");
  if (!/^[0-9 ]{5,20}$/.test(String(phoneForm.phone_number).trim())) errors.phone_number = t("profilePage.badPhone");
  if (Object.keys(errors).length) return;
  const payload = {
    dialing_code_id: phoneForm.dialing_code_id,
    phone_number: String(phoneForm.phone_number).replace(/\s+/g, ""),
    phone_type: phoneForm.phone_type,
    status: phoneForm.status,
  };
  saving.value = true;
  try {
    const res = phone.value.id
      ? await auth.fetchProtectedApi(`/api/phone-numbers/${phone.value.id}`, payload, "PUT")
      : await auth.fetchProtectedApi("/api/phone-numbers/", payload, "POST");
    if (res?.status) {
      toast.success(t("profilePage.saved"));
      editing.value = "";
      await loadPhone();
    } else {
      toast.error(firstError(res) || t("profilePage.saveFailed"));
    }
  } finally {
    saving.value = false;
  }
}
async function loadPhone() {
  const res = await auth.fetchProtectedApi("/api/phone-numbers/", {}, "GET");
  const p = Array.isArray(res?.data) ? res.data[0] : res?.data;
  if (res?.status && p) {
    phone.value = {
      id: p.id, dialing_code_id: p.dialing_code_id ?? "", phone_number: p.phone_number ?? "",
      phone_type: Number(p.phone_type) || 1, status: Number(p.status) || 0, dialing_code: p.dialing_code ?? "",
    };
  }
}

// ---- Address (fields follow the country's address format) ----
const address = ref({});
const addressId = ref(null);
const addressForm = reactive({});
const addressFormat = ref({ fields: ["line1", "line2", "city", "region", "postcode"], labels: {}, required: ["line1", "city"], uppercase: [] });
const country = ref("");
const FLAT = { line1: "address_line_one", line2: "address_line_two", city: "city", region: "state_or_region", postcode: "postal_code" };

async function loadAddress() {
  const [fmt, res] = await Promise.all([
    auth.fetchProtectedApi("/api/addresses/address-format", {}, "GET"),
    auth.fetchProtectedApi("/api/addresses/", {}, "GET"),
  ]);
  if (fmt?.format?.fields) addressFormat.value = { labels: {}, required: [], uppercase: [], ...fmt.format };
  const a = Array.isArray(res?.data) ? res.data[0] : res?.data;
  addressId.value = a?.id ?? null;
  const c = a?.components || {};
  address.value = Object.fromEntries(addressFormat.value.fields.map((f) => [f, c[f] ?? a?.[FLAT[f]] ?? ""]));
}
const addressLines = computed(() => addressFormat.value.fields.map((f) => address.value[f]).filter(Boolean));
const fieldLabel = (f) => addressFormat.value.labels?.[f] || t(`profilePage.addr_${f}`);

async function saveAddress() {
  Object.keys(errors).forEach((k) => delete errors[k]);
  for (const f of addressFormat.value.required || []) {
    if (!String(addressForm[f] || "").trim()) errors[`addr_${f}`] = t("profilePage.required");
  }
  if (Object.keys(errors).length) return;
  const components = {};
  addressFormat.value.fields.forEach((f) => {
    let v = String(addressForm[f] || "").trim();
    if ((addressFormat.value.uppercase || []).includes(f)) v = v.toUpperCase();
    components[f] = v || null;
  });
  const payload = { components };
  Object.entries(FLAT).forEach(([k, col]) => (payload[col] = components[k] ?? null));
  saving.value = true;
  try {
    const res = addressId.value
      ? await auth.fetchProtectedApi(`/api/addresses/${addressId.value}`, payload, "PUT")
      : await auth.fetchProtectedApi("/api/addresses", payload, "POST");
    if (res?.status) {
      toast.success(t("profilePage.saved"));
      editing.value = "";
      await loadAddress();
    } else {
      toast.error(firstError(res) || t("profilePage.saveFailed"));
    }
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  const [, , , codes, ctry] = await Promise.all([
    loadLogo(), loadPhone(), loadAddress(),
    auth.fetchProtectedApi("/api/dialing-codes/", {}, "GET"),
    auth.fetchProtectedApi("/api/user-countries/country-name/", {}, "GET"),
  ]);
  dialingCodes.value = (codes?.status ? codes.data : []).filter((d) => !(d.is_active === 0 || d.is_active === "0"));
  country.value = ctry?.data?.user_country_name?.name || "";
  loading.value = false;
});
onBeforeUnmount(() => (editing.value = ""));
</script>

<template>
  <div class="flex flex-col gap-6">
    <AzPageHeader :title="t('accountNav.profile')" :description="isOrg ? t('profilePage.description') : t('profilePage.descriptionPerson')" />

    <AzSkeleton v-if="loading" :lines="6" height="3.5rem" />

    <template v-else>
      <!-- Logo and name -->
      <AzCard>
        <div class="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div class="relative">
            <AzAvatar :src="logoUrl" :name="displayName" size="xl" />
            <button type="button" class="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-ink-2 shadow-card hover:text-primary"
              :aria-label="isOrg ? t('profilePage.changeLogo') : t('profilePage.changePhoto')" :disabled="uploadingLogo" @click="logoInput?.click()">
              <Camera class="h-4 w-4" aria-hidden="true" />
            </button>
            <input ref="logoInput" type="file" accept="image/png,image/jpeg,image/webp" class="sr-only" tabindex="-1" @change="onLogo" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xl font-semibold text-ink">{{ displayName || '—' }}</p>
            <p v-if="!isOrg && auth.user?.azon_id" class="text-sm text-ink-2">{{ t('profilePage.azonId', { id: auth.user.azon_id }) }}</p>
            <p class="text-sm text-ink-muted">{{ isOrg ? t('profilePage.logoHelp') : t('profilePage.photoHelp') }}</p>
          </div>
        </div>
      </AzCard>

      <!-- Account details -->
      <AzCard :title="t('profilePage.accountDetails')" :padded="false">
        <dl class="divide-y divide-line">
          <!-- Name -->
          <div class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start">
            <dt class="w-44 shrink-0 text-sm font-medium text-ink-muted">{{ isOrg ? t('profilePage.orgName') : t('profilePage.yourName') }}</dt>
            <dd class="min-w-0 flex-1">
              <form v-if="editing === 'name'" class="flex flex-col gap-3" novalidate @submit.prevent="saveAccountField('name')">
                <AzInput v-if="isOrg" v-model="form.org_name" :label="t('profilePage.orgName')" :error="errors.org_name" maxlength="100" autocomplete="organization" />
                <div v-else class="grid gap-3 sm:grid-cols-2">
                  <AzInput v-model="form.first_name" :label="t('profilePage.firstName')" :error="errors.first_name" maxlength="100" autocomplete="given-name" />
                  <AzInput v-model="form.last_name" :label="t('profilePage.lastName')" :error="errors.last_name" maxlength="100" autocomplete="family-name" />
                </div>
                <div class="flex gap-2"><AzButton type="submit" size="sm" :loading="saving">{{ t('common.save') }}</AzButton><AzButton variant="quiet" size="sm" @click="editing = ''">{{ t('common.cancel') }}</AzButton></div>
              </form>
              <div v-else class="flex items-center justify-between gap-3">
                <span class="text-[15px] text-ink">{{ displayName || '—' }}</span>
                <AzButton variant="quiet" size="sm" @click="startEdit('name')"><template #icon><Pencil class="h-4 w-4" /></template>{{ t('common.edit') }}</AzButton>
              </div>
            </dd>
          </div>
          <!-- Username -->
          <div class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start">
            <dt class="w-44 shrink-0 text-sm font-medium text-ink-muted">{{ t('profilePage.username') }}</dt>
            <dd class="min-w-0 flex-1">
              <form v-if="editing === 'username'" class="flex flex-col gap-3" novalidate @submit.prevent="saveAccountField('username')">
                <AzInput v-model="form.username" :label="t('profilePage.username')" :help="t('profilePage.usernameHelp')" :error="errors.username" maxlength="30" autocomplete="username" />
                <div class="flex gap-2"><AzButton type="submit" size="sm" :loading="saving">{{ t('common.save') }}</AzButton><AzButton variant="quiet" size="sm" @click="editing = ''">{{ t('common.cancel') }}</AzButton></div>
              </form>
              <div v-else class="flex items-center justify-between gap-3">
                <span class="text-[15px] text-ink">{{ auth.user?.username || '—' }}</span>
                <AzButton variant="quiet" size="sm" @click="startEdit('username')"><template #icon><Pencil class="h-4 w-4" /></template>{{ t('common.edit') }}</AzButton>
              </div>
            </dd>
          </div>
          <!-- Email -->
          <div class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start">
            <dt class="w-44 shrink-0 text-sm font-medium text-ink-muted">{{ t('profilePage.email') }}</dt>
            <dd class="min-w-0 flex-1">
              <form v-if="editing === 'email'" class="flex flex-col gap-3" novalidate @submit.prevent="saveAccountField('email')">
                <AzInput v-model="form.email" type="email" inputmode="email" :label="t('profilePage.email')" :help="t('profilePage.emailHelp')" :error="errors.email" maxlength="100" autocomplete="email" />
                <div class="flex gap-2"><AzButton type="submit" size="sm" :loading="saving">{{ t('common.save') }}</AzButton><AzButton variant="quiet" size="sm" @click="editing = ''">{{ t('common.cancel') }}</AzButton></div>
              </form>
              <div v-else class="flex items-center justify-between gap-3">
                <span class="break-all text-[15px] text-ink">{{ auth.user?.email || '—' }}</span>
                <AzButton variant="quiet" size="sm" @click="startEdit('email')"><template #icon><Pencil class="h-4 w-4" /></template>{{ t('common.edit') }}</AzButton>
              </div>
            </dd>
          </div>
          <!-- Country (changed in Settings) -->
          <div class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
            <dt class="w-44 shrink-0 text-sm font-medium text-ink-muted">{{ t('profilePage.country') }}</dt>
            <dd class="flex min-w-0 flex-1 items-center justify-between gap-3">
              <span class="text-[15px] text-ink">{{ country || '—' }}</span>
              <AzButton variant="quiet" size="sm" :to="settingsRoute">{{ t('accountNav.settings') }}</AzButton>
            </dd>
          </div>
        </dl>
      </AzCard>

      <!-- Phone -->
      <AzCard :title="t('profilePage.phone')">
        <template v-if="editing !== 'phone'" #actions>
          <AzButton variant="quiet" size="sm" @click="startEdit('phone')"><template #icon><Pencil class="h-4 w-4" /></template>{{ phone.id ? t('common.edit') : t('profilePage.add') }}</AzButton>
        </template>
        <form v-if="editing === 'phone'" class="grid gap-4 sm:grid-cols-2" novalidate @submit.prevent="savePhone">
          <AzSelect v-model="phoneForm.dialing_code_id" :label="t('profilePage.countryCode')" :options="dialingOptions" :placeholder="t('meetingForm.choose')" :error="errors.dialing_code_id" />
          <AzInput v-model="phoneForm.phone_number" type="tel" inputmode="tel" :label="t('profilePage.number')" :error="errors.phone_number" maxlength="20" autocomplete="tel-national" />
          <AzSelect v-model="phoneForm.phone_type" :label="t('profilePage.phoneType')" :options="phoneTypeOptions" />
          <AzSelect v-model="phoneForm.status" :label="t('profilePage.whoCanSee')" :options="visibilityOptions" />
          <div class="flex gap-2 sm:col-span-2"><AzButton type="submit" size="sm" :loading="saving">{{ t('common.save') }}</AzButton><AzButton variant="quiet" size="sm" @click="editing = ''">{{ t('common.cancel') }}</AzButton></div>
        </form>
        <div v-else-if="phone.id" class="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span class="text-[15px] font-medium text-ink">{{ phone.dialing_code }} {{ phone.phone_number }}</span>
          <AzBadge tone="neutral">{{ t(`profilePage.phoneType_${phone.phone_type}`) }}</AzBadge>
          <span class="text-sm text-ink-muted">{{ t(`profilePage.visibility_${phone.status}`) }}</span>
        </div>
        <p v-else class="text-[15px] text-ink-muted">{{ t('profilePage.noPhone') }}</p>
      </AzCard>

      <!-- Address -->
      <AzCard :title="t('profilePage.address')">
        <template v-if="editing !== 'address'" #actions>
          <AzButton variant="quiet" size="sm" @click="startEdit('address')"><template #icon><Pencil class="h-4 w-4" /></template>{{ addressLines.length ? t('common.edit') : t('profilePage.add') }}</AzButton>
        </template>
        <form v-if="editing === 'address'" class="grid gap-4 sm:grid-cols-2" novalidate @submit.prevent="saveAddress">
          <div v-for="f in addressFormat.fields" :key="f" :class="f === 'line1' || f === 'line2' ? 'sm:col-span-2' : ''">
            <AzInput v-model="addressForm[f]" :label="fieldLabel(f)" :required="(addressFormat.required || []).includes(f)" :error="errors[`addr_${f}`]"
              maxlength="255" :autocomplete="{ line1: 'address-line1', line2: 'address-line2', city: 'address-level2', region: 'address-level1', postcode: 'postal-code' }[f] || 'off'" />
          </div>
          <div class="flex gap-2 sm:col-span-2"><AzButton type="submit" size="sm" :loading="saving">{{ t('common.save') }}</AzButton><AzButton variant="quiet" size="sm" @click="editing = ''">{{ t('common.cancel') }}</AzButton></div>
        </form>
        <address v-else-if="addressLines.length" class="flex flex-col not-italic text-[15px] text-ink">
          <span v-for="(line, i) in addressLines" :key="i">{{ line }}</span>
          <span v-if="country" class="text-ink-muted">{{ country }}</span>
        </address>
        <p v-else class="text-[15px] text-ink-muted">{{ t('profilePage.noAddress') }}</p>
      </AzCard>
    </template>
  </div>
</template>
