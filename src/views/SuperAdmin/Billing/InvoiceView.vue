<!-- One invoice for the Super Admin: lines and totals, payments received, and the actions
     (publish, record a payment, change due date or notes, cancel) -->
<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { money, statusTone, shortDate, gatewayName } from "@/helpers/billing";
import { Send, Banknote, Ban, Pencil } from "lucide-vue-next";

const auth = authStore;
const route = useRoute();
const { t, locale } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const METHODS = ["bank_transfer", "cash", "cheque", "card", "bkash", "rocket", "sslcommerze", "stripe", "paypal", "other"];
const loading = ref(true);
const d = ref(null);
const inv = computed(() => d.value?.invoice || null);
const cur = computed(() => ({ code: inv.value?.currency_code }));
const today = new Date().toISOString().slice(0, 10);
const state = computed(() => {
  const i = inv.value;
  if (!i) return "";
  if (i.invoice_status === "cancelled") return "cancelled";
  if (!i.is_published) return "draft";
  if (Number(i.balance_due) > 0 && i.payment_status !== "paid" && i.due_date && i.due_date < today) return "overdue";
  return i.payment_status;
});
const canPay = computed(() => inv.value && inv.value.invoice_status !== "cancelled" && Number(inv.value.balance_due) > 0);

async function load() {
  const res = await auth.fetchProtectedApi(`/api/superadmin/billing/invoices/${route.params.id}`, {}, "GET");
  d.value = res?.status ? res.data : null;
}

async function act(path, successKey, payload = {}) {
  const res = await auth.fetchProtectedApi(`/api/superadmin/billing/invoices/${inv.value.id}/${path}`, payload, "POST");
  if (res?.status) {
    toast.success(t(successKey));
    await load();
    return true;
  }
  toast.error(res?.errors?.message || t("profilePage.saveFailed"));
  return false;
}

async function publish() {
  const ok = await confirm({ title: t("adminBilling.publishTitle"), message: t("adminBilling.publishText", { org: inv.value.org_name }), confirmText: t("adminBilling.publish") });
  if (ok) act("publish", "adminBilling.publishedOne");
}
async function cancel() {
  const ok = await confirm({ title: t("adminBilling.cancelTitle"), message: t("adminBilling.cancelText"), confirmText: t("adminBilling.cancelInvoice"), danger: true });
  if (ok) act("cancel", "adminBilling.cancelled");
}

// ---- Record a payment ----
const paying = ref(false);
const pay = reactive({ amount: "", method: "bank_transfer", paid_on: today, reference: "", note: "" });
const payErrors = reactive({});
const saving = ref(false);
function openPay() {
  Object.assign(pay, { amount: String(inv.value.balance_due), method: "bank_transfer", paid_on: today, reference: "", note: "" });
  Object.keys(payErrors).forEach((k) => delete payErrors[k]);
  paying.value = true;
}
async function savePayment() {
  Object.keys(payErrors).forEach((k) => delete payErrors[k]);
  const amount = Number(pay.amount);
  if (!(amount > 0) || amount > Number(inv.value.balance_due)) payErrors.amount = t("adminBilling.amountRange", { max: money(inv.value.balance_due, cur.value) });
  if (!pay.paid_on || pay.paid_on > today) payErrors.paid_on = t("adminBilling.dateNotFuture");
  if (Object.keys(payErrors).length) return;
  saving.value = true;
  try {
    const ok = await act("payments", "adminBilling.paymentRecorded", { ...pay, amount, reference: pay.reference.trim() || null, note: pay.note.trim() || null });
    if (ok) paying.value = false;
  } finally {
    saving.value = false;
  }
}

// ---- Due date and notes ----
const editing = ref(false);
const edit = reactive({ due_date: "", invoice_note: "", terms: "", admin_note: "" });
function openEdit() {
  Object.assign(edit, { due_date: inv.value.due_date || "", invoice_note: inv.value.invoice_note || "", terms: inv.value.terms || "", admin_note: inv.value.admin_note || "" });
  editing.value = true;
}
async function saveEdit() {
  const res = await auth.fetchProtectedApi(`/api/superadmin/billing/invoices/${inv.value.id}`, { ...edit, due_date: edit.due_date || null }, "PUT");
  if (res?.status) {
    toast.success(t("lookups.saved"));
    editing.value = false;
    await load();
  } else toast.error(t("profilePage.saveFailed"));
}

