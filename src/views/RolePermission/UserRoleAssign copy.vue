<script setup>
import { ref, onMounted, computed, reactive, watch } from 'vue'
import Swal from 'sweetalert2'
import { authStore } from '@/store/authStore'
import SearchableSelect from '@/views/Common/SearchableSelect.vue'

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
const roleEditMode = ref(false)

const org_type_user_id = ref(null)
const org_role_title_id = ref(null)
/* ================= ROLE TITLES STATE ================= */
const roleTitles = ref([])
const roleTitleName = ref('')
const roleTitleId = ref(null)
const roleTitleEditMode = ref(false)

/* ================= ASSIGN PERMISSIONS STATE ================= */
const selectedRoleId = ref(null)
const selectedPermissions = ref([])

/* ================= USERS & ASSIGN ROLES STATE ================= */
const users = ref([])
const organisation_users = ref([])
const organisation_members = ref([])

const selectedUserId = ref(null)
const selectedUserRoles = ref([])

/* ================= GET DATA ================= */
const getPermissions = async () => permissions.value = await auth.fetchProtectedApi('/api/permissions')
const getRoles = async () => roles.value = await auth.fetchProtectedApi('/api/roles')
const getRoleTitles = async () => roleTitles.value = await auth.fetchProtectedApi('/api/org-role-titles')
const getUsers = async () => users.value = await auth.fetchProtectedApi('/api/users?type=individual')

const getOrganisationUsers = async () => organisation_users.value = await auth.fetchProtectedApi('/api/users?type=organisation')
// const getMembers = async () => organisation_members.value = await auth.fetchProtectedApi(`/api/org-members/list/${org_type_user_id.value}`)
const getMembers = async () => organisation_members.value = await auth.fetchProtectedApi(`/api/org-members-users/${org_type_user_id.value}`)


