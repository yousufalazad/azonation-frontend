// Platform lists the Super Admin looks after (countries, currencies, statuses...).
// One entry per list; LookupPage.vue shows, adds, edits and removes records from it.
//
// field: { key, label (i18n key under lookups.field_*), type: text|number|textarea|select|switch,
//          required?, max?, help?, options?: { endpoint, value, label } | [{ value, label }] }
// columns: which values the table shows (a field key, or a key the list already returns, e.g. country_name)

const active = { key: "is_active", type: "switch", default: 1 };

export const GROUPS = [
  { key: "places", items: ["countries", "regions", "country-regions", "dialing-codes", "time-zones", "account-countries"] },
  { key: "money", items: ["currencies", "region-currencies", "tax-rates"] },
  { key: "membership", items: ["membership-types", "membership-statuses", "renewal-cycles", "designations"] },
  { key: "activities", items: ["attendance-types", "attendance-statuses", "conduct-types", "privacy"] },
  { key: "app", items: ["languages"] },
];

export const LOOKUPS = {
  countries: {
    endpoint: "/api/countries",
    fields: [
      { key: "name", type: "text", required: true, max: 255 },
      { key: "iso_code_alpha_2", type: "text", required: true, max: 2, help: "iso2Help" },
      { key: "iso_code_alpha_3", type: "text", required: true, max: 3, help: "iso3Help" },
      { key: "numeric_code", type: "text", required: true, max: 3 },
      active,
    ],
    columns: ["name", "iso_code_alpha_2", "iso_code_alpha_3", "numeric_code"],
    sortBy: "name",
  },
  regions: {
    endpoint: "/api/regions",
    fields: [
      { key: "name", type: "text", required: true, max: 255, help: "regionNameHelp" },
      { key: "title", type: "text", required: true, max: 255 },
      active,
    ],
    columns: ["name", "title"],
  },
  "country-regions": {
    endpoint: "/api/country-regions",
    fields: [
      { key: "country_id", type: "select", required: true, options: { endpoint: "/api/countries", value: "id", label: "name" } },
      { key: "region_id", type: "select", required: true, options: { endpoint: "/api/regions", value: "id", label: "name" } },
      active,
    ],
    columns: ["country_name", "region_name"],
    sortBy: "country_name",
  },
  "dialing-codes": {
    endpoint: "/api/dialing-codes",
    fields: [
      { key: "country_id", type: "select", required: true, options: { endpoint: "/api/countries", value: "id", label: "name" } },
      { key: "dialing_code", type: "text", required: true, max: 10, help: "dialingHelp" },
      active,
    ],
    columns: ["name", "dialing_code"],
    sortBy: "name",
  },
  "account-countries": {
    endpoint: "/api/user-countries",
    fields: [
      { key: "user_id", type: "select", required: true, options: { endpoint: "/api/get-user-list", value: "id", label: "name" } },
      { key: "country_id", type: "select", required: true, options: { endpoint: "/api/countries", value: "id", label: "name" } },
      active,
    ],
    columns: ["user_name", "country_name", "user_type"],
    sortBy: "user_name",
  },
  "time-zones": {
    endpoint: "/api/time-zone-setups",
    fields: [
      { key: "time_zone", type: "text", required: true, max: 255, help: "timeZoneHelp" },
      { key: "offset", type: "text", required: true, max: 10, help: "offsetHelp" },
      { key: "description", type: "text", required: true, max: 255 },
      active,
    ],
    columns: ["time_zone", "offset", "description"],
  },
  currencies: {
    endpoint: "/api/currencies",
    fields: [
      { key: "currency_name", type: "text", required: true, max: 255 },
      { key: "currency_code", type: "text", required: true, max: 3, help: "currencyCodeHelp" },
      { key: "currency_symbol", type: "text", required: true, max: 5 },
      { key: "unit_name", type: "text", max: 255, help: "unitHelp" },
      active,
    ],
    columns: ["currency_name", "currency_code", "currency_symbol"],
  },
  "region-currencies": {
    endpoint: "/api/region-currencies",
    fields: [
      { key: "region_id", type: "select", required: true, options: { endpoint: "/api/regions", value: "id", label: "name" } },
      { key: "currency_id", type: "select", required: true, options: { endpoint: "/api/currencies", value: "id", label: "currency_code" } },
      active,
    ],
    columns: ["region_name", "currency_name"],
  },
  "tax-rates": {
    endpoint: "/api/regional-tax-rates",
    fields: [
      { key: "region_id", type: "select", required: true, options: { endpoint: "/api/regions", value: "id", label: "name" } },
      { key: "tax_rate", type: "number", required: true, help: "taxHelp" },
      active,
    ],
    columns: ["region_name", "tax_rate"],
  },
  "membership-types": {
    endpoint: "/api/membership-types",
    fields: [{ key: "name", type: "text", required: true, max: 255 }, active],
    columns: ["name"],
  },
  "membership-statuses": {
    endpoint: "/api/membership-statuses",
    fields: [
      { key: "name", type: "text", required: true, max: 30 },
      { key: "description", type: "text", max: 255 },
      active,
    ],
    columns: ["name", "description"],
  },
  "renewal-cycles": {
    endpoint: "/api/membership-renewal-cycles",
    fields: [
      { key: "name", type: "text", required: true, max: 255 },
      { key: "duration_in_months", type: "number", required: true, help: "monthsHelp" },
      active,
    ],
    columns: ["name", "duration_in_months"],
  },
  designations: {
    endpoint: "/api/designations",
    fields: [{ key: "name", type: "text", required: true, max: 255, help: "designationHelp" }, active],
    columns: ["name"],
  },
  "attendance-types": {
    endpoint: "/api/attendance-types",
    fields: [{ key: "name", type: "text", required: true, max: 255, help: "attendanceTypeHelp" }, active],
    columns: ["name"],
  },
  "attendance-statuses": {
    endpoint: "/api/attendance-statuses",
    fields: [
      { key: "name", type: "text", required: true, max: 255 },
      { key: "is_attended", type: "switch", default: 1, help: "attendedHelp" },
      { key: "sort_order", type: "number", default: 0 },
      active,
    ],
    columns: ["name", "is_attended", "sort_order"],
    sortBy: "sort_order",
  },
  "conduct-types": {
    endpoint: "/api/conduct-types",
    fields: [{ key: "name", type: "text", required: true, max: 255, help: "conductHelp" }, active],
    columns: ["name"],
  },
  privacy: {
    endpoint: "/api/privacy-setups",
    listEndpoint: "/api/privacy-setups/all",
    fields: [
      { key: "name", type: "text", required: true, max: 255 },
      { key: "description", type: "textarea", required: true },
      active,
    ],
    columns: ["name", "description"],
    warning: "privacyWarning",
  },
  languages: {
    endpoint: "/api/languages",
    fields: [
      { key: "language_name", type: "text", required: true, max: 255 },
      { key: "language_code", type: "text", required: true, max: 10, help: "languageCodeHelp" },
      { key: "default", type: "switch", default: 0 },
      active,
    ],
    columns: ["language_name", "language_code", "default"],
  },
};
