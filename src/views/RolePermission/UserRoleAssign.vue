<script setup>
import { ref, onMounted, computed, reactive, watch } from 'vue'
import Swal from 'sweetalert2'
import { authStore } from '@/store/authStore'

const auth = authStore

/* ================= TABS ================= */
const activeTab = ref('permissions')
const setTab = (tab) => activeTab.value = tab

/* ================= PERMISSIONS STATE ================= */
const permissions = ref([])
const permName = ref('')
const permId = ref(null)
const permEditMode = ref(false)

/* ================= ROLES STATE ================= */
const roles = ref([])
const roleName = ref('')
const roleId = ref(null)
const org_type_user_name = ref('')
const org_type_user_id = ref(null)
const roleEditMode = ref(false)

/* ================= ASSIGN PERMISSIONS STATE ================= */
const selectedRoleId = ref(null)
const selectedPermissions = ref([])

/* ================= USERS & ASSIGN ROLES STATE ================= */
const users = ref([])
const organisation_users = ref([])

const selectedUserId = ref(null)
const selectedUserRoles = ref([])

/* ================= GET DATA ================= */
const getPermissions = async () => permissions.value = await auth.fetchProtectedApi('/api/permissions')
const getRoles = async () => roles.value = await auth.fetchProtectedApi('/api/roles')
const getUsers = async () => users.value = await auth.fetchProtectedApi('/api/users?type=individual')  	

const getOrganisationUsers = async () => organisation_users.value = await auth.fetchProtectedApi('/api/users?type=organisation')

const getAllData = async () => {
    await getPermissions()
    await getRoles()
    await getUsers()
    await getOrganisationUsers()
}

/* ================= ON MOUNT ================= */
onMounted(getAllData)

/* ================= PERMISSION FUNCTIONS ================= */
const resetPermForm = () => { permId.value = null; permName.value = ''; permEditMode.value = false }
const editPermission = (p) => { permId.value = p.id; permName.value = p.name; permEditMode.value = true }

const savePermission = async () => {
    if (!permName.value.trim()) return Swal.fire('Error', 'Permission name required', 'error')
    const payload = { name: permName.value }
    const apiUrl = permEditMode.value ? `/api/permissions/${permId.value}` : '/api/permissions'
    const method = permEditMode.value ? 'PUT' : 'POST'

    const res = await Swal.fire({
        title: 'Confirm?',
        text: `Do you want to ${permEditMode.value ? 'update' : 'create'} this permission?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, save!'
    })
    if (res.isConfirmed) {
        try {
            const r = await auth.fetchProtectedApi(apiUrl, payload, method)
            Swal.fire('Success', r.message || 'Saved', 'success')
            resetPermForm()
            getPermissions()
        } catch (e) { console.log(e); Swal.fire('Error', 'Failed', 'error') }
    }
}

const deletePermission = async (id) => {
    const res = await Swal.fire({
        title: 'Delete Permission?',
        text: 'This may affect roles using it!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete!'
    })
    if (res.isConfirmed) {
        try {
            await auth.fetchProtectedApi(`/api/permissions/${id}`, {}, 'DELETE')
            Swal.fire('Deleted', 'Permission removed', 'success')
            getPermissions()
        } catch (e) { console.log(e); Swal.fire('Error', 'Delete failed', 'error') }
    }
}

/* ================= ROLE FUNCTIONS ================= */
const resetRoleForm = () => { roleId.value = null; roleName.value = ''; org_type_user_id.value = null; org_type_user_name.value = ''; org_type_user_name.value = ''; roleEditMode.value = false }
const editRole = (r) => { roleId.value = r.id; roleName.value = r.name; org_type_user_id.value = r.org_type_user_id; org_type_user_name.value = r.org_type_user_name; roleEditMode.value = true }

const saveRole = async () => {
    if (!roleName.value.trim()) return Swal.fire('Error', 'Role name required', 'error')
    const payload = { name: roleName.value, org_type_user_id: org_type_user_id.value }
    const apiUrl = roleEditMode.value ? `/api/roles/${roleId.value}` : '/api/roles'
    const method = roleEditMode.value ? 'PUT' : 'POST'

    const res = await Swal.fire({
        title: 'Confirm?',
        text: `Do you want to ${roleEditMode.value ? 'update' : 'create'} this role?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, save!'
    })
    if (res.isConfirmed) {
        try {
            const r = await auth.fetchProtectedApi(apiUrl, payload, method)
            Swal.fire('Success', r.message || 'Saved', 'success')
            resetRoleForm()
            getRoles()
        } catch (e) { console.log(e); Swal.fire('Error', 'Failed', 'error') }
    }
}

const deleteRole = async (id) => {
    const res = await Swal.fire({
        title: 'Delete Role?',
        text: 'This may affect users assigned to this role!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete!'
    })
    if (res.isConfirmed) {
        try {
            await auth.fetchProtectedApi(`/api/roles/${id}`, {}, 'DELETE')
            Swal.fire('Deleted', 'Role removed', 'success')
            getRoles()
        } catch (e) { console.log(e); Swal.fire('Error', 'Delete failed', 'error') }
    }
}

