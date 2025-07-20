<script setup>
import Header from './Header.vue'
import Footer from './Footer.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white">
    <!-- Header -->
    <Header />

    <!-- Main Content -->
    <main class="flex-grow pt-[100px] pb-16">
      <div class="max-w-5xl mx-auto px-4">
        <h1 class="text-3xl font-bold text-gray-800 text-center mb-10">Organisation Account Overview</h1>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Organisation Basics -->
          <div>
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Organisation Basics</h2>
            <div class="space-y-6 text-sm text-gray-700 leading-relaxed">
              <div>
                <h3 class="font-semibold text-gray-800 mb-1">What is an Organisation Account?</h3>
                <p>
                  An Organisation Account allows any recognised group, association, or institution to manage their structure digitally within Azonation. It gives access to tools for managing members, activities, events, projects, and financials.
                </p>
              </div>
              <div>
                <h3 class="font-semibold text-gray-800 mb-1">Who Can Register?</h3>
                <p>
                  Any authorised representative of a legitimate organisation can register. This includes founders, board members, administrative staff, or officers with permission to manage the organisation's profile and activities.
                </p>
              </div>
              <div>
                <h3 class="font-semibold text-gray-800 mb-1">Benefits Overview</h3>
                <p>
                  With an Organisation Account, you can digitise your operations—manage memberships, communicate with members, organise meetings and events, track income and expenses, and ensure smooth governance with less paperwork.
                </p>
              </div>
            </div>
          </div>

          <!-- Features & Management -->
          <div>
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Features & Management</h2>
            <div class="space-y-6 text-sm text-gray-700 leading-relaxed">
              <div>
                <h3 class="font-semibold text-gray-800 mb-1">Manage Members</h3>
                <p>
                  Add, invite, and manage members efficiently. Assign roles (like President, Treasurer), track member activity, renewal status, and connect them to your events and projects.
                </p>
              </div>
              <div>
                <h3 class="font-semibold text-gray-800 mb-1">Events & Projects</h3>
                <p>
                  Organise meetings, seminars, campaigns, and internal projects. Schedule timelines, set responsibilities, and keep everything documented in a centralised platform.
                </p>
              </div>
              <div>
                <h3 class="font-semibold text-gray-800 mb-1">Finance & Billing</h3>
                <p>
                  Track incomes and expenses with integrated finance tools. Generate billing reports, view monthly summaries, manage subscriptions, and ensure transparency within your organisation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<style scoped>
</style>
