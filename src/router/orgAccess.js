// Who may open a page of the organisation dashboard.
// - The organisation account: every page.
// - A member with a role in the organisation they are currently working in: the home page, and pages
//   whose required permission their role includes. Everything else (account, billing, settings,
//   plans, reports...) stays with the organisation account. Secure by default: a page without a
//   permission is owner-only.
import { authStore } from "@/store/authStore";

const MEMBER_HOME = "org-dashboard-index";

export function isActingForOrg() {
  const auth = authStore;
  if (auth.user?.type !== "individual" || !auth.currentOrgId) return false;
  const org = auth.orgAccess.find((o) => String(o.org_type_user_id) === String(auth.currentOrgId));
  return !!org && (org.permissions || []).length > 0;
}

export function canOpenOrgRoute(route) {
  const auth = authStore;
  if (auth.user?.type === "organisation") return true;
  if (!isActingForOrg() || !route) return false;
  if (route.name === MEMBER_HOME) return true;
  const permission = route.meta?.permission;
  return !!permission && auth.hasPermission(permission);
}

export function currentOrgName() {
  const auth = authStore;
  if (auth.user?.type === "organisation") return auth.user?.org_name || "";
  return auth.orgAccess.find((o) => String(o.org_type_user_id) === String(auth.currentOrgId))?.org_name || "";
}
