import SuperadminDashboardLayout from "../views/SuperAdmin/Layouts/Layout.vue";
import SuperadminDashboardIndex from "../views/SuperAdmin/Layouts/Dashboard/Index.vue";
import SuperAdminProfileUpdate from "../views/SuperAdmin/Profile/SuperAdminProfileUpdate.vue";

//SuperAdmin Master Setting
import Country from "../views/SuperAdmin/MasterSetting/Country.vue";
import Region from "../views/SuperAdmin/MasterSetting/Region.vue";
import RegionCurrency from "../views/SuperAdmin/MasterSetting/RegionCurrency.vue";
import CountryRegion from "../views/SuperAdmin/MasterSetting/CountryRegion.vue";
import UserCountry from "../views/SuperAdmin/MasterSetting/UserCountry.vue";
import DialingCode from "../views/SuperAdmin/MasterSetting/DialingCode.vue";
import AttendanceType from "../views/SuperAdmin/MasterSetting/AttendanceType.vue";
import ConductType from "../views/SuperAdmin/MasterSetting/ConductType.vue";
import MembershipType from "../views/SuperAdmin/MasterSetting/MembershipType.vue";
import MembershipRenewalCycle from "../views/SuperAdmin/MasterSetting/MembershipRenewalCycle.vue";
import Designation from "../views/SuperAdmin/MasterSetting/Designation.vue";
import Language from "../views/SuperAdmin/MasterSetting/Language.vue";
import TimeZoneSetup from "../views/SuperAdmin/MasterSetting/TimeZoneSetup.vue";
import PrivacySetup from "../views/SuperAdmin/MasterSetting/PrivacySetup.vue";
import RegionalTaxRate from "../views/SuperAdmin/MasterSetting/RegionalTaxRate.vue";

//Currency
import IndexCurrency from "../views/SuperAdmin/Financial/Currency/Index.vue";
//Package
import IndexPackage from "../views/SuperAdmin/Financial/Package/Index.vue";
import EditPackage from "../views/SuperAdmin/Financial/Package/Edit.vue";
import ViewPackage from "../views/SuperAdmin/Financial/Package/View.vue";
//Price
import EditPrice from "../views/SuperAdmin/Financial/Price/Edit.vue";
import IndexPrice from "../views/SuperAdmin/Financial/Price/Index.vue";
import ViewPrice from "../views/SuperAdmin/Financial/Price/View.vue";

//Subscription
import EditSubscription from "../views/SuperAdmin/Financial/Subscription/Edit.vue";
//import IndexSubscription from "../views/SuperAdmin/Financial/Subscription/Index.vue";
import ViewSubscription from "../views/SuperAdmin/Financial/Subscription/View.vue";
import SuperAdminSubscriptionList from "../views/SuperAdmin/Financial/Subscription/Index.vue";

//UserPrice
import UserPriceRate from "../views/SuperAdmin/Financial/UserPriceRate/Index.vue";

//Billing
import SuperAdminBillingList from "../views/SuperAdmin/Financial/Billing/Index.vue";
import SuperAdminBillingCreate from "../views/SuperAdmin/Financial/Billing/Create.vue";
import SuperAdminBillingEdit from "../views/SuperAdmin/Financial/Billing/Edit.vue";
import SuperAdminBillingView from "../views/SuperAdmin/Financial/Billing/View.vue";

//Everyday member count and billing
import SuperAdminEverydayMemberCountAndBillingList from "../views/SuperAdmin/Financial/EverydayMemberCountAndBilling/Index.vue";
import SuperAdminEverydayMemberCountAndBillingCreate from "../views/SuperAdmin/Financial/EverydayMemberCountAndBilling/Create.vue";
import SuperAdminEverydayMemberCountAndBillingEdit from "../views/SuperAdmin/Financial/EverydayMemberCountAndBilling/Edit.vue";
import SuperAdminEverydayMemberCountAndBillingView from "../views/SuperAdmin/Financial/EverydayMemberCountAndBilling/View.vue";

// EverydayStorageBilling
import SuperAdminEverydayStorageBillingList from "../views/SuperAdmin/Financial/EverydayStorageBilling/Index.vue";
import SuperAdminEverydayStorageBillingCreate from "../views/SuperAdmin/Financial/EverydayStorageBilling/Create.vue";
import SuperAdminEverydayStorageBillingEdit from "../views/SuperAdmin/Financial/EverydayStorageBilling/Edit.vue";
import SuperAdminEverydayStorageBillingView from "../views/SuperAdmin/Financial/EverydayStorageBilling/View.vue";

