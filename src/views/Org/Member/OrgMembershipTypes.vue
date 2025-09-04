<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const membershipTypes = ref([]);
const orgMembershipTypeList = ref([]);

// Fetch Membership Types (for modal list)
const fetchMembershipTypes = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/membership-types', {}, 'GET');
        membershipTypes.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching membership types:', error);
    }
};

// Fetch Org Membership Types (to check if already added)
const fetchOrgMembershipTypes = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/org-membership-types', {}, 'GET');
        orgMembershipTypeList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching organisation membership types:', error);
    }
};
// Check if the membership type already exists
const isAlreadyAdded = (membershipTypeId) => {
    return orgMembershipTypeList.value.some(item => item.membership_type_id === membershipTypeId);
};

// Get the corresponding org_membership_type.id (for PUT request)
const getOrgMembershipTypeID = (membershipTypeId) => {
    const found = orgMembershipTypeList.value.find(item => item.membership_type_id === membershipTypeId);
    return found ? found.id : null;
};

// Handle Toggle
const handleToggle = async (membershipType) => {
    const alreadyAdded = isAlreadyAdded(membershipType.id);
    const orgMembershipTypeID = getOrgMembershipTypeID(membershipType.id);
    if (!alreadyAdded) {
        const method = 'POST';
        const apiUrl = '/api/org-membership-types';

        const payload = {
            membership_type_id: membershipType.id,
            is_active: 1,
        };

        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: `Do you want to submit this membership type?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, proceed!',
                cancelButtonText: 'Cancel'
            });

            if (result.isConfirmed) {
                const response = await auth.fetchProtectedApi(apiUrl, payload, method);
                if (response.status) {
                    await Swal.fire('Success!', `Membership type added successfully.`, 'success');
                    fetchOrgMembershipTypes();
                } else {
                    Swal.fire('Failed!', 'An error occurred. Please try again.', 'error');
                }
            }
        } catch (error) {
            console.error('Error handling toggle:', error);
            Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
        }
    }
    else {
        // If already added, we need to delete it
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to remove this membership type?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            await deleteMembershipType(orgMembershipTypeID);
        }
    }

};
const deleteMembershipType = async (orgMembershipTypeID) => {
    try {
        // show processing message
        Swal.fire({
            title: 'Deleting...',
            text: 'Please wait while we remove the type.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading()
            }
        })

        const response = await auth.fetchProtectedApi(`/api/org-membership-types/${orgMembershipTypeID}`, {}, 'DELETE')

        if (response.status) {
            await fetchMembershipTypes();
            await fetchOrgMembershipTypes();
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Membership type deleted successfully.',
                timer: 1500,
                showConfirmButton: false
            })
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Failed to delete membership type.',
                timer: 2000,
                showConfirmButton: false
            })
        }
    } catch (error) {
        console.error(error)
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'An error occurred.',
            timer: 2000,
            showConfirmButton: false
        })
    }
}
// Load data on mount
onMounted(() => {
    fetchMembershipTypes();
    fetchOrgMembershipTypes();
});
</script>

<template>
    <div class="max-w-7xl mx-auto w-11/12">
        <section class="bg-white shadow-md rounded-xl border">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b gap-3">
                <h5 class="text-lg font-semibold text-gray-700">Organisation Membership Types</h5>
                <button @click="$router.push({ name: 'index-member' })"
                    class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
                    Back to Member List
                </button>
            </div>

            <!-- Existing List -->
            <div class="overflow-x-auto p-4">

                <!-- Table with Toggles -->
                <table class="min-w-full table-auto border-collapse border border-gray-200 text-sm text-left">
                    <thead class="bg-gray-100">
                        <tr class="text-gray-700">
                            <th class="border px-4 py-2">Membership Type</th>
                            <th class="border px-4 py-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="membershipType in membershipTypes" :key="membershipType.id">
                            <td class="py-2 px-4 border">{{ membershipType.name }}</td>
                            <td class="py-2 px-4 border">
                                <label class="inline-flex items-center cursor-pointer">
                                    <input type="checkbox" :checked="!isAlreadyAdded(membershipType.id)"
                                        @change="handleToggle(membershipType)" class="sr-only peer" />
                                    <div
                                        class="relative w-11 h-6 bg-green-500 rounded-full peer peer-checked:bg-gray-200">
                                        <div
                                            class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5">
                                        </div>
                                    </div>
                                    <span class="ml-2 text-sm">
                                        {{ isAlreadyAdded(membershipType.id) ? 'Active' : '' }}
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
