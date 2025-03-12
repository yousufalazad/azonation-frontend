<!-- OrgMemberList.vue -->

<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';

const memberList = ref([]);

const fetchMemberList = async () => {
  try {
    const response = await authStore.fetchProtectedApi('/api/org-all-members', {}, 'GET');
    if (response.status) {
      memberList.value = response.data;
    } else {
      memberList.value = [];
    }
  } catch (error) {
    console.error("Error fetching member list:", error);
    memberList.value = [];
  }
};

onMounted(fetchMemberList);
</script>

<template>
  <div class="p-4">
    <div class="flex justify-between mb-4 left-color-shade py-2">
      <div>
        <h5 class="text-md font-semibold mt-2">Member list</h5>
      </div>
      <div>

        <a href="/org-dashboard/add-member">
          <button class="text-md text-white font-semibold bg-gray-400 p-2 rounded mr-2">
            Full list
          </button>
        </a>

        <a href="/org-dashboard/add-member">
          <button class="text-md text-white font-semibold bg-gray-400 p-2 rounded mx-2">
            Print
          </button>
        </a>

        <a href="/org-dashboard/add-member">
          <button class="text-md text-white font-semibold bg-gray-400 p-2 rounded mx-2">
            PDF
          </button>
        </a>

        <a href="/org-dashboard/add-member">
          <button class="text-md text-white font-semibold bg-gray-400 p-2 rounded mx-2">
            Excel
          </button>
        </a>

        <a href="/org-dashboard/add-member">
          <button class="text-md text-white font-semibold bg-gray-400 p-2 rounded mx-2">
            Settings
          </button>
        </a>
        <a href="/org-dashboard/add-member">
          <button class="text-md text-white font-semibold bg-gray-400 p-2 rounded mx-2">
            Past members
          </button>
        </a>
        <a href="/org-dashboard/add-member">
          <button class="text-md text-white font-semibold bg-blue-600 p-2 rounded mx-2">
            + Add member
          </button>
        </a>
      </div>
    </div>
    <div v-if="memberList.length" class="bg-white">
      <table class="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            <th class="border px-4 py-2">Sl</th>
            <th class="border px-4 py-2">ID Number</th>
            <!-- <th class="border px-4 py-2">Photo</th> -->
            <th class="border px-4 py-2">Name</th>
            <th class="border px-4 py-2">Email</th>
            <th class="border px-4 py-2">Azon ID</th>
            <th class="border px-4 py-2">Individual ID</th>
            <th class="border px-4 py-2">Joining Date</th>
            <th class="border px-4 py-2">Membership Type</th>
            <th class="border px-4 py-2">End Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in memberList" :key="member.id" class="hover:bg-gray-50">
            <td class="border px-4 py-2">{{ member.id }}</td>
            <td class="border px-4 py-2">{{ member.existing_org_membership_id }}</td>
            <!-- <td class="border px-4 py-2">{{ member.memberProfileImage.image_path }}</td>  -->
            <td class="border px-4 py-2">{{ member.individual.name }}</td>
            <td class="border px-4 py-2">{{ member.individual.email }}</td>
            <td class="border px-4 py-2">{{ member.individual.azon_id }}</td>
            <td class="border px-4 py-2">{{ member.individual.id }}</td>
            <td class="border px-4 py-2">{{ member.joining_date }}</td>
            <td class="border px-4 py-2">{{ member.membership_type.name }}</td>
            <td class="border px-4 py-2">{{ member.end_date }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Spacing -->
    <div class="my-8"></div>

    <div class="flex justify-between mb-4 left-color-shade py-2">
      <div>
        <h5 class="text-md font-semibold mt-2">Past member list</h5>
      </div>
      <div>

<a href="/org-dashboard/add-member">
  <button class="text-md text-white font-semibold bg-gray-400 p-2 rounded mr-2">
    Print
  </button>
</a>

<a href="/org-dashboard/add-member">
  <button class="text-md text-white font-semibold bg-gray-400 p-2 rounded mx-2">
    PDF
  </button>
</a>

<a href="/org-dashboard/add-member">
  <button class="text-md text-white font-semibold bg-gray-400 p-2 rounded mx-2">
    Excel
  </button>
</a>

<a href="/org-dashboard/add-member">
  <button class="text-md text-white font-semibold bg-gray-400 p-2 rounded mx-2">
    Settings
  </button>
</a>

</div>
    </div>
    <div v-if="memberList.length" class="bg-white">
      <table class="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            <th class="border px-4 py-2">Sl</th>
            <th class="border px-4 py-2">ID Number</th>
            <!-- <th class="border px-4 py-2">Photo</th> -->
            <th class="border px-4 py-2">Name</th>
            <th class="border px-4 py-2">Email</th>
            <th class="border px-4 py-2">Azon ID</th>
            <th class="border px-4 py-2">Individual ID</th>
            <th class="border px-4 py-2">Joining Date</th>
            <th class="border px-4 py-2">Membership Type</th>
            <th class="border px-4 py-2">End Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in memberList" :key="member.id" class="hover:bg-gray-50">
            <td class="border px-4 py-2">{{ member.id }}</td>
            <td class="border px-4 py-2">{{ member.existing_org_membership_id }}</td>
            <!-- <td class="border px-4 py-2">{{ member.memberProfileImage.image_path }}</td> -->
            <td class="border px-4 py-2">{{ member.individual.name }}</td>
            <td class="border px-4 py-2">{{ member.individual.email }}</td>
            <td class="border px-4 py-2">{{ member.individual.azon_id }}</td>
            <td class="border px-4 py-2">{{ member.individual.id }}</td>
            <td class="border px-4 py-2">{{ member.joining_date }}</td>
            <td class="border px-4 py-2">{{ member.membership_type.name }}</td>
            <td class="border px-4 py-2">{{ member.end_date }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <p>No members found</p>
    </div>
  </div>
</template>

<style scoped></style>
