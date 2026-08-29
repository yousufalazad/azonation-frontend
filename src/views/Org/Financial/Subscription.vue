<script setup>
import { ref, computed, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;

/*
|--------------------------------------------------------------------------
| Subscription Data
|--------------------------------------------------------------------------
*/

const managementSubscriptions = ref([]);
const managementPackages = ref([]);

const isModalOpen = ref(false);
const showUpgradeDowngradeModal = ref(false);

const subscription_id = ref(null);
const user_id = ref('');
const package_id = ref('');
const end_date = ref('');
const status = ref(true);

const errorMessage = ref('');

/*
|--------------------------------------------------------------------------
| Existing Pricing Data
|--------------------------------------------------------------------------
*/

const userPriceRate = ref([]);
const currency = ref([]);

/*
|--------------------------------------------------------------------------
| Country & Package Price Data
|--------------------------------------------------------------------------
|
| Country and package prices are intentionally kept separate from
| managementPackages.
|
*/

const countries = ref([]);
const packagePrices = ref([]);

const selectedCountryId = ref(null);

const selectedManagementSubscription = ref(null);

const isLoadingCountries = ref(false);
const isLoadingPackagePrices = ref(false);


/*
|--------------------------------------------------------------------------
| Get Subscriptions
|--------------------------------------------------------------------------
*/

const getSubscriptions = async () => {
    try {
        const response = await auth.fetchProtectedApi(
            '/api/management-subscriptions',
            {},
            'GET'
        );

        managementSubscriptions.value = response.status
            ? response.data
            : [];

    } catch (error) {
        console.error(
            'Error fetching managementSubscriptions:',
            error
        );

        managementSubscriptions.value = [];
    }
};


/*
|--------------------------------------------------------------------------
| Get Management Packages
|--------------------------------------------------------------------------
*/

const getManagementPackages = async () => {
    try {
        const response = await auth.fetchProtectedApi(
            '/api/management-packages',
            {},
            'GET'
        );

        managementPackages.value = response.status
            ? response.managementPackages
            : [];

    } catch (error) {
        console.error(
            'Error fetching managementPackages:',
            error
        );

        managementPackages.value = [];
    }
};


/*
|--------------------------------------------------------------------------
| Edit Subscription
|--------------------------------------------------------------------------
*/

const editSubscription = (subscription) => {
    subscription_id.value = subscription.id;
    user_id.value = subscription.user_id;
    package_id.value = subscription.package_id;
    end_date.value = subscription.end_date;
    status.value = subscription.status;

    isModalOpen.value = true;
};


/*
|--------------------------------------------------------------------------
| Close Edit Modal
|--------------------------------------------------------------------------
*/

const closeModal = () => {
    isModalOpen.value = false;
};


/*
|--------------------------------------------------------------------------
| Update Subscription
|--------------------------------------------------------------------------
*/

const updateSubscription = async () => {
    const payload = {
        user_id: user_id.value,
        package_id: package_id.value,
        end_date: end_date.value,
        status: status.value,
        start_date: new Date().toISOString().slice(0, 10),
    };

    try {
        const response = await auth.fetchProtectedApi(
            `/api/subscription/${subscription_id.value}`,
            payload,
            'PUT'
        );

        if (response.status) {
            await getSubscriptions();

            Swal.fire(
                'Success',
                'Subscription updated successfully!',
                'success'
            );

            closeModal();
        } else {
            console.error(
                'Error updating subscription:',
                response
            );

            Swal.fire(
                'Error',
                'Failed to update subscription!',
                'error'
            );
        }

    } catch (error) {
        console.error(
            'Error updating subscription:',
            error
        );

        Swal.fire(
            'Error',
            'An error occurred while updating subscription!',
            'error'
        );
    }
};


/*
|--------------------------------------------------------------------------
| Existing Daily Price Rate API
|--------------------------------------------------------------------------
*/

const fetchUserPriceRate = async () => {
    try {
        const response = await auth.fetchProtectedApi(
            '/api/management-subscriptions/daily-price-rate',
            {},
            'GET'
        );

        if (response.status) {
            userPriceRate.value = response.daily_price_rate;
        } else {
            userPriceRate.value = [];
        }

    } catch (error) {
        console.error(
            'Error fetching user price rate:',
            error
        );

        errorMessage.value = error.message;
    }
};


/*
|--------------------------------------------------------------------------
| Existing Currency API
|--------------------------------------------------------------------------
*/

const fetchCurrency = async () => {
    try {
        const response = await auth.fetchProtectedApi(
            '/api/management-subscriptions/currencies',
            {},
            'GET'
        );

        if (response.status) {
            currency.value = response.data;
        } else {
            currency.value = [];
        }

    } catch (error) {
        console.error(
            'Error fetching currency:',
            error
        );

        errorMessage.value = error.message;
    }
};


/*
|--------------------------------------------------------------------------
| COUNTRY API
|--------------------------------------------------------------------------
|
| TODO:
| Update ONLY this endpoint and response mapping according to your
| actual Country API.
|
| Expected example:
|
| [
|   {
|      id: 1,
|      name: "Bangladesh",
|      currency_code: "BDT",
|      currency_symbol: "৳"
|   },
|   ...
| ]
|
|--------------------------------------------------------------------------
*/

const getCountries = async () => {
    isLoadingCountries.value = true;

    try {
        /*
         * TODO:
         * Replace this endpoint with your actual country API.
         */
        const response = await auth.fetchProtectedApi(
            '/api/countries',
            {},
            'GET'
        );

        if (response.status) {
            countries.value =
                response.data ??
                response.countries ??
                [];
        } else {
            countries.value = [];
        }

    } catch (error) {
        console.error(
            'Error fetching countries:',
            error
        );

        countries.value = [];
    } finally {
        isLoadingCountries.value = false;
    }
};


/*
|--------------------------------------------------------------------------
| PACKAGE PRICE API
|--------------------------------------------------------------------------
|
| TODO:
| Update ONLY this endpoint and response mapping according to your
| actual Package Price API.
|
| Expected example:
|
| [
|   {
|      id: 1,
|      package_id: 1,
|      country_id: 1,
|      price: 0
|   },
|   {
|      id: 2,
|      package_id: 2,
|      country_id: 1,
|      price: 500
|   }
| ]
|
|--------------------------------------------------------------------------
*/

const X_getPackagePrices = async () => {
    isLoadingPackagePrices.value = true;

    try {
        /*
         * TODO:
         * Replace this endpoint with your actual package-price API.
         */
        const response = await auth.fetchProtectedApi(
            '/api/management-package-prices',
            {},
            'GET'
        );

        if (response.status) {
            packagePrices.value =
                response.data ??
                response.packagePrices ??
                response.package_prices ??
                [];
        } else {
            packagePrices.value = [];
        }

    } catch (error) {
        console.error(
            'Error fetching package prices:',
            error
        );

        packagePrices.value = [];
    } finally {
        isLoadingPackagePrices.value = false;
    }
};
const getPackagePrices = async () => {
    isLoadingPackagePrices.value = true;

    try {
        /*
         * TODO:
         * Replace this endpoint with your actual package-price API.
         */

        const response = await auth.fetchProtectedApi(
            '/api/management-subscriptions/management-package-prices',
            {},
            'GET'
        );

        if (response.status) {
            packagePrices.value = response.package_prices ?? [];
        } else {
            packagePrices.value = [];
        }

    } catch (error) {
        console.error(
            'Error fetching package prices:',
            error
        );

        packagePrices.value = [];
    } finally {
        isLoadingPackagePrices.value = false;
    }
};

/*
|--------------------------------------------------------------------------
| Package Feature Configuration
|--------------------------------------------------------------------------
|
| Feature names are controlled here.
| Feature values ALWAYS come from managementPackages API.
|
|--------------------------------------------------------------------------
*/

const packageFeatures = [
    {
        key: 'max_member',
        label: 'Maximum Members',
        type: 'number',
    },
    {
        key: 'storage_limit',
        label: 'Storage Limit',
        type: 'storage',
    },
    {
        key: 'meeting_limit',
        label: 'Meeting Limit',
        type: 'number',
    },
    {
        key: 'event_limit',
        label: 'Event Limit',
        type: 'number',
    },
    {
        key: 'project_limit',
        label: 'Project Limit',
        type: 'number',
    },
    {
        key: 'asset_limit',
        label: 'Asset Limit',
        type: 'number',
    },
    {
        key: 'document_limit',
        label: 'Document Limit',
        type: 'number',
    },
    {
        key: 'report',
        label: 'Reports',
        type: 'boolean',
    },
    {
        key: 'advanced_report',
        label: 'Advanced Reports',
        type: 'boolean',
    },
    {
        key: 'custom_report',
        label: 'Custom Reports',
        type: 'boolean',
    },
    {
        key: 'custom_branding',
        label: 'Custom Branding',
        type: 'boolean',
    },
    {
        key: 'api_access',
        label: 'API Access',
        type: 'boolean',
    },
    {
        key: 'priority_support',
        label: 'Priority Support',
        type: 'boolean',
    },
    {
        key: 'premium_support',
        label: 'Premium Support',
        type: 'boolean',
    },
    {
        key: 'dedicated_account_manager',
        label: 'Dedicated Account Manager',
        type: 'boolean',
    },
    {
        key: 'custom_domain',
        label: 'Custom Domain',
        type: 'boolean',
    },
    {
        key: 'custom_email_template',
        label: 'Custom Email Template',
        type: 'boolean',
    },
    {
        key: 'multi_currency_payment',
        label: 'Multi Currency Payment',
        type: 'boolean',
    },
    {
        key: 'custom_username',
        label: 'Custom Username',
        type: 'boolean',
    },
    {
        key: 'web_profile',
        label: 'Web Profile',
        type: 'boolean',
    },
    {
        key: 'support',
        label: 'Support',
        type: 'boolean',
    },
    {
        key: 'is_storage_grace_period_allow',
        label: 'Storage Grace Period',
        type: 'boolean',
    },
    {
        key: 'is_billing_grace_period_allow',
        label: 'Billing Grace Period',
        type: 'boolean',
    },
];


/*
|--------------------------------------------------------------------------
| Open Upgrade / Downgrade Modal
|--------------------------------------------------------------------------
*/

const openUpgradeDowngradeModal = async (subscription) => {
    selectedManagementSubscription.value = subscription;

    /*
     * Existing subscription country, if available.
     */
    selectedCountryId.value =
        subscription?.country_id ??
        subscription?.countryId ??
        null;

    showUpgradeDowngradeModal.value = true;

    /*
     * Make sure country and price data are available.
     */
    if (!countries.value.length) {
        await getCountries();
    }

    if (!packagePrices.value.length) {
        await getPackagePrices();
    }

    /*
     * If subscription has no country,
     * automatically select the first available country.
     */
    if (
        !selectedCountryId.value &&
        countries.value.length
    ) {
        selectedCountryId.value =
            countries.value[0].id;
    }
};


/*
|--------------------------------------------------------------------------
| Close Upgrade / Downgrade Modal
|--------------------------------------------------------------------------
*/

const closeUpgradeDowngradeModal = () => {
    showUpgradeDowngradeModal.value = false;
    selectedManagementSubscription.value = null;
};


/*
|--------------------------------------------------------------------------
| Selected Country
|--------------------------------------------------------------------------
*/

const selectedCountry = computed(() => {
    if (!selectedCountryId.value) {
        return null;
    }

    return (
        countries.value.find(
            country =>
                Number(country.id) ===
                Number(selectedCountryId.value)
        ) ?? null
    );
});


/*
|--------------------------------------------------------------------------
| Country Name
|--------------------------------------------------------------------------
*/

const selectedCountryName = computed(() => {
    return selectedCountry.value?.name ?? '';
});


/*
|--------------------------------------------------------------------------
| Country Currency
|--------------------------------------------------------------------------
|
| Supports different possible API field names.
|--------------------------------------------------------------------------
*/

const selectedCurrencyCode = computed(() => {
    const country = selectedCountry.value;

    if (!country) {
        return '';
    }

    return (
        country.currency_code ??
        country.currency ??
        country.currencyCode ??
        ''
    );
});


const selectedCurrencySymbol = computed(() => {
    const country = selectedCountry.value;

    if (!country) {
        return '';
    }

    return (
        country.currency_symbol ??
        country.currencySymbol ??
        ''
    );
});


/*
|--------------------------------------------------------------------------
| Country Change
|--------------------------------------------------------------------------
*/

const onCountryChange = () => {
    /*
     * Nothing else is required here.
     *
     * Because getPackagePrice() depends on selectedCountryId,
     * Vue automatically updates every package price.
     *
     * Package feature values do NOT change.
     */
};


/*
|--------------------------------------------------------------------------
| Find Package Price
|--------------------------------------------------------------------------
*/

const getPackagePriceRecord = (pkg) => {
    if (!pkg || !selectedCountryId.value) {
        return null;
    }

    return (
        packagePrices.value.find(
            item =>
                Number(item.management_package_id) === Number(pkg.id)
                 &&
                Number(item.region_id) === 1
                // Number(item.region_id) === Number(selectedCountryId.value)

        ) ?? null
    );
};


/*
|--------------------------------------------------------------------------
| Get Package Price
|--------------------------------------------------------------------------
*/

const getPackagePrice = (pkg) => {
    const priceRecord = getPackagePriceRecord(pkg);

    if (!priceRecord) {
        return null;
    }

    return Number(
        priceRecord.price ??
        priceRecord.amount ??
        priceRecord.price_rate ??
        0
    );
};


/*
|--------------------------------------------------------------------------
| Price Availability
|--------------------------------------------------------------------------
*/

const hasPackagePrice = (pkg) => {
    return getPackagePriceRecord(pkg) !== null;
};


/*
|--------------------------------------------------------------------------
| Format Price
|--------------------------------------------------------------------------
*/

const formatPrice = (price) => {
    if (price === null || price === undefined) {
        return '';
    }

    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(Number(price));
};


/*
|--------------------------------------------------------------------------
| Format Feature Value
|--------------------------------------------------------------------------
*/

const formatFeatureValue = (pkg, feature) => {
    const value = pkg?.[feature.key];

    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return '—';
    }

    if (feature.type === 'storage') {
        return `${value} MB`;
    }

    return value;
};


