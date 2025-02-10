<!-- Every Day Member Count Index.vue -->
<script setup>
import { onMounted, ref } from 'vue';
import { authStore } from '../../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;
const everyDayMemberCountList = ref([]);

const getRecords = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/every-day-member-count-list`, {}, 'GET');
    console.log(response.data);

    everyDayMemberCountList.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching events:', error);
  }
};

// Delete a meeting
const deleteRecord = async (id) => {
  try {
    const confirmed = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (confirmed.isConfirmed) {
      const response = await auth.fetchProtectedApi(`/api/delete-every-day-member-count/${id}`, {}, 'DELETE');
      if (response.status) {
        everyDayMemberCountList.value = everyDayMemberCountList.value.filter(record => record.id !== id);
        Swal.fire('Deleted!', 'Billing has been deleted.', 'success');
      } else {
        Swal.fire('Error!', 'Failed to delete meeting.', 'error');
      }
    }
  } catch (error) {
    Swal.fire('Error!', 'Failed to delete meeting.', 'error');
  }
};

onMounted(() => getRecords());
</script>

<template>
  <div class="max-w-7xl mx-auto w-10/12">
    <section>
      <div class="flex justify-between left-color-shade py-2 my-3">
        <h5 class="text-md font-semibold mt-2">Every Day Member Count List</h5>
        <div>
          <button @click="$router.push({ name: 'super-admin-every-day-member-count-create' })"
            class="bg-blue-500 text-white font-semibold py-2 px-2 mx-3 rounded-md">
            Add Every Day Member Count
          </button>
        </div>
      </div>
      <!-- Table container inside the card body -->
      <div v-if="everyDayMemberCountList.length" class="p-4">
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border border-gray-200">
            <thead class="bg-gray-50">
              <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th class="py-2 px-4 border">Sl</th>
                <th class="py-2 px-4 border">Date</th>
                <th class="py-2 px-4 border">Day Total Member</th>
                <th class="py-2 px-4 border">Day Total Bill</th>
                <th class="py-2 px-4 border">Active</th>
                <th class="border px-1 py-3 text-left" style="width:300px">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="(data, index) in everyDayMemberCountList" :key="data.id">
                <td class="py-2 px-4 border">{{ index + 1 }}</td>
                <td class="py-2 px-4 border">{{ data.date }}</td>
                <td class="py-2 px-4 border">{{ data.day_total_member }}</td>
                <td class="py-2 px-4 border">{{ data.day_total_bill }}</td>

                <td class="py-2 px-4 border">{{ data.is_active }}</td>

                <td class="py-2 px-4 border">
                  <button @click="$router.push({ name: 'super-admin-every-day-member-count-edit', params: { id: data.id } })"
                    class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 m-2 rounded">Edit</button>
                  <button @click="$router.push({ name: 'super-admin-every-day-member-count-view', params: { id: data.id } })"
                    class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 m-2 rounded">View</button>
                  <button @click="deleteRecord(data.id)"
                    class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="p-4">
        <p class="text-center text-gray-500">No Every Day Member Count available. Click "Create Every Day Member Count" to add a new one.</p>
      </div>
    </section>
  </div>
</template>
<style scoped>
table {
  border-collapse: collapse;
  width: 100%;
}

th,
td {
  padding: 5px;
  text-align: left;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
}

td {
  border-bottom: 1px solid #ddd;
}

button {
  margin-right: 5px;
}
</style>