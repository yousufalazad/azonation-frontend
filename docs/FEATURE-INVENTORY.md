# Azonation feature inventory (parity checklist)

Written 2026-10-01 from the frozen repos `azonation-frontend` and `azonation-backend`. Every item must work in `azonation-app` / `azonation-api` before the old repos are retired (roadmap §2, parity rule). Tick `[x]` when an item works in the new app **with** its security checks, 10 languages, dark mode and phone layout.

Totals: **229 page addresses** (incl. old-link redirects), **487 API routes**, **109 permissions**, 5 console commands, 5 emails, 2 in-app notifications.

How to use: when a module moves, go through its **Features** first (what people can do), then the pages and API routes underneath. An item may be replaced by something better (for example the daily billing jobs → band pricing), but then write *replaced by …* next to it instead of ticking it.

## Contents

- [Accounts & Access](#accounts--access) — core
- [Organisation (dashboard, profile, content)](#organisation-dashboard-profile-content) — core
- [Member area](#member-area) — core
- [My family / Member families](#my-family--member-families) — core (member area + membership)
- [Membership](#membership) — core
- [Committees](#committees) — core
- [Meetings (incl. attendance, guests, minutes)](#meetings-incl-attendance-guests-minutes) — core
- [Documents](#documents) — core
- [Notifications](#notifications) — core
- [Reports](#reports) — core (basic)
- [Support](#support) — core (basic)
- [Billing](#billing) — core — becomes band pricing when moved
- [Super Admin](#super-admin) — core
- [Finance](#finance) — module
- [Events](#events) — module
- [Projects](#projects) — module
- [Assets](#assets) — module
- [Planning](#planning) — module
- [Public pages](#public-pages) — marketing pages → azonation-site; sign-in, not found, no access stay in the app
- [Shop](#shop) — Azonation-only — reshape at its roadmap step
- [Cross-cutting features](#cross-cutting-features)
- [Permissions](#permissions)
- [Scheduled jobs, commands, emails](#scheduled-jobs-commands-emails)
- [Access rules to define when moving](#access-rules-to-define-when-moving)

## Accounts & Access

*Target: core*

**Features**

- [ ] Sign up as a person or an organisation (name or organisation name, email, country, strong password, how you heard, referral code from `?ref=`)
- [ ] Log in with email and password, remember me, Google sign-in, Google sign-up completion step
- [ ] Forgot password → 6-digit code by email (resend with countdown, other email) → new password; one-time reset token
- [ ] Strong password rules with strength meter (8+, capital, small, number, symbol), enforced on the server too
- [ ] Profile (name, username, email, photo, address with country-specific format, phone numbers), Security (change password), Settings (language, theme)
- [ ] Language and light/dark/system theme saved per person; English + Bangla
- [ ] Roles and permissions per organisation; role assignment for organisation users; role-holders can act for the organisation (organisation switcher)
- [ ] Log out with confirm; session expiry handling; login rate limit

**Pages**

| ✓ | Address | Route name | File | Permission |
|---|---|---|---|---|
| [ ] | `individual-profile` | individual-profile | Org/Profile/Profile.vue | — |
| [ ] | `individual-security` | individual-security | Org/Profile/Security.vue | — |
| [ ] | `individual-settings` | individual-settings | Org/Profile/Settings.vue | — |
| [ ] | `user-role-assign` | user-role-assign | RolePermission/OrgUserRoleAssign.vue | assign_roles |
| [ ] | `my-account` | my-account | Org/Profile/MyAccount.vue | — |
| [ ] | `profile` | profile | Org/Profile/Profile.vue | — |
| [ ] | `settings` | settings | Org/Profile/Settings.vue | — |
| [ ] | `security` | security | Org/Profile/Security.vue | — |
| [ ] | `/` | login | Auth/Login.vue | — |
| [ ] | `/signup` | signup | Auth/Signup.vue | — |
| [ ] | `/verify-code` | verify-code | Auth/VerifyCode.vue | — |
| [ ] | `/forgot-password` | forgot-password | Auth/ForgotPassword.vue | — |
| [ ] | `/reset-password` | reset-password | Auth/ResetPassword.vue | — |
| [ ] | `/oauth/complete` | oauth-complete | Auth/OauthComplete.vue | — |
| [ ] | `/oauth/signed-in` | oauth-signed-in | Auth/OauthSignedIn.vue | — |
| [ ] | `/unauthorized` | unauthorized | Common/Unauthorized.vue | — |
| [ ] | `roles` | roles | RolePermission/Roles.vue | manage_roles |
| [ ] | `account-settings` | superadmin-account-settings | Org/Profile/Settings.vue | — |

Old addresses that redirect (keep working links): `settings`, `permissions`

**API routes**

| ✓ | Method | Route | Controller | Access |
|---|---|---|---|---|
| [ ] | GET | `/api/addresses` | Common/AddressController@index | login |
| [ ] | POST | `/api/addresses` | Common/AddressController@store | login |
| [ ] | PUT | `/api/addresses/{id}` | Common/AddressController@update | login |
| [ ] | POST | `/api/forgot-password` | Auth/ForgotPasswordController@sendResetCode | throttle |
| [ ] | GET | `/api/individual-users` | Individual/IndividualController@getIndividualUser | login |
| [ ] | GET | `/api/individual_profile_data/{userId}` | Individual/IndividualController@getProfileImage | login |
| [ ] | POST | `/api/login` | Auth/AuthController@login | throttle |
| [ ] | GET | `/api/me` | Auth/AuthController@me | login |
| [ ] | POST | `/api/oauth/google/complete` | Auth/SocialAuthController@completeProfile | throttle |
| [ ] | GET | `/api/org/switch` | Auth/AuthController@switchOrg | login |
| [ ] | GET | `/api/permissions` | Role/PermissionController@index | login |
| [ ] | POST | `/api/permissions` | Role/PermissionController@store | login; superadmin |
| [ ] | DELETE | `/api/permissions/{id}` | Role/PermissionController@destroy | login; superadmin |
| [ ] | PUT | `/api/permissions/{id}` | Role/PermissionController@update | login; superadmin |
| [ ] | GET | `/api/phone-numbers` | Common/PhoneNumberController@index | login |
| [ ] | POST | `/api/phone-numbers` | Common/PhoneNumberController@store | login |
| [ ] | GET | `/api/phone-numbers/{id}` | Common/PhoneNumberController@show | login |
| [ ] | PUT | `/api/phone-numbers/{id}` | Common/PhoneNumberController@update | login |
| [ ] | GET | `/api/profileimage/{userId}` | Individual/IndividualController@getProfileImage | login |
| [ ] | POST | `/api/profileimage/{userId}` | Individual/IndividualController@updateProfileImage | login |
| [ ] | POST | `/api/register` | Auth/AuthController@register | throttle |
| [ ] | POST | `/api/reset-password` | Auth/ForgotPasswordController@resetPassword | throttle |
| [ ] | GET | `/api/roles` | Role/RoleController@index | login |
| [ ] | POST | `/api/roles` | Role/RoleController@store | login; superadmin |
| [ ] | GET | `/api/roles-permissions` | Role/RoleController@permissions | login |
| [ ] | DELETE | `/api/roles/{id}` | Role/RoleController@destroy | login; superadmin |
| [ ] | PUT | `/api/roles/{id}` | Role/RoleController@update | login; superadmin |
| [ ] | PUT | `/api/roles/{role}/permissions` | Role/UserRoleController@updateRolePermissions | login; superadmin |
| [ ] | PUT | `/api/update-email/{userId}` | Auth/AuthController@userEmailUpdate | login |
| [ ] | PUT | `/api/update-first-last-name/{userId}` | Auth/AuthController@firstLastNameUpdate | login |
| [ ] | PUT | `/api/update-last-name/{userId}` | Auth/AuthController@lastNameUpdate | login |
| [ ] | PUT | `/api/update-name/{userId}` | Auth/AuthController@nameUpdate | login |
| [ ] | POST | `/api/update-password/{userId}` | Auth/AuthController@updatePassword | login |
| [ ] | PUT | `/api/update-username/{userId}` | Auth/AuthController@usernameUpdate | login |
| [ ] | GET | `/api/users` | Role/UserRoleController@getUsers | login |
| [ ] | PUT | `/api/users/{user}/roles` | Role/UserRoleController@assignRoles | login |
| [ ] | GET | `/api/verify-account/{uuid}` | Auth/AuthController@verify | public |
| [ ] | POST | `/api/verify-code` | Auth/ForgotPasswordController@verifyResetCode | throttle |

## Organisation (dashboard, profile, content)

*Target: core*

**Features**

- [ ] Organisation dashboard: welcome, totals (members, next meeting, balance, new members this year), money and membership charts, recent members, quick actions
- [ ] Organisation profile: logo, organisation info (fundamental info), administrator
- [ ] Founders, history, recognition, success stories — list, add, edit, view, with privacy (Public / Private) and attachments
- [ ] Header: organisation name, notifications bell, account menu, appearance settings; responsive sidebar

**Pages**

| ✓ | Address | Route name | File | Permission |
|---|---|---|---|---|
| [ ] | `/org-dashboard` | org-dashboard | Org/Layouts/Layout.vue | — |
| [ ] | `index` | org-dashboard-index | Org/Layouts/Dashboard/Index.vue | — |
| [ ] | `founders` | founders | Org/Founder/Index.vue | — |
| [ ] | `history` | history | Org/History/Index.vue | — |
| [ ] | `history/create` | create-history | Org/History/Create.vue | — |
| [ ] | `history/edit/:id` | edit-history | Org/History/Edit.vue | — |
| [ ] | `history/view/:id` | view-history | Org/History/View.vue | — |
| [ ] | `recognition` | recognition | Org/Recognition/Index.vue | — |
| [ ] | `recognition/create` | create-recognition | Org/Recognition/Create.vue | — |
| [ ] | `recognition/edit/:id` | edit-recognition | Org/Recognition/Edit.vue | — |
| [ ] | `recognition/view/:id` | view-recognition | Org/Recognition/View.vue | — |
| [ ] | `success-story` | success-story | Org/SuccessStory/Index.vue | — |
| [ ] | `success-story/create` | create-success-story | Org/SuccessStory/Create.vue | — |
| [ ] | `success-story/edit/:id` | edit-success-story | Org/SuccessStory/Edit.vue | — |
| [ ] | `success-story/view/:id` | view-success-story | Org/SuccessStory/View.vue | — |
| [ ] | `administrator` | administrator | Org/Profile/Administrator.vue | — |
| [ ] | `fundamental-info` | fundamental-info | Org/Profile/FundamentalInfo.vue | — |

Old addresses that redirect (keep working links): `fundamental-info`

**API routes**

| ✓ | Method | Route | Controller | Access |
|---|---|---|---|---|
| [ ] | GET | `/api/founders` | Org/FounderController@index | login; owner |
| [ ] | POST | `/api/founders` | Org/FounderController@store | login; owner |
| [ ] | DELETE | `/api/founders/{id}` | Org/FounderController@destroy | login; owner |
| [ ] | POST | `/api/founders/{id}` | Org/FounderController@update | login; owner |
| [ ] | GET | `/api/histories` | Org/History/HistoryController@index | login; owner |
| [ ] | POST | `/api/histories` | Org/History/HistoryController@store | login; owner |
| [ ] | DELETE | `/api/histories/{id}` | Org/History/HistoryController@destroy | login; owner |
| [ ] | GET | `/api/histories/{id}` | Org/History/HistoryController@show | login; owner |
| [ ] | POST | `/api/histories/{id}` | Org/History/HistoryController@update | login; owner |
| [ ] | POST | `/api/logout` | Auth/AuthController@logout | login |
| [ ] | GET | `/api/org-administrators` | Org/OrgAdministratorController@index | login |
| [ ] | POST | `/api/org-administrators` | Org/OrgAdministratorController@store | login |
| [ ] | POST | `/api/org-administrators/check` | Org/OrgAdministratorController@checkAdministratorExists | login |
| [ ] | GET | `/api/org-administrators/primary` | Org/OrgAdministratorController@getPrimaryAdministrator | login |
| [ ] | DELETE | `/api/org-administrators/{id}` | Org/OrgAdministratorController@destroy | login |
| [ ] | PUT | `/api/org-administrators/{id}` | Org/OrgAdministratorController@update | login |
| [ ] | GET | `/api/org-profile-data/{userId}` | Org/OrgProfileController@index | login |
| [ ] | PUT | `/api/org-profile-update/{userId}` | Org/OrgProfileController@update | login; owner |
| [ ] | GET | `/api/org-profile/logo` | Org/OrgProfileController@getLogo | login |
| [ ] | POST | `/api/org-profile/logo/{userId}` | Org/OrgProfileController@updateLogo | login |
| [ ] | GET | `/api/privacy-setups` | SuperAdmin/Settings/PrivacySetupController@index | login |
| [ ] | POST | `/api/privacy-setups` | SuperAdmin/Settings/PrivacySetupController@store | login; superadmin |
| [ ] | GET | `/api/privacy-setups/all` | SuperAdmin/Settings/PrivacySetupController@getAllPrivacySetupForSuperAdmin | login; superadmin |
| [ ] | DELETE | `/api/privacy-setups/{id}` | SuperAdmin/Settings/PrivacySetupController@destroy | login; superadmin |
| [ ] | PUT | `/api/privacy-setups/{id}` | SuperAdmin/Settings/PrivacySetupController@update | login; superadmin |
| [ ] | GET | `/api/recognitions` | Org/Recognition/RecognitionController@index | login; owner |
| [ ] | POST | `/api/recognitions` | Org/Recognition/RecognitionController@store | login; owner |
| [ ] | DELETE | `/api/recognitions/{id}` | Org/Recognition/RecognitionController@destroy | login; owner |
| [ ] | GET | `/api/recognitions/{id}` | Org/Recognition/RecognitionController@show | login; owner |
| [ ] | POST | `/api/recognitions/{id}` | Org/Recognition/RecognitionController@update | login; owner |
| [ ] | GET | `/api/success-stories` | Org/SuccessStory/SuccessStoryController@index | login; owner |
| [ ] | POST | `/api/success-stories` | Org/SuccessStory/SuccessStoryController@store | login; owner |
| [ ] | DELETE | `/api/success-stories/{id}` | Org/SuccessStory/SuccessStoryController@destroy | login; owner |
| [ ] | GET | `/api/success-stories/{id}` | Org/SuccessStory/SuccessStoryController@show | login; owner |
| [ ] | POST | `/api/success-stories/{id}` | Org/SuccessStory/SuccessStoryController@update | login; owner |

## Member area

*Target: core*

**Features**

- [ ] Member home: greeting, each organisation's next meetings, upcoming events, projects, my committees, items I look after
- [ ] My organisations: current and former memberships, membership type, number, member since, **fee paid until** / ended
- [ ] Member views of meetings, events, projects, committees, assets, attendance (current and past)
- [ ] Member profile, security, settings, notifications, help and support reuse the organisation pages

**Pages**

| ✓ | Address | Route name | File | Permission |
|---|---|---|---|---|
| [ ] | `/individual-dashboard` | individual-dashboard | Individual/Layouts/Layout.vue | — |
| [ ] | `index` | individual-dashboard-index | Individual/Layouts/Dashboard/Index.vue | — |
| [ ] | `connected-organisations` | connected-organisations | Individual/Organisation/Index.vue | — |

**API routes**

| ✓ | Method | Route | Controller | Access |
|---|---|---|---|---|
| [ ] | GET | `/api/connected-org-list` | Individual/IndividualController@getOrganisationByIndividualId | login |
| [ ] | GET | `/api/individual/dashboard-summary` | Individual/IndividualController@summary | login |

## My family / Member families

*Target: core (member area + membership)*

**Features**

- [ ] My family (member): add/edit/remove family members (name, relationship, birth year, gender, note), max 50
- [ ] Sharing per organisation: Private (default) / Numbers only / Names and details (confirm for details)
- [ ] Member families (organisation, permission `member-family.read`): totals, age groups, families list, search, export; names only where allowed
- [ ] Events: "Families welcome" flag with estimated headcount; members see a nudge to share

**Pages**

| ✓ | Address | Route name | File | Permission |
|---|---|---|---|---|
| [ ] | `family` | individual-family | Individual/Family/Index.vue | — |
| [ ] | `member-families` | member-families | Org/Member/MemberFamilies.vue | member-family.read |

Old addresses that redirect (keep working links): `family-member`

**API routes**

| ✓ | Method | Route | Controller | Access |
|---|---|---|---|---|
| [ ] | GET | `/api/individual/family` | Individual/MemberFamilyController@index | login |
| [ ] | POST | `/api/individual/family` | Individual/MemberFamilyController@store | login |
| [ ] | PUT | `/api/individual/family/sharing/{orgId}` | Individual/MemberFamilyController@share | login |
| [ ] | DELETE | `/api/individual/family/{id}` | Individual/MemberFamilyController@destroy | login |
| [ ] | PUT | `/api/individual/family/{id}` | Individual/MemberFamilyController@update | login |
| [ ] | GET | `/api/member-families` | Org/Membership/MemberFamilySummaryController@index | `member-family.read`; login |

## Membership

*Target: core*

**Features**

- [ ] Members list with search, filters, sort, columns, export (CSV, Excel, PDF, Word), member view and edit (type, number, dates, status)
- [ ] Add member: search Azonation people by name / Azon ID / username / email / phone (3+ letters), state labels (already a member, left before, cannot rejoin), confirm, sign-up link to copy
- [ ] Unlinked members (people without an account), terminated / former members with reasons and notes, rejoin rules
- [ ] Membership types (organisation's own, duplicates blocked, member and fee counts, cannot delete with fees)
- [ ] Renewals: overview (overdue, due soon, paid up, nothing recorded), record payment, payment history, renewal settings (periods + fees in minor units)
- [ ] Status and type change logs

**Pages**

| ✓ | Address | Route name | File | Permission |
|---|---|---|---|---|
| [ ] | `unlink-member` | unlink-member | Org/Member/UnlinkMember.vue | unlink-member.read |
| [ ] | `create-member` | create-member | Org/Member/Create.vue | member.create |
| [ ] | `index-member` | index-member | Org/Member/Index.vue | member.read |
| [ ] | `terminated-member` | terminated-member | Org/Member/TerminatedMember.vue | terminated-member.read |
| [ ] | `org-membership-type` | org-membership-type | Org/Member/OrgMembershipTypes.vue | org-membership-type.read |
| [ ] | `org-membership-renewal-cycle` | org-membership-renewal-cycle | Org/Financial/Renewal/OrgMembershipRenewalCycle.vue | org-membership-renewal-cycle.read |
| [ ] | `org-membership-renewal` | org-membership-renewal | Org/Financial/Renewal/OrgMembershipRenewal.vue | org-membership-renewal.read |

Old addresses that redirect (keep working links): `org-membership-renewal-price`, `membership-type`, `membership-statuses`, `membership-renewal-cycle`

**API routes**

| ✓ | Method | Route | Controller | Access |
|---|---|---|---|---|
| [ ] | GET | `/api/independent-members` | Org/Membership/OrgIndependentMemberController@index | login |
| [ ] | POST | `/api/independent-members` | Org/Membership/OrgIndependentMemberController@store | login |
| [ ] | DELETE | `/api/independent-members/{id}` | Org/Membership/OrgIndependentMemberController@destroy | login |
| [ ] | GET | `/api/independent-members/{id}` | Org/Membership/OrgIndependentMemberController@show | login |
| [ ] | PUT | `/api/independent-members/{id}` | Org/Membership/OrgIndependentMemberController@update | login |
| [ ] | GET | `/api/membership-renewal-cycles` | SuperAdmin/Settings/MembershipRenewalCycleController@index | login |
| [ ] | POST | `/api/membership-renewal-cycles` | SuperAdmin/Settings/MembershipRenewalCycleController@store | login; superadmin |
| [ ] | DELETE | `/api/membership-renewal-cycles/{id}` | SuperAdmin/Settings/MembershipRenewalCycleController@destroy | login; superadmin |
| [ ] | PUT | `/api/membership-renewal-cycles/{id}` | SuperAdmin/Settings/MembershipRenewalCycleController@update | login; superadmin |
| [ ] | GET | `/api/membership-statuses` | Org/Membership/MembershipStatusController@index | login |
| [ ] | POST | `/api/membership-statuses` | Org/Membership/MembershipStatusController@store | login; superadmin |
| [ ] | DELETE | `/api/membership-statuses/{id}` | Org/Membership/MembershipStatusController@destroy | login; superadmin |
| [ ] | GET | `/api/membership-statuses/{id}` | Org/Membership/MembershipStatusController@show | login |
| [ ] | PUT | `/api/membership-statuses/{id}` | Org/Membership/MembershipStatusController@update | login; superadmin |
| [ ] | GET | `/api/membership-termination-reasons` | Org/Membership/MembershipTerminationReasonController@index | login |
| [ ] | POST | `/api/membership-termination-reasons` | Org/Membership/MembershipTerminationReasonController@store | login; superadmin |
| [ ] | DELETE | `/api/membership-termination-reasons/{id}` | Org/Membership/MembershipTerminationReasonController@destroy | login; superadmin |
| [ ] | PUT | `/api/membership-termination-reasons/{id}` | Org/Membership/MembershipTerminationReasonController@update | login; superadmin |
| [ ] | GET | `/api/membership-terminations` | Org/Membership/MembershipTerminationController@index | login |
| [ ] | POST | `/api/membership-terminations` | Org/Membership/MembershipTerminationController@store | login |
| [ ] | DELETE | `/api/membership-terminations/{id}` | Org/Membership/MembershipTerminationController@destroy | login |
| [ ] | GET | `/api/membership-terminations/{id}` | Org/Membership/MembershipTerminationController@show | login |
| [ ] | PUT | `/api/membership-terminations/{id}` | Org/Membership/MembershipTerminationController@update | login |
| [ ] | GET | `/api/membership-types` | SuperAdmin/Settings/MembershipTypeController@index | login |
| [ ] | POST | `/api/membership-types` | SuperAdmin/Settings/MembershipTypeController@store | login; superadmin |
| [ ] | DELETE | `/api/membership-types/{id}` | SuperAdmin/Settings/MembershipTypeController@destroy | login; superadmin |
| [ ] | PUT | `/api/membership-types/{id}` | SuperAdmin/Settings/MembershipTypeController@update | login; superadmin |
| [ ] | GET | `/api/org-all-member-name` | Org/Membership/OrgMemberController@getOrgAllMemberName | login |
| [ ] | GET | `/api/org-members` | Org/Membership/OrgMemberController@index | `member.read`; login |
| [ ] | GET | `/api/org-members-users/{orgId}` | Role/UserRoleController@getOrgMemberList | login |
| [ ] | POST | `/api/org-members/check` | Org/Membership/OrgMemberController@checkMember | login |
| [ ] | POST | `/api/org-members/create` | Org/Membership/OrgMemberController@store | `member.create`; login |
| [ ] | GET | `/api/org-members/list/{userId}` | Org/Membership/OrgMemberController@getMemberList | login |
| [ ] | POST | `/api/org-members/search` | Org/Membership/OrgMemberController@search | login |
| [ ] | DELETE | `/api/org-members/{id}` | Org/Membership/OrgMemberController@destroy | `member.delete`; login |
| [ ] | GET | `/api/org-members/{id}` | Org/Membership/OrgMemberController@show | `member.read`; login |
| [ ] | PUT | `/api/org-members/{id}` | Org/Membership/OrgMemberController@update | `member.update`; login |
| [ ] | GET | `/api/org-membership-renewal-cycles` | Org/Membership/OrgMembershipRenewalCycleController@index | `org-membership-renewal-cycle.read`; login |
| [ ] | POST | `/api/org-membership-renewal-cycles` | Org/Membership/OrgMembershipRenewalCycleController@store | `org-membership-renewal-cycle.create`; login |
| [ ] | DELETE | `/api/org-membership-renewal-cycles/{id}` | Org/Membership/OrgMembershipRenewalCycleController@destroy | `org-membership-renewal-cycle.delete`; login |
| [ ] | GET | `/api/org-membership-renewal-cycles/{id}` | Org/Membership/OrgMembershipRenewalCycleController@show | `org-membership-renewal-cycle.read`; login |
| [ ] | PUT | `/api/org-membership-renewal-cycles/{id}` | Org/Membership/OrgMembershipRenewalCycleController@update | `org-membership-renewal-cycle.update`; login |
| [ ] | GET | `/api/org-membership-renewal-prices` | Org/Membership/OrgMembershipRenewalPriceController@index | `org-membership-renewal-price.read`; login |
| [ ] | POST | `/api/org-membership-renewal-prices` | Org/Membership/OrgMembershipRenewalPriceController@store | `org-membership-renewal-price.create`; login |
| [ ] | DELETE | `/api/org-membership-renewal-prices/{id}` | Org/Membership/OrgMembershipRenewalPriceController@destroy | `org-membership-renewal-price.delete`; login |
| [ ] | GET | `/api/org-membership-renewal-prices/{id}` | Org/Membership/OrgMembershipRenewalPriceController@show | `org-membership-renewal-price.read`; login |
| [ ] | PUT | `/api/org-membership-renewal-prices/{id}` | Org/Membership/OrgMembershipRenewalPriceController@update | `org-membership-renewal-price.update`; login |
| [ ] | GET | `/api/org-membership-renewals` | Org/Membership/OrgMembershipRenewalController@index | `org-membership-renewal.read`; login |
| [ ] | POST | `/api/org-membership-renewals` | Org/Membership/OrgMembershipRenewalController@store | `org-membership-renewal.create`; login |
| [ ] | GET | `/api/org-membership-renewals/overview` | Org/Membership/OrgMembershipRenewalController@overview | `org-membership-renewal.read`; login |
| [ ] | DELETE | `/api/org-membership-renewals/{id}` | Org/Membership/OrgMembershipRenewalController@destroy | `org-membership-renewal.delete`; login |
| [ ] | GET | `/api/org-membership-renewals/{id}` | Org/Membership/OrgMembershipRenewalController@show | `org-membership-renewal.read`; login |
| [ ] | PUT | `/api/org-membership-renewals/{id}` | Org/Membership/OrgMembershipRenewalController@update | `org-membership-renewal.update`; login |
| [ ] | GET | `/api/org-membership-types` | Org/Membership/OrgMembershipTypeController@index | `org-membership-type.read`; login |
| [ ] | POST | `/api/org-membership-types` | Org/Membership/OrgMembershipTypeController@store | `org-membership-type.create`; login |
| [ ] | DELETE | `/api/org-membership-types/{id}` | Org/Membership/OrgMembershipTypeController@destroy | `org-membership-type.delete`; login |
| [ ] | GET | `/api/org-membership-types/{id}` | Org/Membership/OrgMembershipTypeController@show | `org-membership-type.read`; login |
| [ ] | PUT | `/api/org-membership-types/{id}` | Org/Membership/OrgMembershipTypeController@update | `org-membership-type.update`; login |
| [ ] | GET | `/api/org-terminated-members` | Org/Membership/MembershipTerminationController@getOrgTerminatedMembers | login |
| [ ] | GET | `/api/this-year-new-member-count` | Org/Membership/OrgMemberController@thisYearNewMemberCount | login |
| [ ] | GET | `/api/total-org-member-count` | Org/Membership/OrgMemberController@totalOrgMemberCount | login |
| [ ] | GET | `/api/unlink-members` | Org/Membership/UnlinkMemberController@index | `unlink-member.read`; login |
| [ ] | POST | `/api/unlink-members` | Org/Membership/UnlinkMemberController@store | `unlink-member.create`; login |
| [ ] | DELETE | `/api/unlink-members/{id}` | Org/Membership/UnlinkMemberController@destroy | `unlink-member.delete`; login |
| [ ] | GET | `/api/unlink-members/{id}` | Org/Membership/UnlinkMemberController@show | `unlink-member.read`; login |
| [ ] | PUT | `/api/unlink-members/{id}` | Org/Membership/UnlinkMemberController@update | `unlink-member.update`; login |

## Committees

*Target: core*

**Features**

- [ ] Committees: add, edit, view, members with role titles, former committees
- [ ] Committee role titles and designations

**Pages**

| ✓ | Address | Route name | File | Permission |
|---|---|---|---|---|
| [ ] | `committees` | individual-committees | Individual/Committee/Index.vue | — |
| [ ] | `committees` | committees | Org/Committee/Index.vue | committee.read |

Old addresses that redirect (keep working links): `past-committees`, `former-committee-list`, `designation`

**API routes**

| ✓ | Method | Route | Controller | Access |
|---|---|---|---|---|
| [ ] | POST | `/api/committee-members` | Org/Committee/CommitteeMemberController@store | `committee-member.create`; login |
| [ ] | DELETE | `/api/committee-members/{id}` | Org/Committee/CommitteeMemberController@destroy | `committee-member.delete`; login |
| [ ] | GET | `/api/committee-members/{id}` | Org/Committee/CommitteeMemberController@index | `committee-member.read`; login |
| [ ] | PUT | `/api/committee-members/{id}` | Org/Committee/CommitteeMemberController@update | `committee-member.update`; login |
| [ ] | GET | `/api/committees` | Org/Committee/CommitteeController@index | `committee.read`; login |
| [ ] | POST | `/api/committees` | Org/Committee/CommitteeController@store | `committee.create`; login |
| [ ] | DELETE | `/api/committees/{id}` | Org/Committee/CommitteeController@destroy | `committee.delete`; login |
| [ ] | GET | `/api/committees/{id}` | Org/Committee/CommitteeController@show | `committee.read`; login |
| [ ] | PUT | `/api/committees/{id}` | Org/Committee/CommitteeController@update | `committee.update`; login |
| [ ] | GET | `/api/designations` | SuperAdmin/Settings/DesignationController@index | login |
| [ ] | POST | `/api/designations` | SuperAdmin/Settings/DesignationController@store | login; superadmin |
| [ ] | DELETE | `/api/designations/{id}` | SuperAdmin/Settings/DesignationController@destroy | login; superadmin |
| [ ] | PUT | `/api/designations/{id}` | SuperAdmin/Settings/DesignationController@update | login; superadmin |
| [ ] | GET | `/api/individual/committees` | Individual/MemberActivityController@committees | login |
| [ ] | GET | `/api/org-role-titles` | Role/OrgRoleTitleController@index | login |
| [ ] | POST | `/api/org-role-titles` | Role/OrgRoleTitleController@store | login |
| [ ] | DELETE | `/api/org-role-titles/{id}` | Role/OrgRoleTitleController@destroy | login |
| [ ] | GET | `/api/org-role-titles/{id}` | Role/OrgRoleTitleController@show | login |
| [ ] | PUT | `/api/org-role-titles/{id}` | Role/OrgRoleTitleController@update | login |

## Meetings (incl. attendance, guests, minutes)

*Target: core*

**Features**

- [ ] Meetings: list (upcoming / past), create, edit, view, delete; date, time, place, online link, agenda, privacy, attachments
- [ ] Attendance checklist (how attended + status, mark the rest, save bar, leave and close-tab warning)
- [ ] Guests list, minutes (write / view), meeting summary
- [ ] Conduct types and attendance types/statuses (lookups)

**Pages**

| ✓ | Address | Route name | File | Permission |
|---|---|---|---|---|
| [ ] | `meetings` | individual-meetings | Individual/Meeting/Index.vue | — |
| [ ] | `meeting/view/:id` | view-individual-meeting | Individual/Meeting/View.vue | — |
| [ ] | `attendances` | individual-attendances | Individual/Attendance/Index.vue | — |
| [ ] | `meetings` | index-meeting | Org/Meeting/Index.vue | meeting.read |
| [ ] | `meeting/create` | create-meeting | Org/Meeting/Create.vue | meeting.create |
| [ ] | `meeting/edit/:id` | edit-meeting | Org/Meeting/Edit.vue | meeting.update |
| [ ] | `meeting/view/:id` | view-meeting | Org/Meeting/View.vue | meeting.read |
| [ ] | `meeting-minutes` | index-meeting-minutes | Org/Meeting/MeetingMinutes/Index.vue | meeting-minute.read |
| [ ] | `meeting-minutes/create/:meetingId` | create-meeting-minutes | Org/Meeting/MeetingMinutes/Create.vue | meeting-minute.create |
| [ ] | `meeting-minutes/edit/:id` | edit-meeting-minutes | Org/Meeting/MeetingMinutes/Edit.vue | meeting-minute.update |
| [ ] | `meeting-minutes/view/:id` | view-meeting-minutes | Org/Meeting/MeetingMinutes/View.vue | meeting-minute.read |
| [ ] | `meeting/attendances/:id` | meeting-attendances | Org/Meeting/MeetingAttendances.vue | meeting-attendance.read |
| [ ] | `meeting/guest/attendance/:id` | meeting-guest-attendance | Org/Meeting/MeetingGuestAttendances.vue | meeting-guest-attendance.read |

Old addresses that redirect (keep working links): `past-meetings`, `conduct-type`, `attendance-type`

**API routes**

| ✓ | Method | Route | Controller | Access |
|---|---|---|---|---|
| [ ] | GET | `/api/attendance-statuses` | SuperAdmin/Settings/AttendanceStatusController@index | login |
| [ ] | POST | `/api/attendance-statuses` | SuperAdmin/Settings/AttendanceStatusController@store | login; superadmin |
| [ ] | DELETE | `/api/attendance-statuses/{id}` | SuperAdmin/Settings/AttendanceStatusController@destroy | login; superadmin |
| [ ] | PUT | `/api/attendance-statuses/{id}` | SuperAdmin/Settings/AttendanceStatusController@update | login; superadmin |
| [ ] | GET | `/api/attendance-types` | SuperAdmin/Settings/AttendanceTypeController@index | login |
| [ ] | POST | `/api/attendance-types` | SuperAdmin/Settings/AttendanceTypeController@store | login; superadmin |
| [ ] | DELETE | `/api/attendance-types/{id}` | SuperAdmin/Settings/AttendanceTypeController@destroy | login; superadmin |
| [ ] | PUT | `/api/attendance-types/{id}` | SuperAdmin/Settings/AttendanceTypeController@update | login; superadmin |
| [ ] | GET | `/api/conduct-types` | SuperAdmin/Settings/ConductTypeController@index | login |
| [ ] | POST | `/api/conduct-types` | SuperAdmin/Settings/ConductTypeController@store | login; superadmin |
| [ ] | DELETE | `/api/conduct-types/{id}` | SuperAdmin/Settings/ConductTypeController@destroy | login; superadmin |
| [ ] | PUT | `/api/conduct-types/{id}` | SuperAdmin/Settings/ConductTypeController@update | login; superadmin |
| [ ] | GET | `/api/individual/attendance` | Individual/MemberActivityController@attendance | login |
| [ ] | GET | `/api/individual/meetings` | Individual/MemberActivityController@meetings | login |
| [ ] | GET | `/api/individual/meetings/{id}` | Individual/MemberActivityController@meeting | login |
| [ ] | GET | `/api/meeting-attendances` | Org/Meeting/MeetingAttendanceController@index | `meeting-attendance.read`; login |
| [ ] | POST | `/api/meeting-attendances` | Org/Meeting/MeetingAttendanceController@store | `meeting-attendance.create`; login |
| [ ] | POST | `/api/meeting-attendances/bulk` | Org/Meeting/MeetingAttendanceController@bulkStore | `meeting-attendance.create`; login |
| [ ] | DELETE | `/api/meeting-attendances/{id}` | Org/Meeting/MeetingAttendanceController@destroy | `meeting-attendance.delete`; login |
| [ ] | GET | `/api/meeting-attendances/{id}` | Org/Meeting/MeetingAttendanceController@show | `meeting-attendance.read`; login |
| [ ] | PUT | `/api/meeting-attendances/{id}` | Org/Meeting/MeetingAttendanceController@update | `meeting-attendance.update`; login |
| [ ] | GET | `/api/meeting-guest-attendances` | Org/Meeting/MeetingGuestAttendanceController@index | `meeting-guest-attendance.read`; login |
| [ ] | POST | `/api/meeting-guest-attendances` | Org/Meeting/MeetingGuestAttendanceController@store | `meeting-guest-attendance.create`; login |
| [ ] | DELETE | `/api/meeting-guest-attendances/{id}` | Org/Meeting/MeetingGuestAttendanceController@destroy | `meeting-guest-attendance.delete`; login |
| [ ] | GET | `/api/meeting-guest-attendances/{id}` | Org/Meeting/MeetingGuestAttendanceController@show | `meeting-guest-attendance.read`; login |
| [ ] | PUT | `/api/meeting-guest-attendances/{id}` | Org/Meeting/MeetingGuestAttendanceController@update | `meeting-guest-attendance.update`; login |
| [ ] | GET | `/api/meeting-minutes` | Org/Meeting/MeetingMinutesController@index | `meeting-minute.read`; login |
| [ ] | POST | `/api/meeting-minutes` | Org/Meeting/MeetingMinutesController@store | `meeting-minute.create`; login |
| [ ] | DELETE | `/api/meeting-minutes/{id}` | Org/Meeting/MeetingMinutesController@destroy | `meeting-minute.delete`; login |
| [ ] | GET | `/api/meeting-minutes/{id}` | Org/Meeting/MeetingMinutesController@show | `meeting-minute.read`; login |
| [ ] | POST | `/api/meeting-minutes/{id}` | Org/Meeting/MeetingMinutesController@update | `meeting-minute.update`; login |
| [ ] | GET | `/api/meetings` | Org/Meeting/MeetingController@index | `meeting.read`; login |
| [ ] | POST | `/api/meetings` | Org/Meeting/MeetingController@store | `meeting.create`; login |
| [ ] | DELETE | `/api/meetings/{id}` | Org/Meeting/MeetingController@destroy | `meeting.delete`; login |
| [ ] | GET | `/api/meetings/{id}` | Org/Meeting/MeetingController@show | `meeting.read`; login |
| [ ] | POST | `/api/meetings/{id}` | Org/Meeting/MeetingController@update | `meeting.update`; login |
| [ ] | GET | `/api/org-next-meeting` | Org/Meeting/MeetingController@orgNextMeeting | `meeting.read`; login |

## Documents

*Target: core*

**Features**

- [ ] Office documents: list, add, edit, view, delete; files with type and size checks; remove a single file

**Pages**

| ✓ | Address | Route name | File | Permission |
|---|---|---|---|---|
| [ ] | `office-document` | index-document | Org/OfficeDocument/Index.vue | document.read |
| [ ] | `document/create` | create-document | Org/OfficeDocument/Create.vue | document.create |
| [ ] | `document/edit/:id` | edit-document | Org/OfficeDocument/Edit.vue | document.update |
| [ ] | `document/view/:id` | view-document | Org/OfficeDocument/View.vue | document.read |

**API routes**

| ✓ | Method | Route | Controller | Access |
|---|---|---|---|---|
| [ ] | GET | `/api/office-documents` | Org/OfficeDocument/OfficeDocumentController@index | `document.read`; login |
| [ ] | POST | `/api/office-documents` | Org/OfficeDocument/OfficeDocumentController@store | `document.create`; login |
| [ ] | DELETE | `/api/office-documents/{id}` | Org/OfficeDocument/OfficeDocumentController@destroy | `document.delete`; login |
| [ ] | GET | `/api/office-documents/{id}` | Org/OfficeDocument/OfficeDocumentController@show | `document.read`; login |
| [ ] | POST | `/api/office-documents/{id}` | Org/OfficeDocument/OfficeDocumentController@update | `document.update`; login |
| [ ] | PUT | `/api/office-documents/{id}` | Org/OfficeDocument/OfficeDocumentController@update | `document.update`; login |
| [ ] | DELETE | `/api/office-documents/{id}/files/{fileId}` | Org/OfficeDocument/OfficeDocumentController@destroyFile | `document.update`; login |

## Notifications

*Target: core*

**Features**

- [ ] Notifications page (all / unread, mark read, mark all read), header bell dropdown with unread count
- [ ] Notification settings per person (which notifications by channel)
- [ ] Emails: welcome on sign-up (person, organisation, Super Admin copy), added-to-organisation, password reset code, support replied

**Pages**

| ✓ | Address | Route name | File | Permission |
|---|---|---|---|---|
| [ ] | `individual-notifications` | individual-notifications | Org/Notification/Index.vue | — |
| [ ] | `notification-settings` | individual-notification-settings | Org/Notification/UserNotifications.vue | — |
| [ ] | `header-notifications` | header-notifications | Org/Layouts/HeaderNotification.vue | — |
| [ ] | `notifications` | notifications | Org/Notification/Index.vue | — |
| [ ] | `user-notifications` | user-notifications | Org/Notification/UserNotifications.vue | — |
| [ ] | `notifications` | superadmin-notifications | Org/Notification/Index.vue | — |
| [ ] | `notification-settings` | superadmin-notification-settings | Org/Notification/UserNotifications.vue | — |

Old addresses that redirect (keep working links): `header-notifications`

**API routes**

| ✓ | Method | Route | Controller | Access |
|---|---|---|---|---|
| [ ] | GET | `/api/notification-names` | Common/NotificationNameController@index | login |
| [ ] | POST | `/api/notification-names` | Common/NotificationNameController@store | login; superadmin |
| [ ] | DELETE | `/api/notification-names/{id}` | Common/NotificationNameController@destroy | login; superadmin |
| [ ] | GET | `/api/notification-names/{id}` | Common/NotificationNameController@show | login |
| [ ] | PUT | `/api/notification-names/{id}` | Common/NotificationNameController@update | login; superadmin |
| [ ] | GET | `/api/notifications/get-all` | Common/NotificationController@index | login |
| [ ] | GET | `/api/notifications/get-all/{userId}` | Common/NotificationController@getNotifications | login |
| [ ] | POST | `/api/notifications/mark-all-as-read` | Common/NotificationController@markAllAsRead | login |
| [ ] | POST | `/api/notifications/mark-all-as-read/{userId}` | Common/NotificationController@markAllAsRead | login |
| [ ] | POST | `/api/notifications/mark-as-read/{notificationId}` | Common/NotificationController@markAsRead | login |
| [ ] | POST | `/api/notifications/mark-as-read/{userId}/{notificationId}` | Common/NotificationController@markAsRead | login |
| [ ] | GET | `/api/user-notifications` | Common/UserNotificationController@index | login |
| [ ] | POST | `/api/user-notifications` | Common/UserNotificationController@store | login |
| [ ] | DELETE | `/api/user-notifications/{id}` | Common/UserNotificationController@destroy | login |
| [ ] | GET | `/api/user-notifications/{id}` | Common/UserNotificationController@show | login |
| [ ] | PUT | `/api/user-notifications/{id}` | Common/UserNotificationController@update | login |

## Reports

*Target: core (basic)*

**Features**

- [ ] Organisation report page (summary, membership growth chart), expense report
- [ ] Dashboard summaries for organisation and member home

**Pages**

| ✓ | Address | Route name | File | Permission |
|---|---|---|---|---|
| [ ] | `org-report` | org-report | Org/Report/Index.vue | — |

Old addresses that redirect (keep working links): `org-expense-report`

**API routes**

| ✓ | Method | Route | Controller | Access |
|---|---|---|---|---|
| [ ] | GET | `/api/org-expense-reports` | Org/Report/OrgReportController@getExpenseReport | login; owner |
| [ ] | GET | `/api/reports` | Org/Report/OrgReportController@getIncomeReport | login; owner |
| [ ] | GET | `/api/reports/membership-growth` | Org/Report/OrgReportController@getMembershipGrowthReport | login; owner |
| [ ] | GET | `/api/reports/summary` | Org/Report/OrgReportController@summary | login; owner |

## Support

*Target: core (basic)*

**Features**

- [ ] Help and support (organisation and member): requests list, new request, conversation view, replies
- [ ] Public Contact us form (saved as a request; spam honeypot; rate limit)
- [ ] Super Admin support inbox with replies (member notified)

**Pages**

| ✓ | Address | Route name | File | Permission |
|---|---|---|---|---|
| [ ] | `support` | individual-support | Org/Support/Index.vue | — |
| [ ] | `support/:id` | individual-support-request | Org/Support/View.vue | — |
| [ ] | `support` | support | Org/Support/Index.vue | — |
| [ ] | `support/:id` | support-request | Org/Support/View.vue | — |
| [ ] | `/contact-us` | contact-us | Common/ContactUs.vue | — |
| [ ] | `support` | superadmin-support | SuperAdmin/Support/Index.vue | — |

**API routes**

| ✓ | Method | Route | Controller | Access |
|---|---|---|---|---|
| [ ] | POST | `/api/contact` | Common/SupportRequestController@contact | throttle |
| [ ] | GET | `/api/superadmin/support-requests` | SuperAdmin/Support/SupportRequestController@index | login; superadmin |
| [ ] | GET | `/api/superadmin/support-requests/{id}` | SuperAdmin/Support/SupportRequestController@show | login; superadmin |
| [ ] | POST | `/api/superadmin/support-requests/{id}/messages` | SuperAdmin/Support/SupportRequestController@reply | login; superadmin |
| [ ] | PUT | `/api/superadmin/support-requests/{id}/status` | SuperAdmin/Support/SupportRequestController@updateStatus | login; superadmin |
| [ ] | GET | `/api/support-requests` | Common/SupportRequestController@index | login |
| [ ] | POST | `/api/support-requests` | Common/SupportRequestController@store | login; throttle |
| [ ] | GET | `/api/support-requests/{id}` | Common/SupportRequestController@show | login |
| [ ] | POST | `/api/support-requests/{id}/close` | Common/SupportRequestController@close | login |
| [ ] | POST | `/api/support-requests/{id}/messages` | Common/SupportRequestController@reply | login; throttle |

## Billing

*Target: core — becomes band pricing when moved*

**Features**

- [ ] Organisation: Subscription (plan, change plan), Your bill (current month), Invoices (list, view, print), Receipts, Refer and earn
- [ ] Plans (management packages with limits and features), regional prices, currencies, storage packages
- [ ] Bills → draft invoices → publish → record payment (manual methods: bank transfer, cash, cheque, card, other)
- [ ] Super Admin billing: bills, invoices, invoice view (publish, edit, cancel), payments, daily records, plans, subscriptions
- [ ] Scheduled jobs: daily bill and storage records, monthly bill (being replaced by band pricing — roadmap §5)
- [ ] Public Pricing page data (`/api/public/plans`)
- [ ] Old billing addresses redirect to the new pages

**Pages**

| ✓ | Address | Route name | File | Permission |
|---|---|---|---|---|
| [ ] | `subscription` | subscription | Org/Financial/Subscription.vue | — |
| [ ] | `bill-calculation` | bill-calculation | Org/Financial/BillCalculation.vue | — |
| [ ] | `view-billing/:id` | view-billing | Org/Financial/ManagementAndStorageBilling/View.vue | — |
| [ ] | `invoices` | invoices | Org/Financial/Invoice/Index.vue | — |
| [ ] | `view-invoice/:id` | view-invoice | Org/Financial/Invoice/View.vue | — |
| [ ] | `org-receipt-index` | org-receipt-index | Org/Financial/Receipt/Index.vue | — |
| [ ] | `referral` | referral | Org/Referral/Referral.vue | — |
| [ ] | `/pricing` | pricing | Common/Pricing.vue | — |
| [ ] | `super-admin-packages` | super-admin-packages | SuperAdmin/Billing/Plans.vue | — |
| [ ] | `super-admin-subscription-list` | super-admin-subscription-list | SuperAdmin/Billing/Subscriptions.vue | — |
| [ ] | `super-admin-every-day-member-count-and-bill-list` | super-admin-every-day-member-count-and-bill-list | SuperAdmin/Billing/Daily.vue | — |
| [ ] | `super-admin-management-and-storage-billing-list` | super-admin-management-and-storage-billing-list | SuperAdmin/Billing/Bills.vue | — |
| [ ] | `super-admin-invoice-list` | super-admin-invoice-list | SuperAdmin/Billing/Invoices.vue | — |
| [ ] | `super-admin-payment-log-list` | super-admin-payment-log-list | SuperAdmin/Billing/Payments.vue | — |
| [ ] | `billing/invoices/:id` | superadmin-invoice | SuperAdmin/Billing/InvoiceView.vue | — |

Old addresses that redirect (keep working links): `package`, `bill-list`, `region`, `region-currency`, `country-region`, `regional-tax-rate`, `index-currency`, `edit-package`, `view-package`, `edit-price`, `index-price`, `view-price`, `edit-subscription`, `super-admin-view-subscription`, `user-price-rate`, `super-admin-billing-list`, `super-admin-billing-create`, `super-admin-billing-edit/:id`, `super-admin-billing-view/:id`, `super-admin-every-day-member-count-and-bill-create`, `super-admin-every-day-member-count-and-bill-edit/:id`, `super-admin-every-day-member-count-and-bill-view/:id`, `super-admin-everyday-storage-billing-list`, `super-admin-everyday-storage-billing-create`, `super-admin-everyday-storage-billing-edit/:id`, `super-admin-everyday-storage-billing-view/:id`, `super-admin-management-and-storage-billing-create`, `super-admin-management-and-storage-billing-edit/:id`, `super-admin-management-and-storage-billing-view/:id`, `super-admin-invoice-create`, `super-admin-invoice-edit/:id`, `super-admin-invoice-view/:id`, `super-admin-receipt-list`, `super-admin-receipt-create`, `super-admin-receipt-edit/:id`, `super-admin-receipt-view/:id`, `super-admin-payment-log`, `super-admin-payment-log-create`, `super-admin-payment-log-edit/:id`, `super-admin-payment-log-view/:id`

**API routes**

| ✓ | Method | Route | Controller | Access |
|---|---|---|---|---|
| [ ] | GET | `/api/country-regions` | SuperAdmin/Settings/CountryRegionController@index | login |
| [ ] | POST | `/api/country-regions` | SuperAdmin/Settings/CountryRegionController@store | login; superadmin |
| [ ] | GET | `/api/country-regions/country/{country_id}` | SuperAdmin/Settings/CountryRegionController@countryWiseRegionWithCurrency | login |
| [ ] | DELETE | `/api/country-regions/{id}` | SuperAdmin/Settings/CountryRegionController@destroy | login; superadmin |
| [ ] | GET | `/api/country-regions/{id}` | SuperAdmin/Settings/CountryRegionController@show | login |
| [ ] | PUT | `/api/country-regions/{id}` | SuperAdmin/Settings/CountryRegionController@update | login; superadmin |
| [ ] | GET | `/api/currencies` | SuperAdmin/Settings/CurrencyController@index | login |
| [ ] | POST | `/api/currencies` | SuperAdmin/Settings/CurrencyController@store | login; superadmin |
| [ ] | DELETE | `/api/currencies/{id}` | SuperAdmin/Settings/CurrencyController@destroy | login; superadmin |
| [ ] | PUT | `/api/currencies/{id}` | SuperAdmin/Settings/CurrencyController@update | login; superadmin |
| [ ] | GET | `/api/every-day-member-count-and-billings` | SuperAdmin/Financial/Management/EverydayMemberCountAndBillingController@index | login; superadmin |
| [ ] | POST | `/api/every-day-member-count-and-billings` | SuperAdmin/Financial/Management/EverydayMemberCountAndBillingController@superAdminStore | login; superadmin |
| [ ] | DELETE | `/api/every-day-member-count-and-billings/{id}` | SuperAdmin/Financial/Management/EverydayMemberCountAndBillingController@destroy | login; superadmin |
| [ ] | GET | `/api/every-day-member-count-and-billings/{id}` | SuperAdmin/Financial/Management/EverydayMemberCountAndBillingController@show | login; superadmin |
| [ ] | PUT | `/api/every-day-member-count-and-billings/{id}` | SuperAdmin/Financial/Management/EverydayMemberCountAndBillingController@update | login; superadmin |
| [ ] | GET | `/api/every-day-storage-billings` | SuperAdmin/Financial/Storage/EverydayStorageBillingController@index | login; superadmin |
| [ ] | POST | `/api/every-day-storage-billings` | SuperAdmin/Financial/Storage/EverydayStorageBillingController@superAdminStore | login; superadmin |
| [ ] | DELETE | `/api/every-day-storage-billings/{id}` | SuperAdmin/Financial/Storage/EverydayStorageBillingController@destroy | login; superadmin |
| [ ] | GET | `/api/every-day-storage-billings/{id}` | SuperAdmin/Financial/Storage/EverydayStorageBillingController@show | login; superadmin |
| [ ] | PUT | `/api/every-day-storage-billings/{id}` | SuperAdmin/Financial/Storage/EverydayStorageBillingController@update | login; superadmin |
| [ ] | GET | `/api/fund-transaction-currencies` | Org/FundManagement/FundManagementController@getTransactionCurrency | controller: `fund-management.create`, `fund-management.delete`, `fund-management.read`, `fund-management.update`; login |
| [ ] | POST | `/api/fund-transaction-currencies` | Org/FundManagement/FundManagementController@storeTransactionCurrency | controller: `fund-management.create`, `fund-management.delete`, `fund-management.read`, `fund-management.update`; login |
| [ ] | PUT | `/api/fund-transaction-currencies/{id}` | Org/FundManagement/FundManagementController@updateTransactionCurrency | controller: `fund-management.create`, `fund-management.delete`, `fund-management.read`, `fund-management.update`; login |
| [ ] | GET | `/api/invoices` | SuperAdmin/Financial/InvoiceController@index | login |
| [ ] | POST | `/api/invoices` | SuperAdmin/Financial/InvoiceController@store | login; superadmin |
| [ ] | GET | `/api/invoices/all` | SuperAdmin/Financial/InvoiceController@indexForSuperadmin | login; superadmin |
| [ ] | DELETE | `/api/invoices/{id}` | SuperAdmin/Financial/InvoiceController@destroy | login; superadmin |
| [ ] | GET | `/api/invoices/{id}` | SuperAdmin/Financial/InvoiceController@show | login |
| [ ] | PUT | `/api/invoices/{id}` | SuperAdmin/Financial/InvoiceController@update | login; superadmin |
| [ ] | GET | `/api/management-and-storage-billings` | SuperAdmin/Financial/Management/ManagementAndStorageBillingController@index | login |
| [ ] | POST | `/api/management-and-storage-billings` | SuperAdmin/Financial/Management/ManagementAndStorageBillingController@store | login; superadmin |
| [ ] | GET | `/api/management-and-storage-billings/superadmin` | SuperAdmin/Financial/Management/ManagementAndStorageBillingController@indexSuperAdmin | login; superadmin |
| [ ] | POST | `/api/management-and-storage-billings/system` | SuperAdmin/Financial/Management/ManagementAndStorageBillingController@storeBySystem | login; superadmin |
| [ ] | DELETE | `/api/management-and-storage-billings/{id}` | SuperAdmin/Financial/Management/ManagementAndStorageBillingController@destroy | login; superadmin |
| [ ] | GET | `/api/management-and-storage-billings/{id}` | SuperAdmin/Financial/Management/ManagementAndStorageBillingController@show | login |
| [ ] | PUT | `/api/management-and-storage-billings/{id}` | SuperAdmin/Financial/Management/ManagementAndStorageBillingController@update | login; superadmin |
| [ ] | GET | `/api/management-packages` | SuperAdmin/Financial/Management/ManagementPackageController@index | login |
| [ ] | POST | `/api/management-packages` | SuperAdmin/Financial/Management/ManagementPackageController@store | login; superadmin |
| [ ] | DELETE | `/api/management-packages/{id}` | SuperAdmin/Financial/Management/ManagementPackageController@destroy | login; superadmin |
| [ ] | GET | `/api/management-packages/{id}` | SuperAdmin/Financial/Management/ManagementPackageController@show | login |
| [ ] | PUT | `/api/management-packages/{id}` | SuperAdmin/Financial/Management/ManagementPackageController@update | login; superadmin |
| [ ] | GET | `/api/management-pricings` | SuperAdmin/Financial/Management/ManagementPricingController@index | login; superadmin |
| [ ] | GET | `/api/management-pricings/all-user-price-rate` | SuperAdmin/Financial/Management/ManagementPricingController@getAllUserPriceRate | login; superadmin |
| [ ] | PUT | `/api/management-pricings/update` | SuperAdmin/Financial/Management/ManagementPricingController@update | login; superadmin |
| [ ] | GET | `/api/management-subscriptions` | SuperAdmin/Financial/Management/ManagementSubscriptionController@index | login |
| [ ] | POST | `/api/management-subscriptions` | SuperAdmin/Financial/Management/ManagementSubscriptionController@store | login; superadmin |
| [ ] | GET | `/api/management-subscriptions/currencies` | SuperAdmin/Financial/Management/ManagementSubscriptionController@currency | login |
| [ ] | GET | `/api/management-subscriptions/daily-price-rate` | SuperAdmin/Financial/Management/ManagementSubscriptionController@managementPriceRate | login |
| [ ] | GET | `/api/management-subscriptions/management-package-prices` | SuperAdmin/Financial/Management/ManagementSubscriptionController@managementPackagePrices | login |
| [ ] | DELETE | `/api/management-subscriptions/{id}` | SuperAdmin/Financial/Management/ManagementSubscriptionController@destroy | login; superadmin |
| [ ] | PUT | `/api/management-subscriptions/{id}` | SuperAdmin/Financial/Management/ManagementSubscriptionController@update | login |
| [ ] | GET | `/api/org-all-bill` | SuperAdmin/Financial/Management/ManagementAndStorageBillingController@orgAllBill | login |
| [ ] | GET | `/api/org-financial/current-month-bill-calculation` | SuperAdmin/Financial/Management/EverydayMemberCountAndBillingController@currentMonthBillCalculation | login |
| [ ] | GET | `/api/org-financial/sub-month-bill-calculation` | SuperAdmin/Financial/Management/EverydayMemberCountAndBillingController@subMonthBillCalculation | login |
| [ ] | GET | `/api/public/plans` | Common/PublicPlanController@index | throttle |
| [ ] | GET | `/api/receipts/org-receipts` | SuperAdmin/Financial/ReceiptController@orgIndex | login |
| [ ] | GET | `/api/referrals` | Common/ReferralController@index | login |
| [ ] | GET | `/api/referrals/stats` | Common/ReferralController@stats | login |
| [ ] | GET | `/api/region-currencies` | SuperAdmin/Settings/RegionCurrencyController@index | login; superadmin |
| [ ] | POST | `/api/region-currencies` | SuperAdmin/Settings/RegionCurrencyController@store | login; superadmin |
| [ ] | DELETE | `/api/region-currencies/{id}` | SuperAdmin/Settings/RegionCurrencyController@destroy | login; superadmin |
| [ ] | GET | `/api/region-currencies/{id}` | SuperAdmin/Settings/RegionCurrencyController@show | login; superadmin |
| [ ] | PUT | `/api/region-currencies/{id}` | SuperAdmin/Settings/RegionCurrencyController@update | login; superadmin |
| [ ] | GET | `/api/regional-tax-rates` | SuperAdmin/Financial/RegionalTaxRateController@index | login; superadmin |
| [ ] | POST | `/api/regional-tax-rates` | SuperAdmin/Financial/RegionalTaxRateController@store | login; superadmin |
| [ ] | DELETE | `/api/regional-tax-rates/{id}` | SuperAdmin/Financial/RegionalTaxRateController@destroy | login; superadmin |
| [ ] | GET | `/api/regional-tax-rates/{id}` | SuperAdmin/Financial/RegionalTaxRateController@show | login; superadmin |
| [ ] | PUT | `/api/regional-tax-rates/{id}` | SuperAdmin/Financial/RegionalTaxRateController@update | login; superadmin |
| [ ] | GET | `/api/regions` | SuperAdmin/Settings/RegionController@index | login; superadmin |
| [ ] | POST | `/api/regions` | SuperAdmin/Settings/RegionController@store | login; superadmin |
| [ ] | DELETE | `/api/regions/{id}` | SuperAdmin/Settings/RegionController@destroy | login; superadmin |
| [ ] | GET | `/api/regions/{id}` | SuperAdmin/Settings/RegionController@show | login; superadmin |
| [ ] | PUT | `/api/regions/{id}` | SuperAdmin/Settings/RegionController@update | login; superadmin |
| [ ] | GET | `/api/strategic-plans` | Org/StrategicPlan/StrategicPlanController@index | login; owner |
| [ ] | POST | `/api/strategic-plans` | Org/StrategicPlan/StrategicPlanController@store | login; owner |
| [ ] | DELETE | `/api/strategic-plans/{id}` | Org/StrategicPlan/StrategicPlanController@destroy | login; owner |
| [ ] | GET | `/api/strategic-plans/{id}` | Org/StrategicPlan/StrategicPlanController@show | login; owner |
| [ ] | POST | `/api/strategic-plans/{id}` | Org/StrategicPlan/StrategicPlanController@update | login; owner |
| [ ] | GET | `/api/superadmin/billing/bills` | SuperAdmin/Billing/BillingAdminController@bills | login; superadmin |
| [ ] | POST | `/api/superadmin/billing/bills/generate` | SuperAdmin/Billing/BillingAdminController@generateBills | login; superadmin |
| [ ] | POST | `/api/superadmin/billing/bills/invoice-month` | SuperAdmin/Billing/BillingAdminController@invoiceMonth | login; superadmin |
| [ ] | POST | `/api/superadmin/billing/bills/{id}/invoice` | SuperAdmin/Billing/BillingAdminController@invoiceBill | login; superadmin |
| [ ] | GET | `/api/superadmin/billing/daily` | SuperAdmin/Billing/BillingAdminController@daily | login; superadmin |
| [ ] | GET | `/api/superadmin/billing/invoices` | SuperAdmin/Billing/BillingAdminController@invoices | login; superadmin |
| [ ] | POST | `/api/superadmin/billing/invoices/publish-drafts` | SuperAdmin/Billing/BillingAdminController@publishDrafts | login; superadmin |
| [ ] | GET | `/api/superadmin/billing/invoices/{id}` | SuperAdmin/Billing/BillingAdminController@invoice | login; superadmin |
| [ ] | PUT | `/api/superadmin/billing/invoices/{id}` | SuperAdmin/Billing/BillingAdminController@updateInvoice | login; superadmin |
| [ ] | POST | `/api/superadmin/billing/invoices/{id}/cancel` | SuperAdmin/Billing/BillingAdminController@cancelInvoice | login; superadmin |
| [ ] | POST | `/api/superadmin/billing/invoices/{id}/payments` | SuperAdmin/Billing/BillingAdminController@recordPayment | login; superadmin |
| [ ] | POST | `/api/superadmin/billing/invoices/{id}/publish` | SuperAdmin/Billing/BillingAdminController@publishInvoice | login; superadmin |
| [ ] | GET | `/api/superadmin/billing/payments` | SuperAdmin/Billing/BillingAdminController@payments | login; superadmin |
| [ ] | GET | `/api/superadmin/billing/plans` | SuperAdmin/Billing/BillingAdminController@plans | login; superadmin |
| [ ] | PUT | `/api/superadmin/billing/plans/{id}` | SuperAdmin/Billing/BillingAdminController@updatePlan | login; superadmin |
| [ ] | PUT | `/api/superadmin/billing/plans/{id}/price` | SuperAdmin/Billing/BillingAdminController@setPrice | login; superadmin |
| [ ] | GET | `/api/superadmin/billing/subscriptions` | SuperAdmin/Billing/BillingAdminController@subscriptions | login; superadmin |
| [ ] | GET | `/api/year-plans` | Org/YearPlan/YearPlanController@index | login; owner |
| [ ] | POST | `/api/year-plans` | Org/YearPlan/YearPlanController@store | login; owner |
| [ ] | DELETE | `/api/year-plans/{id}` | Org/YearPlan/YearPlanController@destroy | login; owner |
| [ ] | GET | `/api/year-plans/{id}` | Org/YearPlan/YearPlanController@show | login; owner |
| [ ] | POST | `/api/year-plans/{id}` | Org/YearPlan/YearPlanController@update | login; owner |

## Super Admin

*Target: core*

**Features**

- [ ] Super Admin layout, overview dashboard (platform totals)
- [ ] Platform lists (lookups): country-regions, dialing-codes, account-countries, time-zones, region-currencies, tax-rates, membership-types, membership-statuses, renewal-cycles, attendance-types, attendance-statuses, conduct-types, privacy setups, countries, languages, address formats
- [ ] Roles and access: platform roles, plan roles hidden from organisations, assignments
- [ ] Super Admin profile, security, settings; user countries

**Pages**

| ✓ | Address | Route name | File | Permission |
|---|---|---|---|---|
| [ ] | `/superadmin-dashboard` | superadmin-dashboard | SuperAdmin/Layouts/Layout.vue | — |
| [ ] | `index` | superadmin-dashboard-index | SuperAdmin/Layouts/Dashboard/Index.vue | — |
| [ ] | `settings` | superadmin-settings | SuperAdmin/Settings/Index.vue | — |
| [ ] | `settings/:key` | superadmin-lookup | SuperAdmin/Settings/LookupPage.vue | — |
| [ ] | `superadmin-user-role-assign` | superadmin-user-role-assign | RolePermission/UserRoleAssign.vue | assign_roles |
| [ ] | `security` | superadmin-security | Org/Profile/Security.vue | — |
| [ ] | `super-admin-profile-update` | super-admin-profile-update | Org/Profile/Profile.vue | — |

Old addresses that redirect (keep working links): `country`, `user-country`, `dialing-code`, `language`, `time-zone-setup`, `privacy-setup`

**API routes**

| ✓ | Method | Route | Controller | Access |
|---|---|---|---|---|
| [ ] | GET | `/api/addresses/address-format` | Common/AddressController@getAddressFormat | login |
| [ ] | GET | `/api/countries` | SuperAdmin/Settings/CountryController@index | public |
| [ ] | POST | `/api/countries` | SuperAdmin/Settings/CountryController@store | login; superadmin |
| [ ] | DELETE | `/api/countries/{id}` | SuperAdmin/Settings/CountryController@destroy | login; superadmin |
| [ ] | PUT | `/api/countries/{id}` | SuperAdmin/Settings/CountryController@update | login; superadmin |
| [ ] | GET | `/api/dialing-codes` | SuperAdmin/Settings/DialingCodeController@index | login |
| [ ] | POST | `/api/dialing-codes` | SuperAdmin/Settings/DialingCodeController@store | login; superadmin |
| [ ] | DELETE | `/api/dialing-codes/{id}` | SuperAdmin/Settings/DialingCodeController@destroy | login; superadmin |
| [ ] | PUT | `/api/dialing-codes/{id}` | SuperAdmin/Settings/DialingCodeController@update | login; superadmin |
| [ ] | GET | `/api/get-user-list` | Common/UserCountryController@getUser | login |
| [ ] | GET | `/api/languages` | SuperAdmin/Settings/LanguageController@index | login |
| [ ] | POST | `/api/languages` | SuperAdmin/Settings/LanguageController@store | login; superadmin |
| [ ] | DELETE | `/api/languages/{id}` | SuperAdmin/Settings/LanguageController@destroy | login; superadmin |
| [ ] | PUT | `/api/languages/{id}` | SuperAdmin/Settings/LanguageController@update | login; superadmin |
| [ ] | GET | `/api/super_admin_profile_image/{userId}` | SuperAdmin/SuperAdminController@getSuperAdminProfileImage | login; superadmin |
| [ ] | POST | `/api/super_admin_profile_image/{userId}` | SuperAdmin/SuperAdminController@updateSuperAdminProfileImage | login; superadmin |
| [ ] | GET | `/api/super_admin_user_data/{id}` | SuperAdmin/SuperAdminController@show | login; superadmin |
| [ ] | GET | `/api/superadmin/access` | SuperAdmin/Access/RoleAdminController@index | login; superadmin |
| [ ] | POST | `/api/superadmin/access/permissions` | SuperAdmin/Access/RoleAdminController@storePermission | login; superadmin |
| [ ] | DELETE | `/api/superadmin/access/permissions/{id}` | SuperAdmin/Access/RoleAdminController@destroyPermission | login; superadmin |
| [ ] | POST | `/api/superadmin/access/roles` | SuperAdmin/Access/RoleAdminController@store | login; superadmin |
| [ ] | DELETE | `/api/superadmin/access/roles/{id}` | SuperAdmin/Access/RoleAdminController@destroy | login; superadmin |
| [ ] | PUT | `/api/superadmin/access/roles/{id}` | SuperAdmin/Access/RoleAdminController@update | login; superadmin |
| [ ] | GET | `/api/superadmin/overview` | SuperAdmin/DashboardController@overview | login; superadmin |
| [ ] | GET | `/api/time-zone-setups` | SuperAdmin/Settings/TimeZoneSetupController@index | login; superadmin |
| [ ] | POST | `/api/time-zone-setups` | SuperAdmin/Settings/TimeZoneSetupController@store | login; superadmin |
| [ ] | DELETE | `/api/time-zone-setups/{id}` | SuperAdmin/Settings/TimeZoneSetupController@destroy | login; superadmin |
| [ ] | PUT | `/api/time-zone-setups/{id}` | SuperAdmin/Settings/TimeZoneSetupController@update | login; superadmin |
| [ ] | GET | `/api/user-countries` | Common/UserCountryController@index | login |
| [ ] | POST | `/api/user-countries` | Common/UserCountryController@store | login |
| [ ] | GET | `/api/user-countries/country-name` | Org/OrgProfileController@getOrgCountry | login |
| [ ] | DELETE | `/api/user-countries/{id}` | Common/UserCountryController@destroy | login |
| [ ] | GET | `/api/user-countries/{id}` | Common/UserCountryController@show | login |
| [ ] | PUT | `/api/user-countries/{id}` | Common/UserCountryController@update | login |
| [ ] | GET | `/api/user-languages` | Common/UserLanguageController@index | login |
| [ ] | POST | `/api/user-languages` | Common/UserLanguageController@store | login |
| [ ] | GET | `/api/user-languages/language-name` | Common/UserLanguageController@getUserLanguage | login |
| [ ] | DELETE | `/api/user-languages/{id}` | Common/UserLanguageController@destroy | login |
| [ ] | GET | `/api/user-languages/{id}` | Common/UserLanguageController@show | login |
| [ ] | PUT | `/api/user-languages/{id}` | Common/UserLanguageController@update | login |

## Finance

*Target: module*

**Features**

- [ ] Funds: list, add, edit, delete
- [ ] Fund management: income and expense transactions with photos and documents, totals, currency, filters, export

**Pages**

| ✓ | Address | Route name | File | Permission |
|---|---|---|---|---|
| [ ] | `fund` | fund | Org/FundManagement/Fund.vue | fund.read |
| [ ] | `fund-management` | fund-management | Org/FundManagement/Index.vue | fund-management.read |

**API routes**

| ✓ | Method | Route | Controller | Access |
|---|---|---|---|---|
| [ ] | GET | `/api/fund-transactions` | Org/FundManagement/FundManagementController@index | `fund-management.read`; login |
| [ ] | POST | `/api/fund-transactions` | Org/FundManagement/FundManagementController@store | `fund-management.create`; login |
| [ ] | DELETE | `/api/fund-transactions/{id}` | Org/FundManagement/FundManagementController@destroy | `fund-management.delete`; login |
| [ ] | PUT | `/api/fund-transactions/{id}` | Org/FundManagement/FundManagementController@update | `fund-management.update`; login |
| [ ] | GET | `/api/funds` | Org/FundManagement/FundController@index | `fund.read`; login |
| [ ] | POST | `/api/funds` | Org/FundManagement/FundController@store | `fund.create`; login |
| [ ] | DELETE | `/api/funds/{id}` | Org/FundManagement/FundController@destroy | `fund.delete`; login |
| [ ] | PUT | `/api/funds/{id}` | Org/FundManagement/FundController@update | `fund.update`; login |

## Events

*Target: module*

**Features**

- [ ] Events: list, create, edit, view, delete; date, time, conduct type, venue, details, attachments, on/off, families welcome
- [ ] Event attendance, guests, event reports (summary create/edit/view)

**Pages**

| ✓ | Address | Route name | File | Permission |
|---|---|---|---|---|
| [ ] | `events` | individual-events | Individual/Event/Index.vue | — |
| [ ] | `event/view/:id` | view-individual-event | Individual/Event/View.vue | — |
| [ ] | `events` | index-event | Org/Event/Index.vue | event.read |
| [ ] | `event/create` | create-event | Org/Event/Create.vue | event.create |
| [ ] | `event/edit/:id` | edit-event | Org/Event/Edit.vue | event.update |
| [ ] | `event/view/:id` | view-event | Org/Event/View.vue | event.read |
| [ ] | `event-summary` | index-event-summary | Org/Event/EventSummary/Index.vue | event-summary.read |
| [ ] | `event-summary/create/:eventId` | create-event-summary | Org/Event/EventSummary/Create.vue | event-summary.create |
| [ ] | `event-summary/edit/:id` | edit-event-summary | Org/Event/EventSummary/Edit.vue | event-summary.update |
| [ ] | `event-summary/view/:id` | view-event-summary | Org/Event/EventSummary/View.vue | event-summary.read |
| [ ] | `event/attendances/:id` | event-attendances | Org/Event/EventAttendances.vue | event-attendance.read |
| [ ] | `event/guest/attendance/:id` | event-guest-attendance | Org/Event/EventGuestAttendance.vue | event-guest-attendance.read |

Old addresses that redirect (keep working links): `past-events`, `upcoming-events`

**API routes**

| ✓ | Method | Route | Controller | Access |
|---|---|---|---|---|
| [ ] | GET | `/api/event-attendances` | Org/Event/EventAttendanceController@index | `event-attendance.read`; login |
| [ ] | POST | `/api/event-attendances` | Org/Event/EventAttendanceController@store | `event-attendance.create`; login |
| [ ] | POST | `/api/event-attendances/bulk` | Org/Event/EventAttendanceController@bulkStore | `event-attendance.create`; login |
| [ ] | DELETE | `/api/event-attendances/{id}` | Org/Event/EventAttendanceController@destroy | `event-attendance.delete`; login |
| [ ] | GET | `/api/event-attendances/{id}` | Org/Event/EventAttendanceController@show | `event-attendance.read`; login |
| [ ] | PUT | `/api/event-attendances/{id}` | Org/Event/EventAttendanceController@update | `event-attendance.update`; login |
| [ ] | GET | `/api/event-guest-attendances` | Org/Event/EventGuestAttendanceController@index | `event-guest-attendance.read`; login |
| [ ] | POST | `/api/event-guest-attendances` | Org/Event/EventGuestAttendanceController@store | `event-guest-attendance.create`; login |
| [ ] | DELETE | `/api/event-guest-attendances/{id}` | Org/Event/EventGuestAttendanceController@destroy | `event-guest-attendance.delete`; login |
| [ ] | GET | `/api/event-guest-attendances/{id}` | Org/Event/EventGuestAttendanceController@show | `event-guest-attendance.read`; login |
| [ ] | PUT | `/api/event-guest-attendances/{id}` | Org/Event/EventGuestAttendanceController@update | `event-guest-attendance.update`; login |
| [ ] | GET | `/api/event-summaries` | Org/Event/EventSummaryController@index | `event-summary.read`; login |
| [ ] | POST | `/api/event-summaries` | Org/Event/EventSummaryController@store | `event-summary.create`; login |
| [ ] | DELETE | `/api/event-summaries/{id}` | Org/Event/EventSummaryController@destroy | `event-summary.delete`; login |
| [ ] | GET | `/api/event-summaries/{id}` | Org/Event/EventSummaryController@show | `event-summary.read`; login |
| [ ] | POST | `/api/event-summaries/{id}` | Org/Event/EventSummaryController@update | `event-summary.update`; login |
| [ ] | GET | `/api/events` | Org/Event/EventController@index | `event.read`; login |
| [ ] | POST | `/api/events` | Org/Event/EventController@store | `event.create`; login |
| [ ] | GET | `/api/events/event/{eventId}` | Org/Event/EventController@getEvent | `event.read`; login |
| [ ] | DELETE | `/api/events/{eventId}` | Org/Event/EventController@destroy | `event.delete`; login |
| [ ] | POST | `/api/events/{eventId}` | Org/Event/EventController@update | `event.update`; login |
| [ ] | GET | `/api/individual/events` | Individual/MemberActivityController@events | login |
| [ ] | GET | `/api/individual/events/{id}` | Individual/MemberActivityController@event | login |

## Projects

*Target: module*

**Features**

- [ ] Projects: list, create, edit, view, delete; participants, guests, project reports (summary)

**Pages**

| ✓ | Address | Route name | File | Permission |
|---|---|---|---|---|
| [ ] | `projects` | individual-projects | Individual/Project/Index.vue | — |
| [ ] | `project/view/:id` | view-individual-project | Individual/Project/View.vue | — |
| [ ] | `projects` | index-project | Org/Project/Index.vue | project.read |
| [ ] | `project/create` | create-project | Org/Project/Create.vue | project.create |
| [ ] | `project/edit/:id` | edit-project | Org/Project/Edit.vue | project.update |
| [ ] | `project/view/:id` | view-project | Org/Project/View.vue | project.read |
| [ ] | `project/attendances/:id` | project-attendances | Org/Project/ProjectAttendances.vue | project-attendance.read |
| [ ] | `project/guest/attendance/:id` | project-guest-attendance | Org/Project/ProjectGuestAttendance.vue | project-guest-attendance.read |
| [ ] | `project-summary` | index-project-summary | Org/Project/ProjectSummary/Index.vue | project-summary.read |
| [ ] | `project-summary/create/:projectId` | create-project-summary | Org/Project/ProjectSummary/Create.vue | project-summary.create |
| [ ] | `project-summary/edit/:summaryId` | edit-project-summary | Org/Project/ProjectSummary/Edit.vue | project-summary.update |
| [ ] | `project-summary/view/:summaryId` | view-project-summary | Org/Project/ProjectSummary/View.vue | project-summary.read |

Old addresses that redirect (keep working links): `past-projects`

**API routes**

| ✓ | Method | Route | Controller | Access |
|---|---|---|---|---|
| [ ] | GET | `/api/individual/projects` | Individual/MemberActivityController@projects | login |
| [ ] | GET | `/api/individual/projects/{id}` | Individual/MemberActivityController@project | login |
| [ ] | GET | `/api/project-attendances` | Org/Project/ProjectAttendanceController@index | `project-attendance.read`; login |
| [ ] | POST | `/api/project-attendances` | Org/Project/ProjectAttendanceController@store | `project-attendance.create`; login |
| [ ] | POST | `/api/project-attendances/bulk` | Org/Project/ProjectAttendanceController@bulkStore | `project-attendance.create`; login |
| [ ] | DELETE | `/api/project-attendances/{id}` | Org/Project/ProjectAttendanceController@destroy | `project-attendance.delete`; login |
| [ ] | GET | `/api/project-attendances/{id}` | Org/Project/ProjectAttendanceController@show | `project-attendance.read`; login |
| [ ] | PUT | `/api/project-attendances/{id}` | Org/Project/ProjectAttendanceController@update | `project-attendance.update`; login |
| [ ] | GET | `/api/project-guest-attendances` | Org/Project/ProjectGuestAttendanceController@index | `project-guest-attendance.read`; login |
| [ ] | POST | `/api/project-guest-attendances` | Org/Project/ProjectGuestAttendanceController@store | `project-guest-attendance.create`; login |
| [ ] | DELETE | `/api/project-guest-attendances/{id}` | Org/Project/ProjectGuestAttendanceController@destroy | `project-guest-attendance.delete`; login |
| [ ] | GET | `/api/project-guest-attendances/{id}` | Org/Project/ProjectGuestAttendanceController@show | `project-guest-attendance.read`; login |
| [ ] | PUT | `/api/project-guest-attendances/{id}` | Org/Project/ProjectGuestAttendanceController@update | `project-guest-attendance.update`; login |
| [ ] | GET | `/api/project-summaries` | Org/Project/ProjectSummaryController@index | `project-summary.read`; login |
| [ ] | POST | `/api/project-summaries` | Org/Project/ProjectSummaryController@store | `project-summary.create`; login |
| [ ] | DELETE | `/api/project-summaries/{id}` | Org/Project/ProjectSummaryController@destroy | `project-summary.delete`; login |
| [ ] | GET | `/api/project-summaries/{id}` | Org/Project/ProjectSummaryController@show | `project-summary.read`; login |
| [ ] | POST | `/api/project-summaries/{id}` | Org/Project/ProjectSummaryController@update | `project-summary.update`; login |
| [ ] | GET | `/api/projects` | Org/Project/ProjectController@index | `project.read`; login |
| [ ] | POST | `/api/projects` | Org/Project/ProjectController@store | `project.create`; login |
| [ ] | DELETE | `/api/projects/{id}` | Org/Project/ProjectController@destroy | `project.delete`; login |
| [ ] | POST | `/api/projects/{id}` | Org/Project/ProjectController@update | `project.update`; login |
| [ ] | GET | `/api/projects/{projectId}` | Org/Project/ProjectController@show | `project.read`; login |

## Assets

*Target: module*

**Features**

- [ ] Assets: list, add, edit, view; holder history and handover

**Pages**

| ✓ | Address | Route name | File | Permission |
|---|---|---|---|---|
| [ ] | `assets` | individual-assets | Individual/Asset/Index.vue | — |
| [ ] | `asset-management` | index-asset | Org/Asset/Index.vue | asset.read |
| [ ] | `asset/create` | create-asset | Org/Asset/Create.vue | asset.create |
| [ ] | `asset/edit/:id` | edit-asset | Org/Asset/Edit.vue | asset.update |
| [ ] | `asset/view/:id` | view-asset | Org/Asset/View.vue | asset.read |

Old addresses that redirect (keep working links): `past-assets`

**API routes**

| ✓ | Method | Route | Controller | Access |
|---|---|---|---|---|
| [ ] | GET | `/api/asset-lifecycle-setups` | Org/Asset/AssetLifecycleStatusController@index | login |
| [ ] | GET | `/api/assets` | Org/Asset/AssetController@index | `asset.read`; login |
| [ ] | POST | `/api/assets` | Org/Asset/AssetController@store | `asset.create`; login |
| [ ] | GET | `/api/assets/{assetId}` | Org/Asset/AssetController@getAssetDetails | `asset.read`; login |
| [ ] | DELETE | `/api/assets/{id}` | Org/Asset/AssetController@destroy | `asset.delete`; login |
| [ ] | POST | `/api/assets/{id}` | Org/Asset/AssetController@update | `asset.update`; login |
| [ ] | POST | `/api/assets/{id}/handover` | Org/Asset/AssetController@handover | `asset.update`; login |
| [ ] | GET | `/api/individual/assets` | Individual/MemberActivityController@assets | login |

## Planning

*Target: module*

**Features**

- [ ] Strategic plans and year plans: list, add, edit, view

**Pages**

| ✓ | Address | Route name | File | Permission |
|---|---|---|---|---|
| [ ] | `strategic-plan` | strategic-plan | Org/StrategicPlan/Index.vue | — |
| [ ] | `strategic-plan/create` | create-strategic-plan | Org/StrategicPlan/Create.vue | — |
| [ ] | `strategic-plan/edit/:id` | edit-strategic-plan | Org/StrategicPlan/Edit.vue | — |
| [ ] | `strategic-plan/view/:id` | view-strategic-plan | Org/StrategicPlan/View.vue | — |
| [ ] | `year-plan` | year-plan | Org/YearPlan/Index.vue | — |
| [ ] | `year-plan/create` | create-year-plan | Org/YearPlan/Create.vue | — |
| [ ] | `year-plan/edit/:id` | edit-year-plan | Org/YearPlan/Edit.vue | — |
| [ ] | `year-plan/view/:id` | view-year-plan | Org/YearPlan/View.vue | — |

## Public pages

*Target: marketing pages → azonation-site; sign-in, not found, no access stay in the app*

**Features**

- [ ] Landing via login page; Pricing (real plans, country picker, cost estimate), Help centre (searchable questions), About, Contact, Terms, Privacy, Cookies
- [ ] Accounts for members / for organisations overview pages; Not found; No access; Style guide (internal)

**Pages**

| ✓ | Address | Route name | File | Permission |
|---|---|---|---|---|
| [ ] | `/individual` | individual | Common/IndividualAccountOverview.vue | — |
| [ ] | `/organisation` | organisation | Common/OrganisationAccountOverview.vue | — |
| [ ] | `/help` | help | Common/HelpCenter.vue | — |
| [ ] | `/cookies` | cookies | Common/Cookies.vue | — |
| [ ] | `/privacy-policy` | privacy-policy | Common/PrivacyPolicy.vue | — |
| [ ] | `/terms-of-service` | terms-of-service | Common/TermsOfService.vue | — |
| [ ] | `/about-us` | about-us | Common/AboutUs.vue | — |
| [ ] | `/style-guide` | style-guide |  | — |
| [ ] | `/:pathMatch(.*)*` | not-found | Common/NotFound.vue | — |

## Shop

*Target: Azonation-only — reshape at its roadmap step*

**Features**

- [ ] Super Admin shop: products, brands, categories, sub-categories, business types, orders (old style, kept as is)

**Pages**

| ✓ | Address | Route name | File | Permission |
|---|---|---|---|---|
| [ ] | `index-business-type` | index-business-type | SuperAdmin/E-commerce/BusinessType.vue | — |
| [ ] | `index-category` | index-category | SuperAdmin/E-commerce/Category.vue | — |
| [ ] | `index-sub-category` | index-sub-category | SuperAdmin/E-commerce/SubCategory.vue | — |
| [ ] | `index-sub-sub-category` | index-sub-sub-category | SuperAdmin/E-commerce/SubSubCategory.vue | — |
| [ ] | `index-brand` | index-brand | SuperAdmin/E-commerce/Brand.vue | — |
| [ ] | `products-list` | products-list | SuperAdmin/E-commerce/product/Index.vue | — |
| [ ] | `product-create` | product-create | SuperAdmin/E-commerce/product/Create.vue | — |
| [ ] | `product-edit/:id` | product-edit | SuperAdmin/E-commerce/product/Edit.vue | — |
| [ ] | `product-view/:id` | product-view | SuperAdmin/E-commerce/product/View.vue | — |
| [ ] | `orders-list` | orders-list | SuperAdmin/E-commerce/order/Index.vue | — |
| [ ] | `order-create` | order-create | SuperAdmin/E-commerce/order/Create.vue | — |
| [ ] | `order-edit/:id` | order-edit | SuperAdmin/E-commerce/order/Edit.vue | — |
| [ ] | `order-view/:id` | order-view | SuperAdmin/E-commerce/order/View.vue | — |

**API routes**

| ✓ | Method | Route | Controller | Access |
|---|---|---|---|---|
| [ ] | GET | `/api/brands` | Ecommerce/BrandController@index | login; superadmin |
| [ ] | POST | `/api/brands` | Ecommerce/BrandController@store | login; superadmin |
| [ ] | DELETE | `/api/brands/{id}` | Ecommerce/BrandController@destroy | login; superadmin |
| [ ] | GET | `/api/brands/{id}` | Ecommerce/BrandController@show | login; superadmin |
| [ ] | PUT | `/api/brands/{id}` | Ecommerce/BrandController@update | login; superadmin |
| [ ] | GET | `/api/business-types` | Ecommerce/Category/BusinessTypeController@index | login; superadmin |
| [ ] | POST | `/api/business-types` | Ecommerce/Category/BusinessTypeController@store | login; superadmin |
| [ ] | DELETE | `/api/business-types/{id}` | Ecommerce/Category/BusinessTypeController@destroy | login; superadmin |
| [ ] | GET | `/api/business-types/{id}` | Ecommerce/Category/BusinessTypeController@show | login; superadmin |
| [ ] | PUT | `/api/business-types/{id}` | Ecommerce/Category/BusinessTypeController@update | login; superadmin |
| [ ] | GET | `/api/categories` | Ecommerce/Category/CategoryController@index | login; superadmin |
| [ ] | POST | `/api/categories` | Ecommerce/Category/CategoryController@store | login; superadmin |
| [ ] | DELETE | `/api/categories/{id}` | Ecommerce/Category/CategoryController@destroy | login; superadmin |
| [ ] | GET | `/api/categories/{id}` | Ecommerce/Category/CategoryController@show | login; superadmin |
| [ ] | PUT | `/api/categories/{id}` | Ecommerce/Category/CategoryController@update | login; superadmin |
| [ ] | GET | `/api/order-details` | Ecommerce/Order/OrderDetailController@index | login; superadmin |
| [ ] | POST | `/api/order-details` | Ecommerce/Order/OrderDetailController@store | login; superadmin |
| [ ] | DELETE | `/api/order-details/{id}` | Ecommerce/Order/OrderDetailController@destroy | login; superadmin |
| [ ] | GET | `/api/order-details/{id}` | Ecommerce/Order/OrderDetailController@show | login; superadmin |
| [ ] | PUT | `/api/order-details/{id}` | Ecommerce/Order/OrderDetailController@update | login; superadmin |
| [ ] | GET | `/api/order-items` | Ecommerce/Order/OrderItemController@index | login; superadmin |
| [ ] | POST | `/api/order-items` | Ecommerce/Order/OrderItemController@store | login; superadmin |
| [ ] | DELETE | `/api/order-items/{id}` | Ecommerce/Order/OrderItemController@destroy | login; superadmin |
| [ ] | GET | `/api/order-items/{id}` | Ecommerce/Order/OrderItemController@show | login; superadmin |
| [ ] | PUT | `/api/order-items/{id}` | Ecommerce/Order/OrderItemController@update | login; superadmin |
| [ ] | GET | `/api/orders` | Ecommerce/Order/OrderController@index | login; superadmin |
| [ ] | POST | `/api/orders` | Ecommerce/Order/OrderController@store | login; superadmin |
| [ ] | DELETE | `/api/orders/{id}` | Ecommerce/Order/OrderController@destroy | login; superadmin |
| [ ] | GET | `/api/orders/{id}` | Ecommerce/Order/OrderController@show | login; superadmin |
| [ ] | PUT | `/api/orders/{id}` | Ecommerce/Order/OrderController@update | login; superadmin |
| [ ] | GET | `/api/products` | Ecommerce/Product/ProductController@index | login; superadmin |
| [ ] | POST | `/api/products` | Ecommerce/Product/ProductController@store | login; superadmin |
| [ ] | DELETE | `/api/products/{id}` | Ecommerce/Product/ProductController@destroy | login; superadmin |
| [ ] | GET | `/api/products/{id}` | Ecommerce/Product/ProductController@show | login; superadmin |
| [ ] | PUT | `/api/products/{id}` | Ecommerce/Product/ProductController@update | login; superadmin |
| [ ] | GET | `/api/sub-categories` | Ecommerce/Category/SubCategoryController@index | login; superadmin |
| [ ] | POST | `/api/sub-categories` | Ecommerce/Category/SubCategoryController@store | login; superadmin |
| [ ] | DELETE | `/api/sub-categories/{id}` | Ecommerce/Category/SubCategoryController@destroy | login; superadmin |
| [ ] | GET | `/api/sub-categories/{id}` | Ecommerce/Category/SubCategoryController@show | login; superadmin |
| [ ] | PUT | `/api/sub-categories/{id}` | Ecommerce/Category/SubCategoryController@update | login; superadmin |
| [ ] | GET | `/api/sub-sub-categories` | Ecommerce/Category/SubSubCategoryController@index | login; superadmin |
| [ ] | POST | `/api/sub-sub-categories` | Ecommerce/Category/SubSubCategoryController@store | login; superadmin |
| [ ] | DELETE | `/api/sub-sub-categories/{id}` | Ecommerce/Category/SubSubCategoryController@destroy | login; superadmin |
| [ ] | GET | `/api/sub-sub-categories/{id}` | Ecommerce/Category/SubSubCategoryController@show | login; superadmin |
| [ ] | PUT | `/api/sub-sub-categories/{id}` | Ecommerce/Category/SubSubCategoryController@update | login; superadmin |

## Cross-cutting features

These are not pages; every module relies on them.

- [ ] Azonation Calm design system: Az components (page header, card, button, inputs, select, textarea, checkbox, modal with top layer, data table with phone list, segmented, badge, menu, avatar, empty state, skeleton, list toolbar, pagination, appearance settings, rich text, charts)
- [ ] Light / dark / system theme; colour tokens only
- [ ] Translations English + Bangla (→ 10 languages with RTL in the new app)
- [ ] Toasts and confirm dialogs (no SweetAlert)
- [ ] List pages: search, filters, sort, column choice, pagination, export CSV / Excel / PDF / Word, print
- [ ] Attachments: images and documents with type and size checks; rich text with safe HTML
- [ ] Attendance components shared by meetings, events, projects (checklist, guests, marker)
- [ ] Organisation access: current organisation sent with every request (`X-Org-Id`); role-holders open only permitted pages; owner-only pages
- [ ] Server security: every organisation route checks the current organisation; permission middleware; Super Admin guard; rate limits on login, register, password reset, contact; safe error messages
- [ ] Phone layout everywhere (48px touch targets, sidebar drawer)
- [ ] Top loader and page loader; skip-to-content link; accessible labels
- [ ] Super Admin lookup pages driven by one config (`lookups.js`)

## Permissions

All permissions in the database (organisation roles are built from these). Each must exist in the new app.

| ✓ | Permission group | Actions |
|---|---|---|
| [ ] | `asset` | create, delete, read, update |
| [ ] | `committee-member` | create, delete, read, update |
| [ ] | `committee` | create, delete, read, update |
| [ ] | `document` | create, delete, read, update |
| [ ] | `event-attendance` | create, delete, read, update |
| [ ] | `event-guest-attendance` | create, delete, read, update |
| [ ] | `event-summary` | create, delete, read, update |
| [ ] | `event` | create, delete, read, update |
| [ ] | `former-committee` | create, delete, read, update |
| [ ] | `fund-management` | create, delete, read, update |
| [ ] | `fund` | create, delete, read, update |
| [ ] | `meeting-attendance` | create, delete, read, update |
| [ ] | `meeting-guest-attendance` | create, delete, read, update |
| [ ] | `meeting-minute` | create, delete, read, update |
| [ ] | `meeting` | create, delete, read, update |
| [ ] | `member-family` | read |
| [ ] | `member` | create, delete, read, update |
| [ ] | `org-membership-renewal-cycle` | create, delete, read, update |
| [ ] | `org-membership-renewal-price` | create, delete, read, update |
| [ ] | `org-membership-renewal` | create, delete, read, update |
| [ ] | `org-membership-type` | create, delete, read, update |
| [ ] | `project-attendance` | create, delete, read, update |
| [ ] | `project-guest-attendance` | create, delete, read, update |
| [ ] | `project-summary` | create, delete, read, update |
| [ ] | `project` | create, delete, read, update |
| [ ] | `terminated-member` | create, delete, read, update |
| [ ] | `unlink-member` | create, delete, read, update |
| [ ] | `user` | create, delete, read, update |

## Scheduled jobs, commands, emails

**Scheduled jobs** (`routes/console.php`, needs cron `schedule:run`)

- [ ] `generate:everyday-management-bill` — daily 23:50
- [ ] `generate:everyday-storage-bill` — daily 23:55
- [ ] `generate:management-and-storage-bill` — monthly, 1st at 02:00

**Console commands**

- [ ] `GenerateEverydayManagementBill`
- [ ] `GenerateEverydayStorageBill`
- [ ] `GenerateManagementAndStorageBillingOrder`
- [ ] `GenerateManagementAndStorageInvoice`
- [ ] `GenerateMonthlyManagementAndStorageBill`

**Emails** (`app/Mail`)

- [ ] `AddMemberSuccessMail`
- [ ] `IndividualUserRegisteredMail`
- [ ] `OrgUserRegisteredMail`
- [ ] `PasswordResetCodeMail`
- [ ] `SuperAdminUserRegisteredMail`

**In-app notifications** (`app/Notifications`)

- [ ] `AddMemberSuccess`
- [ ] `SupportReplied`

## Access rules to define when moving

These organisation routes check that the person is logged in and work only on the current organisation, but they have **no permission or owner rule** in the old app, so any role-holder of the organisation can use them. In the new app give each one a permission (or make it owner-only) before ticking it. Example: membership terminations should require `terminated-member.*`.

| ✓ | Module | Method | Route | Controller |
|---|---|---|---|---|
| [ ] | access | GET | `/api/permissions` | Role/PermissionController@index |
| [ ] | access | GET | `/api/roles` | Role/RoleController@index |
| [ ] | access | GET | `/api/roles-permissions` | Role/RoleController@permissions |
| [ ] | access | GET | `/api/users` | Role/UserRoleController@getUsers |
| [ ] | access | PUT | `/api/users/{user}/roles` | Role/UserRoleController@assignRoles |
| [ ] | billing | GET | `/api/invoices` | SuperAdmin/Financial/InvoiceController@index |
| [ ] | billing | GET | `/api/invoices/{id}` | SuperAdmin/Financial/InvoiceController@show |
| [ ] | billing | GET | `/api/management-and-storage-billings` | SuperAdmin/Financial/Management/ManagementAndStorageBillingController@index |
| [ ] | billing | GET | `/api/management-and-storage-billings/{id}` | SuperAdmin/Financial/Management/ManagementAndStorageBillingController@show |
| [ ] | billing | GET | `/api/management-packages` | SuperAdmin/Financial/Management/ManagementPackageController@index |
| [ ] | billing | GET | `/api/management-packages/{id}` | SuperAdmin/Financial/Management/ManagementPackageController@show |
| [ ] | billing | GET | `/api/management-subscriptions` | SuperAdmin/Financial/Management/ManagementSubscriptionController@index |
| [ ] | billing | GET | `/api/management-subscriptions/daily-price-rate` | SuperAdmin/Financial/Management/ManagementSubscriptionController@managementPriceRate |
| [ ] | billing | GET | `/api/management-subscriptions/management-package-prices` | SuperAdmin/Financial/Management/ManagementSubscriptionController@managementPackagePrices |
| [ ] | billing | PUT | `/api/management-subscriptions/{id}` | SuperAdmin/Financial/Management/ManagementSubscriptionController@update |
| [ ] | billing | GET | `/api/org-all-bill` | SuperAdmin/Financial/Management/ManagementAndStorageBillingController@orgAllBill |
| [ ] | billing | GET | `/api/org-financial/current-month-bill-calculation` | SuperAdmin/Financial/Management/EverydayMemberCountAndBillingController@currentMonthBillCalculation |
| [ ] | billing | GET | `/api/org-financial/sub-month-bill-calculation` | SuperAdmin/Financial/Management/EverydayMemberCountAndBillingController@subMonthBillCalculation |
| [ ] | billing | GET | `/api/receipts/org-receipts` | SuperAdmin/Financial/ReceiptController@orgIndex |
| [ ] | committees | GET | `/api/org-role-titles` | Role/OrgRoleTitleController@index |
| [ ] | committees | POST | `/api/org-role-titles` | Role/OrgRoleTitleController@store |
| [ ] | committees | GET | `/api/org-role-titles/{id}` | Role/OrgRoleTitleController@show |
| [ ] | committees | PUT | `/api/org-role-titles/{id}` | Role/OrgRoleTitleController@update |
| [ ] | committees | DELETE | `/api/org-role-titles/{id}` | Role/OrgRoleTitleController@destroy |
| [ ] | membership | GET | `/api/independent-members` | Org/Membership/OrgIndependentMemberController@index |
| [ ] | membership | POST | `/api/independent-members` | Org/Membership/OrgIndependentMemberController@store |
| [ ] | membership | GET | `/api/independent-members/{id}` | Org/Membership/OrgIndependentMemberController@show |
| [ ] | membership | PUT | `/api/independent-members/{id}` | Org/Membership/OrgIndependentMemberController@update |
| [ ] | membership | DELETE | `/api/independent-members/{id}` | Org/Membership/OrgIndependentMemberController@destroy |
| [ ] | membership | GET | `/api/membership-renewal-cycles` | SuperAdmin/Settings/MembershipRenewalCycleController@index |
| [ ] | membership | GET | `/api/membership-terminations` | Org/Membership/MembershipTerminationController@index |
| [ ] | membership | POST | `/api/membership-terminations` | Org/Membership/MembershipTerminationController@store |
| [ ] | membership | GET | `/api/membership-terminations/{id}` | Org/Membership/MembershipTerminationController@show |
| [ ] | membership | PUT | `/api/membership-terminations/{id}` | Org/Membership/MembershipTerminationController@update |
| [ ] | membership | DELETE | `/api/membership-terminations/{id}` | Org/Membership/MembershipTerminationController@destroy |
| [ ] | membership | GET | `/api/membership-types` | SuperAdmin/Settings/MembershipTypeController@index |
| [ ] | membership | GET | `/api/org-all-member-name` | Org/Membership/OrgMemberController@getOrgAllMemberName |
| [ ] | membership | GET | `/api/org-members-users/{orgId}` | Role/UserRoleController@getOrgMemberList |
| [ ] | membership | POST | `/api/org-members/check` | Org/Membership/OrgMemberController@checkMember |
| [ ] | membership | GET | `/api/org-members/list/{userId}` | Org/Membership/OrgMemberController@getMemberList |
| [ ] | membership | POST | `/api/org-members/search` | Org/Membership/OrgMemberController@search |
| [ ] | membership | GET | `/api/org-terminated-members` | Org/Membership/MembershipTerminationController@getOrgTerminatedMembers |
| [ ] | membership | GET | `/api/this-year-new-member-count` | Org/Membership/OrgMemberController@thisYearNewMemberCount |
| [ ] | membership | GET | `/api/total-org-member-count` | Org/Membership/OrgMemberController@totalOrgMemberCount |
| [ ] | org-content | GET | `/api/org-administrators` | Org/OrgAdministratorController@index |
| [ ] | org-content | POST | `/api/org-administrators` | Org/OrgAdministratorController@store |
| [ ] | org-content | POST | `/api/org-administrators/check` | Org/OrgAdministratorController@checkAdministratorExists |
| [ ] | org-content | GET | `/api/org-administrators/primary` | Org/OrgAdministratorController@getPrimaryAdministrator |
| [ ] | org-content | PUT | `/api/org-administrators/{id}` | Org/OrgAdministratorController@update |
| [ ] | org-content | DELETE | `/api/org-administrators/{id}` | Org/OrgAdministratorController@destroy |
| [ ] | org-content | GET | `/api/org-profile-data/{userId}` | Org/OrgProfileController@index |
| [ ] | org-content | GET | `/api/org-profile/logo` | Org/OrgProfileController@getLogo |
| [ ] | org-content | POST | `/api/org-profile/logo/{userId}` | Org/OrgProfileController@updateLogo |
