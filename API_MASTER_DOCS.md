# Waffer API — Master Documentation

> **Base URL:** `https://waffer.runasp.net`  
> **Version:** `1.0` | **Spec:** OpenAPI 3.0.4  
> **Auth:** Bearer JWT — all private endpoints require `Authorization: Bearer <token>`

---

## 🌐 API Response Envelope (CRITICAL)

**ALL** API responses are wrapped in a standard envelope. Never access data directly off `response.data` — always unwrap `.data`:

```json
{
  "success": true,
  "message": "تم تسجيل الدخول بنجاح",
  "data": { /* the actual payload */ },
  "pagination": null,
  "error": null,
  "timestamp": "2026-05-02T01:12:48Z"
}
```

**In services:** `authService.login()` returns `response.data` (the envelope). To get the payload, use `envelope.data`.  
**In AuthContext:** This is already handled — `login()` unwraps `envelope?.data || envelope` automatically.  
**In UI components:** All service methods already return the envelope's `.data` field — so no additional unwrapping needed in components, only in `AuthContext`.

**Login response payload shape** (`envelope.data`):
```json
{
  "userId": "uuid",
  "userName": "admin",
  "email": "admin@test.com",
  "role": 2,
  "isVerified": false,
  "token": "eyJ...",
  "tokenExpiration": "2026-05-02T05:32:48Z",
  "refreshToken": "...",
  "refreshTokenExpiration": "2026-05-09T01:12:48Z"
}
```



These integers are sent **to** and received **from** the API. The frontend must map them to human-readable labels.

| Enum | Values |
|------|--------|
| `AccountType` | `0` = Charity, `1` = DonorOrganization |
| `UserRole` | `0` = Charity, `1` = DonorOrganization, `2` = Admin |
| `ApplicationStatus` | `0` = Pending, `1` = Accepted, `2` = Rejected |
| `ProductCategory` | `0` = Food, `1` = Clothing, `2` = Medical, `3` = Education, `4` = Other |
| `CharityNeedPriority` | `0` = Urgent, `1` = High, `2` = Normal, `3` = Low |
| `CharityNeedStatus` | `0` = Pending, `1` = Approved, `2` = Rejected, `3` = Fulfilled |
| `OfferStatus` | `0` = Pending, `1` = Approved, `2` = Rejected, `3` = Expired, `4` = Fulfilled |

---

## 🔐 Authentication Endpoints (`/api/v1/auth`)

### `POST /api/v1/auth/register`
**Purpose:** Register a new Charity or DonorOrganization account.

**Request Body (`application/json`):**
```json
{
  "accountType": 0,           // REQUIRED: AccountType enum (0=Charity, 1=DonorOrganization)
  "name": "Organization Name", // REQUIRED: 3–200 chars
  "username": "username01",    // REQUIRED: 3–50 chars, must be unique
  "email": "org@email.com",    // REQUIRED: valid email, must be unique
  "phone": "0123456789",       // REQUIRED: valid phone format
  "password": "Pass@1234",     // REQUIRED: min 5 chars
  "confirmPassword": "Pass@1234", // REQUIRED: must match password
  "description": "About us...", // OPTIONAL: 10–1000 chars
  "whatsapp": "0123456789",    // OPTIONAL
  "city": "Cairo",             // OPTIONAL
  "governorate": "Cairo",      // OPTIONAL
  "postalCode": "12345"        // OPTIONAL
}
```

**Responses:**
| Status | Meaning |
|--------|---------|
| `201 Created` | Account created. Verification email sent. **Redirect to "Check your email" screen.** |
| `400 Bad Request` | Validation error. Map `error.validationErrors` to form fields. |
| `409 Conflict` | Username or email already exists. Show `error.appMessage`. |
| `500` | Server error. |

---

### `POST /api/v1/auth/login`
**Purpose:** Login with username/email and password. **Email must be verified first.**

