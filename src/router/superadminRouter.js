const SuperadminDashboardLayout = () => import("../views/SuperAdmin/Layouts/Layout.vue");
const SuperadminDashboardIndex = () => import("../views/SuperAdmin/Layouts/Dashboard/Index.vue");
const SuperAdminProfileUpdate = () => import("../views/SuperAdmin/Profile/SuperAdminProfileUpdate.vue");
//SuperAdmin Master Setting
const Country = () => import("../views/SuperAdmin/MasterSetting/Country.vue");
const Region = () => import("../views/SuperAdmin/MasterSetting/Region.vue");
const RegionCurrency = () => import("../views/SuperAdmin/MasterSetting/RegionCurrency.vue");
const CountryRegion = () => import("../views/SuperAdmin/MasterSetting/CountryRegion.vue");
const UserCountry = () => import("../views/SuperAdmin/MasterSetting/UserCountry.vue");
const DialingCode = () => import("../views/SuperAdmin/MasterSetting/DialingCode.vue");
const AttendanceType = () => import("../views/SuperAdmin/MasterSetting/AttendanceType.vue");
const ConductType = () => import("../views/SuperAdmin/MasterSetting/ConductType.vue");
const MembershipType = () => import("../views/SuperAdmin/MasterSetting/MembershipType.vue");
const MembershipStatuses = () => import("../views/SuperAdmin/MasterSetting/MembershipStatuses.vue");
const MembershipRenewalCycle = () => import("../views/SuperAdmin/MasterSetting/MembershipRenewalCycle.vue");
const Designation = () => import("../views/SuperAdmin/MasterSetting/Designation.vue");
const Language = () => import("../views/SuperAdmin/MasterSetting/Language.vue");
const TimeZoneSetup = () => import("../views/SuperAdmin/MasterSetting/TimeZoneSetup.vue");
const PrivacySetup = () => import("../views/SuperAdmin/MasterSetting/PrivacySetup.vue");
const RegionalTaxRate = () => import("../views/SuperAdmin/MasterSetting/RegionalTaxRate.vue");
//Currency
const IndexCurrency = () => import("../views/SuperAdmin/Financial/Currency/Index.vue");
//Package
const IndexPackage = () => import("../views/SuperAdmin/Financial/Package/Index.vue");
const EditPackage = () => import("../views/SuperAdmin/Financial/Package/Edit.vue");
const ViewPackage = () => import("../views/SuperAdmin/Financial/Package/View.vue");
//Price
const EditPrice = () => import("../views/SuperAdmin/Financial/Price/Edit.vue");
const IndexPrice = () => import("../views/SuperAdmin/Financial/Price/Index.vue");
const ViewPrice = () => import("../views/SuperAdmin/Financial/Price/View.vue");
//Subscription
const EditSubscription = () => import("../views/SuperAdmin/Financial/Subscription/Edit.vue");
//import IndexSubscription from "../views/SuperAdmin/Financial/Subscription/Index.vue";
const ViewSubscription = () => import("../views/SuperAdmin/Financial/Subscription/View.vue");
const SuperAdminSubscriptionList = () => import("../views/SuperAdmin/Financial/Subscription/Index.vue");
//UserPrice
const UserPriceRate = () => import("../views/SuperAdmin/Financial/UserPriceRate/Index.vue");
//Billing
const SuperAdminBillingList = () => import("../views/SuperAdmin/Financial/Billing/Index.vue");
const SuperAdminBillingCreate = () => import("../views/SuperAdmin/Financial/Billing/Create.vue");
const SuperAdminBillingEdit = () => import("../views/SuperAdmin/Financial/Billing/Edit.vue");
const SuperAdminBillingView = () => import("../views/SuperAdmin/Financial/Billing/View.vue");
//Everyday member count and billing
const SuperAdminEverydayMemberCountAndBillingList = () => import("../views/SuperAdmin/Financial/EverydayMemberCountAndBilling/Index.vue");
const SuperAdminEverydayMemberCountAndBillingCreate = () => import("../views/SuperAdmin/Financial/EverydayMemberCountAndBilling/Create.vue");
const SuperAdminEverydayMemberCountAndBillingEdit = () => import("../views/SuperAdmin/Financial/EverydayMemberCountAndBilling/Edit.vue");
const SuperAdminEverydayMemberCountAndBillingView = () => import("../views/SuperAdmin/Financial/EverydayMemberCountAndBilling/View.vue");
// EverydayStorageBilling
const SuperAdminEverydayStorageBillingList = () => import("../views/SuperAdmin/Financial/EverydayStorageBilling/Index.vue");
const SuperAdminEverydayStorageBillingCreate = () => import("../views/SuperAdmin/Financial/EverydayStorageBilling/Create.vue");
const SuperAdminEverydayStorageBillingEdit = () => import("../views/SuperAdmin/Financial/EverydayStorageBilling/Edit.vue");
const SuperAdminEverydayStorageBillingView = () => import("../views/SuperAdmin/Financial/EverydayStorageBilling/View.vue");
//ManagementAndStorageBilling
const SuperAdminManagementAndStorageBillingList = () => import("../views/SuperAdmin/Financial/ManagementAndStorageBilling/Index.vue");
const SuperAdminManagementAndStorageBillingCreate = () => import("../views/SuperAdmin/Financial/ManagementAndStorageBilling/Create.vue");
const SuperAdminManagementAndStorageBillingEdit = () => import("../views/SuperAdmin/Financial/ManagementAndStorageBilling/Edit.vue");
const SuperAdminManagementAndStorageBillingView = () => import("../views/SuperAdmin/Financial/ManagementAndStorageBilling/View.vue");
//Invoice
const SuperAdminInvoiceList = () => import("../views/SuperAdmin/Financial/Invoice/Index.vue");
const SuperAdminInvoiceCreate = () => import("../views/SuperAdmin/Financial/Invoice/Create.vue");
const SuperAdminInvoiceEdit = () => import("../views/SuperAdmin/Financial/Invoice/Edit.vue");
const SuperAdminInvoiceView = () => import("../views/SuperAdmin/Financial/Invoice/View.vue");
//Receipt
const SuperAdminReceiptList = () => import("@/views/SuperAdmin/Financial/Receipt/Index.vue");
const SuperAdminReceiptCreate = () => import("@/views/SuperAdmin/Financial/Receipt/Create.vue");
const SuperAdminReceiptEdit = () => import("@/views/SuperAdmin/Financial/Receipt/Edit.vue");
const SuperAdminReceiptView = () => import("@/views/SuperAdmin/Financial/Receipt/View.vue");
//Payment Log
const SuperAdminPaymentLog = () => import("../views/SuperAdmin/Financial/PaymentLog/Index.vue");
const SuperAdminPaymentLogList = () => import("../views/SuperAdmin/Financial/PaymentLog/Index.vue");
const SuperAdminPaymentLogCreate = () => import("../views/SuperAdmin/Financial/PaymentLog/Create.vue");
const SuperAdminPaymentLogEdit = () => import("../views/SuperAdmin/Financial/PaymentLog/Edit.vue");
const SuperAdminPaymentLogView = () => import("../views/SuperAdmin/Financial/PaymentLog/View.vue");
//SuperAdmin E-commerce Setting
const IndexBusinessType = () => import("../views/SuperAdmin/E-commerce/BusinessType.vue");
const IndexCategory = () => import("../views/SuperAdmin/E-commerce/Category.vue");
const IndexSubCategory = () => import("../views/SuperAdmin/E-commerce/SubCategory.vue");
const IndexSubSubCategory = () => import("../views/SuperAdmin/E-commerce/SubSubCategory.vue");
const IndexBrand = () => import("../views/SuperAdmin/E-commerce/Brand.vue");
const ProductList = () => import("../views/SuperAdmin/E-commerce/product/Index.vue");
const ProductCreate = () => import("../views/SuperAdmin/E-commerce/product/Create.vue");
const ProductEdit = () => import("../views/SuperAdmin/E-commerce/product/Edit.vue");
const ProductView = () => import("../views/SuperAdmin/E-commerce/product/View.vue");
const OrderList = () => import("../views/SuperAdmin/E-commerce/order/Index.vue");
const OrderCreate = () => import("../views/SuperAdmin/E-commerce/order/Create.vue");
const OrderEdit = () => import("../views/SuperAdmin/E-commerce/order/Edit.vue");
const OrderView = () => import("../views/SuperAdmin/E-commerce/order/View.vue");
const Roles = () => import("@/views/RolePermission/Roles.vue");
const Permissions = () => import("@/views/RolePermission/Permissions.vue");
const UserRoleAssign = () => import("@/views/RolePermission/UserRoleAssign.vue");
const SupportInbox = () => import("@/views/SuperAdmin/Support/Index.vue");
const superadminRoutes = [
  {
    path: "/superadmin-dashboard",
    name: "superadmin-dashboard",
    component: SuperadminDashboardLayout,
    meta: {
      requiresAuth: true,
      type: "superadmin",
    },
    children: [
      {
        path: "index",
        name: "superadmin-dashboard-index",
        component: SuperadminDashboardIndex,
        meta: { requiresAuth: true },
      },
      {
        path: "support",
        name: "superadmin-support",
        component: SupportInbox,
        meta: { requiresAuth: true },
      },
      // Role & Permission routes
      {
        path: "roles",
        name: "roles",
        component: Roles,
        meta: { requiresAuth: true},
        // meta: { requiresAuth: true, permission: "manage_roles" },
      },
      {
        path: "permissions",
        name: "permissions",
        component: Permissions,
        meta: { requiresAuth: true},
        // meta: { requiresAuth: true, permission: "manage_permissions" },
      },
      {
        path: "superadmin-user-role-assign",
        name: "superadmin-user-role-assign",
        component: UserRoleAssign,
        meta: { requiresAuth: true},
        // meta: { requiresAuth: true, permission: "assign_roles" },
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
        path: "membership-statuses",
        name: "membership-statuses",
        component: MembershipStatuses,
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
