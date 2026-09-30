// Permissions are named module.action (meeting.read, event-attendance.create...).
// These helpers group them by module for grids and summaries.

export const ACTIONS = ["read", "create", "update", "delete"];

export function moduleOf(name) {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.slice(0, i) : name;
}
export function actionOf(name) {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.slice(i + 1) : "";
}

// [{ module, actions: { read: 'meeting.read', ... }, other: ['meeting.export'] }] sorted by module
export function groupPermissions(names) {
  const map = new Map();
  names.forEach((n) => {
    const m = moduleOf(n);
    if (!map.has(m)) map.set(m, { module: m, actions: {}, other: [] });
    const a = actionOf(n);
    if (ACTIONS.includes(a)) map.get(m).actions[a] = n;
    else map.get(m).other.push(n);
  });
  return [...map.values()].sort((a, b) => a.module.localeCompare(b.module));
}

// "meeting-guest-attendance" -> "Meeting guest attendance" (used when no translation exists)
export const humanModule = (m) => m.replace(/[-_]/g, " ").replace(/^\w/, (c) => c.toUpperCase());

// Short summary of what a role lets someone do: modules it can read, and which it can change
export function roleSummary(permissionNames) {
  const groups = groupPermissions(permissionNames);
  return {
    modules: groups.length,
    canChange: groups.filter((g) => g.actions.create || g.actions.update || g.actions.delete).map((g) => g.module),
    readOnly: groups.filter((g) => g.actions.read && !g.actions.create && !g.actions.update && !g.actions.delete).map((g) => g.module),
  };
}