**Request Body (`application/json`):**
```json
{
  "usernameOrEmail": "user@email.com", // REQUIRED
  "password": "Pass@1234",             // REQUIRED: min 5 chars
  "rememberMe": false                   // OPTIONAL: boolean (default: false)
}
```

**Success Response (`200 OK`):**
> ⚠️ The response includes `token`, `refreshToken`, `role` (integer), and user profile data.
> `AuthContext.login()` handles all token storage and role mapping automatically.

**Responses:**
| Status | Meaning |
|--------|---------|
| `200 OK` | Returns `{ token, refreshToken, role, ...userProfile }`. |
| `400` | Validation error. |
| `401` | Invalid credentials. Show `error.appMessage`. |
| `403` | Email not verified **OR** account is deactivated. Show `error.appMessage`. |

---

### `POST /api/v1/auth/refresh`
**Purpose:** Exchange a valid refresh token for a new access token + refresh token pair. Handled automatically by `apiClient.js`.

**Request Body:**
```json
{ "refreshToken": "string" }
```

**Responses:** `200 OK` → new `{ token, refreshToken }` | `401` → refresh expired, force logout.

---

### `POST /api/v1/auth/logout`
**Purpose:** Revoke the current refresh token server-side. Call `useAuth().logout()` which handles this + local cleanup.

**Responses:** `200 OK` | `401` Unauthorized.

---

### `GET /api/v1/auth/verify-email`
**Purpose:** Verify a user's email using the link from the verification email.

**Query Params:** `userId` (UUID), `token` (string)

**Responses:** `200 OK` (verified) | `400` (invalid/expired token) | `404` (user not found).

---

### `POST /api/v1/auth/resend-verification`
**Purpose:** Resend the verification email.

**Request Body:** `{ "email": "user@email.com" }`

**Responses:** `200 OK` | `400` (invalid email) | `404` (user not found or already verified).

---

## 🏠 Public Endpoints (`/api/v1/public`) — No Auth Required

### `GET /api/v1/public/charity-needs`
**Purpose:** Browse all **Approved** charity needs. Used on the Browse page for Donor users.

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `Category` | `int` | ProductCategory enum (0–4) |
| `Priority` | `int` | CharityNeedPriority enum (0–3) |
| `City` | `string` | Filter by city |
| `Governorate` | `string` | Filter by governorate |
| `Search` | `string` | Search by product name |
| `Page` | `int` | Default 1, min 1 |
| `PageSize` | `int` | Default 10, max 50 |

**Response:** `200 OK` → paginated list of approved charity needs.

---

### `GET /api/v1/public/charity-needs/{charityNeedId}`
**Purpose:** Get a single approved charity need detail by UUID.

**Path Param:** `charityNeedId` (UUID)

**Responses:** `200 OK` | `404` (not found or not approved).

---

### `GET /api/v1/public/offers`
**Purpose:** Browse all **Approved** donor offers. Used on the Browse page for Charity users.

**Query Params:** Same as charity-needs: `Category`, `City`, `Governorate`, `Search`, `Page`, `PageSize`.

**Response:** `200 OK` → paginated list of approved offers.

---

### `GET /api/v1/public/offers/{offerId}`
**Purpose:** Get a single approved offer detail by UUID.

**Responses:** `200 OK` | `404` (not found or not approved).

---

### `GET /api/v1/public/statistics`
**Purpose:** Platform-wide stats for the landing page (total needs, offers, users).

**Response:** `200 OK` → `{ totalApprovedNeeds, totalApprovedOffers, totalUsers, ... }`.

---

## 🤲 Charity Endpoints (`/api/v1/charity`) — Role: `Charity`

> ⚠️ **PREREQUISITE:** User must be **email-verified AND admin-approved** (`IsVerified = true`). Creating posts before approval returns `403 Forbidden`.

### `POST /api/v1/charity/charity-needs`
**Purpose:** Create a new charity need. Starts as `Pending`, must be admin-approved.

