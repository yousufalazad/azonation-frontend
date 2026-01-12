<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { authStore } from '../../../store/authStore'
import Swal from 'sweetalert2'
import { CurrencyService } from "@/helpers/currency";

const auth = authStore
const router = useRouter()

// ✅ Currency
const currencies = ref([])
const fetchCurrencies = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/currencies');
        currencies.value = response.status ? response.data : [];
    } catch (error) {
        errorMessage.value = 'Error loading currencies. Please try again later.';
    }
};

const selectedCurrency = ref('')
const selectedCurrencyId = ref(null)
const fetchCurrencyPreference = async () => {
    try {
        const res = await auth.fetchProtectedApi('/api/accounts-transaction-currencies', {}, 'GET')
        if (res.status && res.data) {
            selectedCurrency.value = res.data.currency_id
            selectedCurrencyId.value = res.data.id
        }
    } catch (err) {
        console.error('Failed to fetch user currency preference', err)
    }
}

// ✅ Handle Currency Save or Change
const saveOrUpdateCurrency = async () => {
    if (!selectedCurrency.value) return

    const payload = {
        currency_id: selectedCurrency.value,
        is_active: true
    }

    try {
        let response

        if (selectedCurrencyId.value) {
            // Update
            response = await auth.fetchProtectedApi(
                `/api/accounts-transaction-currencies/${selectedCurrencyId.value}`,
                payload,
                'PUT'
            )
        } else {
            // Create
            response = await auth.fetchProtectedApi(
                '/api/accounts-transaction-currencies',
                payload,
                'POST'
            )
        }

        if (response.status) {
            Swal.fire('Success', 'Currency saved successfully', 'success')
            selectedCurrencyId.value = response.data.id
            await CurrencyService.load();
        } else {
            Swal.fire('Failed', response.message || 'Failed to save currency', 'error')
        }
    } catch (error) {
        Swal.fire('Error', 'An error occurred while saving currency', 'error')
    }
}

// ✅ handle currency change
const handleCurrencyChange = () => {
    saveOrUpdateCurrency()
}

// ✅ Computed selected currency data
const selectedCurrencyData = computed(() => {
    return currencies.value.find(c => c.id === selectedCurrency.value) || null
})
const formatCurrency = (a) => CurrencyService.format(a);
// ✅ Timezone display
const name = Intl.DateTimeFormat().resolvedOptions().timeZone;

