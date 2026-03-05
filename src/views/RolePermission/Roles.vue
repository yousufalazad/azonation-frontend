<script setup>
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { authStore } from '@/store/authStore'

const auth = authStore

/* ================= STATE ================= */
const roles = ref([])
const name = ref('')
const selectedRoleId = ref(null)
const isEditMode = ref(false)

/* ================= GET ROLES ================= */
const getRoles = async () => {
    roles.value = await auth.fetchProtectedApi('/api/roles')
}

/* ================= CREATE / UPDATE ================= */
const submitForm = async () => {
    if (!name.value.trim()) {
        Swal.fire('Error', 'Role name is required', 'error')
        return
    }

    const payload = { name: name.value }
    const apiUrl = isEditMode.value
        ? `/api/roles/${selectedRoleId.value}`
        : '/api/roles'
    const method = isEditMode.value ? 'PUT' : 'POST'

    const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to ${isEditMode.value ? 'update' : 'create'} this role?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, save it!'
    })

    if (result.isConfirmed) {
        try {
            const res = await auth.fetchProtectedApi(apiUrl, payload, method)
            Swal.fire('Success!', res.message || 'Saved successfully', 'success')
            getRoles()
            resetForm()
        } catch (e) {
            console.log(e)
            Swal.fire('Error', 'Operation failed', 'error')
        }
    }
}

/* ================= EDIT ================= */
const editRole = (r) => {
    selectedRoleId.value = r.id
    name.value = r.name
    isEditMode.value = true
}

/* ================= DELETE ================= */
const deleteRole = async (id) => {
    const result = await Swal.fire({
        title: 'Delete Role?',
        text: 'This may affect users assigned to this role!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete!'
    })

    if (result.isConfirmed) {
        try {
            await auth.fetchProtectedApi(`/api/roles/${id}`, {}, 'DELETE')
            Swal.fire('Deleted!', 'Role removed.', 'success')
            getRoles()
        } catch (e) {
            console.log(e)
            Swal.fire('Error', 'Delete failed', 'error')
        }
    }
}

/* ================= RESET FORM ================= */
const resetForm = () => {
    selectedRoleId.value = null
    name.value = ''
    isEditMode.value = false
}

/* ================= ON MOUNT ================= */
onMounted(getRoles)
</script>

<template>
    <div class="p-6 bg-white rounded-2xl shadow-md max-w-3xl mx-auto">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">Role Management</h2>

        <!-- FORM -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
            <input v-model="name" placeholder="Role Name"
                class="border rounded-lg px-4 py-2 w-full sm:w-64 focus:ring-2 focus:ring-indigo-500">
            <button @click="submitForm"
                class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg transition duration-200">
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
                        <th class="p-3 text-left text-gray-700">Role Name</th>
                        <th class="p-3 text-right text-gray-700">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="r in roles" :key="r.id" class="border-t hover:bg-gray-50">
                        <td class="p-3">{{ r.name }}</td>
                        <td class="p-3 text-right space-x-2">
                            <button @click="editRole(r)"
                                class="px-3 py-1 bg-yellow-400 rounded hover:bg-yellow-500 transition">Edit</button>
                            <button @click="deleteRole(r.id)"
                                class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition">Delete</button>
                        </td>
                    </tr>
                    <tr v-if="roles.length === 0">
                        <td colspan="2" class="p-3 text-center text-gray-500">No roles found.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>