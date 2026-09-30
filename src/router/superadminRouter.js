const SuperadminDashboardLayout = () => import("../views/SuperAdmin/Layouts/Layout.vue");
const SuperadminDashboardIndex = () => import("../views/SuperAdmin/Layouts/Dashboard/Index.vue");
// Account pages shared with organisations and members
const SuperAdminProfileUpdate = () => import("@/views/Org/Profile/Profile.vue");
const AccountSecurity = () => import("@/views/Org/Profile/Security.vue");
const AccountSettings = () => import("@/views/Org/Profile/Settings.vue");
const NotificationSettings = () => import("@/views/Org/Notification/UserNotifications.vue");
//SuperAdmin Master Setting
//Currency
//Package
//Price
//Subscription
//UserPrice
//Billing
//Everyday member count and billing
// EverydayStorageBilling
//ManagementAndStorageBilling
//Invoice
//Receipt
//Payment Log
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
const UserRoleAssign = () => import("@/views/RolePermission/UserRoleAssign.vue");
const SupportInbox = () => import("@/views/SuperAdmin/Support/Index.vue");
const Plans = () => import("@/views/SuperAdmin/Billing/Plans.vue");
const Subscriptions = () => import("@/views/SuperAdmin/Billing/Subscriptions.vue");
const Bills = () => import("@/views/SuperAdmin/Billing/Bills.vue");
const Invoices = () => import("@/views/SuperAdmin/Billing/Invoices.vue");
const InvoiceView = () => import("@/views/SuperAdmin/Billing/InvoiceView.vue");
const Payments = () => import("@/views/SuperAdmin/Billing/Payments.vue");
const Daily = () => import("@/views/SuperAdmin/Billing/Daily.vue");
const PlatformSettings = () => import("@/views/SuperAdmin/Settings/Index.vue");
const LookupPage = () => import("@/views/SuperAdmin/Settings/LookupPage.vue");
const Notifications = () => import("@/views/Org/Notification/Index.vue");
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
        path: "settings",
        name: "superadmin-settings",
        component: PlatformSettings,
        meta: { requiresAuth: true },
      },
      {
        path: "settings/:key",
        name: "superadmin-lookup",
        component: LookupPage,
        meta: { requiresAuth: true },
      },
      {
        path: "notifications",
        name: "superadmin-notifications",
        component: Notifications,
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
      { path: "permissions", name: "permissions", redirect: { name: "roles", query: { tab: "permissions" } } },
      {
        path: "superadmin-user-role-assign",
        name: "superadmin-user-role-assign",
        component: UserRoleAssign,
        meta: { requiresAuth: true},
        // meta: { requiresAuth: true, permission: "assign_roles" },
      },
      { path: "security", name: "superadmin-security", component: AccountSecurity, meta: { requiresAuth: true } },
      { path: "account-settings", name: "superadmin-account-settings", component: AccountSettings, meta: { requiresAuth: true } },
      { path: "notification-settings", name: "superadmin-notification-settings", component: NotificationSettings, meta: { requiresAuth: true } },
      {
        path: "super-admin-profile-update",
        name: "super-admin-profile-update",
        component: SuperAdminProfileUpdate,
        meta: { requiresAuth: true },
      },
      { path: "country", name: "country", redirect: { name: "superadmin-lookup", params: { key: "countries" } } },
      { path: "region", name: "region", redirect: { name: "superadmin-lookup", params: { key: "regions" } } },
      { path: "region-currency", name: "region-currency", redirect: { name: "superadmin-lookup", params: { key: "region-currencies" } } },
      { path: "country-region", name: "country-region", redirect: { name: "superadmin-lookup", params: { key: "country-regions" } } },
      { path: "user-country", name: "user-country", redirect: { name: "superadmin-lookup", params: { key: "account-countries" } } },
      { path: "dialing-code", name: "dialing-code", redirect: { name: "superadmin-lookup", params: { key: "dialing-codes" } } },
      { path: "conduct-type", name: "conduct-type", redirect: { name: "superadmin-lookup", params: { key: "conduct-types" } } },
      { path: "attendance-type", name: "attendance-type", redirect: { name: "superadmin-lookup", params: { key: "attendance-types" } } },
      { path: "membership-type", name: "membership-type", redirect: { name: "superadmin-lookup", params: { key: "membership-types" } } },
      { path: "membership-statuses", name: "membership-statuses", redirect: { name: "superadmin-lookup", params: { key: "membership-statuses" } } },
      { path: "membership-renewal-cycle", name: "membership-renewal-cycle", redirect: { name: "superadmin-lookup", params: { key: "renewal-cycles" } } },
      { path: "designation", name: "designation", redirect: { name: "superadmin-lookup", params: { key: "designations" } } },
      { path: "language", name: "language", redirect: { name: "superadmin-lookup", params: { key: "languages" } } },
      { path: "time-zone-setup", name: "time-zone-setup", redirect: { name: "superadmin-lookup", params: { key: "time-zones" } } },
      { path: "privacy-setup", name: "privacy-setup", redirect: { name: "superadmin-lookup", params: { key: "privacy" } } },
      { path: "regional-tax-rate", name: "regional-tax-rate", redirect: { name: "superadmin-lookup", params: { key: "tax-rates" } } },
      { path: "index-currency", name: "index-currency", redirect: { name: "superadmin-lookup", params: { key: "currencies" } } },
      // Billing (views/SuperAdmin/Billing); older addresses lead to the new pages
      { path: "super-admin-packages", name: "super-admin-packages", component: Plans, meta: { requiresAuth: true } },
      { path: "edit-package", name: "edit-package", redirect: { name: "super-admin-packages" } },
      { path: "view-package", name: "view-package", redirect: { name: "super-admin-packages" } },
      { path: "edit-price", name: "edit-price", redirect: { name: "super-admin-packages" } },
      { path: "index-price", name: "index-price", redirect: { name: "super-admin-packages" } },
      { path: "view-price", name: "view-price", redirect: { name: "super-admin-packages" } },
      { path: "edit-subscription", name: "edit-subscription", redirect: { name: "super-admin-subscription-list" } },
      { path: "super-admin-subscription-list", name: "super-admin-subscription-list", component: Subscriptions, meta: { requiresAuth: true } },
      { path: "super-admin-view-subscription", name: "super-admin-view-subscription", redirect: { name: "super-admin-subscription-list" } },
      { path: "user-price-rate", name: "user-price-rate", redirect: { name: "super-admin-subscription-list" } },
      { path: "super-admin-billing-list", name: "super-admin-billing-list", redirect: { name: "super-admin-management-and-storage-billing-list" } },
      { path: "super-admin-billing-create", name: "super-admin-billing-create", redirect: { name: "super-admin-management-and-storage-billing-list" } },
      { path: "super-admin-billing-edit/:id", name: "super-admin-billing-edit", redirect: { name: "super-admin-management-and-storage-billing-list" } },
      { path: "super-admin-billing-view/:id", name: "super-admin-billing-view", redirect: { name: "super-admin-management-and-storage-billing-list" } },
      { path: "super-admin-every-day-member-count-and-bill-list", name: "super-admin-every-day-member-count-and-bill-list", component: Daily, meta: { requiresAuth: true } },
      { path: "super-admin-every-day-member-count-and-bill-create", name: "super-admin-every-day-member-count-and-bill-create", redirect: { name: "super-admin-every-day-member-count-and-bill-list" } },
      { path: "super-admin-every-day-member-count-and-bill-edit/:id", name: "super-admin-every-day-member-count-and-bill-edit", redirect: { name: "super-admin-every-day-member-count-and-bill-list" } },
      { path: "super-admin-every-day-member-count-and-bill-view/:id", name: "super-admin-every-day-member-count-and-bill-view", redirect: { name: "super-admin-every-day-member-count-and-bill-list" } },
      { path: "super-admin-everyday-storage-billing-list", name: "super-admin-everyday-storage-billing-list", redirect: { name: "super-admin-every-day-member-count-and-bill-list" } },
      { path: "super-admin-everyday-storage-billing-create", name: "super-admin-everyday-storage-billing-create", redirect: { name: "super-admin-every-day-member-count-and-bill-list" } },
      { path: "super-admin-everyday-storage-billing-edit/:id", name: "super-admin-everyday-storage-billing-edit", redirect: { name: "super-admin-every-day-member-count-and-bill-list" } },
      { path: "super-admin-everyday-storage-billing-view/:id", name: "super-admin-everyday-storage-billing-view", redirect: { name: "super-admin-every-day-member-count-and-bill-list" } },
      { path: "super-admin-management-and-storage-billing-list", name: "super-admin-management-and-storage-billing-list", component: Bills, meta: { requiresAuth: true } },
      { path: "super-admin-management-and-storage-billing-create", name: "super-admin-management-and-storage-billing-create", redirect: { name: "super-admin-payment-log-list" } },
      { path: "super-admin-management-and-storage-billing-edit/:id", name: "super-admin-management-and-storage-billing-edit", redirect: { name: "super-admin-payment-log-list" } },
      { path: "super-admin-management-and-storage-billing-view/:id", name: "super-admin-management-and-storage-billing-view", redirect: { name: "super-admin-payment-log-list" } },
      { path: "super-admin-invoice-list", name: "super-admin-invoice-list", component: Invoices, meta: { requiresAuth: true } },
      { path: "super-admin-invoice-create", name: "super-admin-invoice-create", redirect: { name: "super-admin-invoice-list" } },
      { path: "super-admin-invoice-edit/:id", name: "super-admin-invoice-edit", redirect: { name: "super-admin-invoice-list" } },
      { path: "super-admin-invoice-view/:id", name: "super-admin-invoice-view", redirect: (to) => ({ name: "superadmin-invoice", params: { id: to.params.id } }) },
      { path: "super-admin-receipt-list", name: "super-admin-receipt-list", redirect: { name: "super-admin-payment-log-list" } },
      { path: "super-admin-receipt-create", name: "super-admin-receipt-create", redirect: { name: "super-admin-payment-log-list" } },
      { path: "super-admin-receipt-edit/:id", name: "super-admin-receipt-edit", redirect: { name: "super-admin-payment-log-list" } },
      { path: "super-admin-receipt-view/:id", name: "super-admin-receipt-view", redirect: { name: "super-admin-payment-log-list" } },
      { path: "super-admin-payment-log", name: "super-admin-payment-log", redirect: { name: "super-admin-payment-log-list" } },
      { path: "super-admin-payment-log-list", name: "super-admin-payment-log-list", component: Payments, meta: { requiresAuth: true } },
      { path: "super-admin-payment-log-create", name: "super-admin-payment-log-create", redirect: { name: "super-admin-payment-log-list" } },
      { path: "super-admin-payment-log-edit/:id", name: "super-admin-payment-log-edit", redirect: { name: "super-admin-payment-log-list" } },
      { path: "super-admin-payment-log-view/:id", name: "super-admin-payment-log-view", redirect: { name: "super-admin-payment-log-list" } },
      { path: "billing/invoices/:id", name: "superadmin-invoice", component: InvoiceView, meta: { requiresAuth: true } },
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