//ManagementAndStorageBilling
import SuperAdminManagementAndStorageBillingList from "../views/SuperAdmin/Financial/ManagementAndStorageBilling/Index.vue";
import SuperAdminManagementAndStorageBillingCreate from "../views/SuperAdmin/Financial/ManagementAndStorageBilling/Create.vue";
import SuperAdminManagementAndStorageBillingEdit from "../views/SuperAdmin/Financial/ManagementAndStorageBilling/Edit.vue";
import SuperAdminManagementAndStorageBillingView from "../views/SuperAdmin/Financial/ManagementAndStorageBilling/View.vue";

//Invoice
import SuperAdminInvoiceList from "../views/SuperAdmin/Financial/Invoice/Index.vue";
import SuperAdminInvoiceCreate from "../views/SuperAdmin/Financial/Invoice/Create.vue";
import SuperAdminInvoiceEdit from "../views/SuperAdmin/Financial/Invoice/Edit.vue";
import SuperAdminInvoiceView from "../views/SuperAdmin/Financial/Invoice/View.vue";

//Receipt
import SuperAdminReceiptList from "@/views/SuperAdmin/Financial/Receipt/Index.vue";
import SuperAdminReceiptCreate from "@/views/SuperAdmin/Financial/Receipt/Create.vue";
import SuperAdminReceiptEdit from "@/views/SuperAdmin/Financial/Receipt/Edit.vue";
import SuperAdminReceiptView from "@/views/SuperAdmin/Financial/Receipt/View.vue";

//Payment Log
import SuperAdminPaymentLog from "../views/SuperAdmin/Financial/PaymentLog/Index.vue";
import SuperAdminPaymentLogList from "../views/SuperAdmin/Financial/PaymentLog/Index.vue";
import SuperAdminPaymentLogCreate from "../views/SuperAdmin/Financial/PaymentLog/Create.vue";
import SuperAdminPaymentLogEdit from "../views/SuperAdmin/Financial/PaymentLog/Edit.vue";
import SuperAdminPaymentLogView from "../views/SuperAdmin/Financial/PaymentLog/View.vue";

//SuperAdmin E-commerce Setting
import IndexBusinessType from "../views/SuperAdmin/E-commerce/BusinessType.vue";
import IndexCategory from "../views/SuperAdmin/E-commerce/Category.vue";
import IndexSubCategory from "../views/SuperAdmin/E-commerce/SubCategory.vue";
import IndexSubSubCategory from "../views/SuperAdmin/E-commerce/SubSubCategory.vue";
import IndexBrand from "../views/SuperAdmin/E-commerce/Brand.vue";

import ProductList from "../views/SuperAdmin/E-commerce/product/Index.vue";
import ProductCreate from "../views/SuperAdmin/E-commerce/product/Create.vue";
import ProductEdit from "../views/SuperAdmin/E-commerce/product/Edit.vue";
import ProductView from "../views/SuperAdmin/E-commerce/product/View.vue";

import OrderList from "../views/SuperAdmin/E-commerce/order/Index.vue";
import OrderCreate from "../views/SuperAdmin/E-commerce/order/Create.vue";
import OrderEdit from "../views/SuperAdmin/E-commerce/order/Edit.vue";
import OrderView from "../views/SuperAdmin/E-commerce/order/View.vue";


