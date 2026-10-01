<script setup>
// Living style guide for the Azonation Calm design system.
// Available at /style-guide in development builds only.
import { ref } from "vue";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";

const toast = useToast();
const confirm = useConfirm();

const name = ref("Nusrat Jahan");
const phone = ref("01712 34");
const role = ref("treasurer");
const notes = ref("");
const agree = ref(true);
const modalOpen = ref(false);
const saving = ref(false);

const roles = [
  { value: "president", label: "President" },
  { value: "secretary", label: "Secretary" },
  { value: "treasurer", label: "Treasurer" },
  { value: "member", label: "Member" },
];

const swatches = [
  { name: "Canvas", cls: "bg-canvas", note: "Page background" },
  { name: "Surface", cls: "bg-surface", note: "Cards, menus" },
  { name: "Surface 2", cls: "bg-surface-2", note: "Subtle areas" },
  { name: "Primary", cls: "bg-primary", note: "Main actions only" },
  { name: "Success", cls: "bg-success", note: "Paid, active, done" },
  { name: "Warning", cls: "bg-warning", note: "Due soon, pending" },
  { name: "Danger", cls: "bg-danger", note: "Overdue, delete" },
  { name: "Ink", cls: "bg-ink", note: "Main text" },
];
// Tailwind cannot see class names built at runtime, so the scale uses inline colours
const brand = [
  [50, "#EEF5FF"], [100, "#D9E8FF"], [200, "#B5D2FF"], [300, "#84B4FB"], [400, "#4D93F5"],
  [500, "#1A7BF0"], [600, "#0B63D1"], [700, "#0A4FA8"], [800, "#0D4288"], [900, "#102F5E"],
];

async function fakeSave() {
  saving.value = true;
  await new Promise((r) => setTimeout(r, 1200));
  saving.value = false;
  toast.success("Member saved");
}