/* ================= ASSIGN PERMISSIONS TO ROLE ================= */
const permissionParents = computed(() => {
    const parentMap = {}
    permissions.value.forEach(p => {
        const parts = p.name.split('.')
        const parent = parts[0]
        const child = parts[1] || null
        if (!parentMap[parent]) parentMap[parent] = { name: parent, children: [] }
        if (child) parentMap[parent].children.push(child)
    })
    return Object.values(parentMap)
})

const toggleChildren = (parent) => {
    const parentChecked = selectedPermissions.value.includes(parent.name)
    parent.children.forEach(child => {
        const childFull = `${parent.name}.${child}`
        if (parentChecked && !selectedPermissions.value.includes(childFull)) {
            selectedPermissions.value.push(childFull)
        } else if (!parentChecked) {
            selectedPermissions.value = selectedPermissions.value.filter(v => v !== childFull)
        }
    })
}
const editRolePermissions = (role) => {
    selectedRoleId.value = role.id
    selectedPermissions.value = role.permissions?.map(p => p.name) || []
}

const saveAssign = async () => {
    if (!selectedRoleId.value) return
    const res = await Swal.fire({
        title: 'Confirm?',
        text: 'Update permissions for this role?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, save!'
    })
    if (res.isConfirmed) {
        try {
            const payload = { permissions: selectedPermissions.value }
            const r = await auth.fetchProtectedApi(`/api/roles/${selectedRoleId.value}/permissions`, payload, 'PUT')
            Swal.fire('Success', r.message || 'Permissions updated', 'success')
            selectedRoleId.value = null
            selectedPermissions.value = []
            getAllData()
        } catch (e) { console.log(e); Swal.fire('Error', 'Failed', 'error') }
    }
}

/* ================= ASSIGN ROLES TO USER ================= */
const editUserRoles = (user) => {
    selectedUserId.value = user.id
    selectedUserRoles.value = user.roles?.map(r => r.name) || []
}

const saveUserRoles = async () => {
    if (!selectedUserId.value) return Swal.fire('Error', 'Select a user', 'error')

    const res = await Swal.fire({
        title: 'Confirm?',
        text: 'Do you want to assign selected roles to this user?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, assign!'
    })

    if (res.isConfirmed) {
        try {
            const payload = { roles: selectedUserRoles.value }
            const r = await auth.fetchProtectedApi(`/api/users/${selectedUserId.value}/roles`, payload, 'PUT')
            Swal.fire('Success', r.message || 'Roles assigned', 'success')

            selectedUserId.value = null
            selectedUserRoles.value = []
            getUsers()
        } catch (e) {
            console.log(e)
            Swal.fire('Error', 'Failed to assign roles', 'error')
        }
    }
}

/* ================= USER FILTER ================= */
const userSearch = ref('')

const filteredUsers = computed(() => {
    if (!userSearch.value.trim()) return users.value
    return users.value.filter(u =>
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(userSearch.value.toLowerCase())
    )
})

watch(selectedUserId, (newUserId) => {
    if (!newUserId) {
        selectedUserRoles.value = []
        return
    }

    const user = users.value.find(u => u.id === newUserId)

    selectedUserRoles.value = user?.roles
        ? user.roles.map(r => r.name)
        : []
})

const filteredOrganisationUsers = computed(() => {
    if (!userSearch.value.trim()) return organisation_users.value
    return organisation_users.value.filter(u =>
        u.org_name.toLowerCase().includes(userSearch.value.toLowerCase())
    )
})


</script>

