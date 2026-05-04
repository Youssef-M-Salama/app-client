# Waffer — Full API Integration Roadmap

## 📖 Essential Context (Read This First)

### What's Already Done
- **`src/services/*.js`** — All service files are **100% complete**. Do NOT modify them.
- **`src/services/apiClient.js`** — Auto-attaches `Bearer` token. On `401`, auto-retries with refresh token or force-logouts. Standardizes all errors.
- **`src/context/AuthContext.jsx`** — `AuthProvider` wraps the whole app in `src/app/layout.jsx`. Fully handles login, token storage in cookies, role mapping, and session persistence in `localStorage`.

### Hook API — `useAuth()`
```js
const { user, isAuthenticated, role, isLoading, login, logout } = useAuth();
```
| Property | Type | Value |
|----------|------|-------|
| `user` | object | Full user/profile object from login response |
| `isAuthenticated` | bool | `true` if a valid access token cookie exists |
| `role` | string | `'Charity'`, `'DonorOrganization'`, or `'Admin'` |
| `isLoading` | bool | `true` during initial session hydration |
| `login(credentials)` | async fn | Calls API, stores tokens, sets role — **throws on failure** |
| `logout()` | async fn | Calls API logout, clears all cookies/localStorage, redirects to `/login` |

### Error Handling Pattern (Use in Every Async Handler)
```js
try {
  const data = await someService.method(payload);
  // handle success
} catch (error) {
  if (error.validationErrors) {
    // Map field errors → only present on 400 with FluentValidation output
    // Shape: { "FieldName": ["Error message"] }
    setFieldErrors(error.validationErrors);
  } else {
    // Generic message for 401, 403, 404, 409, 422, 500
    setErrorMessage(error.appMessage);
  }
}
```

### ⚠️ API Response Envelope (CONFIRMED from live API)
All responses are wrapped: `{ success, message, data, pagination, error, timestamp }`.

**Services return the envelope directly.** In `AuthContext.login()`, we unwrap it: `payload = envelope?.data || envelope`.  
In all **UI components**: service methods return the envelope — use `result.data` if you need a nested field. However, most service methods already just call `return response.data` (the axios layer), so components receive the full envelope object.

**Login payload** (inside `envelope.data`):
```json
{ "userId": "...", "userName": "...", "email": "...", "role": 2, "isVerified": false, "token": "...", "refreshToken": "..." }
```



### Business Rules Reference
- **New posts (Needs & Offers)** start as `Pending (0)` and are invisible to the public until an Admin approves them.
- **Lock Rule:** Edit & Delete buttons **MUST be hidden** if `post.status !== 0` (not Pending). The API returns `422` if violated.
- **Verification Gate:** Charities/Donors can log in after email verification, but **cannot create posts or apply** until an Admin approves their account (`IsVerified = true`). API returns `403` if violated.
- **Application Ownership:** Only the post **owner** can accept/reject applications on it. Only the **sender** can cancel a Pending application.

### Enum Cheatsheet (send integers to API, show strings to user)
| Enum | Values |
|------|--------|
| `AccountType` | `0`=Charity, `1`=DonorOrganization |
| `ProductCategory` | `0`=Food, `1`=Clothing, `2`=Medical, `3`=Education, `4`=Other |
| `CharityNeedPriority` | `0`=Urgent, `1`=High, `2`=Normal, `3`=Low |
| `CharityNeedStatus` | `0`=Pending, `1`=Approved, `2`=Rejected, `3`=Fulfilled |
| `OfferStatus` | `0`=Pending, `1`=Approved, `2`=Rejected, `3`=Expired, `4`=Fulfilled |
| `UserRole` | `0`=Charity, `1`=DonorOrganization, `2`=Admin |
| `ApplicationStatus` | `0`=Pending, `1`=Accepted, `2`=Rejected |

---

## ✅ Phase Completion Status
- [x] Phase 0: Prerequisites (Service Layer + AuthContext) — **DONE**
- [x] Phase 1: Authentication & Route Protection — **DONE** ✅
- [x] **Phase 2: Core Dashboards (My Posts)** — **DONE** ✅
- [x] **Phase 3: Applications Workflow** — **DONE** ✅
- [x] **Phase 4: Admin Controls** — **DONE** ✅
- [x] **Phase 5: Profile Management** — **DONE** ✅

---

## 🔐 Phase 1: Authentication & Route Protection