async function removeMember() {
  const ok = await confirm({
    title: "Remove Kamal Hossain?",
    message: "He will no longer see club meetings or pay fees online. This can't be undone.",
    confirmText: "Remove member",
    danger: true,
  });
  if (ok) toast.info("Kamal Hossain was removed");
}
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-8 sm:px-6">
    <AzPageHeader title="Azonation Calm" description="Every shared component, in both themes and both languages. Build new screens from these pieces.">
      <div class="w-72 max-w-full">
        <AzAppearanceSettings />
      </div>
    </AzPageHeader>

    <div class="flex flex-col gap-6">
      <AzCard title="Colour" description="Colours carry meaning. Blue is for actions, green for done, amber for attention, red for problems.">
        <div class="grid grid-cols-5 overflow-hidden rounded-control border border-line sm:grid-cols-10">
          <div v-for="[n, hex] in brand" :key="n" class="flex aspect-square items-end p-1.5 text-[10px] font-semibold"
            :class="n >= 500 ? 'text-white' : 'text-brand-900'" :style="{ backgroundColor: hex }">{{ n }}</div>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div v-for="s in swatches" :key="s.name" class="overflow-hidden rounded-control border border-line">
            <div class="h-12" :class="s.cls" />
            <div class="px-3 py-2">
              <p class="text-sm font-semibold text-ink">{{ s.name }}</p>
              <p class="text-xs text-ink-muted">{{ s.note }}</p>
            </div>
          </div>
        </div>
      </AzCard>

      <AzCard title="Type" description="Noto Sans and Noto Sans Bengali. Body text is never smaller than 15px.">
        <div class="flex flex-col gap-3">
          <p class="text-[28px] font-bold leading-tight text-ink">Members</p>
          <p class="text-xl font-semibold text-ink">Upcoming meetings</p>
          <p class="text-[15px] text-ink-2">The annual general meeting is on Saturday at 4 pm in the community hall.</p>
          <p class="text-[15px] text-ink-2">বার্ষিক সাধারণ সভা শনিবার বিকেল ৪টায় কমিউনিটি হলে অনুষ্ঠিত হবে।</p>
          <p class="text-[13px] text-ink-muted">Help text and captions: 13px, muted.</p>
        </div>
      </AzCard>

      <AzCard title="Buttons" description="One primary button per screen. Labels start with a verb.">
        <div class="flex flex-wrap items-center gap-3">
          <AzButton :loading="saving" loading-text="Saving…" @click="fakeSave">
            <template #icon><Plus class="h-[18px] w-[18px]" /></template>
            Save member
          </AzButton>
          <AzButton variant="secondary">Export list</AzButton>
          <AzButton variant="quiet">Cancel</AzButton>
          <AzButton variant="danger" @click="removeMember">Remove member</AzButton>
          <AzButton variant="secondary" size="sm">Small (tables)</AzButton>
          <AzButton disabled>Disabled</AzButton>
        </div>
      </AzCard>

      <AzCard title="Status" description="A dot and a word, so status is clear without colour.">
        <div class="flex flex-wrap gap-2">
          <AzBadge tone="success">Paid</AzBadge>
          <AzBadge tone="warning">Due in 3 days</AzBadge>
          <AzBadge tone="danger">Overdue</AzBadge>
          <AzBadge tone="info">Draft</AzBadge>
          <AzBadge>Archived</AzBadge>
        </div>
      </AzCard>

      <AzCard title="Forms" description="Labels always above the field. Errors say how to fix the problem.">
        <form class="grid gap-5 sm:grid-cols-2" @submit.prevent="fakeSave">
          <AzInput v-model="name" label="Full name" help="As it should appear on the membership card." required autocomplete="name" />
          <AzInput v-model="phone" label="Mobile number" type="tel" inputmode="tel"
            error="Enter all 11 digits, for example 01712 345678." />
          <AzSelect v-model="role" label="Committee role" :options="roles" />
          <AzInput label="Search members" placeholder="Name or membership ID">
            <template #prefix><Search class="h-5 w-5" /></template>
          </AzInput>
          <div class="sm:col-span-2">
            <AzTextarea v-model="notes" label="Notes" help="Only committee members can see this." />
          </div>
          <div class="sm:col-span-2">
            <AzCheckbox v-model="agree" label="Send a welcome email" help="The new member gets their login details by email." />
          </div>
        </form>
      </AzCard>

      <AzCard title="Feedback" description="Toasts for small confirmations, dialogs for decisions.">
        <div class="flex flex-wrap gap-3">
          <AzButton variant="secondary" @click="toast.success('Payment recorded')">Show success</AzButton>
          <AzButton variant="secondary" @click="toast.error('Could not save. Check your internet connection and try again.')">Show error</AzButton>
          <AzButton variant="secondary" @click="modalOpen = true">Open dialog</AzButton>
          <AzButton variant="secondary" @click="removeMember">Ask to confirm</AzButton>
        </div>
      </AzCard>

      <AzCard title="Empty and loading states" :padded="false">
        <div class="grid divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <AzEmptyState title="No meetings yet" description="Schedule your first meeting and members will be notified.">
            <AzButton>Schedule meeting</AzButton>
          </AzEmptyState>
          <div class="p-6">
            <AzSkeleton :lines="4" />
          </div>
        </div>
      </AzCard>
    </div>

    <AzModal v-model:open="modalOpen" title="Record payment" description="Nusrat Jahan · October fee">
      <div class="flex flex-col gap-4">
        <AzInput label="Amount (BDT)" type="number" inputmode="decimal" model-value="500" />
        <AzSelect label="Paid by" :options="['Cash', 'bKash', 'Bank transfer']" model-value="Cash" />
      </div>
      <template #footer>
        <AzButton variant="quiet" @click="modalOpen = false">Cancel</AzButton>
        <AzButton @click="modalOpen = false; toast.success('Payment recorded')">Record payment</AzButton>
      </template>
    </AzModal>
  </div>
</template>
