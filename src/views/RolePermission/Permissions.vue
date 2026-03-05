<script setup>
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { authStore } from '@/store/authStore'

const auth = authStore

/* ================= STATE ================= */
const permissions = ref([])
const name = ref('')
const selectedPermissionId = ref(null)
const isEditMode = ref(false)

/* ================= GET PERMISSIONS ================= */
const getPermissions = async () => {
    permissions.value = await auth.fetchProtectedApi('/api/permissions')
}

/* ================= CREATE / UPDATE ================= */
const submitForm = async () => {
    if (!name.value.trim()) {
        Swal.fire('Error', 'Permission name is required', 'error')
        return
    }

    const payload = { name: name.value }

    const apiUrl = isEditMode.value
        ? `/api/permissions/${selectedPermissionId.value}`
        : '/api/permissions'

    const method = isEditMode.value ? 'PUT' : 'POST'

    const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to ${isEditMode.value ? 'update' : 'create'} this permission?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, save it!'
    })

    if (result.isConfirmed) {
        try {
            const res = await auth.fetchProtectedApi(apiUrl, payload, method)
            Swal.fire('Success!', res.message || 'Saved successfully', 'success')
            getPermissions()
            resetForm()
        } catch (e) {
            console.log(e)
            Swal.fire('Error', 'Operation failed', 'error')
        }
    }
}

/* ================= EDIT ================= */
const editPermission = (p) => {
    selectedPermissionId.value = p.id
    name.value = p.name
    isEditMode.value = true
}

/* ================= DELETE ================= */
const deletePermission = async (id) => {
    const result = await Swal.fire({
        title: 'Delete Permission?',
        text: 'This may affect roles using it!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete!'
    })

    if (result.isConfirmed) {
        try {
            await auth.fetchProtectedApi(`/api/permissions/${id}`, {}, 'DELETE')
            Swal.fire('Deleted!', 'Permission removed.', 'success')
            getPermissions()
        } catch (e) {
            console.log(e)
            Swal.fire('Error', 'Delete failed', 'error')
        }
    }
}

/* ================= RESET FORM ================= */
const resetForm = () => {
    selectedPermissionId.value = null
    name.value = ''
    isEditMode.value = false
}

/* ================= ON MOUNT ================= */
onMounted(getPermissions)
</script>

<template>
    <div class="p-6 bg-white rounded-2xl shadow-md max-w-3xl mx-auto">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">Permission Management</h2>

        <!-- FORM -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
            <input v-model="name" placeholder="Permission Name"
                class="border rounded-lg px-4 py-2 w-full sm:w-64 focus:ring-2 focus:ring-blue-500">
            <button @click="submitForm"
                class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition duration-200">
                {{ isEditMode ? 'Update' : 'Create' }}
            </button>
            <button v-if="isEditMode" @click="resetForm"
                class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition duration-200">
                Cancel
            </button>
        </div>

        <!-- TABLE -->
        <div class="overflow-x-auto">
            <table class="min-w-full border rounded-lg">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="p-3 text-left text-gray-700">Permission Name</th>
                        <th class="p-3 text-right text-gray-700">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="p in permissions" :key="p.id" class="border-t hover:bg-gray-50">
                        <td class="p-3">{{ p.name }}</td>
                        <td class="p-3 text-right space-x-2">
                            <button @click="editPermission(p)"
                                class="px-3 py-1 bg-yellow-400 rounded hover:bg-yellow-500 transition">Edit</button>
                            <button @click="deletePermission(p.id)"
                                class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition">Delete</button>
                        </td>
                    </tr>
                    <tr v-if="permissions.length === 0">
                        <td colspan="2" class="p-3 text-center text-gray-500">No permissions found.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