### Task 1.1 — Wire Register Form
**File:** `src/components/forms/RegisterForm.jsx`  
**Service:** `authService.register(userData)`  
**API:** `POST /api/v1/auth/register`

**Payload Shape:**
```js
{
  accountType: 0,          // int: 0=Charity, 1=DonorOrganization — from radio buttons
  name: "string",          // REQUIRED: 3–200 chars
  username: "string",      // REQUIRED: 3–50 chars
  email: "string",         // REQUIRED: valid email
  phone: "string",         // REQUIRED
  password: "string",      // REQUIRED: min 5 chars
  confirmPassword: "string" // REQUIRED: must match password
}
```

**State to manage:** `isLoading`, `fieldErrors`, `generalError`

**Logic:**
1. `'use client'` directive required (hooks + event handlers).
2. On submit → set `isLoading = true`, call `authService.register(formData)`.
3. **On `201` success** → redirect to `/register/success` (or show an inline success banner: "Check your email to verify your account."). Do NOT auto-login.
4. **On `400` error** → `error.validationErrors` contains field-level errors. Map them below each input.
5. **On `409` error** → `error.appMessage` = "Username or email already exists." Show as general form error.
6. Always reset `isLoading = false` in `finally`.

**Current State:** Form is static HTML with no state or handlers.

---

### Task 1.2 — Wire Login Form
**File:** `src/components/forms/LoginForm.jsx`  
**Hook:** `useAuth()` → call `login(credentials)` — **do NOT call `authService.login` directly**  
**API (handled internally):** `POST /api/v1/auth/login`

**Payload Shape (passed to `login()`):**
```js
{
  usernameOrEmail: "string", // REQUIRED
  password: "string",        // REQUIRED: min 5 chars
  rememberMe: false          // OPTIONAL boolean
}
```

**State to manage:** `isLoading`, `errorMessage`

**Logic:**
1. `'use client'` directive required.
2. On submit → call `const { login } = useAuth()`, then `await login(credentials)`.
3. **On success** → `login()` returns the response data. Check the `role` from `useAuth()`:
   - `role === 'Admin'` → `router.push('/admin')`
   - `role === 'Charity'` or `'DonorOrganization'` → `router.push('/posts')` (or the main dashboard route)
4. **On failure** → `error.appMessage` covers:
   - `401`: "Invalid credentials."
   - `403`: "Email not verified" OR "Account is deactivated."
   - Show `errorMessage` below the form.

**Current State:** Form is static HTML with no state or handlers. Input is type="email" but the API field is `usernameOrEmail` — update the label & placeholder accordingly.

---

### Task 1.3 — Route Protection (AuthGuard)
**File:** Create `src/components/layout/AuthGuard.jsx` (new file)  
**Hook:** `useAuth()`

**Guard Logic:**
```
isLoading === true  →  Show a full-page spinner (do not render children)
isAuthenticated === false  →  router.push('/login') and return null
role === 'Admin' on a /(dashboard) route  →  router.push('/admin') and return null
role !== 'Admin' on a /(admin) route  →  router.push('/posts') and return null
All checks pass  →  render children
```

**Integration:**
- Wrap the layout in `src/app/(dashboard)/layout.jsx` with `<AuthGuard requiredRole={['Charity', 'DonorOrganization']}>`.
- Wrap the layout in `src/app/(admin)/layout.jsx` with `<AuthGuard requiredRole={['Admin']}>`.

**"Under Review" Banner (Phase 1 Restriction):**
- After authentication, if `user?.isVerified === false` (or `user?.applicationStatus === 0`), show a dismissible yellow banner at the top of the dashboard:
  > _"مرحباً! حسابك قيد المراجعة من قبل الإدارة. ستتمكن من نشر الاحتياجات والعروض بعد الموافقة."_
- This does NOT block navigation — just blocks create/apply actions (the API enforces this with `403`).

---

## 📊 Phase 2: Core Dashboards (My Posts)

### Task 2.1 — Fetch & Display Posts
**File:** `src/app/(dashboard)/posts/page.jsx` & `src/components/cards/PostCard.jsx`

**Logic:**
1. `'use client'` — use `useEffect` to fetch on mount.
2. Get `role` from `useAuth()`.
3. If `role === 'Charity'` → call `charityNeedsService.getMyCharityNeeds({ Page: 1, PageSize: 20 })`.
4. If `role === 'DonorOrganization'` → call `offersService.getMyOffers({ Page: 1, PageSize: 20 })`.
5. Handle loading state and error display.