/*
|--------------------------------------------------------------------------
| Current Package
|--------------------------------------------------------------------------
*/

const isCurrentPackage = (pkg) => {
    if (!selectedManagementSubscription.value) {
        return false;
    }

    return (
        Number(
            selectedManagementSubscription.value.package_id
        ) === Number(pkg.id)
    );
};


/*
|--------------------------------------------------------------------------
| Package Order
|--------------------------------------------------------------------------
|
| Prefer sort_order if your package API provides it.
| Otherwise fallback to package ID.
|--------------------------------------------------------------------------
*/

const getPackageOrder = (pkg) => {
    return Number(
        pkg?.sort_order ??
        pkg?.sortOrder ??
        pkg?.display_order ??
        pkg?.id ??
        0
    );
};


/*
|--------------------------------------------------------------------------
| Current Package Object
|--------------------------------------------------------------------------
*/

const currentPackage = computed(() => {
    if (!selectedManagementSubscription.value) {
        return null;
    }

    return (
        managementPackages.value.find(
            pkg =>
                Number(pkg.id) ===
                Number(
                    selectedManagementSubscription.value.package_id
                )
        ) ?? null
    );
});


/*
|--------------------------------------------------------------------------
| Upgrade / Downgrade / Choose
|--------------------------------------------------------------------------
*/