onMounted(async () => {
  await load();
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-6">
    <AzPageHeader :title="inv ? t('invoicePage.invoiceNo', { code: inv.invoice_code }) : t('invoicePage.invoice')" :back="{ name: 'super-admin-invoice-list' }" :back-label="t('adminBilling.invoicesTitle')">
      <template v-if="inv">
        <AzButton v-if="state === 'draft'" @click="publish"><template #icon><Send class="h-[18px] w-[18px]" /></template>{{ t('adminBilling.publish') }}</AzButton>
        <AzButton v-if="canPay && state !== 'draft'" @click="openPay"><template #icon><Banknote class="h-[18px] w-[18px]" /></template>{{ t('renewals.record') }}</AzButton>
        <AzButton v-if="state !== 'cancelled'" variant="secondary" @click="openEdit"><template #icon><Pencil class="h-[18px] w-[18px]" /></template>{{ t('common.edit') }}</AzButton>
        <AzButton v-if="state !== 'cancelled' && !Number(inv.amount_paid)" variant="quiet" @click="cancel"><template #icon><Ban class="h-[18px] w-[18px]" /></template>{{ t('adminBilling.cancelInvoice') }}</AzButton>
      </template>
    </AzPageHeader>

    <AzSkeleton v-if="loading" :lines="6" height="3rem" />
    <AzCard v-else-if="!inv"><AzEmptyState :title="t('invoicePage.notFoundTitle')" /></AzCard>

    <template v-else>
      <AzCard>
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-sm text-ink-muted">{{ t('invoicePage.billedTo') }}</p>
            <p class="font-semibold text-ink">{{ inv.org_name || d.organisation?.org_name }}</p>
            <p class="text-sm text-ink-2">{{ d.organisation?.email }}</p>
            <p v-if="d.order?.billing_address" class="text-sm text-ink-2">{{ d.order.billing_address }}</p>
            <p v-if="d.order?.user_country" class="text-sm text-ink-2">{{ d.order.user_country }}</p>
          </div>
          <div class="flex flex-col gap-1 text-sm sm:text-right">
            <AzBadge class="self-start sm:self-end" :tone="statusTone(state)">{{ t(`billing.status_${state}`, state) }}</AzBadge>
            <p><span class="text-ink-muted">{{ t('invoicePage.issued') }}:</span> {{ shortDate(inv.issue_date, locale) || t('adminBilling.notYet') }}</p>
            <p><span class="text-ink-muted">{{ t('invoicePage.due') }}:</span> {{ shortDate(inv.due_date, locale) || '—' }}</p>
            <p v-if="inv.billing_code"><span class="text-ink-muted">{{ t('billPage.billNumber') }}:</span> {{ inv.billing_code }}</p>
          </div>
        </div>

        <table class="mt-6 w-full text-sm">
          <tbody class="divide-y divide-line border-y border-line">
            <tr v-for="(it, i) in d.items" :key="i">
              <td class="py-3 text-ink">{{ it.product_name }}</td>
              <td class="py-3 text-right tabular-nums text-ink">{{ money(it.total_price, cur) }}</td>
            </tr>
            <tr v-if="!d.items.length"><td class="py-3 text-ink-muted" colspan="2">{{ inv.description }}</td></tr>
          </tbody>
        </table>
        <dl class="ml-auto mt-4 flex max-w-xs flex-col gap-2 text-sm">
          <div v-if="d.order" class="flex justify-between"><dt class="text-ink-muted">{{ t('invoicePage.subtotal') }}</dt><dd class="tabular-nums">{{ money(d.order.sub_total, cur) }}</dd></div>
          <div v-if="Number(d.order?.total_tax)" class="flex justify-between"><dt class="text-ink-muted">{{ t('invoicePage.tax') }} ({{ Number(d.order.tax_rate) }}%)</dt><dd class="tabular-nums">{{ money(d.order.total_tax, cur) }}</dd></div>
          <div class="flex justify-between font-semibold"><dt>{{ t('billing.total') }}</dt><dd class="tabular-nums">{{ money(inv.total_amount, cur) }}</dd></div>
          <div class="flex justify-between"><dt class="text-ink-muted">{{ t('invoicePage.paid') }}</dt><dd class="tabular-nums">{{ money(inv.amount_paid, cur) }}</dd></div>
          <div class="flex justify-between text-base font-semibold"><dt>{{ t('invoicePage.toPay') }}</dt><dd class="tabular-nums" :class="state === 'overdue' ? 'text-danger' : ''">{{ money(inv.balance_due, cur) }}</dd></div>
        </dl>
        <p v-if="inv.invoice_note" class="mt-4 whitespace-pre-line border-t border-line pt-4 text-sm text-ink-2">{{ inv.invoice_note }}</p>
        <p v-if="inv.admin_note" class="mt-2 text-sm text-ink-muted">{{ t('adminBilling.adminNote') }}: {{ inv.admin_note }}</p>
      </AzCard>

      <AzCard :title="t('adminBilling.paymentsTitle')" :padded="false">
        <p v-if="!d.receipts.length" class="px-5 py-4 text-sm text-ink-muted">{{ t('adminBilling.noPaymentsYet') }}</p>
        <ul v-else class="divide-y divide-line">
          <li v-for="r in d.receipts" :key="r.id" class="flex items-center gap-3 px-5 py-3">
            <span class="min-w-0 flex-1">
              <span class="block font-medium text-ink">{{ money(r.amount_received, { code: r.currency_code }) }} · {{ gatewayName(r.gateway_type) }}</span>
              <span class="block truncate text-sm text-ink-muted">{{ [shortDate(r.payment_date, locale), r.receipt_code, r.transaction_reference, r.note].filter(Boolean).join(' · ') }}</span>
            </span>
          </li>
        </ul>
      </AzCard>
    </template>

    <AzModal v-if="paying" :open="true" :title="t('adminBilling.recordTitle')" :description="t('adminBilling.recordText', { due: money(inv.balance_due, cur) })" @close="paying = false">
      <form id="pay-form" class="flex flex-col gap-5" novalidate @submit.prevent="savePayment">
        <div class="grid gap-5 sm:grid-cols-2">
          <AzInput v-model="pay.amount" type="number" min="0.01" step="0.01" inputmode="decimal" :label="t('adminBilling.amount', { code: inv.currency_code })" :error="payErrors.amount" required />
          <AzInput v-model="pay.paid_on" type="date" :max="today" :label="t('renewals.paidOn')" :error="payErrors.paid_on" required />
        </div>
        <AzSelect v-model="pay.method" :label="t('receiptPage.method')" :options="METHODS.map((m) => ({ value: m, label: gatewayName(m) }))" />
        <AzInput v-model="pay.reference" :label="t('receiptPage.reference')" :help="t('adminBilling.referenceHelp')" maxlength="100" autocomplete="off" />
        <AzInput v-model="pay.note" :label="t('meetingView.note')" maxlength="255" autocomplete="off" />
      </form>
      <template #footer>
        <AzButton variant="quiet" @click="paying = false">{{ t('common.cancel') }}</AzButton>
        <AzButton type="submit" form="pay-form" :loading="saving">{{ t('renewals.record') }}</AzButton>
      </template>
    </AzModal>

    <AzModal v-if="editing" :open="true" :title="t('adminBilling.editTitle')" @close="editing = false">
      <form id="inv-edit" class="flex flex-col gap-5" novalidate @submit.prevent="saveEdit">
        <AzInput v-model="edit.due_date" type="date" :label="t('invoicePage.due')" />
        <AzTextarea v-model="edit.invoice_note" :label="t('adminBilling.noteForOrg')" :rows="3" />
        <AzTextarea v-model="edit.terms" :label="t('adminBilling.terms')" :rows="2" />
        <AzInput v-model="edit.admin_note" :label="t('adminBilling.adminNote')" :help="t('adminBilling.adminNoteHelp')" maxlength="255" />
      </form>
      <template #footer>
        <AzButton variant="quiet" @click="editing = false">{{ t('common.cancel') }}</AzButton>
        <AzButton type="submit" form="inv-edit">{{ t('common.save') }}</AzButton>
      </template>
    </AzModal>
  </div>
</template>
