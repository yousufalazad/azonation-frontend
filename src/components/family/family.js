// Shared lists for family information (same values as the server)
export const AGE_GROUPS = ["0-4", "5-12", "13-17", "18-59", "60+"];
export const RELATIONSHIPS = ["spouse", "child", "parent", "sibling", "grandparent", "grandchild", "other"];
export const GENDERS = ["male", "female", "other"];
export const LEVELS = ["none", "numbers", "details"];

// i18n key for an age group: "5-12" -> family.age_5_12, "60+" -> family.age_60plus
export const ageKey = (group) => `family.age_${String(group).replace("+", "plus").replace("-", "_")}`;