const superadminRoutes = [
    {
        path: "/superadmin-dashboard",
        name: "superadmin-dashboard",
        component: SuperadminDashboardLayout,
        meta: {
            requiresAuth: true,
            type: 'superadmin',
        },
        children: [
            {
                path: "index",
                name: "superadmin-dashboard-index",
                component: SuperadminDashboardIndex,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-profile-update",
                name: "super-admin-profile-update",
                component: SuperAdminProfileUpdate,
                meta: { requiresAuth: true },
            },
            {
                path: "country",
                name: "country",
                component: Country,
                meta: { requiresAuth: true },
            },
            {
                path: "region",
                name: "region",
                component: Region,
                meta: { requiresAuth: true },
            },
            {
                path: "region-currency",
                name: "region-currency",
                component: RegionCurrency,
                meta: { requiresAuth: true },
            },
            {
                path: "country-region",
                name: "country-region",
                component: CountryRegion,
                meta: { requiresAuth: true },
            },
            {
                path: "user-country",
                name: "user-country",
                component: UserCountry,
                meta: { requiresAuth: true },
            },
            {
                path: "dialing-code",
                name: "dialing-code",
                component: DialingCode,
                meta: { requiresAuth: true },
            },
            {
                path: "conduct-type",
                name: "conduct-type",
                component: ConductType,
                meta: { requiresAuth: true },
            },
            {
                path: "attendance-type",
                name: "attendance-type",
                component: AttendanceType,
                meta: { requiresAuth: true },
            },
            {
                path: "membership-type",
                name: "membership-type",
                component: MembershipType,
                meta: { requiresAuth: true },
            },
            {
                path: "membership-renewal-cycle",
                name: "membership-renewal-cycle",
                component: MembershipRenewalCycle,
                meta: { requiresAuth: true },
            },
            {
                path: "designation",
                name: "designation",
                component: Designation,
                meta: { requiresAuth: true },
            },
            {
                path: "language",
                name: "language",
                component: Language,
                meta: { requiresAuth: true },
            },
            {
                path: "time-zone-setup",
                name: "time-zone-setup",
                component: TimeZoneSetup,
                meta: { requiresAuth: true },
            },
            {
                path: "privacy-setup",
                name: "privacy-setup",
                component: PrivacySetup,
                meta: { requiresAuth: true },
            },
            {
                path: "regional-tax-rate",
                name: "regional-tax-rate",
                component: RegionalTaxRate,
                meta: { requiresAuth: true },
            },
            {
                path: "index-currency",
                name: "index-currency",
                component: IndexCurrency,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-packages",
                name: "super-admin-packages",
                component: IndexPackage,
                meta: { requiresAuth: true },
            },
            {
                path: "edit-package",
                name: "edit-package",
                component: EditPackage,
                meta: { requiresAuth: true },
            },
            {
                path: "view-package",
                name: "view-package",
                component: ViewPackage,
                meta: { requiresAuth: true },
            },
            {
                path: "edit-price",
                name: "edit-price",
                component: EditPrice,
                meta: { requiresAuth: true },
            },
            {
                path: "index-price",
                name: "index-price",
                component: IndexPrice,
                meta: { requiresAuth: true },
            },
            {
                path: "view-price",
                name: "view-price",
                component: ViewPrice,
                meta: { requiresAuth: true },
            },
           
            {
                path: "edit-subscription",
                name: "edit-subscription",
                component: EditSubscription,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-subscription-list",
                name: "super-admin-subscription-list",
                component: SuperAdminSubscriptionList,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-view-subscription",
                name: "super-admin-view-subscription",
                component: ViewSubscription,
                meta: { requiresAuth: true },
            },
            {
                path: "user-price-rate",
                name: "user-price-rate",
                component: UserPriceRate,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-billing-list",
                name: "super-admin-billing-list",
                component: SuperAdminBillingList,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-billing-create",
                name: "super-admin-billing-create",
                component: SuperAdminBillingCreate,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-billing-edit/:id",
                name: "super-admin-billing-edit",
                component: SuperAdminBillingEdit,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-billing-view/:id",
                name: "super-admin-billing-view",
                component: SuperAdminBillingView,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-every-day-member-count-and-bill-list",
                name: "super-admin-every-day-member-count-and-bill-list",
                component: SuperAdminEverydayMemberCountAndBillingList,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-every-day-member-count-and-bill-create",
                name: "super-admin-every-day-member-count-and-bill-create",
                component: SuperAdminEverydayMemberCountAndBillingCreate,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-every-day-member-count-and-bill-edit/:id",
                name: "super-admin-every-day-member-count-and-bill-edit",
                component: SuperAdminEverydayMemberCountAndBillingEdit,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-every-day-member-count-and-bill-view/:id",
                name: "super-admin-every-day-member-count-and-bill-view",
                component: SuperAdminEverydayMemberCountAndBillingView,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-everyday-storage-billing-list",
                name: "super-admin-everyday-storage-billing-list",
                component: SuperAdminEverydayStorageBillingList,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-everyday-storage-billing-create",
                name: "super-admin-everyday-storage-billing-create",
                component: SuperAdminEverydayStorageBillingCreate,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-everyday-storage-billing-edit/:id",
                name: "super-admin-everyday-storage-billing-edit",
                component: SuperAdminEverydayStorageBillingEdit,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-everyday-storage-billing-view/:id",
                name: "super-admin-everyday-storage-billing-view",
                component: SuperAdminEverydayStorageBillingView,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-management-and-storage-billing-list",
                name: "super-admin-management-and-storage-billing-list",
                component: SuperAdminManagementAndStorageBillingList,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-management-and-storage-billing-create",
                name: "super-admin-management-and-storage-billing-create",
                component: SuperAdminManagementAndStorageBillingCreate,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-management-and-storage-billing-edit/:id",
                name: "super-admin-management-and-storage-billing-edit",
                component: SuperAdminManagementAndStorageBillingEdit,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-management-and-storage-billing-view/:id",
                name: "super-admin-management-and-storage-billing-view",
                component: SuperAdminManagementAndStorageBillingView,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-invoice-list",
                name: "super-admin-invoice-list",
                component: SuperAdminInvoiceList,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-invoice-create",
                name: "super-admin-invoice-create",
                component: SuperAdminInvoiceCreate,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-invoice-edit/:id",
                name: "super-admin-invoice-edit",
                component: SuperAdminInvoiceEdit,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-invoice-view/:id",
                name: "super-admin-invoice-view",
                component: SuperAdminInvoiceView,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-receipt-list",
                name: "super-admin-receipt-list",
                component: SuperAdminReceiptList,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-receipt-create",
                name: "super-admin-receipt-create",
                component: SuperAdminReceiptCreate,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-receipt-edit/:id",
                name: "super-admin-receipt-edit",
                component: SuperAdminReceiptEdit,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-receipt-view/:id",
                name: "super-admin-receipt-view",
                component: SuperAdminReceiptView,
                meta: { requiresAuth: true },
            },

            {
                path: "super-admin-payment-log",
                name: "super-admin-payment-log",
                component: SuperAdminPaymentLog,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-payment-log-list",
                name: "super-admin-payment-log-list",
                component: SuperAdminPaymentLogList,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-payment-log-create",
                name: "super-admin-payment-log-create",
                component: SuperAdminPaymentLogCreate,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-payment-log-edit/:id",
                name: "super-admin-payment-log-edit",
                component: SuperAdminPaymentLogEdit,
                meta: { requiresAuth: true },
            },
            {
                path: "super-admin-payment-log-view/:id",
                name: "super-admin-payment-log-view",
                component: SuperAdminPaymentLogView,
                meta: { requiresAuth: true },
            },
            
            {
                path: "index-business-type",
                name: "index-business-type",
                component: IndexBusinessType,
                meta: { requiresAuth: true },
            },
            {
                path: "index-category",
                name: "index-category",
                component: IndexCategory,
                meta: { requiresAuth: true },
            },
            {
                path: "index-sub-category",
                name: "index-sub-category",
                component: IndexSubCategory,
                meta: { requiresAuth: true },
            },
            {
                path: "index-sub-sub-category",
                name: "index-sub-sub-category",
                component: IndexSubSubCategory,
                meta: { requiresAuth: true },
            },
            {
                path: "index-brand",
                name: "index-brand",
                component: IndexBrand,
                meta: { requiresAuth: true },
            },
            {
                path: "products-list",
                name: "products-list",
                component: ProductList,
                meta: { requiresAuth: true },
            },
            {
                path: "product-create",
                name: "product-create",
                component: ProductCreate,
                meta: { requiresAuth: true },
            },
            {
                path: "product-edit/:id",
                name: "product-edit",
                component: ProductEdit,
                meta: { requiresAuth: true },
            },
            {
                path: "product-view/:id",
                name: "product-view",
                component: ProductView,
                meta: { requiresAuth: true },
            },

            {
                path: "orders-list",
                name: "orders-list",
                component: OrderList,
                meta: { requiresAuth: true },
            },
            {
                path: "order-create",
                name: "order-create",
                component: OrderCreate,
                meta: { requiresAuth: true },
            },
            {
                path: "order-edit/:id",
                name: "order-edit",
                component: OrderEdit,
                meta: { requiresAuth: true },
            },
            {
                path: "order-view/:id",
                name: "order-view",
                component: OrderView,
                meta: { requiresAuth: true },
            },

        ],
    },
];
export default superadminRoutes;