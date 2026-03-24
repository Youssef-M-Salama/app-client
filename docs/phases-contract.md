# Implementation Phases

> Build the UI first with fake data. Wire the real API after.
> Never do both at the same time.

---

## The only rule you need to remember

```
See it working with fake data first → then make it real
```

---

## Phase 0 — Foundation
> The project runs. Global styles work. Layouts are visible.

- Create the Next.js project
- Set Arabic language and RTL direction on the HTML root
- Add the Cairo font
- Create the CSS variables file (colors, spacing, radius)
- Create the routes and categories constants files
- Build the Navbar (static, no links yet)
- Build the Sidebar (static, no links yet)
- Build the TopBar (static, no action yet)
- Build the Footer (static)

**You are done when** the app runs with no errors and the three layouts (public, auth, dashboard) are visible.

---

## Phase 1 — Login & Register Pages
> The auth pages look right. Forms do nothing yet.

- Build the Login page — email field, password field, submit button
- Build the Register page — name, username, email, password, role choice (charity or donor)
- Both pages use the auth layout: gradient background, white card, image on the side

Pressing submit only prints to the console. No API call yet.

**You are done when** both pages look like the design. No console errors.

---

## Phase 2 — Public Browse Pages
> A visitor can browse requests and offers using fake data.

- Build the Request card (charity logo, name, product, location, priority)
- Build the Offer card (image, company name, product, expiry date)
- Build the Empty state (shown when a list has nothing to show)
- Build the Badge (small colored label for priority and status)
- Build the Homepage (hero section, stats, sample cards)
- Build the Browse Requests page (grid of request cards)
- Build the Browse Offers page (grid of offer cards)

All data is a hardcoded array written directly in the page file. No API.

**You are done when** both browse pages show cards. Clearing the array shows the empty state.

---

## Phase 3 — Dashboard Pages
> Every logged-in page looks right. All fake data. No actions work yet.

First build these shared pieces:
- The Modal wrapper (open and close)
- The Post card (image, title, short description, date, menu)
- The Application row (logo, name, description, accept and reject buttons)
- The Profile form (cover image, editable fields)

Then build each dashboard page:
- Posts page — grid of post cards
- My Requests page — grid of request cards (charity view)
- My Offers page — grid of offer cards (donor view)
- Browse Offers page — charity browsing donor offers
- Browse Requests page — donor browsing charity requests
- Received Applications page — list of application rows with accept / reject
- Sent Applications page — list of application rows, status only
- Profile page — cover image and profile form
- Notifications page — just the empty state for now

**You are done when** every page renders, modals open and close, and there are zero API calls anywhere.

---

## Phase 4 — Real Login & Register
> A real user can log in, reach their dashboard, and log out.

- Add the API base URL to the environment file
- Create the auth service (login, register, logout functions)
- Connect the Login form to the real API
- On success → redirect to the dashboard
- On error → show a message under the form
- Connect the Register form to the real API
- Save the JWT token in a cookie after login
- Protect the dashboard — anyone without a valid cookie goes back to login
- Connect the logout button to clear the cookie and redirect

**You are done when** a real user can log in, see their dashboard, and log out cleanly.

---

## Phase 5 — Public Browse from Real API
> The browse pages show real data from the backend.

- Create the requests service and the offers service
- Replace the fake array in the Browse Requests page with a real API call
- Replace the fake array in the Browse Offers page with a real API call
- Connect the category filter to update what the API returns
- Show the empty state when the API returns nothing

**You are done when** browse pages load real data and the filter actually works.

---

## Phase 6 — Dashboard from Real API
> Every action in the dashboard talks to the real backend.

Posts:
- Load real posts on the posts page
- Submitting the post form creates a real post
- The delete option on a post card actually deletes it

Requests and Offers:
- My Requests loads the logged-in charity's own requests
- My Offers loads the logged-in donor's own offers
- Browse Offers and Browse Requests load from the real API

Applications:
- The Apply button sends a real application
- Received Applications loads real incoming applications
- Accept and Reject buttons actually work
- Sent Applications loads the user's own sent applications

Profile:
- The profile page loads the real user data
- Saving the profile form updates the real backend

**You are done when** a charity and a donor can each complete every task with real data.

---

## Phase 7 — Polish
> Nothing is broken. Every edge case is handled.

- Show a loading indicator while any page is fetching data
- Show a clear Arabic error message when anything fails
- Ask for confirmation before any delete or reject action
- Show a notice to users whose account is still pending verification
- Test the full charity flow start to finish
- Test the full donor flow start to finish
- Test every empty state
- Test what happens when the token expires

**You are done when** every path through the app works and nothing looks broken.

---

## Summary

| Phase | What you build |
|-------|---------------|
| 0 | Project setup and layouts |
| 1 | Login and Register pages (UI only) |
| 2 | Homepage and browse pages (UI only) |
| 3 | All dashboard pages (UI only) |
| 4 | Real login, register, logout |
| 5 | Public browse from real API |
| 6 | All dashboard features from real API |
| 7 | Polish and edge cases |

---
