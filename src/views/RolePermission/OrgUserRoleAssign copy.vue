<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import Swal from 'sweetalert2'
import { authStore } from '@/store/authStore'
import SearchableSelect from '@/views/Common/SearchableSelect.vue'

const auth = authStore
const orgId = authStore.user.id // Assuming the org ID is stored in the logged-in user

/* ================= TOAST (non-blocking feedback) ================= */
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    didOpen: (t) => {
        t.addEventListener('mouseenter', Swal.stopTimer)
        t.addEventListener('mouseleave', Swal.resumeTimer)
    }
})

/* ================= TABS ================= */
const activeTab = ref('roles_title')
const setTab = (tab) => activeTab.value = tab

/* ================= ROLES STATE ================= */
const roles = ref([])
const org_type_user_name = ref('')
const org_type_user_id = orgId //ref(null)
const org_role_title_id = ref(null)

const roleTitles = ref([])
const roleTitleName = ref('')
const roleTitleId = ref(null)
const roleTitleEditMode = ref(false)

/* ================= USERS & ASSIGN ROLES STATE ================= */
const users = ref([])
const organisation_users = ref([])
const organisation_members = ref([])

const selectedUserId = ref(null)
const selectedUserRoles = ref([])

/* ================= UI / LOADING STATE ================= */
const isLoadingData = ref(true)
const isSavingRoleTitle = ref(false)
const deletingRoleTitleId = ref(null)
const isSavingUserRoles = ref(false)

/* ================= GET DATA ================= */
const getRoles = async () => roles.value = await auth.fetchProtectedApi('/api/roles')
const getRoleTitles = async () => roleTitles.value = await auth.fetchProtectedApi(`/api/org-role-titles?org_type_user_id=${org_type_user_id}`)

const getUsers = async () => users.value = await auth.fetchProtectedApi('/api/users?type=individual')
const getOrganisationUsers = async () => organisation_users.value = await auth.fetchProtectedApi('/api/users?type=organisation')
const getMembers = async () => organisation_members.value = await auth.fetchProtectedApi(`/api/org-members-users/${org_type_user_id}`)

const getAllData = async () => {
    isLoadingData.value = true
    try {
        await Promise.all([getRoles(), getRoleTitles(), getUsers(), getOrganisationUsers(), getMembers()])
    } catch (e) {
        console.error(e)
        Toast.fire({ icon: 'error', title: 'Failed to load some data' })
    } finally {
        isLoadingData.value = false
    }
}

/* ================= ON MOUNT ================= */
onMounted(getAllData)

/* ================= ROLE TITLE FUNCTIONS ================= */
const resetRoleTitleForm = () => {
    roleTitleId.value = null
    roleTitleName.value = ''
    org_type_user_id = null
    org_type_user_name.value = ''
    roleTitleEditMode.value = false
}

const editRoleTitle = (r) => {
    roleTitleId.value = r.id
    roleTitleName.value = r.name
    org_type_user_id = r.org_type_user_id
    org_type_user_name.value = r.org_type_user_name
    roleTitleEditMode.value = true
}

