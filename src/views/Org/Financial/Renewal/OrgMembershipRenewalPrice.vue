<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../../store/authStore';

const auth = authStore;

// State
const renewalPrices = ref([]);
const showModal = ref(false);
const isEditMode = ref(false);
const selectedId = ref(null);

// Dropdown lists
const orgMembershipTypes = ref([]);
const orgMemRenewalCycles = ref([]);
const memberRenewalCycles = ref([]);

// Form fields
const form = ref({
  org_membership_type_id: '',
  org_mem_renewal_cycle_id: '',
  member_renewal_cycle_id: '',
  currency: '',
  unit_amount_minor: '',
  is_recurring: false,
  valid_from: '',
  valid_to: '',
  org_notes: '',
  is_active: true,
  sort_order: 0,
});

// Fetch data
const fetchRenewalPrices = async () => {
  const res = await auth.fetchProtectedApi('/api/org-membership-renewal-prices', {}, 'GET');
  if (res.status) renewalPrices.value = res.data;
};

const fetchDropdowns = async () => {
  const [types, orgCycles, memberCycles] = await Promise.all([
    auth.fetchProtectedApi('/api/org-membership-types', {}, 'GET'),
    auth.fetchProtectedApi('/api/org-membership-renewal-cycles', {}, 'GET'),
    auth.fetchProtectedApi('/api/membership-renewal-cycles', {}, 'GET')
  ]);
  if (types.status) orgMembershipTypes.value = types.data;
  if (orgCycles.status) orgMemRenewalCycles.value = orgCycles.data;
  if (memberCycles.status) memberRenewalCycles.value = memberCycles.data;
};

onMounted(() => {
  fetchRenewalPrices();
  fetchDropdowns();
});

// Open modal
const openModal = (price = null) => {
  if (price) {
    isEditMode.value = true;
    selectedId.value = price.id;
    form.value = { ...price };
  } else {
    isEditMode.value = false;
    selectedId.value = null;
    form.value = {
      org_membership_type_id: '',
      org_mem_renewal_cycle_id: '',
      member_renewal_cycle_id: '',
      currency: '',
      unit_amount_minor: '',
      is_recurring: false,
      valid_from: '',
      valid_to: '',
      org_notes: '',
      is_active: true,
      sort_order: 0,
    };
  }
  showModal.value = true;
};

// Submit form
const submitForm = async () => {
  try {
    const url = isEditMode.value
      ? `/api/org-membership-renewal-prices/${selectedId.value}`
      : '/api/org-membership-renewal-prices';

    const method = isEditMode.value ? 'PUT' : 'POST';
    const res = await auth.fetchProtectedApi(url, form.value, method);

    if (res.status) {
      Swal.fire('Success', res.message, 'success');
      showModal.value = false;
      fetchRenewalPrices();
    } else {
      Swal.fire('Error', res.message, 'error');
    }
  } catch (error) {
    Swal.fire('Error', 'An error occurred. Please try again.', 'error');
  }
};

// Delete
const deleteRenewalPrice = async (id) => {
  Swal.fire({
    title: 'Are you sure?',
    text: 'This action cannot be undone!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then(async (result) => {
    if (result.isConfirmed) {
      const res = await auth.fetchProtectedApi(`/api/org-membership-renewal-prices/${id}`, {}, 'DELETE');
      if (res.status) {
        Swal.fire('Deleted!', res.message, 'success');
        fetchRenewalPrices();
      } else {
        Swal.fire('Error', res.message, 'error');
      }
    }
  });
};
</script>

<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Org Membership Renewal Prices</h2>
      <button @click="openModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg">Add</button>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-2 border">Org Membership Type</th>
            <th class="p-2 border">Currency</th>
            <th class="p-2 border">Amount</th>
            <th class="p-2 border">Recurring</th>
            <th class="p-2 border">Valid From</th>
            <th class="p-2 border">Valid To</th>
            <th class="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="price in renewalPrices" :key="price.id" class="border-b">
            <td class="p-2 border">{{ price.org_membership_type_id }}</td>
            <td class="p-2 border">{{ price.currency }}</td>
            <td class="p-2 border">{{ price.unit_amount_minor }}</td>
            <td class="p-2 border">{{ price.is_recurring ? 'Yes' : 'No' }}</td>
            <td class="p-2 border">{{ price.valid_from }}</td>
            <td class="p-2 border">{{ price.valid_to }}</td>
            <td class="p-2 border">
              <button @click="openModal(price)" class="text-blue-600 mr-2">Edit</button>
              <button @click="deleteRenewalPrice(price.id)" class="text-red-600">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal"  class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg w-3/4 max-h-[90vh] overflow-y-auto p-6">
        <h3 class="text-lg font-bold mb-4">{{ isEditMode ? 'Edit' : 'Add' }} Renewal Price</h3>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium">Org Membership Type</label>
            <select v-model="form.org_membership_type_id" class="w-full border rounded p-2">
              <option value="">Select</option>
              <option v-for="item in orgMembershipTypes" :key="item.id" :value="item.id">{{ item.membership_type.name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium">Org Membership Renewal Cycle</label>
            <select v-model="form.org_mem_renewal_cycle_id" class="w-full border rounded p-2">
              <option value="">Select</option>
              <option v-for="item in orgMemRenewalCycles" :key="item.id" :value="item.id">{{ item.member_renewal_cycle.name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium">Member Renewal Cycle</label>
            <select v-model="form.member_renewal_cycle_id" class="w-full border rounded p-2">
              <option value="">Select</option>
              <option v-for="item in memberRenewalCycles" :key="item.id" :value="item.id">{{ item.name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium">Currency</label>
            <input v-model="form.currency" type="text" class="w-full border rounded p-2" />
          </div>

          <div>
            <label class="block text-sm font-medium">Unit Amount Minor</label>
            <input v-model="form.unit_amount_minor" type="number" class="w-full border rounded p-2" />
          </div>

          <div>
            <label class="block text-sm font-medium">Recurring</label>
            <input type="checkbox" v-model="form.is_recurring" />
          </div>

          <div>
            <label class="block text-sm font-medium">Valid From</label>
            <input v-model="form.valid_from" type="date" class="w-full border rounded p-2" />
          </div>

          <div>
            <label class="block text-sm font-medium">Valid To</label>
            <input v-model="form.valid_to" type="date" class="w-full border rounded p-2" />
          </div>

          <div class="col-span-2">
            <label class="block text-sm font-medium">Notes</label>
            <textarea v-model="form.org_notes" class="w-full border rounded p-2"></textarea>
          </div>
        </div>

        <div class="flex justify-center mt-4">
          <button @click="submitForm" class="bg-green-600 text-white px-4 py-2 rounded-lg">
            {{ isEditMode ? 'Update' : 'Save' }}
          </button>
          <button @click="showModal = false" class="ml-2 bg-gray-400 text-white px-4 py-2 rounded-lg">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>
