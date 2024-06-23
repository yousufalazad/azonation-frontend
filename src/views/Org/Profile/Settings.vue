<!-- ProfileUpdate.vue -->

<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from "sweetalert2";

//for Org Administrator
const searchQuery = ref('');
const searchResults = ref([]);
const selectedIndividual = ref(null);
const orgAdministrator = ref([]);

const fromDate = ref('');
const endDate = ref('');

const auth = authStore;
const orgId = auth.org.id; // Assuming the org ID is stored in the logged-in user

const searchIndividuals = async () => {
    try {
        const response = await auth.fetchPublicApi('/api/search-individual', { query: searchQuery.value }, 'POST');
        if (response.status) {
            searchResults.value = response.data;
        } else {
            searchResults.value = [];
        }
    } catch (error) {
        console.error("Error searching individuals:", error);
        searchResults.value = [];
    }
};

const addAdministrator = async (individualId) => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to add this person as a Administrator?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, add it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi('/api/add_administrator', { org_id: orgId, individual_id: individualId }, 'POST');
            if (response.status) {
                await Swal.fire(
                    'Added!',
                    'Administrator added successfully.',
                    'success'
                );
                selectedIndividual.value = null;
                searchResults.value = [];
                searchQuery.value = '';
            } else {
                Swal.fire(
                    'Failed!',
                    'Failed to add member.',
                    'error'
                );
            }
        }
    } catch (error) {
        console.error("Error adding member:", error);
        Swal.fire(
            'Error!',
            'Failed to add member.',
            'error'
        );
    }
};

const fetchOrgAdministrator = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/org-administrator/${orgId}`, {}, 'GET');
        if (response.status) {
            orgAdministrator.value = response.data;
        } else {
            orgAdministrator.value = [];
        }
    } catch (error) {
        console.error("Error fetching org administrator info:", error);
        orgAdministrator.value = [];
    }
};

const updateOrgAdministrator = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/update-administrator/${orgId}`, {
            from_date: fromDate.value,
            end_date: endDate.value,
        }, 'PUT');
        if (response.status) {
            Swal.fire('Success', 'Administrator updated successfully', 'success');
        } else {
            Swal.fire('Error', 'Failed to update Administrator', 'error');
        }
    } catch (error) {
        console.error("Error updating Administrator:", error);
        Swal.fire('Error', 'Failed to update Administrator', 'error');
    }
};

onMounted(fetchOrgAdministrator);
</script>

<template>
    <div class="add-member container">
        <h2 class="mb-4 text-center">Search new admin</h2>

        <div class="input-group-container">
            <div class="input-group mb-3">
                <input type="text" class="form-control" v-model="searchQuery"
                    placeholder="Search by ID, User ID, Azon ID, or Full Name" @input="searchIndividuals">
                <button class="btn btn-outline-secondary" type="button" @click="searchIndividuals">Search</button>
            </div>

            <div v-if="searchResults.length" class="results-container">
                <ul class="list-group">
                    <li v-for="individual in searchResults" :key="individual.id"
                        class="list-group-item d-flex justify-content-between align-items-center">
                        {{ individual.full_name }} ({{ individual.id }}, {{ individual.user_id }}, {{ individual.azon_id
                        }})
                        <button class="btn btn-sm btn-primary px-4" @click="addAdministrator(individual.id)">Add
                            administrator</button>
                    </li>
                </ul>
            </div>

            <div v-else>
                <p>No results found</p>
            </div>

        </div>
    </div>
    <br>
    <div>
        <br>
        <h5>Contact person</h5>

        <div>
            <div v-if="orgAdministrator.length">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col">Name</th>
                            <th scope="col">From</th>
                            <th scope="col">End Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="administrator in orgAdministrator" :key="administrator.id">
                            <td>{{ administrator.individual.full_name }}</td>
                            <td>{{ administrator.from_date }}</td>
                            <td>{{ administrator.end_date }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-else>
                <p>No members found</p>
            </div>
        </div>
    </div>

    <div class="card shadow-sm">
        <div class="card-body p-4">
            <div class="mb-3">
                <div v-if="orgAdministrator.length">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <h5>Update contact person</h5>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="administrator in orgAdministrator" :key="administrator.id">
                                <td>{{ administrator.individual.full_name }}</td>

                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="mb-3">
                <label for="fromDate" class="form-label">From</label>
                <input v-model="fromDate" type="date" id="fromDate" class="form-control"
                    placeholder="Administrator from">
            </div>

            <div class="mb-3">
                <label for="endDate" class="form-label">End</label>
                <input v-model="endDate" type="date" id="endDate" class="form-control" placeholder="End date">
            </div>

            <div class="text-end">
                <button @click="updateOrgAdministrator" class="btn btn-primary">Update Org Administrator</button>
            </div>
        </div>
    </div>
    <br>

</template>

<style scoped>
.profile-data-show {
    padding: 20px;
}

.img-thumbnail {
    max-width: 200px;
    margin-top: 10px;
}

.add-member {
    padding: 20px;
}

.input-group-container {
    max-width: 600px;
    margin: auto;
}

.results-container {
    width: 100%;
}

.input-group {
    width: 100%;
}

.list-group-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.list-group-item button {
    margin-left: 10px;
}
</style>