// Account pages (profile, settings, support, notifications) are shared by organisations and members,
// but live under different dashboards. This gives the right route name for the signed-in account.
import { computed } from "vue";
import { authStore } from "@/store/authStore";

const NAMES = {
  organisation: {
    profile: "profile",
    security: "security",
    settings: "settings",
    support: "support",
    supportRequest: "support-request",
    notifications: "notifications",
    notificationSettings: "user-notifications",
  },
  superadmin: {
    profile: "super-admin-profile-update",
    security: "superadmin-security",
    settings: "superadmin-account-settings",
    support: "superadmin-support",
    supportRequest: "superadmin-support",
    notifications: "superadmin-notifications",
    notificationSettings: "superadmin-notification-settings",
  },
  individual: {
    profile: "individual-profile",
    security: "individual-security",
    settings: "individual-settings",
    support: "individual-support",
    supportRequest: "individual-support-request",
    notifications: "individual-notifications",
    notificationSettings: "individual-notification-settings",
  },
};

export function useAccountRoutes() {
  return computed(() => NAMES[authStore.user?.type] || NAMES.organisation);
}