<template>
    <div class="p-6 bg-white rounded-2xl shadow-md max-w-5xl mx-auto">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">Role & Permission Dashboard</h2>

        <!-- TABS -->
        <div class="flex gap-3 mb-6 border-b">
            <button :class="{ 'border-b-2 border-blue-600 text-blue-600': activeTab === 'permissions' }"
                @click="setTab('permissions')" class="py-2 px-4 font-semibold transition">Permissions</button>
            <button :class="{ 'border-b-2 border-blue-600 text-blue-600': activeTab === 'roles' }"
                @click="setTab('roles')" class="py-2 px-4 font-semibold transition">Roles</button>
            <button :class="{ 'border-b-2 border-blue-600 text-blue-600': activeTab === 'assign' }"
                @click="setTab('assign')" class="py-2 px-4 font-semibold transition">Assign</button>
            <button :class="{ 'border-b-2 border-blue-600 text-blue-600': activeTab === 'userRoles' }"
                @click="setTab('userRoles')" class="py-2 px-4 font-semibold transition">User Assign Role</button>
        </div>

        <!-- PERMISSIONS TAB -->
        <div v-if="activeTab === 'permissions'" class="mt-4">
            <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <input v-model="permName" placeholder="Permission Name"
                    class="border rounded-lg px-4 py-2 w-full sm:w-64 focus:ring-2 focus:ring-blue-500">
                <button @click="savePermission"
                    class="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">
                    {{ permEditMode ? 'Update' : 'Create' }}
                </button>
                <button v-if="permEditMode" @click="resetPermForm"
                    class="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition">
                    Cancel
                </button>
            </div>

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

        <!-- ROLES TAB -->
        <div v-if="activeTab === 'roles'" class="mt-4">
            <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <input v-model="roleName" placeholder="Role Name"
                    class="border rounded-lg px-4 py-2 w-full sm:w-64 focus:ring-2 focus:ring-indigo-500">
                <div class="mb-4">
                    <input type="text" v-model="userSearch" placeholder="Search user..."
                        class="border rounded px-3 py-2 w-full max-w-sm focus:ring-2 focus:ring-blue-500 mb-2">
                    <select v-model="org_type_user_id" class="border rounded px-3 py-2 w-full max-w-sm">
                        <option value="" disabled>Select user</option>
                        <option v-for="user in filteredOrganisationUsers" :key="user.id" :value="user.id">
                            {{ user.org_name }}
                        </option>
                    </select>
                </div>
                <button @click="saveRole"
                    class="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition">
                    {{ roleEditMode ? 'Update' : 'Create' }}
                </button>
                <button v-if="roleEditMode" @click="resetRoleForm"
                    class="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition">
                    Cancel
                </button>
            </div>

            <div class="overflow-x-auto">
                <table class="min-w-full border rounded-lg">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="p-3 text-left text-gray-700">Role Name</th>
                            <th class="p-3 text-left text-gray-700">Organisation</th>
                            <th class="p-3 text-right text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="r in roles" :key="r.id" class="border-t hover:bg-gray-50">
                            <td class="p-3">{{ r.name }}</td>
                            <td class="p-3">
                                {{ filteredOrganisationUsers.find(u => u.id === r.org_type_user_id)?.org_name || 'N/A' }}
                            </td>
                            

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

        <!-- ASSIGN PERMISSIONS TAB -->
        <div v-if="activeTab === 'assign'" class="mt-4">
            <div class="mb-4">
                <label class="block mb-2 font-semibold">Select Role:</label>
                <select v-model="selectedRoleId"
                    class="border rounded px-3 py-2 w-full max-w-sm focus:ring-2 focus:ring-blue-500"
                    @change="editRolePermissions(roles.find(r => r.id === selectedRoleId))">
                    <option value="" disabled>Select role</option>
                    <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.name }}</option>
                </select>
            </div>

            <div v-if="selectedRoleId" class="overflow-x-auto">
                <table class="min-w-full border rounded-lg">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="p-3 text-left text-gray-700">Permission (Parent)</th>
                            <th class="p-3 text-center text-gray-700">Read</th>
                            <th class="p-3 text-center text-gray-700">Create</th>
                            <th class="p-3 text-center text-gray-700">Update</th>
                            <th class="p-3 text-center text-gray-700">Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="parent in permissionParents" :key="parent.name" class="border-t hover:bg-gray-50">
                            <!-- Parent Checkbox -->
                            <td class="p-3 flex items-center gap-2">
                                <input type="checkbox" :id="parent.name" :value="parent.name"
                                    v-model="selectedPermissions" @change="toggleChildren(parent)">
                                <label :for="parent.name" class="font-medium">{{ parent.name }}</label>
                            </td>

                            <!-- Child Permissions -->
                            <td v-for="childName in ['read', 'create', 'update', 'delete']" :key="childName"
                                class="text-center">
                                <input v-if="parent.children.includes(childName)" type="checkbox"
                                    :value="`${parent.name}.${childName}`" v-model="selectedPermissions">
                                <span v-else class="inline-block w-4 h-4"></span> <!-- Empty for fixed column -->
                            </td>
                        </tr>
                        <tr v-if="permissionParents.length === 0">
                            <td colspan="5" class="p-3 text-center text-gray-500">No permissions found.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <button v-if="selectedRoleId" @click="saveAssign"
                class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition mt-3">
                Save Permissions
            </button>
        </div>

        <!-- ASSIGN USER ROLES TAB -->
        <div v-if="activeTab === 'userRoles'" class="mt-4">
            <!-- User Dropdown with Search -->
            <div class="mb-4">
                <input type="text" v-model="userSearch" placeholder="Search user..."
                    class="border rounded px-3 py-2 w-full max-w-sm focus:ring-2 focus:ring-blue-500 mb-2">

                <select v-model="selectedUserId" class="border rounded px-3 py-2 w-full max-w-sm">
                    <option value="" disabled>Select user</option>
                    <option v-for="user in filteredUsers" :key="user.id" :value="user.id">
                        {{ user.first_name }} {{ user.last_name }}
                    </option>
                </select>
            </div>

            <!-- Show Roles checkboxes for selected user -->
            <div v-if="selectedUserId" class="grid grid-cols-3 gap-3 mb-4">
                <label v-for="r in roles" :key="r.id"
                    class="flex items-center gap-2 border p-2 rounded hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" :value="r.name" v-model="selectedUserRoles" class="h-4 w-4">
                    {{ r.name }}
                </label>
            </div>

            <button v-if="selectedUserId" @click="saveUserRoles"
                class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                Save Roles
            </button>
        </div>

    </div>
</template>
