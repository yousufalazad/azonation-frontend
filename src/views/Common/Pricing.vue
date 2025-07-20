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
      <div class="max-w-7xl mx-auto">
        <!-- Title -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-800 mb-4">Choose Your Plan</h1>
          <p class="text-gray-600 text-sm">
            Flexible plans for individuals and organisations. Pay monthly or yearly — switch anytime.
          </p>
        </div>

        <!-- Plans -->
        <div class="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <!-- Free Plan -->
          <div class="border rounded-lg p-6 shadow-sm">
            <h2 class="text-lg font-semibold text-gray-800 mb-2">Free</h2>
            <p class="text-sm text-gray-600 mb-4">Ideal for individuals getting started</p>
            <p class="text-3xl font-bold text-gray-900 mb-1">£0<span class="text-sm font-normal text-gray-500">/mo</span></p>
            <ul class="mt-4 space-y-2 text-sm text-gray-700">
              <li>✔ 1 Organisation</li>
              <li>✔ Up to 5 Members</li>
              <li>✔ Basic Profile Management</li>
              <li>✖ Advanced Reporting</li>
            </ul>
            <router-link
              to="/signup"
              class="block mt-6 text-center bg-gray-800 text-white py-2 rounded-md hover:bg-gray-700 text-sm"
            >
              Get Started
            </router-link>
          </div>

          <!-- Standard Plan -->
          <div class="border rounded-lg p-6 shadow-md bg-blue-50 border-blue-600">
            <h2 class="text-lg font-semibold text-gray-800 mb-2">Standard</h2>
            <p class="text-sm text-gray-600 mb-4">For small teams and associations</p>
            <p class="text-3xl font-bold text-gray-900 mb-1">£9<span class="text-sm font-normal text-gray-500">/mo</span></p>
            <ul class="mt-4 space-y-2 text-sm text-gray-700">
              <li>✔ Up to 3 Organisations</li>
              <li>✔ 50 Members per Org</li>
              <li>✔ Events & Projects</li>
              <li>✔ Member Roles & Permissions</li>
            </ul>
            <router-link
              to="/signup"
              class="block mt-6 text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-500 text-sm"
            >
              Start Standard
            </router-link>
          </div>

          <!-- Professional Plan -->
          <div class="border rounded-lg p-6 shadow-sm">
            <h2 class="text-lg font-semibold text-gray-800 mb-2">Professional</h2>
            <p class="text-sm text-gray-600 mb-4">For medium to large organisations</p>
            <p class="text-3xl font-bold text-gray-900 mb-1">£25<span class="text-sm font-normal text-gray-500">/mo</span></p>
            <ul class="mt-4 space-y-2 text-sm text-gray-700">
              <li>✔ Unlimited Organisations</li>
              <li>✔ Up to 500 Members</li>
              <li>✔ Billing & Finance Tools</li>
              <li>✔ Premium Support</li>
            </ul>
            <router-link
              to="/signup"
              class="block mt-6 text-center bg-gray-800 text-white py-2 rounded-md hover:bg-gray-700 text-sm"
            >
              Start Professional
            </router-link>
          </div>

          <!-- Enterprise Plan -->
          <div class="border rounded-lg p-6 shadow-sm">
            <h2 class="text-lg font-semibold text-gray-800 mb-2">Enterprise</h2>
            <p class="text-sm text-gray-600 mb-4">Custom solution for large networks</p>
            <p class="text-3xl font-bold text-gray-900 mb-1">Custom</p>
            <ul class="mt-4 space-y-2 text-sm text-gray-700">
              <li>✔ Unlimited Members</li>
              <li>✔ Dedicated Success Manager</li>
              <li>✔ Custom Integrations</li>
              <li>✔ SLA & Audit Trail Access</li>
            </ul>
            <router-link
              to="/contact"
              class="block mt-6 text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-500 text-sm"
            >
              Contact Sales
            </router-link>
          </div>
        </div>

        <!-- Comparison Table -->
        <div class="mt-20">
          <h2 class="text-2xl font-bold text-gray-800 text-center mb-6">Compare Features</h2>
          <div class="overflow-x-auto border rounded-lg">
            <table class="min-w-full text-sm text-left">
              <thead class="bg-gray-100 text-gray-700 font-semibold">
                <tr>
                  <th class="px-4 py-3">Feature</th>
                  <th class="px-4 py-3 text-center">Free</th>
                  <th class="px-4 py-3 text-center">Standard</th>
                  <th class="px-4 py-3 text-center">Professional</th>
                  <th class="px-4 py-3 text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody class="text-gray-600">
                <tr class="border-t">
                  <td class="px-4 py-3">Max Organisations</td>
                  <td class="text-center">1</td>
                  <td class="text-center">3</td>
                  <td class="text-center">Unlimited</td>
                  <td class="text-center">Unlimited</td>
                </tr>
                <tr class="border-t">
                  <td class="px-4 py-3">Members Limit</td>
                  <td class="text-center">5</td>
                  <td class="text-center">50</td>
                  <td class="text-center">500</td>
                  <td class="text-center">Unlimited</td>
                </tr>
                <tr class="border-t">
                  <td class="px-4 py-3">Events & Projects</td>
                  <td class="text-center">No</td>
                  <td class="text-center">Yes</td>
                  <td class="text-center">Yes</td>
                  <td class="text-center">Yes</td>
                </tr>
                <tr class="border-t">
                  <td class="px-4 py-3">Finance Module</td>
                  <td class="text-center">No</td>
                  <td class="text-center">No</td>
                  <td class="text-center">Yes</td>
                  <td class="text-center">Yes</td>
                </tr>
                <tr class="border-t">
                  <td class="px-4 py-3">Priority Support</td>
                  <td class="text-center">No</td>
                  <td class="text-center">No</td>
                  <td class="text-center">Yes</td>
                  <td class="text-center">Dedicated Manager</td>
                </tr>
                <tr class="border-t">
                  <td class="px-4 py-3">Audit Logs</td>
                  <td class="text-center">No</td>
                  <td class="text-center">No</td>
                  <td class="text-center">No</td>
                  <td class="text-center">Yes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- CTA Section -->
        <div class="mt-16 text-center">
          <h3 class="text-2xl font-semibold text-gray-800 mb-2">Ready to get started?</h3>
          <p class="text-sm text-gray-600 mb-6">Join Azonation and start managing your organisation today.</p>
          <router-link
            to="/signup"
            class="inline-block bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-500 text-sm"
          >
            Create Your Account
          </router-link>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<style scoped>
</style>