**Request:** `multipart/form-data`
```
Category:     int (REQUIRED) — ProductCategory enum (0–4)
ProductName:  string (REQUIRED) — max 200 chars
Quantity:     int (REQUIRED) — min 1
Priority:     int (REQUIRED) — CharityNeedPriority enum (0–3)
Description:  string (OPTIONAL) — max 1000 chars
ProductImage: file (OPTIONAL) — .jpg/.jpeg/.png/.webp, max 2MB
```

**Responses:** `201 Created` | `400` (validation/invalid image) | `403` (not verified) | `404` (profile not found).

---

### `GET /api/v1/charity/charity-needs`
**Purpose:** Get the authenticated charity's own needs (all statuses visible to owner).

**Query Params:** `Status` (CharityNeedStatus enum), `Page`, `PageSize`.

**Response:** `200 OK` → paginated list.

---

### `GET /api/v1/charity/charity-needs/{charityNeedId}`
**Purpose:** Get a single need owned by the authenticated charity.

**Responses:** `200 OK` | `403` (does not belong to caller) | `404`.

---

### `PUT /api/v1/charity/charity-needs/{charityNeedId}`
**Purpose:** Update a **Pending** charity need. Only fields sent (non-null) are applied.

> ⚠️ **Business Rule:** Only `Pending` (status=0) needs can be edited. API returns `422` otherwise. **Hide Edit button for non-Pending posts.**

**Request:** `multipart/form-data` (all fields optional)
```
Category, ProductName, Quantity, Priority, Description, ProductImage
```

**Responses:** `200 OK` | `400` | `403` (not owner) | `404` | `422` (not Pending).

---

### `DELETE /api/v1/charity/charity-needs/{charityNeedId}`
**Purpose:** Delete a **Pending** charity need. Also deletes the stored image.

> ⚠️ **Business Rule:** Only `Pending` needs can be deleted. Returns `422` otherwise. **Hide Delete button for non-Pending posts.**

**Responses:** `200 OK` | `403` (not owner) | `404` | `422` (not Pending).

---

### `POST /api/v1/charity/charity-needs/{charityNeedId}/fulfill`
**Purpose:** Mark an **Approved** charity need as **Fulfilled**.

> Only `Approved` (status=1) needs can be fulfilled. Returns `422` otherwise.

**Responses:** `200 OK` | `403` | `404` | `422` (not Approved).

---

### `GET /api/v1/charity/applications/received`
**Purpose:** Get all need-applications received by this charity (from donor orgs wanting to help).

**Query Params:** `Page`, `PageSize`.

**Response:** `200 OK` → paginated list of applications.

---

### `POST /api/v1/charity/applications/{needApplicationId}/accept`
**Purpose:** Accept a **Pending** need-application received by the charity.

