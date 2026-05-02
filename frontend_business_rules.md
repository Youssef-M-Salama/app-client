# Waffer API - Frontend Business Rules & Workflows

This document outlines the core business logic enforced by the backend. Frontend developers must implement these rules to ensure a smooth UX and avoid 403/422 errors.

##  Registration & Access Levels
Access to the platform is granted in two distinct phases:

1. **Phase 1: Entry (Email Verification)**
   - **Requirement:** User clicks the link in their email.
   - **Login:** The user **CAN** now log in to the dashboard.
   - **Experience:** Use this state to show a "Welcome! Your account is being reviewed" message.

2. **Phase 2: Activity (Admin Approval)**
   - **Requirement:** Admin reviews the organization and clicks "Verify".
   - **IsVerified:** The `IsVerified` flag in the profile becomes `true`.
   - **Full Access:** Only now can the user post Needs/Offers or apply for help.
   - **Security:** Any attempt to post before this phase returns `403 Forbidden`.

##  Posting Rules (Needs & Offers)
- **Status Flow:** All new posts start as `Pending`. They only appear in the public browse section once an Admin sets them to `Approved`.
- **The "Lock" Rule:** ⚠️ **Edit and Delete buttons must be HIDDEN** if the post status is not `Pending`. The API will reject any update to an `Approved` or `Rejected` post.

##  Application Workflow
- **Accept/Reject:** Only the owner of a post can accept or reject applications.
- **Cancel:** Only the sender can cancel a `Pending` application. Once accepted/rejected, the state is final.

##  Frontend Integration Tips
- **Validation:** Handle `400 BadRequest` by mapping errors from `data.error.details.errors`.


##  Token Management & Auto-Refresh (if you need to use it)
The API uses JWT (Access Tokens) and Refresh Tokens for security.
- **Access Token:** Short-lived. Used in the `Authorization` header for all requests.
- **Refresh Token:** Long-lived. Used to get a new Access Token when the current one expires.
### The Refresh Workflow (Rotation)
When an API call returns a `401 Unauthorized` (due to token expiration):
1. **Request:** Call `POST /api/v1/auth/refresh-token` sending the `refreshToken` you have stored.
2. **Rotation (Important):** The API will return a **NEW** `token` and a **NEW** `refreshToken`.
3. **Storage:** You **MUST** overwrite both stored tokens in your local storage/cookies with the new ones. 
4. **Failure:** If the refresh call itself returns a `401`, it means the refresh token has expired or was already used. In this case, you must log the user out and redirect them to the Login page.

##  Seeded Test Accounts
Use these credentials to test the different roles and workflows in the development environment.
| Role | Username | Email | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin@test.com` | `Admin@1234` |
| **Charity** | `charity1` | `charity@test.com` | `Charity@1234` |
| **Donor** | `donor1` | `donor@test.com` | `Donor@1234` |
> [!TIP]
> Use the **Admin** account to approve posts created by the Charity/Donor accounts so they become visible in the public browse sections.