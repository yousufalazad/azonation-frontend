<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../../store/authStore';

const auth = authStore;
const renewalCycles = ref([]); // Available membership renewal cycles
const orgRenewalCycleList = ref([]); // Organisation-specific renewal cycles

// Fetch available membership renewal cycles
const fetchRenewalCycles = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/membership-renewal-cycles', {}, 'GET');
        renewalCycles.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching renewal cycles:', error);
    }
};

// Fetch Org Membership Renewal Cycles
const fetchOrgRenewalCycles = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/org-membership-renewal-cycles', {}, 'GET');
        orgRenewalCycleList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching organisation renewal cycles:', error);
    }
};

// Check if already added
const isAlreadyAdded = (renewalCycleId) => {
    return orgRenewalCycleList.value.some(item => item.member_renewal_cycle_id === renewalCycleId);
};

// Get Org Renewal Cycle ID
const getOrgRenewalCycleID = (renewalCycleId) => {
    const found = orgRenewalCycleList.value.find(item => item.member_renewal_cycle_id === renewalCycleId);
    return found ? found.id : null;
};

// Handle Toggle
const handleToggle = async (cycle) => {
    const alreadyAdded = isAlreadyAdded(cycle.id);
    const orgRenewalCycleID = getOrgRenewalCycleID(cycle.id);

    if (!alreadyAdded) {
        const method = 'POST';
        const apiUrl = '/api/org-membership-renewal-cycles';

        const payload = {
            member_renewal_cycle_id: cycle.id,
            is_active: 1
        };

        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: `Do you want to add this renewal cycle?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, proceed!',
                cancelButtonText: 'Cancel'
            });

            if (result.isConfirmed) {
                const response = await auth.fetchProtectedApi(apiUrl, payload, method);
                if (response.status) {
                    await Swal.fire('Success!', `Renewal cycle added successfully.`, 'success');
                    fetchOrgRenewalCycles();
                } else {
                    Swal.fire('Failed!', 'An error occurred. Please try again.', 'error');
                }
            }
        } catch (error) {
            console.error('Error handling toggle:', error);
            Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
        }
    } else {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to remove this renewal cycle?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            await deleteRenewalCycle(orgRenewalCycleID);
        }
    }
};

// Delete Org Renewal Cycle
const deleteRenewalCycle = async (orgRenewalCycleID) => {
    try {
        Swal.fire({
            title: 'Deleting...',
            text: 'Please wait while we remove the renewal cycle.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading()
            }
        });

        const response = await auth.fetchProtectedApi(`/api/org-membership-renewal-cycles/${orgRenewalCycleID}`, {}, 'DELETE');

        if (response.status) {
            await fetchRenewalCycles();
            await fetchOrgRenewalCycles();
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Renewal cycle deleted successfully.',
                timer: 1500,
                showConfirmButton: false
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Failed to delete renewal cycle.',
                timer: 2000,
                showConfirmButton: false
            });
        }
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'An error occurred.',
            timer: 2000,
            showConfirmButton: false
        });
    }
};

// Load data on mount
onMounted(() => {
    fetchRenewalCycles();
    fetchOrgRenewalCycles();
});
</script>

<template>
    <div class="max-w-7xl mx-auto w-11/12">
        <section class="bg-white shadow-md rounded-xl border">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b gap-3">
                <h5 class="text-lg font-semibold text-gray-700">Organisation Membership Renewal Cycles</h5>
            </div>

            <div class="overflow-x-auto p-4">
                <table class="min-w-full table-auto border-collapse border border-gray-200 text-sm text-left">
                    <thead class="bg-gray-100">
                        <tr class="text-gray-700">
                            <th class="border px-4 py-2">Renewal Cycle</th>
                            <th class="border px-4 py-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="cycle in renewalCycles" :key="cycle.id">
                            <td class="py-2 px-4 border">{{ cycle.name }} ({{ cycle.duration_in_months }} months)</td>
                            <td class="py-2 px-4 border">
                                <label class="inline-flex items-center cursor-pointer">
                                    <input type="checkbox" :checked="!isAlreadyAdded(cycle.id)"
                                        @change="handleToggle(cycle)" class="sr-only peer" />
                                    <div class="relative w-11 h-6 bg-green-500 rounded-full peer peer-checked:bg-gray-200">
                                        <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
                                    </div>
                                    <span class="ml-2 text-sm">
                                        {{ isAlreadyAdded(cycle.id) ? 'Active' : '' }}
                                    </span>
                                </label>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</template>