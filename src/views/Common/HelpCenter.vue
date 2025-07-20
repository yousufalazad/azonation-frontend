<script setup>
import Header from './Header.vue'
import Footer from './Footer.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white">
    <!-- Header -->
    <Header />

    <!-- Main Content -->
    <main class="flex-grow pt-[100px] pb-20 px-4">
      <div class="max-w-5xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-800 text-center mb-10">Help Center</h1>
        <p class="text-center text-gray-600 mb-12 text-sm">
          Find answers to common questions about your account, membership, and features within Azonation.
        </p>

        <div class="space-y-10">
          <!-- Account Help -->
          <section>
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Account Help</h2>
            <div class="space-y-4">
              <details class="border rounded-md p-4">
                <summary class="cursor-pointer font-medium text-gray-700">How do I create an account?</summary>
                <p class="mt-2 text-sm text-gray-600">
                  Visit the <router-link to="/signup" class="text-blue-600 hover:underline">Sign Up</router-link> page, select Individual or Organisation account, fill in your details, and click “Sign Up”. You’ll receive an email confirmation.
                </p>
              </details>

              <details class="border rounded-md p-4">
                <summary class="cursor-pointer font-medium text-gray-700">What if I forget my password?</summary>
                <p class="mt-2 text-sm text-gray-600">
                  Go to the <router-link to="/forgot-password" class="text-blue-600 hover:underline">Forgot Password</router-link> page and enter your email. You’ll receive a link to reset your password securely.
                </p>
              </details>

              <details class="border rounded-md p-4">
                <summary class="cursor-pointer font-medium text-gray-700">Can I update my email or username?</summary>
                <p class="mt-2 text-sm text-gray-600">
                  Yes, log in and visit <router-link to="/individual-dashboard/my-account" class="text-blue-600 hover:underline">My Account</router-link> to update your email or username. Changes will reflect immediately after confirmation.
                </p>
              </details>
            </div>
          </section>

          <!-- Membership Help -->
          <section>
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Membership</h2>
            <div class="space-y-4">
              <details class="border rounded-md p-4">
                <summary class="cursor-pointer font-medium text-gray-700">How do I join an organisation?</summary>
                <p class="mt-2 text-sm text-gray-600">
                  After logging in, browse public organisations or accept an invitation. Click “Join” on the organisation’s profile page. Some may require admin approval.
                </p>
              </details>

              <details class="border rounded-md p-4">
                <summary class="cursor-pointer font-medium text-gray-700">Can I be part of multiple organisations?</summary>
                <p class="mt-2 text-sm text-gray-600">
                  Yes, Azonation allows you to be a member of multiple organisations. You can switch between them using the dashboard selector.
                </p>
              </details>
            </div>
          </section>

          <!-- Features & Tools -->
          <section>
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Features & Tools</h2>
            <div class="space-y-4">
              <details class="border rounded-md p-4">
                <summary class="cursor-pointer font-medium text-gray-700">How do I manage events and meetings?</summary>
                <p class="mt-2 text-sm text-gray-600">
                  Organisation admins can create and manage events from the dashboard. Members can RSVP, view details, and download event summaries.
                </p>
              </details>

              <details class="border rounded-md p-4">
                <summary class="cursor-pointer font-medium text-gray-700">Is there a billing system?</summary>
                <p class="mt-2 text-sm text-gray-600">
                  Yes. Organisation accounts include billing tools to manage subscriptions, generate invoices, and track financial transactions. You can access them via <router-link to="/org-dashboard/my-account/invoice-list" class="text-blue-600 hover:underline">Billing</router-link>.
                </p>
              </details>
            </div>
          </section>

          <!-- Contact Support -->
          <section>
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Still need help?</h2>
            <p class="text-gray-600 text-sm mb-4">
              If you didn’t find what you were looking for, feel free to contact our support team.
            </p>
            <router-link
              to="/contact-us"
              class="inline-block px-5 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-500"
            >
              Contact Support
            </router-link>
          </section>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<style scoped>
</style>