const getAllData = async () => {
    await getPermissions()
    await getRoles()
    await getRoleTitles()
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
/* ================= ROLE Title FUNCTIONS ================= */
const resetRoleTitleForm = () => { roleTitleId.value = null; roleTitleName.value = ''; org_type_user_id.value = null; org_type_user_name.value = ''; org_type_user_name.value = ''; roleTitleEditMode.value = false }
const editRoleTitle = (r) => { roleTitleId.value = r.id; roleTitleName.value = r.name; org_type_user_id.value = r.org_type_user_id; org_type_user_name.value = r.org_type_user_name; roleTitleEditMode.value = true }

const saveRoleTitle = async () => {
    if (!roleTitleName.value.trim()) return Swal.fire('Error', 'Role title required', 'error')
    const payload = { name: roleTitleName.value, org_type_user_id: org_type_user_id.value }
    const apiUrl = roleTitleEditMode.value ? `/api/org-role-titles/${roleTitleId.value}` : '/api/org-role-titles'
    const method = roleTitleEditMode.value ? 'PUT' : 'POST'

    const res = await Swal.fire({
        title: 'Confirm?',
        text: `Do you want to ${roleTitleId.value ? 'update' : 'create'} this role title?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, save!'
    })
    if (res.isConfirmed) {
        try {
            const r = await auth.fetchProtectedApi(apiUrl, payload, method)
            Swal.fire('Success', r.message || 'Saved', 'success')
            resetRoleTitleForm()
            getRoleTitles()
        } catch (e) { console.log(e); Swal.fire('Error', 'Failed', 'error') }
    }
}

const deleteRoleTitle = async (id) => {
    const res = await Swal.fire({
        title: 'Delete Role Title?',
        text: 'This may affect users assigned to this role title!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete!'
    })
    if (res.isConfirmed) {
        try {
            await auth.fetchProtectedApi(`/api/org-role-titles/${id}`, {}, 'DELETE')
            Swal.fire('Deleted', 'Role title removed', 'success')
            getRoleTitles()
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
    if (!role) return
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
            // getAllData()
            getMembers()
        } catch (e) { console.log(e); Swal.fire('Error', 'Failed', 'error') }
    }
}

/* ================= ASSIGN ROLES TO USER ================= */
const editUserRoles = (user) => {
    if (!user) return
    console.log('Editing roles for user:', user);
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
            const payload = { org_type_user_id: org_type_user_id.value, roles: selectedUserRoles.value, org_role_title_id: org_role_title_id.value }
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
const filteredOrganisationUsers = computed(() => {
    if (!userSearch.value.trim()) return organisation_users.value
    return organisation_users.value.filter(u =>
        u.org_name.toLowerCase().includes(userSearch.value.toLowerCase())
    )
})

const memberSearch = ref('')
const filteredMembers = computed(() => {
    if (!memberSearch.value.trim()) return organisation_members.value
    return organisation_members.value.filter(u =>
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(memberSearch.value.toLowerCase())
    )
})

const roleTitlesSearch = ref('')
const filteredRoleTitles = computed(() => {
    if (!roleTitlesSearch.value.trim()) return roleTitles.value
    return roleTitles.value.filter(r =>
        r.name.toLowerCase().includes(roleTitlesSearch.value.toLowerCase())
    )
})

/* ================= SEARCHABLE SELECT OPTIONS ================= */
// Organisation options (used on Roles tab, Roles Title tab, and User Assign Role tab).
// Built from filteredOrganisationUsers so the existing search inputs still narrow the list.
const organisationOptions = computed(() =>
    filteredOrganisationUsers.value.map(u => ({
        value: u.id,
        label: u.org_name
    }))
)

// Role options (used on the Assign Permissions tab)
const roleOptions = computed(() =>
    roles.value.map(r => ({
        value: r.id,
        label: r.name
    }))
)

// Member options (used on the User Assign Role tab)
const memberOptions = computed(() =>
    filteredMembers.value.map(u => ({
        value: u.id,
        label: `${u.first_name} ${u.last_name}`
    }))
)

// Role title options (used on the User Assign Role tab)
const roleTitleOptions = computed(() =>
    filteredRoleTitles.value.map(r => ({
        value: r.id,
        label: `${r.name} (${filteredOrganisationUsers.value.find(u => u.id === r.org_type_user_id)?.org_name || 'N/A'})`
    }))
)

/* ================= WATCHERS ================= */
// Replaces the old @change="getMembers" on the organisation SearchableSelect (User Assign Role tab)
watch(org_type_user_id, (newOrgId) => {
    if (newOrgId) getMembers()
})

// Replaces the old @change="editRolePermissions(...)" on the role SearchableSelect (Assign tab)
watch(selectedRoleId, (newRoleId) => {
    if (!newRoleId) {
        selectedPermissions.value = []
        return
    }
    const role = roles.value.find(r => r.id === newRoleId)
    editRolePermissions(role)
})

// Replaces the old @change="editUserRoles(...)" on the member SearchableSelect (User Assign Role tab)
watch(selectedUserId, (newUserId) => {
    console.log('Selected user ID changed:', newUserId)
    if (!newUserId) {
        selectedUserRoles.value = []
        return
    }

    const user = organisation_members.value.find(u => u.id === newUserId)
    console.log('Selected user:', user)
    selectedUserRoles.value = user?.roles
        ? user.roles.map(r => r.name)
        : []
    console.log('User roles set to:', selectedUserRoles.value)
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
            <button :class="{ 'border-b-2 border-blue-600 text-blue-600': activeTab === 'roles_title' }"
                @click="setTab('roles_title')" class="py-2 px-4 font-semibold transition">Roles Title</button>
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
                <div class=" w-full max-w-sm">
                    <!-- <input type="text" v-model="userSearch" placeholder="Search user..."
                        class="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 mb-2"> -->
                    <SearchableSelect v-model="org_type_user_id" :options="organisationOptions"
                        placeholder="Select Organisation" />
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
                                {{filteredOrganisationUsers.find(u => u.id === r.org_type_user_id)?.org_name || 'N/A'
                                }}
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

        <!-- ROLES TITLE TAB -->
        <div v-if="activeTab === 'roles_title'" class="mt-4">
            <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <input v-model="roleTitleName" placeholder="Role Title Name"
                    class="border rounded-lg px-4 py-2 w-full sm:w-64 focus:ring-2 focus:ring-indigo-500">
                <div class="w-full max-w-sm">
                    <SearchableSelect v-model="org_type_user_id" :options="organisationOptions"
                        placeholder="Select Organisation" />
                </div>
                <button @click="saveRoleTitle"
                    class="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition">
                    {{ roleTitleEditMode ? 'Update' : 'Create' }}
                </button>
                <button v-if="roleTitleEditMode" @click="resetRoleTitleForm"
                    class="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition">
                    Cancel
                </button>
            </div>

            <div class="overflow-x-auto">
                <table class="min-w-full border rounded-lg">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="p-3 text-left text-gray-700">Role Title Name</th>
                            <th class="p-3 text-left text-gray-700">Organisation</th>
                            <th class="p-3 text-right text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="r in roleTitles" :key="r.id" class="border-t hover:bg-gray-50">
                            <td class="p-3">{{ r.name }}</td>
                            <td class="p-3">
                                {{filteredOrganisationUsers.find(u => u.id === r.org_type_user_id)?.org_name || 'N/A' }}
                            </td>

                            <td class="p-3 text-right space-x-2">
                                <button @click="editRoleTitle(r)"
                                    class="px-3 py-1 bg-yellow-400 rounded hover:bg-yellow-500 transition">Edit</button>
                                <button @click="deleteRoleTitle(r.id)"
                                    class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition">Delete</button>
                            </td>
                        </tr>
                        <tr v-if="roles.length === 0">
                            <td colspan="2" class="p-3 text-center text-gray-500">No role titles found.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- ASSIGN PERMISSIONS TAB -->
        <div v-if="activeTab === 'assign'" class="mt-4">
            <div class="mb-4 w-full max-w-sm">
                <SearchableSelect v-model="selectedRoleId" :options="roleOptions" placeholder="Select Role" />
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

            <!-- Organisation SearchableSelect -->
            <div class="mb-4 w-full max-w-sm">
                <!-- <input type="text" v-model="userSearch" placeholder="Search organisation..."
                    class="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 mb-2"> -->
                <SearchableSelect v-model="org_type_user_id" :options="organisationOptions"
                    placeholder="Select Organisation" />
            </div>

            <!-- Member SearchableSelect -->
            <div class="mb-4 w-full max-w-sm">
                <!-- <input type="text" v-model="memberSearch" placeholder="Search member..."
                    class="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 mb-2"> -->
                <SearchableSelect v-model="selectedUserId" :options="memberOptions" placeholder="Select Member" />
            </div>

            <!-- Role Title SearchableSelect -->
            <div class="mb-4 w-full max-w-sm">
                <!-- <input type="text" v-model="roleTitlesSearch" placeholder="Search role title..."
                    class="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 mb-2"> -->
                <SearchableSelect v-model="org_role_title_id" :options="roleTitleOptions"
                    placeholder="Select Role Title" />
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