**In `PostCard.jsx`:**
- Show: `productName`, `category` (mapped string), `status` (mapped string), `quantity`, `priority` (Charity only), `expiryDate` (Donor only).
- **Lock Rule:** `post.status === 0` → show Edit & Delete buttons. Otherwise → hide them completely.
- Optionally show a "Mark as Fulfilled" button if `post.status === 1` (Approved).

---

### Task 2.2 — Create / Edit Post Modal
**File:** `src/components/ui/PostFormModal.jsx`

**For Charity (charityNeedsService):**
- **Create:** `charityNeedsService.createCharityNeed(formData)` where `formData` is a `FormData` object.
- **Update:** `charityNeedsService.updateCharityNeed(id, formData)`

**Required FormData fields (Charity Create):**
```js
const fd = new FormData();
fd.append('Category', 0);           // int enum — DO NOT send as string
fd.append('ProductName', 'Rice');
fd.append('Quantity', 100);
fd.append('Priority', 2);           // int enum
fd.append('Description', '...');    // optional
fd.append('ProductImage', file);    // optional File object
```

**For Donor (offersService):**
- **Create:** `offersService.createOffer(formData)`
- **Update:** `offersService.updateOffer(id, formData)`

**Required FormData fields (Donor Create):**
```js
fd.append('Category', 0);
fd.append('ProductName', 'Clothing');
fd.append('Quantity', 50);
fd.append('ExpiryDate', '2026-12-31T00:00:00Z'); // ISO 8601 future date
fd.append('Description', '...');    // optional
fd.append('ProductImage', file);    // optional
```

**Error Handling:**
- `400` → `error.validationErrors` → map to form fields.
- `403` → `error.appMessage` → show banner: "Account not yet verified by admin."

---

### Task 2.3 — Delete Post
**File:** `src/components/ui/DeleteConfirmModal.jsx`

**Logic:**
1. Show a confirmation dialog.
2. On confirm → call `charityNeedsService.deleteCharityNeed(id)` or `offersService.deleteOffer(id)`.
3. On success → close modal, remove item from the parent list state (optimistic update or re-fetch).
4. On `422` → `error.appMessage` = "Cannot delete: post is not in Pending status." (Should not appear if Lock Rule is followed.)

---

## 🤝 Phase 3: Applications Workflow

### Task 3.1 — Browse Public Directory
**File:** `src/app/(dashboard)/browse/page.jsx`

**Logic:**
1. If `role === 'DonorOrganization'` → show charity needs tab → `charityNeedsService.getPublicCharityNeeds(params)`.
2. If `role === 'Charity'` → show donor offers tab → `offersService.getPublicOffers(params)`.
3. Filter params to pass: `{ Category, City, Governorate, Search, Page, PageSize }`. All optional.
4. Render results in `BrowseCard.jsx`.

---

### Task 3.2 — Applying to a Post
**File:** `src/components/ui/ApplyModal.jsx`

**Logic:**
1. If Donor applying to a Charity Need → `applicationsService.applyToNeed(charityNeedId)` → `POST /api/v1/donor-organization/charity-needs/{charityNeedId}/apply`.
2. If Charity applying to a Donor Offer → `applicationsService.applyToOffer(offerId)` → `POST /api/v1/charity/offers/{offerId}/apply`.
3. **On `409` Conflict** → `error.appMessage` = "Already applied." Show inline message.
4. **On `403` Forbidden** → `error.appMessage` = "Account not verified." Show banner.

---

### Task 3.3 — Manage Received Applications
**File:** `src/app/(dashboard)/requests/page.jsx` & `src/components/cards/RequestListCard.jsx`

**Fetching:**
- If `role === 'Charity'` → fetch need-applications received: `applicationsService.getReceivedNeedApplications({ Page: 1, PageSize: 20 })`.
- If `role === 'DonorOrganization'` → fetch offer-applications received: `applicationsService.getReceivedOfferApplications({ Page: 1, PageSize: 20 })`.

**Actions (wire to `RequestActionModal.jsx`):**
- Charity accepting/rejecting: `acceptNeedApplication(id)` / `rejectNeedApplication(id)`.
- Donor accepting/rejecting: `acceptOfferApplication(id)` / `rejectOfferApplication(id)`.
- Only show Accept/Reject buttons if `application.status === 0` (Pending).

