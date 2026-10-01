// Settings for the simple write-up sections that share one list, form and reading page:
// the organisation's history, recognitions (awards) and success stories.
//   api:    backend address
//   body:   field holding the formatted text
//   date:   optional date field (null when there is none)
//   active: on/off field name
//   routes: route names for list / create / edit / view
//   t:      translation key prefix (content.<t>.*)
export const CONTENT_TYPES = {
  history: {
    api: "/api/histories",
    body: "history",
    date: null,
    active: "is_active",
    routes: { index: "history", create: "create-history", edit: "edit-history", view: "view-history" },
    t: "history",
    icon: "Landmark",
  },
  recognition: {
    api: "/api/recognitions",
    body: "description",
    date: "recognition_date",
    dateRequired: true,
    active: "is_active",
    routes: { index: "recognition", create: "create-recognition", edit: "edit-recognition", view: "view-recognition" },
    t: "recognition",
    icon: "Award",
  },
  successStory: {
    api: "/api/success-stories",
    body: "story",
    date: null,
    active: "status",
    routes: { index: "success-story", create: "create-success-story", edit: "edit-success-story", view: "view-success-story" },
    t: "successStory",
    icon: "Sparkles",
  },
};
