<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold">Org Membership Renewals</h2>
      <button
        @click="openModal()"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
      >
        Add Renewal
      </button>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full border border-gray-200 divide-y divide-gray-200">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-2 text-left text-sm font-semibold">ID</th>
            <th class="px-4 py-2 text-left text-sm font-semibold">Individual</th>
            <th class="px-4 py-2 text-left text-sm font-semibold">Renewal Cycle</th>
            <th class="px-4 py-2 text-left text-sm font-semibold">Period</th>
            <th class="px-4 py-2 text-left text-sm font-semibold">Amount Paid</th>
            <th class="px-4 py-2 text-left text-sm font-semibold">Status</th>
            <th class="px-4 py-2 text-left text-sm font-semibold">Initiated By</th>
            <th class="px-4 py-2 text-left text-sm font-semibold">Initiated Source</th>
            <th class="px-4 py-2 text-left text-sm font-semibold">Attempts</th>
            <th class="px-4 py-2 text-left text-sm font-semibold">Last Attempt</th>
            <th class="px-4 py-2 text-left text-sm font-semibold">Renewed At</th>
            <th class="px-4 py-2 text-left text-sm font-semibold">Invoice ID</th>
            <th class="px-4 py-2 text-left text-sm font-semibold">Payment ID</th>
            <th class="px-4 py-2 text-left text-sm font-semibold">Failure Code</th>
            <th class="px-4 py-2 text-left text-sm font-semibold">Failure Message</th>
            <th class="px-4 py-2 text-left text-sm font-semibold">Org Notes</th>
            <th class="px-4 py-2 text-left text-sm font-semibold">Idempotency Key</th>
            <th class="px-4 py-2 text-left text-sm font-semibold">Active</th>
            <th class="px-4 py-2 text-left text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="renewal in renewals" :key="renewal.id" class="border-b">
            <td class="px-4 py-2">{{ renewal.id }}</td>
            <td class="px-4 py-2">{{ renewal.individual_type_user_id }}</td>
            <td class="px-4 py-2">{{ renewal.membership_renewal_cycle_id }}</td>
            <td class="px-4 py-2">{{ renewal.period_start }} - {{ renewal.period_end }}</td>
            <td class="px-4 py-2">{{ renewal.amount_paid }}</td>
            <td class="px-4 py-2">{{ renewal.status }}</td>
            <td class="px-4 py-2">{{ renewal.initiated_by }}</td>
            <td class="px-4 py-2">{{ renewal.initiated_source }}</td>
            <td class="px-4 py-2">{{ renewal.attempt_count }}</td>
            <td class="px-4 py-2">{{ renewal.last_attempt_at }}</td>
            <td class="px-4 py-2">{{ renewal.renewed_at }}</td>
            <td class="px-4 py-2">{{ renewal.invoice_id }}</td>
            <td class="px-4 py-2">{{ renewal.payment_id }}</td>
            <td class="px-4 py-2">{{ renewal.failure_code }}</td>
            <td class="px-4 py-2">{{ renewal.failure_message }}</td>
            <td class="px-4 py-2">{{ renewal.org_notes }}</td>
            <td class="px-4 py-2">{{ renewal.idempotency_key }}</td>
            <td class="px-4 py-2">{{ renewal.is_active == 1 ? 'Active' : 'Inactive' }}</td>
            <td class="px-4 py-2">
              <button @click="editRenewal(renewal)" class="text-blue-500 hover:underline mr-2">Edit</button>
              <button @click="deleteRenewal(renewal.id)" class="text-red-500 hover:underline">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white w-11/12 lg:w-3/4 xl:w-2/3 p-6 rounded-2xl shadow-lg max-h-[80vh] overflow-y-auto">
        <h3 class="text-xl font-semibold mb-4">
          {{ isEditMode ? 'Edit Renewal' : 'Add Renewal' }}
        </h3>
        <form @submit.prevent="saveRenewal">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <!-- Individual Type User -->
            <div>
              <label class="block text-sm font-medium">Individual Type User</label>
              <select v-model="form.individual_type_user_id" class="w-full border rounded-lg px-3 py-2">
                <option value="">Select</option>
                 <!-- individual:id,first_name,last_name -->
                <option v-for="individual in individualTypes" :key="individual.individual_type_user_id" :value="individual.individual_type_user_id">
                  {{ individual.individual.first_name }} {{ individual.individual.last_name }}
                </option>
              </select>
            </div>

            <!-- Membership Renewal Cycle -->
            <div>
              <label class="block text-sm font-medium">Membership Renewal Cycle</label>
              <select v-model="form.membership_renewal_cycle_id" class="w-full border rounded-lg px-3 py-2">
                <option value="">Select</option>
                <option v-for="cycle in renewalCycles" :key="cycle.member_renewal_cycle_id" :value="cycle.member_renewal_cycle_id">
                  {{ cycle.member_renewal_cycle.name }}
                </option>
              </select>
            </div>

            <!-- Period Start -->
            <div>
              <label class="block text-sm font-medium">Period Start</label>
              <input type="date" v-model="form.period_start" class="w-full border rounded-lg px-3 py-2" />
            </div>

            <!-- Period End -->
            <div>
              <label class="block text-sm font-medium">Period End</label>
              <input type="date" v-model="form.period_end" class="w-full border rounded-lg px-3 py-2" />
            </div>

            <!-- Amount Paid -->
            <div>
              <label class="block text-sm font-medium">Amount Paid</label>
              <input type="number" v-model="form.amount_paid" class="w-full border rounded-lg px-3 py-2" />
            </div>            

            <!-- Initiated By -->
            <div>
              <label class="block text-sm font-medium">Initiated By</label>
              <select v-model="form.initiated_by" class="w-full border rounded-lg px-3 py-2">
                <option value="">Select</option>
                <option value="system">System</option>
                <option value="individual">Individual</option>
                <option value="organisation">Organisation</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>

            <!-- Initiated Source -->
            <div>
              <label class="block text-sm font-medium">Initiated Source</label>
              <input type="text" v-model="form.initiated_source" class="w-full border rounded-lg px-3 py-2" />
            </div>

            <!-- Attempt Count -->
            <div>
              <label class="block text-sm font-medium">Attempt Count</label>
              <input type="number" v-model="form.attempt_count" class="w-full border rounded-lg px-3 py-2" />
            </div>

            <!-- Last Attempt At -->
            <div>
              <label class="block text-sm font-medium">Last Attempt At</label>
              <input type="datetime-local" v-model="form.last_attempt_at" class="w-full border rounded-lg px-3 py-2" />
            </div>

            <!-- Renewed At -->
            <div>
              <label class="block text-sm font-medium">Renewed At</label>
              <input type="datetime-local" v-model="form.renewed_at" class="w-full border rounded-lg px-3 py-2" />
            </div>

            <!-- Invoice ID -->
            <div>
              <label class="block text-sm font-medium">Invoice ID</label>
              <input type="text" v-model="form.invoice_id" class="w-full border rounded-lg px-3 py-2" />
            </div>

            <!-- Payment ID -->
            <div>
              <label class="block text-sm font-medium">Payment ID</label>
              <input type="text" v-model="form.payment_id" class="w-full border rounded-lg px-3 py-2" />
            </div>

            <!-- Failure Code -->
            <div>
              <label class="block text-sm font-medium">Failure Code</label>
              <input type="text" v-model="form.failure_code" class="w-full border rounded-lg px-3 py-2" />
            </div>

            <!-- Failure Message -->
            <div>
              <label class="block text-sm font-medium">Failure Message</label>
              <input type="text" v-model="form.failure_message" class="w-full border rounded-lg px-3 py-2" />
            </div>

            <!-- Org Notes -->
            <div>
              <label class="block text-sm font-medium">Org Notes</label>
              <textarea v-model="form.org_notes" class="w-full border rounded-lg px-3 py-2"></textarea>
            </div>

            <!-- Idempotency Key -->
            <div>
              <label class="block text-sm font-medium">Idempotency Key</label>
              <input type="text" v-model="form.idempotency_key" class="w-full border rounded-lg px-3 py-2" />
            </div>

            <!-- Status -->
            <div>
              <label class="block text-sm font-medium">Status</label>
              <select v-model="form.status" class="w-full border rounded-lg px-3 py-2">
                <option value="">Select</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <!-- Active -->
            <div>
              <label class="block text-sm font-medium">Active</label>
              <select v-model="form.is_active" class="w-full border rounded-lg px-3 py-2">
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>

          </div>

          <div class="mt-6 flex justify-center">
            <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
              Save
            </button>
            <button type="button" @click="closeModal" class="ml-3 bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../../store/authStore';

