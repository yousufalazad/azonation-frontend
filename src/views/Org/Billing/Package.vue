<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';

const auth = authStore;

// State management
const packageList = ref([]);

// Fetch all packages
const getPackages = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/packages', {}, 'GET');
        console.log(response.data);
        if (response.status) {
            packageList.value = response.data;
            
        } else {
            packageList.value = [];
        }
    } catch (error) {
        console.error('Error fetching packages:', error);
        packageList.value = [];
    }
};

// Fetch packages on mount
onMounted(() => {
    getPackages();
});
</script>

<template>
    <div class="max-w-7xl mx-auto w-10/12">
        <section>
            <h5 class="text-lg font-semibold mb-4">Pricing</h5>

            <div class="overflow-x-auto">
                <table class="min-w-full border border-gray-300">
                    <thead>
                        <tr>
                            <th class="border border-gray-300 p-4">Features</th>
                            <th class="border border-gray-300 p-4" v-for="pkg in packageList" :key="pkg.id">
                                <div class="text-center font-bold">{{ pkg.name }}</div>
                                <div class="text-center text-xl mt-2">{{ pkg.price }} {{ pkg.currency }}</div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="border border-gray-300 p-4 font-semibold">Max Members</td>
                            <td class="border border-gray-300 p-4" v-for="pkg in packageList" :key="pkg.id + '-max-members'">
                                <div class="text-center">{{ pkg.max_members }}</div>
                            </td>
                        </tr>
                        <tr>
                            <td class="border border-gray-300 p-4 font-semibold">Storage Limit (MB)</td>
                            <td class="border border-gray-300 p-4" v-for="pkg in packageList" :key="pkg.id + '-storage-limit'">
                                <div class="text-center">{{ pkg.storage_limit }}</div>
                            </td>
                        </tr>
                        <tr>
                            <td class="border border-gray-300 p-4 font-semibold">Custom Branding</td>
                            <td class="border border-gray-300 p-4" v-for="pkg in packageList" :key="pkg.id + '-custom-branding'">
                                <div class="text-center">{{ pkg.custom_branding ? '✔️' : '❌' }}</div>
                            </td>
                        </tr>
                        <tr>
                            <td class="border border-gray-300 p-4 font-semibold">API Access</td>
                            <td class="border border-gray-300 p-4" v-for="pkg in packageList" :key="pkg.id + '-api-access'">
                                <div class="text-center">{{ pkg.api_access ? '✔️' : '❌' }}</div>
                            </td>
                        </tr>
                        <tr>
                            <td class="border border-gray-300 p-4 font-semibold">Priority Support</td>
                            <td class="border border-gray-300 p-4" v-for="pkg in packageList" :key="pkg.id + '-priority-support'">
                                <div class="text-center">{{ pkg.priority_support ? '✔️' : '❌' }}</div>
                            </td>
                        </tr>
                        <tr>
                            <td class="border border-gray-300 p-4 font-semibold">Meeting Limit</td>
                            <td class="border border-gray-300 p-4" v-for="pkg in packageList" :key="pkg.id + '-meeting-limit'">
                                <div class="text-center">{{ pkg.meeting_limit }}</div>
                            </td>
                        </tr>
                        <tr>
                            <td class="border border-gray-300 p-4 font-semibold">Event Limit</td>
                            <td class="border border-gray-300 p-4" v-for="pkg in packageList" :key="pkg.id + '-event-limit'">
                                <div class="text-center">{{ pkg.event_limit }}</div>
                            </td>
                        </tr>
                        <tr>
                            <td class="border border-gray-300 p-4 font-semibold">Project Limit</td>
                            <td class="border border-gray-300 p-4" v-for="pkg in packageList" :key="pkg.id + '-project-limit'">
                                <div class="text-center">{{ pkg.project_limit }}</div>
                            </td>
                        </tr>
                        <tr>
                            <td class="border border-gray-300 p-4 font-semibold">Asset Limit</td>
                            <td class="border border-gray-300 p-4" v-for="pkg in packageList" :key="pkg.id + '-asset-limit'">
                                <div class="text-center">{{ pkg.asset_limit }}</div>
                            </td>
                        </tr>
                        <tr>
                            <td class="border border-gray-300 p-4 font-semibold">Document Limit</td>
                            <td class="border border-gray-300 p-4" v-for="pkg in packageList" :key="pkg.id + '-document-limit'">
                                <div class="text-center">{{ pkg.document_limit }}</div>
                            </td>
                        </tr>
                        <tr>
                            <td class="border border-gray-300 p-4 font-semibold">Basic Reporting</td>
                            <td class="border border-gray-300 p-4" v-for="pkg in packageList" :key="pkg.id + '-basic-reporting'">
                                <div class="text-center">{{ pkg.report ? '✔️' : '❌' }}</div>
                            </td>
                        </tr>
                        <tr>
                            <td class="border border-gray-300 p-4 font-semibold">Advanced Reporting</td>
                            <td class="border border-gray-300 p-4" v-for="pkg in packageList" :key="pkg.id + '-advanced-reporting'">
                                <div class="text-center">{{ pkg.advanced_report ? '✔️' : '❌' }}</div>
                            </td>
                        </tr>
                        <tr>
                            <td class="border border-gray-300 p-4 font-semibold">Custom Reporting</td>
                            <td class="border border-gray-300 p-4" v-for="pkg in packageList" :key="pkg.id + '-custom-reporting'">
                                <div class="text-center">{{ pkg.custom_report ? '✔️' : '❌' }}</div>
                            </td>
                        </tr>
                        <tr>
                            <td class="border border-gray-300 p-4 font-semibold">Email Support</td>
                            <td class="border border-gray-300 p-4" v-for="pkg in packageList" :key="pkg.id + '-email-support'">
                                <div class="text-center">{{ pkg.support ? '✔️' : '❌' }}</div>
                            </td>
                        </tr>
                        <tr>
                            <td class="border border-gray-300 p-4 font-semibold">Premium Support</td>
                            <td class="border border-gray-300 p-4" v-for="pkg in packageList" :key="pkg.id + '-premium-support'">
                                <div class="text-center">{{ pkg.premium_support ? '✔️' : '❌' }}</div>
                            </td>
                        </tr>
                        <tr>
                            <td class="border border-gray-300 p-4 font-semibold">Account Manager</td>
                            <td class="border border-gray-300 p-4" v-for="pkg in packageList" :key="pkg.id + '-account-manager'">
                                <div class="text-center">{{ pkg.dedicated_account_manager ? '✔️' : '❌' }}</div>
                            </td>
                        </tr>
                        <tr>
                            <td class="border border-gray-300 p-4 font-semibold">Custom Domain</td>
                            <td class="border border-gray-300 p-4" v-for="pkg in packageList" :key="pkg.id + '-custom-domain'">
                                <div class="text-center">{{ pkg.custom_domain ? '✔️' : '❌' }}</div>
                            </td>
                        </tr>
                        <tr>
                            <td class="border border-gray-300 p-4 font-semibold">Custom Email Template</td>
                            <td class="border border-gray-300 p-4" v-for="pkg in packageList" :key="pkg.id + '-custom-email-template'">
                                <div class="text-center">{{ pkg.custom_email_template ? '✔️' : '❌' }}</div>
                            </td>
                        </tr>
                        <tr>
                            <td class="border border-gray-300 p-4 font-semibold">Multi-Currency Payment</td>
                            <td class="border border-gray-300 p-4" v-for="pkg in packageList" :key="pkg.id + '-multi-currency'">
                                <div class="text-center">{{ pkg.multi_currency_payment ? '✔️' : '❌' }}</div>
                            </td>
                        </tr>
                        <tr>
                            <td class="border border-gray-300 p-4 font-semibold">Custom Username</td>
                            <td class="border border-gray-300 p-4" v-for="pkg in packageList" :key="pkg.id + '-custom-username'">
                                <div class="text-center">{{ pkg.custom_username ? '✔️' : '❌' }}</div>
                            </td>
                        </tr>
                        <tr>
                            <td class="border border-gray-300 p-4 font-semibold">Web Profile</td>
                            <td class="border border-gray-300 p-4" v-for="pkg in packageList" :key="pkg.id + '-web-profile'">
                                <div class="text-center">{{ pkg.web_profile ? '✔️' : '❌' }}</div>
                            </td>
                        </tr>
                        <tr>
                            <td class="border border-gray-300 p-4 font-semibold">Status</td>
                            <td class="border border-gray-300 p-4" v-for="pkg in packageList" :key="pkg.id + '-status'">
                                <div class="text-center">{{ pkg.status ? 'Active' : 'Inactive' }}</div>
                            </td>
                        </tr>
                        <tr>
                            <td class=""></td>
                            <td class="border border-gray-300 p-4 font-semibold text-center text-blue-600" v-for="pkg in packageList" :key="pkg.id">
                                <button @click="seletedPackage(pkg.id)">Subscribe</button>
                            </td>
                            
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</template>

<style scoped>
/* Add any specific styles here if needed */
</style>