const getPackageAction = (pkg) => {
    if (!selectedManagementSubscription.value) {
        return 'Choose';
    }

    if (isCurrentPackage(pkg)) {
        return 'Current Plan';
    }

    const currentPkg = currentPackage.value;

    if (!currentPkg) {
        return 'Choose';
    }

    if (
        getPackageOrder(pkg) >
        getPackageOrder(currentPkg)
    ) {
        return 'Upgrade';
    }

    if (
        getPackageOrder(pkg) <
        getPackageOrder(currentPkg)
    ) {
        return 'Downgrade';
    }

    return 'Choose';
};


/*
|--------------------------------------------------------------------------
| Can Select Package
|--------------------------------------------------------------------------
*/

const canSelectPackage = (pkg) => {
    if (isCurrentPackage(pkg)) {
        return false;
    }

    /*
     * Don't allow choosing a package if price is unavailable
     * for selected country.
     */
    if (!hasPackagePrice(pkg)) {
        return false;
    }

    return true;
};


/*
|--------------------------------------------------------------------------
| Change Package
|--------------------------------------------------------------------------
|
| This currently only selects/confirms the package.
| Add your actual upgrade/downgrade API here later.
|--------------------------------------------------------------------------
*/

const changePackage = async (pkg) => {
    if (!canSelectPackage(pkg)) {
        return;
    }

    const action = getPackageAction(pkg);

    const price = getPackagePrice(pkg);

    const currencyCode =
        selectedCurrencyCode.value ||
        selectedCurrencySymbol.value ||
        '';

    const result = await Swal.fire({
        title: `${action} Package?`,
        html: `
            <div class="text-left">
                <p class="mb-2">
                    <strong>Package:</strong>
                    ${pkg.name}
                </p>

                <p class="mb-2">
                    <strong>Country:</strong>
                    ${selectedCountryName.value || 'N/A'}
                </p>

                <p>
                    <strong>Price:</strong>
                    ${currencyCode}
                    ${formatPrice(price)}
                    / month
                </p>
            </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: `Yes, ${action}`,
        cancelButtonText: 'Cancel',
        reverseButtons: true,
    });

    if (!result.isConfirmed) {
        return;
    }

    /*
     * ==============================================================
     * TODO:
     * Replace this section with your actual Upgrade/Downgrade API.
     * ==============================================================
     *
     * Example payload:
     *
     * const payload = {
     *     subscription_id:
     *         selectedManagementSubscription.value.id,
     *
     *     user_id:
     *         selectedManagementSubscription.value.user_id,
     *
     *     package_id: pkg.id,
     *
     *     country_id: selectedCountryId.value,
     *
     *     price: price,
     * };
     *
     * await auth.fetchProtectedApi(
     *     '/api/management-subscriptions/change-package',
     *     payload,
     *     'PUT'
     * );
     */

    console.log('Selected Package:', pkg);
    console.log('Action:', action);
    console.log('Country ID:', selectedCountryId.value);
    console.log('Country:', selectedCountryName.value);
    console.log('Price:', price);

    Swal.fire({
        title: 'Package Selected',
        text: `${pkg.name} has been selected for ${selectedCountryName.value}.`,
        icon: 'success',
        confirmButtonText: 'OK',
    });

    /*
     * Uncomment when your actual API is ready:
     *
     * await getSubscriptions();
     * closeUpgradeDowngradeModal();
     */
};


/*
|--------------------------------------------------------------------------
| Loading State
|--------------------------------------------------------------------------
*/

const isPackageDataLoading = computed(() => {
    return (
        isLoadingCountries.value ||
        isLoadingPackagePrices.value
    );
});


/*
|--------------------------------------------------------------------------
| On Mounted
|--------------------------------------------------------------------------
*/

onMounted(async () => {
    await Promise.all([
        getManagementPackages(),
        getSubscriptions(),
        fetchUserPriceRate(),
        fetchCurrency(),
        getCountries(),
        getPackagePrices(),
    ]);
});
</script>


<template>
    <div>

        <!-- ========================================================= -->
        <!-- PAGE TITLE -->
        <!-- ========================================================= -->

        <h1 class="mb-6 text-3xl font-semibold">
            Subscription
        </h1>


        <!-- ========================================================= -->
        <!-- SUBSCRIPTION TABLE -->
        <!-- ========================================================= -->

        <div class="overflow-x-auto rounded-lg shadow">

            <table class="min-w-full border border-gray-200 bg-white">

                <thead class="bg-gray-100">

                    <tr>

                        <th
                            class="px-4 py-3 text-left font-medium text-gray-700"
                        >
                            Package Name
                        </th>

                        <th
                            class="px-4 py-3 text-left font-medium text-gray-700"
                        >
                            Started From
                        </th>

                        <th
                            class="px-4 py-3 text-left font-medium text-gray-700"
                        >
                            Subscription Status
                        </th>

                        <th
                            class="px-4 py-3 text-left font-medium text-gray-700"
                        >
                            Upgrade / Downgrade
                        </th>

                    </tr>

                </thead>


                <tbody>

                    <tr
                        v-for="managementSubscription in managementSubscriptions"
                        :key="managementSubscription.id"
                        class="transition hover:bg-gray-50"
                    >

                        <!-- Package -->
                        <td
                            class="border-t px-4 py-3 text-gray-600"
                        >
                            {{
                                managementSubscription
                                    .management_package
                                    ?.name ?? 'N/A'
                            }}
                        </td>


                        <!-- Start Date -->
                        <td
                            class="border-t px-4 py-3 text-gray-600"
                        >
                            {{
                                managementSubscription.start_date
                            }}
                        </td>


                        <!-- Status -->
                        <td class="border-t px-4 py-3">

                            <span
                                :class="
                                    managementSubscription.subscription_status
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                "
                                class="inline-block rounded-full px-3 py-1 text-sm"
                            >
                                {{
                                    managementSubscription.subscription_status
                                        ? 'Active'
                                        : 'Inactive'
                                }}
                            </span>

                        </td>


                        <!-- Upgrade / Downgrade -->
                        <td
                            class="border-t px-4 py-3 text-gray-600"
                        >

                            <button
                                type="button"
                                class="btn sm-btn btn-outer-primary"
                                @click.prevent="
                                    openUpgradeDowngradeModal(
                                        managementSubscription
                                    )
                                "
                            >
                                Upgrade / Downgrade
                            </button>

                        </td>

                    </tr>


                    <!-- Empty -->
                    <tr
                        v-if="!managementSubscriptions.length"
                    >

                        <td
                            colspan="4"
                            class="px-4 py-10 text-center text-gray-500"
                        >
                            No subscription found.
                        </td>

                    </tr>

                </tbody>

            </table>

        </div>



        <!-- ========================================================= -->
        <!-- UPGRADE / DOWNGRADE MODAL -->
        <!-- ========================================================= -->

        <div
            v-if="showUpgradeDowngradeModal"
            class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
            @click.self="closeUpgradeDowngradeModal"
        >

            <div
                class="relative flex max-h-[94vh] w-full max-w-[1500px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            >

                <!-- ================================================= -->
                <!-- MODAL HEADER -->
                <!-- ================================================= -->

                <div
                    class="flex shrink-0 items-center justify-between border-b bg-white px-6 py-4"
                >

                    <div>

                        <h3
                            class="text-xl font-bold text-gray-800"
                        >
                            Upgrade / Downgrade Package
                        </h3>

                        <p
                            class="mt-1 text-sm text-gray-500"
                        >
                            Compare package features and choose
                            the plan that best suits your organization.
                        </p>

                    </div>


                    <button
                        type="button"
                        class="flex h-9 w-9 items-center justify-center rounded-full text-2xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                        @click="closeUpgradeDowngradeModal"
                    >
                        &times;
                    </button>

                </div>


                <!-- ================================================= -->
                <!-- COUNTRY SELECTION -->
                <!-- ================================================= -->

                <div
                    class="shrink-0 border-b bg-gray-50 px-6 py-4"
                >

                    <div
                        class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                    >

                        <div>

                            <label
                                class="mb-1 block text-sm font-semibold text-gray-700"
                            >
                                Select Country
                            </label>

                            <p
                                class="text-xs text-gray-500"
                            >
                                Package price will automatically
                                update according to the selected country.
                            </p>

                        </div>


                        <div
                            class="w-full md:w-80"
                        >

                            <select
                                v-model="selectedCountryId"
                                :disabled="isLoadingCountries"
                                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-100"
                                @change="onCountryChange"
                            >

                                <option
                                    :value="null"
                                >
                                    {{
                                        isLoadingCountries
                                            ? 'Loading countries...'
                                            : 'Select Country'
                                    }}
                                </option>


                                <option
                                    v-for="country in countries"
                                    :key="country.id"
                                    :value="country.id"
                                >
                                    {{ country.name }}
                                </option>

                            </select>

                        </div>

                    </div>

                </div>


                <!-- ================================================= -->
                <!-- LOADING -->
                <!-- ================================================= -->

                <div
                    v-if="isPackageDataLoading"
                    class="flex min-h-[250px] items-center justify-center"
                >

                    <div class="text-center">

                        <div
                            class="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary"
                        ></div>

                        <p
                            class="text-sm text-gray-500"
                        >
                            Loading package pricing...
                        </p>

                    </div>

                </div>


                <!-- ================================================= -->
                <!-- COMPARISON TABLE -->
                <!-- ================================================= -->

                <div
                    v-else
                    class="min-h-0 flex-1 overflow-auto"
                >

                    <div
                        v-if="managementPackages.length"
                        class="min-w-[1100px]"
                    >

                        <div
                            class="grid"
                            :style="{
                                gridTemplateColumns:
                                    `250px repeat(${managementPackages.length}, minmax(210px, 1fr))`
                            }"
                        >

                            <!-- ===================================== -->
                            <!-- TOP LEFT FEATURE TITLE -->
                            <!-- ===================================== -->

                            <div
                                class="sticky left-0 z-30 border-b border-r bg-gray-50 px-5 py-6"
                            >

                                <div
                                    class="text-sm font-bold text-gray-700"
                                >
                                    Package Features
                                </div>

                                <div
                                    class="mt-1 text-xs text-gray-500"
                                >
                                    Compare all features
                                </div>

                            </div>


                            <!-- ===================================== -->
                            <!-- PACKAGE HEADER -->
                            <!-- ===================================== -->

                            <div
                                v-for="pkg in managementPackages"
                                :key="`header-${pkg.id}`"
                                class="relative border-b border-r bg-white px-5 py-5 text-center"
                                :class="{
                                    'bg-primary/[0.03]':
                                        isCurrentPackage(pkg)
                                }"
                            >

                                <!-- Current Badge -->
                                <div
                                    v-if="isCurrentPackage(pkg)"
                                    class="absolute right-3 top-3"
                                >

                                    <span
                                        class="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
                                    >
                                        Current
                                    </span>

                                </div>


                                <!-- Package Name -->
                                <h4
                                    class="pt-1 text-xl font-bold text-gray-800"
                                >
                                    {{ pkg.name }}
                                </h4>


                                <!-- Description -->
                                <p
                                    v-if="pkg.description"
                                    class="mx-auto mt-1 max-w-[190px] text-xs leading-5 text-gray-500"
                                >
                                    {{ pkg.description }}
                                </p>


                                <!-- ================================= -->
                                <!-- PRICE -->
                                <!-- ================================= -->

                                <div
                                    class="mt-5 min-h-[70px]"
                                >

                                    <!-- Country Not Selected -->
                                    <template
                                        v-if="!selectedCountryId"
                                    >

                                        <div
                                            class="text-sm font-medium text-gray-400"
                                        >
                                            Select country
                                        </div>

                                    </template>


                                    <!-- Price Available -->
                                    <template
                                        v-else-if="hasPackagePrice(pkg)"
                                    >

                                        <div
                                            class="flex items-end justify-center gap-1"
                                        >

                                            <span
                                                class="text-sm font-semibold text-gray-500"
                                            >
                                                {{
                                                    selectedCurrencySymbol ||
                                                    selectedCurrencyCode
                                                }}
                                            </span>

                                            <span
                                                class="text-3xl font-bold text-gray-900"
                                            >
                                                {{
                                                    formatPrice(
                                                        getPackagePrice(pkg)
                                                    )
                                                }}
                                            </span>

                                        </div>

                                        <div
                                            class="mt-1 text-xs text-gray-500"
                                        >
                                            Per month
                                        </div>

                                    </template>


                                    <!-- Price Not Available -->
                                    <template
                                        v-else
                                    >

                                        <div
                                            class="text-sm font-semibold text-red-500"
                                        >
                                        <!-- {{packagePrices}} -->
                                            Price unavailable
                                        </div>

                                        <div
                                            class="mt-1 text-xs text-gray-400"
                                        >
                                            No rate for this country
                                        </div>

                                    </template>

                                </div>

                            </div>


                            <!-- ===================================== -->
                            <!-- FEATURE HEADER -->
                            <!-- ===================================== -->

                            <div
                                class="sticky left-0 z-20 border-b border-r bg-gray-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                            >
                                Features
                            </div>


                            <div
                                v-for="pkg in managementPackages"
                                :key="`feature-header-${pkg.id}`"
                                class="border-b border-r bg-gray-50 px-5 py-3 text-center text-xs font-semibold text-gray-500"
                            >
                                Included
                            </div>


                            <!-- ===================================== -->
                            <!-- DYNAMIC FEATURE ROWS -->
                            <!-- ===================================== -->

                            <template
                                v-for="feature in packageFeatures"
                                :key="feature.key"
                            >

                                <!-- Feature Name -->
                                <div
                                    class="sticky left-0 z-10 flex min-h-[52px] items-center border-b border-r bg-white px-5 py-3.5 text-sm text-gray-700"
                                >

                                    <span>
                                        {{ feature.label }}
                                    </span>

                                </div>


                                <!-- Package Feature Value -->
                                <div
                                    v-for="pkg in managementPackages"
                                    :key="`${pkg.id}-${feature.key}`"
                                    class="flex min-h-[52px] items-center justify-center border-b border-r px-5 py-3.5 text-center"
                                    :class="{
                                        'bg-primary/[0.02]':
                                            isCurrentPackage(pkg)
                                    }"
                                >

                                    <!-- Boolean -->
                                    <template
                                        v-if="feature.type === 'boolean'"
                                    >

                                        <span
                                            v-if="
                                                Number(
                                                    pkg[feature.key]
                                                ) === 1
                                            "
                                            class="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-600"
                                        >
                                            ✓
                                        </span>

                                        <span
                                            v-else
                                            class="text-sm text-gray-300"
                                        >
                                            —
                                        </span>

                                    </template>


                                    <!-- Number / Storage -->
                                    <template
                                        v-else
                                    >

                                        <span
                                            class="text-sm font-medium text-gray-700"
                                        >
                                            {{
                                                formatFeatureValue(
                                                    pkg,
                                                    feature
                                                )
                                            }}
                                        </span>

                                    </template>

                                </div>

                            </template>


                            <!-- ===================================== -->
                            <!-- ACTION LABEL -->
                            <!-- ===================================== -->

                            <div
                                class="sticky bottom-0 left-0 z-30 border-r bg-white px-5 py-5"
                            >

                                <div
                                    class="text-sm font-semibold text-gray-700"
                                >
                                    Choose Package
                                </div>

                                <div
                                    class="mt-1 text-xs text-gray-500"
                                >
                                    Select your preferred plan.
                                </div>

                            </div>


                            <!-- ===================================== -->
                            <!-- ACTION BUTTON -->
                            <!-- ===================================== -->

                            <div
                                v-for="pkg in managementPackages"
                                :key="`action-${pkg.id}`"
                                class="sticky bottom-0 z-20 border-r bg-white px-5 py-5"
                                :class="{
                                    'bg-primary/[0.02]':
                                        isCurrentPackage(pkg)
                                }"
                            >

                                <!-- Current -->
                                <button
                                    v-if="isCurrentPackage(pkg)"
                                    type="button"
                                    disabled
                                    class="w-full cursor-not-allowed rounded-lg bg-gray-200 px-4 py-3 text-sm font-semibold text-gray-500"
                                >
                                    Current Plan
                                </button>


                                <!-- Price unavailable -->
                                <button
                                    v-else-if="!hasPackagePrice(pkg)"
                                    type="button"
                                    disabled
                                    class="w-full cursor-not-allowed rounded-lg bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-400"
                                >
                                    Price Unavailable
                                </button>


                                <!-- Upgrade -->
                                <button
                                    v-else-if="
                                        getPackageAction(pkg) ===
                                        'Upgrade'
                                    "
                                    type="button"
                                    class="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                                    @click="changePackage(pkg)"
                                >
                                    Upgrade
                                </button>


                                <!-- Downgrade -->
                                <button
                                    v-else-if="
                                        getPackageAction(pkg) ===
                                        'Downgrade'
                                    "
                                    type="button"
                                    class="w-full rounded-lg border border-primary bg-white px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
                                    @click="changePackage(pkg)"
                                >
                                    Downgrade
                                </button>


                                <!-- Choose -->
                                <button
                                    v-else
                                    type="button"
                                    class="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                                    @click="changePackage(pkg)"
                                >
                                    Choose
                                </button>

                            </div>

                        </div>

                    </div>


                    <!-- ============================================== -->
                    <!-- NO PACKAGE -->
                    <!-- ============================================== -->

                    <div
                        v-else
                        class="flex min-h-[300px] items-center justify-center"
                    >

                        <div class="text-center">

                            <div
                                class="text-gray-400"
                            >
                                No packages available.
                            </div>

                            <p
                                class="mt-1 text-sm text-gray-400"
                            >
                                Please try again later.
                            </p>

                        </div>

                    </div>

                </div>


                <!-- ================================================= -->
                <!-- MODAL FOOTER -->
                <!-- ================================================= -->

                <div
                    class="flex shrink-0 items-center justify-between border-t bg-gray-50 px-6 py-4"
                >

                    <div
                        class="text-xs text-gray-500"
                    >

                        <template v-if="selectedCountryId">

                            Prices shown for
                            <strong>
                                {{ selectedCountryName }}
                            </strong>

                        </template>

                        <template v-else>
                            Select a country to view package prices.
                        </template>

                    </div>


                    <button
                        type="button"
                        class="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                        @click="closeUpgradeDowngradeModal"
                    >
                        Close
                    </button>

                </div>

            </div>

        </div>



        <!-- ========================================================= -->
        <!-- EDIT SUBSCRIPTION MODAL -->
        <!-- ========================================================= -->

        <div
            v-if="isModalOpen"
            class="fixed inset-0 z-[9998] flex items-center justify-center bg-gray-800 bg-opacity-50"
        >

            <div
                class="mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
            >

                <h2
                    class="mb-4 text-center text-xl font-semibold"
                >
                    Edit Subscription
                </h2>


                <p
                    class="mb-6 text-center text-sm text-gray-500"
                >
                    The start date will be set to today by default.
                </p>


                <form
                    @submit.prevent="updateSubscription"
                >

                    <!-- User ID -->
                    <div class="mb-4">

                        <label
                            class="mb-1 block text-sm font-medium text-gray-700"
                        >
                            User ID
                        </label>

                        <input
                            type="text"
                            v-model="user_id"
                            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                            required
                        />

                    </div>


                    <!-- Package ID -->
                    <div class="mb-4">

                        <label
                            class="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Package ID
                        </label>

                        <input
                            type="text"
                            v-model="package_id"
                            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                            required
                        />

                    </div>


                    <!-- End Date -->
                    <div class="mb-4">

                        <label
                            class="mb-1 block text-sm font-medium text-gray-700"
                        >
                            End Date
                        </label>

                        <input
                            type="date"
                            v-model="end_date"
                            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                        />

                    </div>


                    <!-- Status -->
                    <div
                        class="mb-4 flex items-center"
                    >

                        <input
                            type="checkbox"
                            v-model="status"
                            class="form-checkbox rounded border-gray-300 focus:ring-blue-500"
                        />

                        <span
                            class="ml-2 text-sm text-gray-700"
                        >
                            Active
                        </span>

                    </div>


                    <!-- Buttons -->
                    <div
                        class="flex justify-end space-x-2"
                    >

                        <button
                            type="button"
                            @click="closeModal"
                            class="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            class="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                        >
                            Update
                        </button>

                    </div>

                </form>

            </div>

        </div>



        <!-- ========================================================= -->
        <!-- EXISTING DAILY PRICING SECTION -->
        <!-- ========================================================= -->

        <section class="mt-12">

            <h2
                class="mb-4 text-2xl font-semibold"
            >
                Pricing
            </h2>


            <div
                v-if="errorMessage"
                class="mb-4 text-red-500"
            >
                {{ errorMessage }}
            </div>


            <div
                class="overflow-hidden rounded-lg bg-white shadow"
            >

                <table class="min-w-full">

                    <thead class="bg-gray-100">

                        <tr>

                            <th
                                class="px-4 py-3 text-left font-medium text-gray-700"
                            >
                                Rate
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        <tr>

                            <td
                                class="px-4 py-3 text-left text-gray-600"
                            >

                                <span
                                    class="font-bold"
                                >
                                    {{
                                        Array.isArray(currency)
                                            ? currency[0]?.currency_code
                                            : currency?.currency_code
                                    }}

                                    {{ userPriceRate }}
                                </span>

                                <br />

                                <span
                                    class="text-sm"
                                >
                                    Per member per day
                                </span>

                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>

        </section>

    </div>
</template>