---

## 🛡️ Phase 4: Admin Controls

### Task 4.1 — Pending Verifications
**File:** `src/app/(admin)/admin/pending/page.jsx`

**Fetch:** `adminUsersService.getPendingVerifications()` → `GET /api/v1/admin/verifications/pending`

**Actions per user card:**
- Verify → `adminUsersService.verifyUser(userId)` → `POST /api/v1/admin/verifications/verify` with `{ userId }`.
- Reject → `adminUsersService.rejectUser(userId)` → `POST /api/v1/admin/verifications/reject` with `{ userId }`.
- On success → remove user from the list (optimistic update).

---

### Task 4.2 — Pending Posts (Needs & Offers)
**File:** `src/app/(admin)/admin/needs/page.jsx` & `src/app/(admin)/admin/offers/page.jsx`

**Fetch:**
- Needs: `charityNeedsService.getPendingCharityNeeds({ Page, PageSize })` → `GET /api/v1/admin/charity-needs/pending`.
- Offers: `offersService.getPendingOffers({ Page, PageSize })` → `GET /api/v1/admin/offers/pending`.

**Actions per post card:**
- Approve Need → `charityNeedsService.approveCharityNeed(charityNeedId)` → `POST /api/v1/admin/charity-needs/approve` with `{ charityNeedId }`.
- Reject Need → `charityNeedsService.rejectCharityNeed(charityNeedId)` → `POST /api/v1/admin/charity-needs/reject` with `{ charityNeedId }`.
- Approve Offer → `offersService.approveOffer(offerId)` → `POST /api/v1/admin/offers/approve` with `{ offerId }`.
- Reject Offer → `offersService.rejectOffer(offerId)` → `POST /api/v1/admin/offers/reject` with `{ offerId }`.
- On `422` → post is not in Pending status (data is stale), re-fetch the list.

---

### Task 4.3 — User Management
**File:** `src/app/(admin)/admin/users/page.jsx`

**Fetch:** `adminUsersService.getUsers({ Role, IsActive, Page, PageSize })` → `GET /api/v1/admin/users`

**Filter UI:**
- Role dropdown: All / Charity (0) / DonorOrganization (1).
- Status toggle: All / Active / Inactive.

**Actions per user row:**
- Deactivate → `adminUsersService.deactivateUser(userId)` → `POST /api/v1/admin/users/deactivate` with `{ userId }`.
- Activate → `adminUsersService.activateUser(userId)` → `POST /api/v1/admin/users/activate` with `{ userId }`.
- Show `isActive` badge; show Activate button if `!user.isActive`, Deactivate button if `user.isActive`.

---

## 👤 Phase 5: Profile Management

### Task 5.1 — Fetch & Update Profile Details
**File:** `src/components/forms/ProfileForm.jsx`

**On mount:** `profileService.getProfile()` → `GET /api/v1/profile`. Pre-fill all form fields.

**On submit:** `profileService.updateProfile({ phone, whatsapp, city, governorate, postalCode })` → `PUT /api/v1/profile`.
- All fields are optional. Only send non-null values.
- On `400` → map `error.validationErrors` to form fields.

---

### Task 5.2 — Update Profile Image & Password
**File:** `src/components/cards/ProfileBanner.jsx` (image) & password section in `ProfileForm.jsx`

**Image Update:**
```js
const fd = new FormData();
fd.append('Image', selectedFile); // File object — field name must be 'Image'
await profileService.updateImage(fd); // PATCH /api/v1/profile/image
```
- On `400` → `error.appMessage` = "Invalid image format or size exceeds 2MB."

**Password Change:**
```js
await profileService.changePassword({
  currentPassword: "OldPass",
  newPassword: "NewPass@1",
  confirmPassword: "NewPass@1"
}); // PATCH /api/v1/profile/password
```
- On `400` → could be validation error OR wrong current password. Show `error.appMessage`.

---

## 🧪 Quick Test Credentials

| Role | Username | Email | Password |
|------|----------|-------|----------|
| Admin | `admin` | `admin@test.com` | `Admin@1234` |
| Charity | `charity1` | `charity@test.com` | `Charity@1234` |
| Donor | `donor1` | `donor@test.com` | `Donor@1234` |

> Use Admin account to approve registrations and posts so they appear in the public browse sections.