const auth = authStore;
const renewals = ref([]);
const individualTypes = ref([]);
const renewalCycles = ref([]);

const showModal = ref(false);
const isEditMode = ref(false);
const form = ref({
  id: null,
  individual_type_user_id: '',
  membership_renewal_cycle_id: '',
  period_start: '',
  period_end: '',
  amount_paid: '',
  status: '',
  initiated_by: '',
  initiated_source: '',
  attempt_count: 0,
  last_attempt_at: '',
  renewed_at: '',
  invoice_id: '',
  payment_id: '',
  failure_code: '',
  failure_message: '',
  org_notes: '',
  idempotency_key: '',
  is_active: 1
});

const fetchRenewals = async () => {
  const res = await auth.fetchProtectedApi('/api/org-membership-renewals', {}, 'GET');
  if (res.status) renewals.value = res.data;
};

const openModal = () => {
  isEditMode.value = false;
  Object.keys(form.value).forEach(key => form.value[key] = '');
  form.value.is_active = 1;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const editRenewal = (renewal) => {
  isEditMode.value = true;
  Object.assign(form.value, renewal);
  showModal.value = true;
};

const saveRenewal = async () => {
  try {
    let response;
    if (isEditMode.value) {
      response = await auth.fetchProtectedApi(`/api/org-membership-renewals/${form.value.id}`, form.value, 'PUT');
    } else {
      response = await auth.fetchProtectedApi('/api/org-membership-renewals', form.value, 'POST');
    }
    if (response.status) {
      Swal.fire('Success', response.message, 'success');
      fetchRenewals();
      closeModal();
    } else {
      Swal.fire('Error', response.message || 'An error occurred. Please try again.', 'error');
    }
  } catch (e) {
    Swal.fire('Error', 'An error occurred. Please try again.', 'error');
  }
};

const deleteRenewal = async (id) => {
  const confirm = await Swal.fire({
    title: 'Are you sure?',
    text: 'This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!'
  });
  if (confirm.isConfirmed) {
    const res = await auth.fetchProtectedApi(`/api/org-membership-renewals/${id}`, {}, 'DELETE');
    if (res.status) {
      Swal.fire('Deleted!', res.message, 'success');
      fetchRenewals();
    } else {
      Swal.fire('Error', res.message || 'An error occurred. Please try again.', 'error');
    }
  }
};

onMounted(async () => {
  await fetchRenewals();

  // Fetch Individual Types 
  const individualRes = await auth.fetchProtectedApi('/api/org-all-member-name', {}, 'GET');
  if (individualRes.status) individualTypes.value = individualRes.data;

  // Fetch Membership Renewal Cycles
  const cycleRes = await auth.fetchProtectedApi('/api/org-membership-renewal-cycles', {}, 'GET');
  if (cycleRes.status) renewalCycles.value = cycleRes.data;
});

</script>
