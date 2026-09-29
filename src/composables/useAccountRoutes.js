// Account pages (profile, settings, support, notifications) are shared by organisations and members,
// but live under different dashboards. This gives the right route name for the signed-in account.
import { computed } from "vue";
import { authStore } from "@/store/authStore";

const NAMES = {
  organisation: {
    profile: "profile",
    settings: "settings",
    support: "support",
    supportRequest: "support-request",
    notifications: "notifications",
    notificationSettings: "user-notifications",
  },
  individual: {
    profile: "individual-profile",
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