// ✅ Language
const languages = ref([])
const fetchLanguages = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/languages');
        languages.value = response.status ? response.data : [];
    } catch (error) {
        errorMessage.value = 'Error loading languages. Please try again later.';
    }
};
const language_id = ref('')
const userLanguage = ref('');
const selectedLanguageId = ref('');
const fetchUserLanguage = async () => {
    try {
        const response = await auth.fetchProtectedApi("/api/user-languages/language-name/", {}, 'GET');
        console.log(response.data);
        if (response.status && response.data) {
            userLanguage.value = response.data.user_language_name.language_name || '';
            language_id.value = response.data.user_language_name.id || '';
            selectedLanguageId.value = response.data.id || 1;
        } else {
            //Swal.fire('Error', 'Failed to fetch organization country', 'error');
        }
    } catch (error) {
        console.error("Error fetching user language:", error);
        Swal.fire('Error', 'Failed to fetch user language', 'error');
    }
};
// ✅ handle language change
const updateLanguage = async () => {
    if (!language_id.value) {
        Swal.fire({
            title: 'Language not selected',
            text: 'Please select a language before updating.',
            icon: 'warning',
            confirmButtonText: 'OK',
            confirmButtonColor: '#2563eb'
        })
        return
    }

    // 🔔 Confirmation
    const confirm = await Swal.fire({
        title: 'Change language?',
        html: `
            <p class="text-sm text-gray-600">
                Updating your language will immediately change how the application
                is displayed for you.
                <br/><br/>
                Do you want to continue?
            </p>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, update language',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#2563eb'
    })

    if (!confirm.isConfirmed) return

    const payload = {
        language_id: language_id.value,
        user_id: auth.user.id,
        is_active: true
    }

    try {
        const response = await auth.fetchProtectedApi(
            `/api/user-languages/${selectedLanguageId.value}`,
            payload,
            'PUT'
        )

        if (response.status) {
            Swal.fire('Success', 'Language updated successfully', 'success')
            await fetchUserLanguage()
        } else {
            Swal.fire(
                'Failed',
                response.message || 'Failed to update language',
                'error'
            )
        }
    } catch (error) {
        Swal.fire(
            'Error',
            'An error occurred while updating language',
            'error'
        )
    }
}

// Fetch countries
const countryNames = ref([]);
const fetchCountries = async () => {
    try {
        const response = await auth.fetchPublicApi("/api/countries", {}, "GET");
        countryNames.value = response.data;
    } catch (error) {
        console.error("Error fetching countries:", error);
    }
};
const country_id = ref('')
const userCountry = ref('');
const selectedCountryId = ref('');
const fetchOrgCountry = async () => {
    try {
        const response = await auth.fetchProtectedApi("/api/user-countries/country-name/", {}, 'GET');
        console.log(response.data);

        if (response.status && response.data) {
            userCountry.value = response.data.user_country_name.name || '';
            country_id.value = response.data.user_country_name.id || '';
            selectedCountryId.value = response.data.id || '';
        } else {
            //Swal.fire('Error', 'Failed to fetch organization country', 'error');
        }
    } catch (error) {
        console.error("Error fetching organization country:", error);
        Swal.fire('Error', 'Failed to fetch organization country', 'error');
    }
};
const updateCountry = async () => {
    if (!country_id.value) return

    // 🔔 First confirmation
    const firstConfirm = await Swal.fire({
        title: 'A little change with big effects',
        html: `
            <p class="text-sm text-gray-600">
                Updating your country will affect <b>billing</b>, <b>time zone</b>,
                <b>compliance</b>, and a few other settings.
                <br/><br/>
                We just want to be sure you’re happy to move forward.
            </p>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Continue',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#2563eb'
    })

    if (!firstConfirm.isConfirmed) return

    // 🔔 Second confirmation
    const secondConfirm = await Swal.fire({
        title: 'Are you sure?',
        text: 'This action cannot be undone.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, update country',
        cancelButtonText: 'No',
        confirmButtonColor: '#dc2626'
    })

    if (!secondConfirm.isConfirmed) return

    // ✅ Proceed with update
    const payload = {
        country_id: country_id.value,
        user_id: auth.user.id,
        is_active: true
    }

    try {
        const response = await auth.fetchProtectedApi(
            `/api/user-countries/${selectedCountryId.value}`,
            payload,
            'PUT'
        )

        if (response.status) {
            Swal.fire('Success', 'Country updated successfully', 'success')
            await fetchOrgCountry()
        } else {
            Swal.fire(
                'Failed',
                response.message || 'Failed to update country',
                'error'
            )
        }
    } catch (error) {
        Swal.fire(
            'Error',
            'An error occurred while updating country',
            'error'
        )
    }
}


