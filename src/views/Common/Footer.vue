<!-- Footer of the public pages -->
<script setup>
const GROUPS = [
  {
    title: "publicSite.product",
    links: [
      { label: "publicSite.forMembers", to: { name: "individual" } },
      { label: "publicSite.forOrgs", to: { name: "organisation" } },
      { label: "publicSite.pricing", to: { name: "pricing" } },
    ],
  },
  {
    title: "publicSite.company",
    links: [
      { label: "publicSite.about", to: { name: "about-us" } },
      { label: "publicSite.help", to: { name: "help" } },
      { label: "footer.contact", to: { name: "contact-us" } },
    ],
  },
  {
    title: "footer.legal",
    links: [
      { label: "signup.termsLink", to: { name: "terms-of-service" } },
      { label: "signup.privacyLink", to: { name: "privacy-policy" } },
      { label: "publicSite.cookiePolicy", to: { name: "cookies" } },
    ],
  },
];
const year = new Date().getFullYear();
</script>

<template>
  <footer class="border-t border-line bg-surface">
    <div class="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <img src="@/assets/Logo/Azonation.png" alt="Azonation" class="w-32 dark:brightness-[1.8] dark:saturate-[.8]" />
        <p class="mt-3 max-w-xs text-sm text-ink-2">{{ $t('publicSite.tagline') }}</p>
      </div>
      <nav v-for="group in GROUPS" :key="group.title" :aria-label="$t(group.title)">
        <h2 class="text-xs font-semibold uppercase tracking-wider text-ink-muted">{{ $t(group.title) }}</h2>
        <ul class="mt-3 flex flex-col gap-1">
          <li v-for="link in group.links" :key="link.label">
            <RouterLink :to="link.to" class="inline-flex min-h-[32px] items-center text-sm text-ink-2 hover:text-ink hover:underline">{{ $t(link.label) }}</RouterLink>
          </li>
        </ul>
      </nav>
    </div>
    <p class="border-t border-line px-4 py-4 text-center text-[13px] text-ink-muted">{{ $t('publicSite.copyright', { year }) }}</p>
  </footer>
</template>