const saveRoleTitle = async () => {
    if (!roleTitleName.value.trim()) {
        return Swal.fire({ icon: 'warning', title: 'Role title required', text: 'Please enter a role title name.' })
    }

    const payload = { name: roleTitleName.value, org_type_user_id: orgId }
    const apiUrl = roleTitleEditMode.value ? `/api/org-role-titles/${roleTitleId.value}` : '/api/org-role-titles'
    const method = roleTitleEditMode.value ? 'PUT' : 'POST'

    const res = await Swal.fire({
        title: roleTitleEditMode.value ? 'Update role title?' : 'Create role title?',
        text: `Do you want to ${roleTitleEditMode.value ? 'update' : 'create'} "${roleTitleName.value}"?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: roleTitleEditMode.value ? 'Yes, update' : 'Yes, create',
        confirmButtonColor: '#4f46e5',
        cancelButtonColor: '#9ca3af',
        reverseButtons: true
    })

    if (!res.isConfirmed) return

    isSavingRoleTitle.value = true
    try {
        const r = await auth.fetchProtectedApi(apiUrl, payload, method)
        Toast.fire({ icon: 'success', title: r.message || 'Role title saved' })
        resetRoleTitleForm()
        await getRoleTitles()
    } catch (e) {
        console.error(e)
        Swal.fire({ icon: 'error', title: 'Something went wrong', text: 'Could not save the role title. Please try again.' })
    } finally {
        isSavingRoleTitle.value = false
    }
}

const deleteRoleTitle = async (id) => {
    const res = await Swal.fire({
        title: 'Delete role title?',
        text: 'This may affect users currently assigned to this role title.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete',
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#9ca3af',
        reverseButtons: true
    })
    if (!res.isConfirmed) return

    deletingRoleTitleId.value = id
    try {
        await auth.fetchProtectedApi(`/api/org-role-titles/${id}`, {}, 'DELETE')
        Toast.fire({ icon: 'success', title: 'Role title removed' })
        await getRoleTitles()
    } catch (e) {
        console.error(e)
        Swal.fire({ icon: 'error', title: 'Delete failed', text: 'Could not delete this role title. Please try again.' })
    } finally {
        deletingRoleTitleId.value = null
    }
}

/* ================= ASSIGN ROLES TO USER ================= */
const saveUserRoles = async () => {
    if (!selectedUserId.value) {
        return Swal.fire({ icon: 'warning', title: 'Select a member', text: 'Please choose a member first.' })
    }
    if (!org_role_title_id.value) {
        return Swal.fire({ icon: 'warning', title: 'Select a role title', text: 'Please choose a role title first.' })
    }

    const formData = new FormData()
    formData.append('org_type_user_id', org_type_user_id)
    formData.append('org_role_title_id', org_role_title_id.value)
    selectedUserRoles.value.forEach(role => formData.append('roles[]', role))

    isSavingUserRoles.value = true
    try {
        await auth.fetchProtectedApi(
            `/api/users/${selectedUserId.value}/roles`,
            formData,
            'PUT',
            { headers: { 'Content-Type': 'multipart/form-data' } }
        )

        Toast.fire({ icon: 'success', title: 'Roles assigned successfully' })
        await getMembers()
    } catch (error) {
        console.error(error)
        Swal.fire({ icon: 'error', title: 'Failed to assign roles', text: 'Please check the form and try again.' })
    } finally {
        isSavingUserRoles.value = false
    }
}

/* ================= USER FILTER (for org dropdown, still used elsewhere) ================= */
const userSearch = ref('')
const filteredOrganisationUsers = computed(() => {
    if (!userSearch.value.trim()) return organisation_users.value
    return organisation_users.value.filter(u =>
        u.org_name.toLowerCase().includes(userSearch.value.toLowerCase())
    )
})

/* ================= SEARCHABLE SELECT OPTIONS ================= */
const memberOptions = computed(() =>
    organisation_members.value.map(u => ({
        value: u.id,
        label: `${u.first_name} ${u.last_name}`
    }))
)

const roleTitleOptions = computed(() =>
    roleTitles.value.map(r => ({
        value: r.id,
        label: `${r.name} (${filteredOrganisationUsers.value.find(u => u.id === r.org_type_user_id)?.org_name || 'N/A'})`
    }))
)

/* ================= DERIVED DISPLAY HELPERS ================= */
const selectedMember = computed(() =>
    organisation_members.value.find(u => u.id === selectedUserId.value) || null
)

const getInitials = (first = '', last = '') =>
    `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || '?'

const toggleRole = (roleName) => {
    const idx = selectedUserRoles.value.indexOf(roleName)
    if (idx === -1) selectedUserRoles.value.push(roleName)
    else selectedUserRoles.value.splice(idx, 1)
}

/* ================= WATCHERS ================= */
watch(selectedUserId, (newUserId) => {
    if (!newUserId) {
        selectedUserRoles.value = []
        return
    }
    const user = organisation_members.value.find(u => u.id === newUserId)
    selectedUserRoles.value = user?.roles ? user.roles.map(r => r.name) : []
})
</script>

<template>
    <div class="max-w-5xl mx-auto">
        <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">

            <!-- HEADER -->
            <div class="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-5 sm:px-8 sm:py-6">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                        <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-xl sm:text-2xl font-bold text-white leading-tight">Role & Permission Dashboard</h2>
                        <p class="text-indigo-100 text-sm mt-0.5">Manage role titles and assign roles to members</p>
                    </div>
                </div>
            </div>

            <!-- TABS -->
            <div class="flex gap-1 px-4 sm:px-6 pt-4 border-b border-gray-200 bg-gray-50">
                <button
                    @click="setTab('roles_title')"
                    :class="[
                        'flex items-center gap-2 py-2.5 px-4 rounded-t-lg font-medium text-sm transition',
                        activeTab === 'roles_title'
                            ? 'bg-white text-indigo-600 border border-b-0 border-gray-200 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                    ]"
                >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                    Role Titles
                </button>
                <button
                    @click="setTab('userRoles')"
                    :class="[
                        'flex items-center gap-2 py-2.5 px-4 rounded-t-lg font-medium text-sm transition',
                        activeTab === 'userRoles'
                            ? 'bg-white text-indigo-600 border border-b-0 border-gray-200 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                    ]"
                >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Assign Roles
                </button>
            </div>

            <!-- LOADING STATE -->
            <div v-if="isLoadingData" class="p-10 flex flex-col items-center justify-center text-gray-400 gap-3">
                <svg class="w-8 h-8 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <p class="text-sm">Loading dashboard data...</p>
            </div>

            <template v-else>
                <!-- ROLES TITLE TAB -->
                <div v-if="activeTab === 'roles_title'" class="p-6 sm:p-8">
                    <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5 mb-6">
                        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            {{ roleTitleEditMode ? 'Edit Role Title' : 'Create New Role Title' }}
                        </label>
                        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
                            <input v-model="roleTitleName" placeholder="e.g. Finance Manager"
                                class="border border-gray-300 rounded-lg px-4 py-2.5 w-full sm:flex-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition">

                            <select v-model="org_type_user_id" class="hidden">
                                <option value="" disabled>Select Organisation</option>
                                <option v-for="user in filteredOrganisationUsers" :key="user.id" :value="user.id">
                                    {{ user.org_name }}
                                </option>
                            </select>

                            <div class="flex gap-2 shrink-0">
                                <button @click="saveRoleTitle" :disabled="isSavingRoleTitle"
                                    class="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition font-medium text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                                    <svg v-if="isSavingRoleTitle" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                    </svg>
                                    {{ roleTitleEditMode ? 'Update' : 'Create' }}
                                </button>
                                <button v-if="roleTitleEditMode" @click="resetRoleTitleForm"
                                    class="bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition font-medium text-sm">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="overflow-x-auto rounded-xl border border-gray-200">
                        <table class="min-w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="p-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Role Title</th>
                                    <th class="p-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Organisation</th>
                                    <th class="p-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                <tr v-for="r in roleTitles" :key="r.id" class="hover:bg-gray-50 transition">
                                    <td class="p-3.5 font-medium text-gray-800">{{ r.name }}</td>
                                    <td class="p-3.5">
                                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                                            {{filteredOrganisationUsers.find(u => u.id === r.org_type_user_id)?.org_name || 'N/A'}}
                                        </span>
                                    </td>
                                    <td class="p-3.5 text-right space-x-2 whitespace-nowrap">
                                        <button @click="editRoleTitle(r)"
                                            class="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition text-sm font-medium">
                                            Edit
                                        </button>
                                        <button @click="deleteRoleTitle(r.id)" :disabled="deletingRoleTitleId === r.id"
                                            class="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium disabled:opacity-60">
                                            {{ deletingRoleTitleId === r.id ? 'Deleting...' : 'Delete' }}
                                        </button>
                                    </td>
                                </tr>
                                <tr v-if="roleTitles.length === 0">
                                    <td colspan="3" class="p-10 text-center text-gray-400">
                                        <svg class="w-10 h-10 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                        </svg>
                                        <p class="text-sm">No role titles found. Create one above to get started.</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- ASSIGN USER ROLES TAB -->
                <div v-if="activeTab === 'userRoles'" class="p-6 sm:p-8">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Member</label>
                            <SearchableSelect v-model="selectedUserId" :options="memberOptions" placeholder="Select member" />
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Role Title</label>
                            <SearchableSelect v-model="org_role_title_id" :options="roleTitleOptions" placeholder="Select role title" />
                        </div>
                    </div>

                    <div v-if="selectedUserId" class="bg-gray-50 border border-gray-200 rounded-xl p-5">
                        <div class="flex items-center gap-3 mb-5">
                            <div class="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm shrink-0">
                                {{ getInitials(selectedMember?.first_name, selectedMember?.last_name) }}
                            </div>
                            <div>
                                <p class="font-semibold text-gray-800 leading-tight">
                                    {{ selectedMember?.first_name }} {{ selectedMember?.last_name }}
                                </p>
                                <p class="text-xs text-gray-500">
                                    {{ selectedUserRoles.length }} role{{ selectedUserRoles.length === 1 ? '' : 's' }} selected
                                </p>
                            </div>
                        </div>

                        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Assign Roles</label>
                        <div class="flex flex-wrap gap-2 mb-5">
                            <button
                                v-for="r in roles" :key="r.id"
                                type="button"
                                @click="toggleRole(r.name)"
                                :class="[
                                    'px-3.5 py-1.5 rounded-full text-sm font-medium border transition flex items-center gap-1.5',
                                    selectedUserRoles.includes(r.name)
                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-600 hover:border-indigo-400 hover:text-indigo-600'
                                ]"
                            >
                                <svg v-if="selectedUserRoles.includes(r.name)" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                                </svg>
                                {{ r.name }}
                            </button>
                            <p v-if="roles.length === 0" class="text-sm text-gray-400">No roles available.</p>
                        </div>

                        <button @click="saveUserRoles" :disabled="isSavingUserRoles"
                            class="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition font-medium text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                            <svg v-if="isSavingUserRoles" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                            {{ isSavingUserRoles ? 'Saving...' : 'Save Roles' }}
                        </button>
                    </div>

                    <div v-else class="text-center py-10 text-gray-400">
                        <svg class="w-10 h-10 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <p class="text-sm">Select a member above to manage their roles.</p>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>