// Delete Account
const deleteAccount = async () => {
    // 🔔 First confirmation (emotional + informative)
    const firstConfirm = await Swal.fire({
        title: "We’ll be sad to see you go!",
        html: `
            <p class="text-sm text-gray-600">
                Deleting your account will <b>permanently remove all your data</b>,
                and this action <b>can’t be undone</b>.
                <br/><br/>
                Are you absolutely sure you want to say goodbye?
            </p>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Continue',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#f97316'
    })

    if (!firstConfirm.isConfirmed) return

    // 🔔 Second confirmation (final irreversible step)
    const secondConfirm = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    })

    if (!secondConfirm.isConfirmed) return

    // ✅ Proceed with delete
    try {
        const response = await auth.fetchProtectedApi(
            `/api/update-deleted-at/${auth.user.id}`,
            {},
            'DELETE'
        )

        if (response.status) {
            Swal.fire('Success', 'Account deleted successfully', 'success')
        } else {
            Swal.fire(
                'Failed',
                response.message || 'Failed to delete account',
                'error'
            )
        }
    } catch (error) {
        Swal.fire(
            'Error',
            'An error occurred while deleting account',
            'error'
        )
    }
}



// On mounted
onMounted(async () => {
    CurrencyService.showSymbol = false; // true = $ or false = USD
    await CurrencyService.load();
    fetchCurrencies();
    fetchLanguages();
    fetchUserLanguage();
    fetchCurrencyPreference();
    fetchOrgCountry();
    fetchCountries();
});

</script>

<template>
    <!-- Currency section -->
    <section>
        <div class="bg-white shadow rounded-lg p-6 mt-5">
            <div class="space-y-4">
                <h3 class="text-lg font-bold mb-4 left-color-shade py-2">Currency</h3>
            </div>
            <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-600">Currency:</span>
                <select v-model="selectedCurrency" @change="handleCurrencyChange"
                    class="px-3 py-2 gap-1 text-sm border border-gray-300 rounded text-gray-700 bg-white hover:border-gray-400">
                    <option value="">Select</option>
                    <option v-for="currency in currencies" :key="currency.id" :value="currency.id">
                        {{ currency.currency_code }}
                    </option>
                </select>
            </div>
        </div>
    </section>

    <section>
        <div class="bg-white shadow rounded-lg p-6 mt-5">
            <router-link to="/org-dashboard/my-account/administrator" @click="handleMenuClick"
                class="block py-2 text-gray-600 hover:bg-gray-100 rounded-md">
                Administrator
            </router-link>
        </div>
    </section>
    <section>
        <div class="bg-white shadow rounded-lg p-6 mt-5">
            <router-link to="/org-dashboard/my-account/org-membership-type" @click="handleLinkClick"
                class="block px-2 py-1 hover:bg-gray-100 rounded text-gray-600">Org Membership Types</router-link>
        </div>
    </section>
    <section>
        <div class="bg-white shadow rounded-lg p-6 mt-5">
            <router-link to="/org-dashboard/my-account/org-membership-renewal-cycle" @click="handleLinkClick"
                class="block px-2 py-1 hover:bg-gray-100 rounded text-gray-600">Org Membership Renewal
                Cycle</router-link>
        </div>
    </section>
    <!-- Time zone section -->
    <section>
        <div class="bg-white shadow rounded-lg p-6 mt-5">
            <div class="space-y-4">
                <h3 class="text-lg font-bold mb-4 left-color-shade py-2">Time zone</h3>
            </div>
            <div>
                <p class="ml-5 pb-9">Current timezone: {{ name }} </p>
            </div>
        </div>
    </section>
    <!-- Notification section -->
    <section>
        <div class="bg-white shadow rounded-lg p-6 mt-5">
            <div class="space-y-4">
                <h3 class="text-lg font-bold mb-4 left-color-shade py-2">Notifications</h3>
            </div>
            <div>
                <router-link to="/org-dashboard/my-account/user-notifications" @click="handleLinkClick"
                    class="block px-2 py-1 hover:bg-gray-100 rounded text-gray-600">User Notifications</router-link>
            </div>
        </div>
    </section>
    <!-- Language section -->
    <section>
        <div class="bg-white shadow rounded-lg p-6 mt-5">
            <!-- Card Header -->
            <h2 class="text-lg font-semibold text-gray-800 mb-6">Language</h2>
            <select v-model="language_id" @change="updateLanguage"
                class="mt-1 w-full border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm">
                <option value="" disabled>Select language</option>
                <option v-for="language in languages" :key="language.id" :value="language.id">
                    {{ language.language_name }}
                </option>
            </select>
        </div>
    </section>
    <!-- Country section -->
    <section>
        <div class="bg-white shadow rounded-lg p-6 mt-5">
            <!-- Card Header -->
            <h2 class="text-lg font-semibold text-gray-800 mb-6">Country</h2>
            <!-- Country Display -->
            <!-- <div class="flex items-start justify-between pb-4">
                <div>
                    <p class="text-gray-900 mt-1 leading-relaxed">
                        {{ userCountry }}
                    </p>
                </div>
            </div> -->
            <select v-model="country_id" @change="updateCountry"
                class="mt-1 w-full border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm">
                <option value="" disabled>Select country</option>
                <option v-for="country in countryNames" :key="country.id" :value="country.id">
                    {{ country.name }}
                </option>
            </select>
        </div>
    </section>
    <!-- Delete Account section -->
    <section>
        <div class="bg-white shadow rounded-lg p-6 mt-5">
            <div class="space-y-4">
                <h3 class="text-lg font-bold mb-4 left-color-shade py-2">Delete Account</h3>
            </div>
            <div class="mt-4">
                <button @click="deleteAccount"
                    class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
                    Delete Account
                </button>
            </div>

        </div>
    </section>
</template>



<style scoped></style>