**Responses:** `200 OK` | `403` (not this charity's need) | `404` | `422` (not Pending).

---

### `POST /api/v1/charity/applications/{needApplicationId}/reject`
**Purpose:** Reject a **Pending** need-application received by the charity.

**Responses:** `200 OK` | `403` | `404` | `422`.

---

### `POST /api/v1/charity/offers/{offerId}/apply`
**Purpose:** Apply the authenticated charity to an **Approved** donor offer. One application per offer.

**Responses:** `201 Created` | `403` (not verified) | `404` (offer not found/available) | `409` (already applied).

---

### `GET /api/v1/charity/applications/sent`
**Purpose:** Get offer-applications sent by this charity (applications to donor offers).

**Query Params:** `Page`, `PageSize`.

**Response:** `200 OK` → paginated list.

---

### `DELETE /api/v1/charity/applications/{offerApplicationId}`
**Purpose:** Cancel a **Pending** offer-application sent by the charity.

**Responses:** `200 OK` | `403` (not the caller's application) | `404` | `422` (not Pending).

---

### `GET /api/v1/charity/dashboard`
**Purpose:** Dashboard statistics for the authenticated charity.

**Response:** `200 OK` → `{ needCounts: {byStatus}, receivedApplicationCounts, sentApplicationCounts }`.

---

## 🏢 Donor Organization Endpoints (`/api/v1/donor-organization`) — Role: `DonorOrganization`

> ⚠️ Same verification prerequisite: must be admin-approved to post or apply.

### `POST /api/v1/donor-organization/offer`
**Purpose:** Create a new donor offer. Starts as `Pending`, must be admin-approved.

**Request:** `multipart/form-data`
```
Category:     int (REQUIRED) — ProductCategory enum (0–4)
ProductName:  string (REQUIRED) — max 200 chars
Quantity:     int (REQUIRED) — min 1
ExpiryDate:   string (REQUIRED) — ISO 8601 date-time, must be a future date
Description:  string (OPTIONAL) — max 1000 chars
ProductImage: file (OPTIONAL) — .jpg/.jpeg/.png/.webp, max 2MB
```

**Responses:** `201 Created` | `400` | `403` (not verified) | `404`.

---

### `GET /api/v1/donor-organization/offer/my-offers`
**Purpose:** Get the authenticated donor's own offers (all statuses).

**Query Params:** `Status` (OfferStatus enum), `Page`, `PageSize`.

**Response:** `200 OK` → paginated list.

---

### `GET /api/v1/donor-organization/offer/my-offers/{offerId}`
**Purpose:** Get a single offer owned by the authenticated donor.

**Responses:** `200 OK` | `403` (not owner) | `404`.

---

### `PUT /api/v1/donor-organization/offer/{offerId}`
**Purpose:** Update a **Pending** offer. Only fields sent (non-null) are applied.

> ⚠️ **Business Rule:** Only `Pending` offers can be edited. Returns `422` otherwise.

**Request:** `multipart/form-data` (all optional): `Category`, `ProductName`, `Quantity`, `ExpiryDate`, `Description`, `ProductImage`.

**Responses:** `200 OK` | `400` | `403` | `404` | `422` (not Pending).

---

### `DELETE /api/v1/donor-organization/offer/{offerId}`
**Purpose:** Delete a **Pending** offer. Also deletes stored image.

**Responses:** `200 OK` | `403` | `404` | `422` (not Pending).

---

### `PATCH /api/v1/donor-organization/offer/{offerId}/fulfill`
**Purpose:** Mark an **Approved** offer as **Fulfilled**.

**Responses:** `200 OK` | `403` | `404` | `422` (not Approved).

---

### `GET /api/v1/donor-organization/offer-applications/received`
**Purpose:** Get all offer-applications received by the donor org (charities applying to their offers).

**Query Params:** `Page`, `PageSize`.

**Response:** `200 OK` → paginated list.

---

### `PATCH /api/v1/donor-organization/offer-applications/{offerApplicationId}/accept`
**Purpose:** Accept a **Pending** offer-application received by the donor.

**Responses:** `200 OK` | `403` | `404` | `422` (not Pending).

---

### `PATCH /api/v1/donor-organization/offer-applications/{offerApplicationId}/reject`
**Purpose:** Reject a **Pending** offer-application received by the donor.

**Responses:** `200 OK` | `403` | `404` | `422` (not Pending).

---

### `POST /api/v1/donor-organization/charity-needs/{charityNeedId}/apply`
**Purpose:** Apply the authenticated donor to an **Approved** charity need. One application per need.

**Responses:** `201 Created` | `403` (not verified) | `404` | `409` (already applied).

---

### `GET /api/v1/donor-organization/dashboard`
**Purpose:** Dashboard statistics for the authenticated donor org.

**Response:** `200 OK` → `{ offerCounts: {byStatus}, receivedApplicationCounts, sentApplicationCounts }`.

---

## 👤 Profile Endpoints (`/api/v1/profile`) — Any Authenticated User

### `GET /api/v1/profile`
**Purpose:** Get the full profile of the authenticated user (contact info, location, image URL).

**Response:** `200 OK` → full profile object.

---

### `PUT /api/v1/profile`
**Purpose:** Update the authenticated user's contact/location fields. All fields optional (patch semantics).

**Request Body (`application/json`):**
```json
{
  "phone": "0123456789",        // OPTIONAL, valid phone format
  "whatsapp": "0123456789",     // OPTIONAL
  "city": "Cairo",              // OPTIONAL, max 100 chars
  "governorate": "Cairo",       // OPTIONAL, max 100 chars
  "postalCode": "12345"         // OPTIONAL, max 20 chars
}
```

**Responses:** `200 OK` | `400` (validation) | `401` | `404`.

---

### `PATCH /api/v1/profile/password`
**Purpose:** Change the authenticated user's password.

**Request Body (`application/json`):**
```json
{
  "currentPassword": "OldPass@1234",  // REQUIRED
  "newPassword": "NewPass@1234",       // REQUIRED: min 5 chars
  "confirmPassword": "NewPass@1234"    // REQUIRED: must match newPassword
}
```

**Responses:** `200 OK` | `400` (wrong current password or validation error) | `401` | `404`.

---

### `PATCH /api/v1/profile/image`
**Purpose:** Update the authenticated user's profile image.

**Request:** `multipart/form-data`
```
Image: file (REQUIRED) — .jpg/.jpeg/.png/.webp, max 2MB
```

**Responses:** `200 OK` | `400` (invalid format/size) | `401` | `404`.

---

## 🛡️ Admin Endpoints (`/api/v1/admin`) — Role: `Admin`

### `GET /api/v1/admin/dashboard`
**Purpose:** Aggregated admin dashboard stats (total users, pending verifications, pending needs, pending offers).

**Response:** `200 OK` → stats object.

---

### `GET /api/v1/admin/verifications/pending`
**Purpose:** Get all users with `ApplicationStatus = Pending (0)` — charities and donors awaiting approval.

**Response:** `200 OK` → `{ charities: [...], donorOrganizations: [...] }`.

---

### `POST /api/v1/admin/verifications/verify`
**Purpose:** Approve a user — sets `ApplicationStatus` to `Accepted (1)`.

**Request Body:** `{ "userId": "UUID" }`

**Responses:** `200 OK` | `400` | `404` | `403` (not admin).

---

### `POST /api/v1/admin/verifications/reject`
**Purpose:** Reject a user registration — sets `ApplicationStatus` to `Rejected (2)`.

**Request Body:** `{ "userId": "UUID" }`

**Responses:** `200 OK` | `400` | `404` | `403`.

---

### `GET /api/v1/admin/users`
**Purpose:** Get all users with optional filters.

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `Role` | `int` | UserRole enum (0–2) |
| `IsActive` | `bool` | Filter active/inactive users |
| `Page` | `int` | Default 1 |
| `PageSize` | `int` | Default 10, max 50 |

**Response:** `200 OK` → paginated list.

---

### `POST /api/v1/admin/users/deactivate`
**Purpose:** Deactivate a user — sets `IsActive` to `false`.

**Request Body:** `{ "userId": "UUID" }`

**Responses:** `200 OK` | `400` | `404` | `403`.

---

### `POST /api/v1/admin/users/activate`
**Purpose:** Activate a user — sets `IsActive` to `true`.

**Request Body:** `{ "userId": "UUID" }`

**Responses:** `200 OK` | `400` | `404` | `403`.

---

### `GET /api/v1/admin/charity-needs/pending`
**Purpose:** Get all charity needs with `Status = Pending (0)`.

**Query Params:** `Page`, `PageSize`.

**Response:** `200 OK` → paginated list.

---

### `POST /api/v1/admin/charity-needs/approve`
**Purpose:** Approve a charity need — sets status to `Approved (1)`.

**Request Body:** `{ "charityNeedId": "UUID" }`

**Responses:** `200 OK` | `400` | `404` | `422` (not Pending) | `403`.

---

### `POST /api/v1/admin/charity-needs/reject`
**Purpose:** Reject a charity need — sets status to `Rejected (2)`.

**Request Body:** `{ "charityNeedId": "UUID" }`

**Responses:** `200 OK` | `400` | `404` | `422` (not Pending) | `403`.

---

### `GET /api/v1/admin/offers/pending`
**Purpose:** Get all offers with `Status = Pending (0)`.

**Query Params:** `Page`, `PageSize`.

**Response:** `200 OK` → paginated list.

---

### `POST /api/v1/admin/offers/approve`
**Purpose:** Approve an offer — sets status to `Approved (1)`.

**Request Body:** `{ "offerId": "UUID" }`

**Responses:** `200 OK` | `400` | `404` | `422` (not Pending) | `403`.

---

### `POST /api/v1/admin/offers/reject`
**Purpose:** Reject an offer — sets status to `Rejected (2)`.

**Request Body:** `{ "offerId": "UUID" }`

**Responses:** `200 OK` | `400` | `404` | `422` (not Pending) | `403`.

---

## 🔧 Service Layer Quick Reference

All services live in `src/services/`. `apiClient.js` auto-attaches the Bearer token and handles errors.

| Service File | Key Methods |
|---|---|
| `authService.js` | `login(credentials)`, `register(userData)`, `logout()`, `verifyEmail(userId, token)`, `resendVerification(email)` |
| `dashboardService.js` | `getCharityDashboard()`, `getDonorDashboard()`, `getAdminDashboard()`, `getPublicStatistics()` |
| `charityNeedsService.js` | `getPublicCharityNeeds(params)`, `createCharityNeed(formData)`, `getMyCharityNeeds(params)`, `updateCharityNeed(id, formData)`, `deleteCharityNeed(id)`, `fulfillCharityNeed(id)`, `getPendingCharityNeeds(params)`, `approveCharityNeed(id)`, `rejectCharityNeed(id)` |
| `offersService.js` | `getPublicOffers(params)`, `createOffer(formData)`, `getMyOffers(params)`, `updateOffer(id, formData)`, `deleteOffer(id)`, `fulfillOffer(id)`, `getPendingOffers(params)`, `approveOffer(id)`, `rejectOffer(id)` |
| `applicationsService.js` | `applyToOffer(offerId)`, `applyToNeed(charityNeedId)`, `getReceivedNeedApplications(params)`, `acceptNeedApplication(id)`, `rejectNeedApplication(id)`, `getReceivedOfferApplications(params)`, `acceptOfferApplication(id)`, `rejectOfferApplication(id)`, `getSentOfferApplications(params)`, `cancelOfferApplication(id)` |
| `profileService.js` | `getProfile()`, `updateProfile(data)`, `changePassword(data)`, `updateImage(formData)` |
| `adminUsersService.js` | `getPendingVerifications()`, `verifyUser(userId)`, `rejectUser(userId)`, `getUsers(params)`, `deactivateUser(userId)`, `activateUser(userId)` |

---

## 🧪 Test Credentials

| Role | Username | Email | Password |
|------|----------|-------|----------|
| Admin | `admin` | `admin@test.com` | `Admin@1234` |
| Charity | `charity1` | `charity@test.com` | `Charity@1234` |
| Donor | `donor1` | `donor@test.com` | `Donor@1234` |

> **Tip:** Use Admin to approve Charity/Donor registrations, then approve posts so they appear in browse sections.

---

## ⚡ Error Handling Contract

`apiClient.js` standardizes all errors. In components, always catch with:

```js
try {
  const data = await someService.method();
} catch (error) {
  // For 400: map field errors to form
  if (error.validationErrors) { /* map to form fields */ }
  // For all others: show a toast or alert
  setErrorMsg(error.appMessage); 
}
```

| Property | Populated When | Content |
|----------|---------------|---------|
| `error.appMessage` | Always on API error | Human-readable message string |
| `error.validationErrors` | Only on `400` with field errors | Object: `{ fieldName: ["error msg"] }` |
| `error.apiStatus` | Always on API error | HTTP status code integer |
