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
*/

const countries = ref([]);
const packagePrices = ref([]);

const selectedCountryId = ref(null);
const selectedManagementSubscription = ref(null);

const isLoadingCountries = ref(false);
const isLoadingPackagePrices = ref(false);

/*
|--------------------------------------------------------------------------
| Country Wise Region & Currency
|--------------------------------------------------------------------------
|
| API:
| GET /api/country-regions/country/{country_id}
|
| Response:
|
| {
|     status: true,
|     data: [
|         {
|             region_id: 1,
|             region_name: "BD",
|             currency_id: 1,
|             currency_name: "BDT",
|             currency_code: "BDT",
|             currency_symbol: "৳"
|         }
|     ]
| }
|
|--------------------------------------------------------------------------
*/

const countryWiseRegionWithCurrency = ref([]);

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
    // alert('ok');
    const payload = {
        user_id: user_id.value,
        management_package_id: package_id.value,
        end_date: end_date.value,
        is_active: status.value,
        start_date: new Date().toISOString().slice(0, 10),
    };
    
    // console.log('Updating subscription with payload:', payload);

    try {
        const response = await auth.fetchProtectedApi(
            `/api/management-subscriptions/${subscription_id.value}`,
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
| Country API
|--------------------------------------------------------------------------
*/

const getCountries = async () => {
    isLoadingCountries.value = true;

    try {
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
| Package Price API
|--------------------------------------------------------------------------
*/

const getPackagePrices = async () => {
    isLoadingPackagePrices.value = true;

    try {
        const response = await auth.fetchProtectedApi(
            '/api/management-subscriptions/management-package-prices',
            {},
            'GET'
        );

        if (response.status) {
            packagePrices.value =
                response.package_prices ??
                response.data ??
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

/*
|--------------------------------------------------------------------------
| Country Wise Region With Currency
|--------------------------------------------------------------------------
*/

const onCountryChange = async () => {
    const countryId = selectedCountryId.value;

    // console.log('Selected Country ID:', countryId);

    /*
    |--------------------------------------------------------------------------
    | Reset previous region/currency data
    |--------------------------------------------------------------------------
    */

    countryWiseRegionWithCurrency.value = [];

    if (!countryId) {
        console.warn('No country selected');
        return;
    }

    try {
        const response = await auth.fetchProtectedApi(
            `/api/country-regions/country/${countryId}`,
            {},
            'GET'
        );

        if (response.status === true) {

            countryWiseRegionWithCurrency.value =
                response.data ?? [];

            console.log(
                'Country region data:',
                countryWiseRegionWithCurrency.value
            );

        } else {

            countryWiseRegionWithCurrency.value = [];

            console.error(
                'Failed to fetch country region data:',
                response?.message ??
                response?.data?.message ??
                'Unknown error'
            );
        }

    } catch (error) {

        countryWiseRegionWithCurrency.value = [];

        console.error(
            'Error fetching country region data:',
            error
        );

        console.error(
            'Server Error:',
            error?.response?.data
        );
    }
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
| Selected Country Name
|--------------------------------------------------------------------------
*/

const selectedCountryName = computed(() => {
    return selectedCountry.value?.name ?? '';
});

/*
|--------------------------------------------------------------------------
| Selected Region
|--------------------------------------------------------------------------
|
| Normally one region is returned for a country.
|
| If multiple regions are returned, first region is used
| unless later you add region selection.
|--------------------------------------------------------------------------
*/

const selectedCountryRegion = computed(() => {

    if (!countryWiseRegionWithCurrency.value.length) {
        return null;
    }

    return countryWiseRegionWithCurrency.value[0] ?? null;
});

/*
|--------------------------------------------------------------------------
| Selected Region ID
|--------------------------------------------------------------------------
*/

const selectedRegionId = computed(() => {

    return (
        selectedCountryRegion.value?.region_id ??
        selectedCountryRegion.value?.country_region_id ??
        null
    );
});

/*
|--------------------------------------------------------------------------
| Selected Region Name
|--------------------------------------------------------------------------
*/

const selectedRegionName = computed(() => {

    return (
        selectedCountryRegion.value?.region_name ??
        ''
    );
});

/*
|--------------------------------------------------------------------------
| Selected Currency Code
|--------------------------------------------------------------------------
|
| Now currency comes from Country Region API.
|--------------------------------------------------------------------------
*/

const selectedCurrencyCode = computed(() => {

    return (
        selectedCountryRegion.value?.currency_code ??
        ''
    );
});

/*
|--------------------------------------------------------------------------
| Selected Currency Name
|--------------------------------------------------------------------------
*/

const selectedCurrencyName = computed(() => {

    return (
        selectedCountryRegion.value?.currency_name ??
        ''
    );
});

/*
|--------------------------------------------------------------------------
| Selected Currency Symbol
|--------------------------------------------------------------------------
*/

const selectedCurrencySymbol = computed(() => {

    return (
        selectedCountryRegion.value?.currency_symbol ??
        ''
    );
});

/*
|--------------------------------------------------------------------------
| Package Feature Configuration
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

    selectedManagementSubscription.value =
        subscription;

    selectedCountryId.value =
        subscription?.country_id ??
        subscription?.countryId ??
        null;

    showUpgradeDowngradeModal.value = true;

    /*
    |--------------------------------------------------------------------------
    | Load Countries
    |--------------------------------------------------------------------------
    */

    if (!countries.value.length) {
        await getCountries();
    }

    /*
    |--------------------------------------------------------------------------
    | Load Package Prices
    |--------------------------------------------------------------------------
    */

    if (!packagePrices.value.length) {
        await getPackagePrices();
    }

    /*
    |--------------------------------------------------------------------------
    | Select First Country If Nothing Selected
    |--------------------------------------------------------------------------
    */

    if (
        !selectedCountryId.value &&
        countries.value.length
    ) {
        selectedCountryId.value =
            countries.value[0].id;
    }

    /*
    |--------------------------------------------------------------------------
    | Load Country Region + Currency
    |--------------------------------------------------------------------------
    */

    if (selectedCountryId.value) {
        await onCountryChange();
    }
};

/*
|--------------------------------------------------------------------------
| Close Upgrade / Downgrade Modal
|--------------------------------------------------------------------------
*/

const closeUpgradeDowngradeModal = () => {

    showUpgradeDowngradeModal.value = false;

    selectedManagementSubscription.value =
        null;

    selectedCountryId.value = null;

    countryWiseRegionWithCurrency.value = [];
};

/*
|--------------------------------------------------------------------------
| Find Package Price Record
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| Previous code:
|
| Number(item.region_id) === 1
|
| was hard-coded.
|
| Now selectedRegionId.value is used.
|--------------------------------------------------------------------------
*/

const getPackagePriceRecord = (pkg) => {

    if (
        !pkg ||
        !selectedCountryId.value ||
        !selectedRegionId.value
    ) {
        return null;
    }

    return (
        packagePrices.value.find(
            item => {

                const packageId =
                    item.management_package_id ??
                    item.package_id;

                const regionId =
                    item.region_id ??
                    item.country_region_id;

                const countryId =
                    item.country_id;

                /*
                |--------------------------------------------------------------------------
                | Match Package
                |--------------------------------------------------------------------------
                */

                const packageMatches =
                    Number(packageId) ===
                    Number(pkg.id);

                /*
                |--------------------------------------------------------------------------
                | Match Region
                |--------------------------------------------------------------------------
                */

                const regionMatches =
                    Number(regionId) ===
                    Number(selectedRegionId.value);

                /*
                |--------------------------------------------------------------------------
                | If package price API has country_id,
                | also match country.
                |--------------------------------------------------------------------------
                */

                const countryMatches =
                    countryId === undefined ||
                    countryId === null ||
                    Number(countryId) ===
                    Number(selectedCountryId.value);

                return (
                    packageMatches &&
                    regionMatches &&
                    countryMatches
                );
            }
        ) ?? null
    );
};

/*
|--------------------------------------------------------------------------
| Get Package Price
|--------------------------------------------------------------------------
*/

const getPackagePrice = (pkg) => {

    const priceRecord =
        getPackagePriceRecord(pkg);

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

    return (
        getPackagePriceRecord(pkg) !== null
    );
};

/*
|--------------------------------------------------------------------------
| Format Price
|--------------------------------------------------------------------------
*/

const formatPrice = (price) => {

    if (
        price === null ||
        price === undefined
    ) {
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

    const value =
        pkg?.[feature.key];

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

    if (
        !selectedManagementSubscription.value
    ) {
        return false;
    }

    return (
        Number(
            selectedManagementSubscription.value
                .package_id
        ) === Number(pkg.id)
    );
};

/*
|--------------------------------------------------------------------------
| Package Order
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

    if (
        !selectedManagementSubscription.value
    ) {
        return null;
    }

    return (
        managementPackages.value.find(
            pkg =>
                Number(pkg.id) ===
                Number(
                    selectedManagementSubscription.value
                        .package_id
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

    if (
        !selectedManagementSubscription.value
    ) {
        return 'Choose';
    }

    if (isCurrentPackage(pkg)) {
        return 'Current Plan';
    }

    const currentPkg =
        currentPackage.value;

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

    if (!selectedRegionId.value) {
        return false;
    }

    if (!hasPackagePrice(pkg)) {
        return false;
    }

    return true;
};

/*
|--------------------------------------------------------------------------
| Change Package
|--------------------------------------------------------------------------
*/


const changePackage = async (pkg) => {
    if (!canSelectPackage(pkg)) {
        return;
    }

    const subscription =
        selectedManagementSubscription.value;

    if (!subscription?.id) {
        await Swal.fire({
            title: 'Error',
            text: 'Subscription information was not found.',
            icon: 'error',
            confirmButtonText: 'OK',
            target: document.body,
            heightAuto: false,
            didOpen: () => {
                const container = Swal.getContainer();

                if (container) {
                    container.style.setProperty(
                        'z-index',
                        '999999',
                        'important'
                    );
                }
            },
        });

        return;
    }

    const action = getPackageAction(pkg);
    const price = getPackagePrice(pkg);

    const currencyText =
        selectedCurrencySymbol.value ||
        selectedCurrencyCode.value ||
        '';

    /*
     * ---------------------------------------------------------
     * IMPORTANT:
     * Hide Upgrade/Downgrade modal before SweetAlert opens.
     * This guarantees SweetAlert is above the modal.
     * ---------------------------------------------------------
     */
    const wasUpgradeDowngradeModalOpen =
        showUpgradeDowngradeModal.value;

    showUpgradeDowngradeModal.value = false;

    /*
     * ---------------------------------------------------------
     * Confirmation Modal
     * ---------------------------------------------------------
     */
    const result = await Swal.fire({
        title: `${action} Package?`,

        html: `
            <div style="
                text-align: left;
                line-height: 1.8;
                font-size: 15px;
            ">
                <div style="margin-bottom: 8px;">
                    <strong>Package:</strong>
                    ${pkg.name ?? 'N/A'}
                </div>

                <div style="margin-bottom: 8px;">
                    <strong>Country:</strong>
                    ${selectedCountryName.value || 'N/A'}
                </div>

                <div style="margin-bottom: 8px;">
                    <strong>Region:</strong>
                    ${selectedRegionName.value || 'N/A'}
                </div>

                <div style="margin-bottom: 8px;">
                    <strong>Currency:</strong>
                    ${
                        selectedCurrencyCode.value ||
                        selectedCurrencyName.value ||
                        'N/A'
                    }
                </div>

                <div>
                    <strong>Price:</strong>
                    ${currencyText}${formatPrice(price)}
                    / month
                </div>
            </div>
        `,

        icon: 'question',

        showCancelButton: true,

        confirmButtonText: `Yes, ${action}`,

        cancelButtonText: 'Cancel',

        reverseButtons: true,

        allowOutsideClick: false,

        allowEscapeKey: false,

        target: document.body,

        heightAuto: false,

        focusConfirm: true,

        /*
         * SweetAlert container-এর z-index
         */
        didOpen: () => {
            const container = Swal.getContainer();

            if (container) {
                container.style.setProperty(
                    'z-index',
                    '999999',
                    'important'
                );
            }

            const popup = Swal.getPopup();

            if (popup) {
                popup.style.setProperty(
                    'z-index',
                    '1000000',
                    'important'
                );
            }
        },
    });

    /*
     * ---------------------------------------------------------
     * Cancel করলে Upgrade/Downgrade modal আবার দেখাবে
     * ---------------------------------------------------------
     */
    if (!result.isConfirmed) {
        if (wasUpgradeDowngradeModalOpen) {
            showUpgradeDowngradeModal.value = true;
        }

        return;
    }

    /*
     * ---------------------------------------------------------
     * Selected package data
     * ---------------------------------------------------------
     */
    subscription_id.value = subscription.id;

    user_id.value = subscription.user_id ?? subscription.user?.id ?? '';

    package_id.value = pkg.id;

    end_date.value = subscription.end_date ?? '';

    status.value = subscription.is_active ?? true;

    // console.log('Changing package:', {
    //     subscription_id: subscription_id.value,
    //     user_id: user_id.value,
    //     old_package_id: subscription.package_id,
    //     new_package_id: package_id.value,
    //     country_id: selectedCountryId.value,
    //     country: selectedCountryName.value,
    //     region_id: selectedRegionId.value,
    //     region: selectedRegionName.value,
    //     currency: selectedCurrencyCode.value,
    //     price,
    //     action,
    // });

    /*
     * ---------------------------------------------------------
     * Actual API Update
     * ---------------------------------------------------------
     */
    const updated = await updateSubscription();

    /*
     * ---------------------------------------------------------
     * Update successful
     * ---------------------------------------------------------
     */
    if (updated) {
        closeUpgradeDowngradeModal();
    } else {
        /*
         * API failed হলে main modal আবার দেখাবে
         */
        showUpgradeDowngradeModal.value = true;
    }
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

                        <th class="px-4 py-3 text-left font-medium text-gray-700">
                            Package Name
                        </th>

                        <th class="px-4 py-3 text-left font-medium text-gray-700">
                            Started From
                        </th>

                        <th class="px-4 py-3 text-left font-medium text-gray-700">
                            Subscription Status
                        </th>

                        <th class="px-4 py-3 text-left font-medium text-gray-700">
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

                        <td class="border-t px-4 py-3 text-gray-600">

                            {{
                                managementSubscription
                                    .management_package
                                    ?.name ?? 'N/A'
                            }}

                        </td>


                        <!-- Start Date -->

                        <td class="border-t px-4 py-3 text-gray-600">

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
                                    managementSubscription.is_active
                                        ? 'Active'
                                        : 'Inactive'
                                }}

                            </span>

                        </td>


                        <!-- Upgrade / Downgrade -->

                        <td class="border-t px-4 py-3 text-gray-600">

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

                    <tr v-if="!managementSubscriptions.length">

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

                        <h3 class="text-xl font-bold text-gray-800">
                            Upgrade / Downgrade Package
                        </h3>

                        <p class="mt-1 text-sm text-gray-500">
                            Compare package features and choose
                            the plan that best suits your organization.
                        </p>

                    </div>


                    <!-- Close -->

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

                        <!-- Country Information -->

                        <div>

                            <label
                                class="mb-1 block text-sm font-semibold text-gray-700"
                            >
                                Select Country
                            </label>

                            <p class="text-xs text-gray-500">
                                Package price will automatically
                                update according to the selected country.
                            </p>

                        </div>


                        <!-- Country Select -->

                        <div class="w-full md:w-80">

                            <select
                                v-model="selectedCountryId"
                                :disabled="isLoadingCountries"
                                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-100"
                                @change="onCountryChange"
                            >

                                <option :value="null">

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


                    <!-- ================================================= -->
                    <!-- SELECTED COUNTRY / REGION / CURRENCY INFO -->
                    <!-- ================================================= -->

                    <div
                        v-if="selectedCountryId"
                        class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3"
                    >

                        <!-- Country -->

                        <div
                            class="rounded-lg border border-gray-200 bg-white px-4 py-3"
                        >

                            <div class="text-xs font-medium uppercase tracking-wide text-gray-400">
                                Country
                            </div>

                            <div class="mt-1 text-sm font-semibold text-gray-800">
                                {{ selectedCountryName || 'N/A' }}
                            </div>

                        </div>


                        <!-- Region -->

                        <div
                            class="rounded-lg border border-gray-200 bg-white px-4 py-3"
                        >

                            <div class="text-xs font-medium uppercase tracking-wide text-gray-400">
                                Region
                            </div>

                            <div class="mt-1 text-sm font-semibold text-gray-800">

                                <template v-if="selectedRegionId">

                                    {{ selectedRegionName || 'N/A' }}

                                </template>

                                <template v-else>

                                    <span class="text-gray-400">
                                        Loading...
                                    </span>

                                </template>

                            </div>

                        </div>


                        <!-- Currency -->

                        <div
                            class="rounded-lg border border-gray-200 bg-white px-4 py-3"
                        >

                            <div class="text-xs font-medium uppercase tracking-wide text-gray-400">
                                Currency
                            </div>

                            <div class="mt-1 text-sm font-semibold text-gray-800">

                                <template v-if="selectedCurrencyCode">

                                    <span>
                                        {{
                                            selectedCurrencySymbol
                                        }}
                                    </span>

                                    <span class="ml-1">
                                        {{
                                            selectedCurrencyCode
                                        }}
                                    </span>

                                    <span
                                        v-if="selectedCurrencyName"
                                        class="ml-1 text-xs font-normal text-gray-500"
                                    >
                                        ({{ selectedCurrencyName }})
                                    </span>

                                </template>

                                <template v-else>

                                    <span class="text-gray-400">
                                        Loading...
                                    </span>

                                </template>

                            </div>

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
                        >
                        </div>

                        <p class="text-sm text-gray-500">
                            Loading package pricing...
                        </p>

                    </div>

                </div>


                <!-- ================================================= -->
                <!-- COUNTRY REGION LOADING -->
                <!-- ================================================= -->

                <div
                    v-else-if="
                        selectedCountryId &&
                        !selectedRegionId
                    "
                    class="flex min-h-[250px] items-center justify-center"
                >

                    <div class="text-center">

                        <div
                            class="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary"
                        >
                        </div>

                        <p class="text-sm text-gray-500">
                            Loading country region and currency...
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

                                <div class="text-sm font-bold text-gray-700">
                                    Package Features
                                </div>

                                <div class="mt-1 text-xs text-gray-500">
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

                                <div class="mt-5 min-h-[70px]">

                                    <!-- Country Not Selected -->

                                    <template v-if="!selectedCountryId">

                                        <div
                                            class="text-sm font-medium text-gray-400"
                                        >
                                            Select country
                                        </div>

                                    </template>


                                    <!-- Region Loading -->

                                    <template
                                        v-else-if="!selectedRegionId"
                                    >

                                        <div
                                            class="text-sm font-medium text-gray-400"
                                        >
                                            Loading region...
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

                                    <template v-else>

                                        <div
                                            class="text-sm font-semibold text-red-500"
                                        >
                                            Price unavailable
                                        </div>

                                        <div
                                            class="mt-1 text-xs text-gray-400"
                                        >
                                            No rate for this region
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
                                        v-if="
                                            feature.type === 'boolean'
                                        "
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

                                    <template v-else>

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


                                <!-- Country / Region Not Selected -->

                                <button
                                    v-else-if="
                                        !selectedCountryId ||
                                        !selectedRegionId
                                    "
                                    type="button"
                                    disabled
                                    class="w-full cursor-not-allowed rounded-lg bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-400"
                                >
                                    Select Country
                                </button>


                                <!-- Price unavailable -->

                                <button
                                    v-else-if="
                                        !hasPackagePrice(pkg)
                                    "
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
                                    class="w-full rounded-lg btn btn-primary bg-primary px-4 py-3 text-sm font-semibold text-dark transition hover:opacity-90"
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

                            <div class="text-gray-400">
                                No packages available.
                            </div>

                            <p class="mt-1 text-sm text-gray-400">
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

                    <div class="text-xs text-gray-500">

                        <template v-if="selectedCountryId">

                            Prices shown for

                            <strong>
                                {{ selectedCountryName }}
                            </strong>

                            <template v-if="selectedRegionName">

                                <span class="mx-1">
                                    /
                                </span>

                                Region:

                                <strong>
                                    {{ selectedRegionName }}
                                </strong>

                            </template>

                            <template v-if="selectedCurrencyCode">

                                <span class="mx-1">
                                    /
                                </span>

                                Currency:

                                <strong>
                                    {{
                                        selectedCurrencySymbol
                                    }}
                                    {{
                                        selectedCurrencyCode
                                    }}
                                </strong>

                            </template>

                        </template>


                        <template v-else>

                            Select a country to view package prices.

                        </template>

                    </div>


                    <!-- Close -->

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

                    <div class="mb-4 flex items-center">

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

                    <div class="flex justify-end space-x-2">

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

            <h2 class="mb-4 text-2xl font-semibold">
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

                                <span class="font-bold">

                                    {{
                                        Array.isArray(currency)
                                            ? currency[0]?.currency_code
                                            : currency?.currency_code
                                    }}

                                    {{ userPriceRate }}

                                </span>

                                <br />

                                <span class="text-sm">
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