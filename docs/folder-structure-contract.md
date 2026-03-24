# Folder Structure

> Pages fetch data. Components display it.
> No hooks. No context. Just pages, components, and services.

---

## Full picture

```
App.Client/
│
├── app/
│   ├── layout.jsx
│   ├── not-found.jsx
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.jsx
│   │   └── register/
│   │       └── page.jsx
│   ├── (public)/
│   │   ├── page.jsx
│   │   ├── requests/
│   │   │   └── page.jsx
│   │   └── offers/
│   │       └── page.jsx
│   └── (dashboard)/
│       ├── layout.jsx
│       ├── posts/page.jsx
│       ├── profile/page.jsx
│       ├── notifications/page.jsx
│       ├── my-requests/page.jsx
│       ├── my-offers/page.jsx
│       ├── browse-offers/page.jsx
│       ├── browse-requests/page.jsx
│       ├── received-applications/page.jsx
│       └── sent-applications/page.jsx
│
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Sidebar.jsx
│   │   └── TopBar.jsx
│   ├── cards/
│   │   ├── OfferCard.jsx
│   │   ├── RequestCard.jsx
│   │   └── PostCard.jsx
│   ├── lists/
│   │   └── ApplicationRow.jsx
│   ├── ui/
│   │   ├── Badge.jsx
│   │   ├── EmptyState.jsx
│   │   ├── Button.jsx
│   │   └── Modal.jsx
│   └── forms/
│       ├── LoginForm.jsx
│       ├── RegisterForm.jsx
│       ├── PostForm.jsx
│       └── ProfileForm.jsx
│
├── services/
│   ├── authService.js
│   ├── postsService.js
│   ├── requestsService.js
│   ├── offersService.js
│   └── applicationsService.js
│
├── utils/
│   ├── formatDate.js
│   └── truncate.js
│
├── constants/
│   ├── routes.js
│   └── categories.js
│
├── styles/
│   └── globals.css
│
└── public/
    └── logo.svg
```

---

## Root folders

| Folder | What lives here |
|---|---|
| `app/` | Every page in the app. Each folder is a URL. |
| `components/` | Every visual piece. Receives data as props and displays it. |
| `services/` | Functions that talk to the API. No React, just plain JS. |
| `utils/` | Tiny helper functions. No side effects. |
| `constants/` | Fixed values used in many places — routes, categories. |
| `styles/` | One CSS file with all global variables. |
| `public/` | Static files like the logo. |

---

## app/

All pages live here. Each folder becomes a URL. Each `page.jsx` is what the user sees at that URL.

The folders in parentheses like `(auth)` and `(dashboard)` are groups — they do not appear in the URL. They just let you apply a different layout to each group.

| File or folder | URL | What it is |
|---|---|---|
| `layout.jsx` | — | HTML root. Sets Arabic language and RTL direction. |
| `not-found.jsx` | — | Shown when a URL does not exist. |
| `(auth)/login/` | `/login` | Login page. Uses the auth layout — gradient background, white card. |
| `(auth)/register/` | `/register` | Register page. Same layout as login. |
| `(public)/` | `/` | Homepage. Visible to anyone without logging in. |
| `(public)/requests/` | `/requests` | Browse all approved charity requests. |
| `(public)/offers/` | `/offers` | Browse all available donor offers. |
| `(dashboard)/layout.jsx` | — | Wraps every dashboard page with the sidebar and topbar. |
| `(dashboard)/posts/` | `/posts` | The posts feed. Same page for charity and donor. |
| `(dashboard)/profile/` | `/profile` | View and edit the logged-in user's profile. |
| `(dashboard)/notifications/` | `/notifications` | Notifications list. |
| `(dashboard)/my-requests/` | `/my-requests` | A charity's own posted requests. |
| `(dashboard)/my-offers/` | `/my-offers` | A donor's own posted offers. |
| `(dashboard)/browse-offers/` | `/browse-offers` | A charity browses donor offers. |
| `(dashboard)/browse-requests/` | `/browse-requests` | A donor browses charity requests. |
| `(dashboard)/received-applications/` | `/received-applications` | Applications other users sent to me. |
| `(dashboard)/sent-applications/` | `/sent-applications` | Applications I sent to other users. |

---

## components/

All visual pieces live here. A component never fetches data — it only receives props and renders HTML.

`layout/` — the four pieces that frame every page.

| File | What it is |
|---|---|
| `Navbar.jsx` | Top navigation bar on public pages. Logo and links. |
| `Footer.jsx` | Bottom of public pages. |
| `Sidebar.jsx` | Right panel on dashboard pages. Logo, nav links, logout. |
| `TopBar.jsx` | Top of every dashboard page. Search bar and action button. |

`cards/` — blocks shown in grids.

| File | What it is |
|---|---|
| `OfferCard.jsx` | One donor offer. Shows image, company name, product, and expiry date. |
| `RequestCard.jsx` | One charity request. Shows logo, name, product, location, and priority. |
| `PostCard.jsx` | One post in the feed. Shows image, title, short description, and date. |

`lists/` — rows shown in vertical lists.

| File | What it is |
|---|---|
| `ApplicationRow.jsx` | One application. Shows logo, name, description, and accept or reject buttons. |

`ui/` — the smallest reusable pieces.

| File | What it is |
|---|---|
| `Badge.jsx` | Small colored label. Used for priority (urgent, high) and status (pending, approved). |
| `EmptyState.jsx` | Centered message shown when a list has nothing to display. |
| `Button.jsx` | Reusable button. Has primary, secondary, and danger variants. |
| `Modal.jsx` | Popup wrapper. Handles open and close state. |

`forms/` — all forms in the app. These are the only files that need `"use client"` because they respond to user input.

| File | What it is |
|---|---|
| `LoginForm.jsx` | Email and password fields with a submit button. |
| `RegisterForm.jsx` | Full registration — name, username, email, password, role selection. |
| `PostForm.jsx` | Create or edit a post — image, title, phone, description. |
| `ProfileForm.jsx` | Edit profile — name, email, phone, address, cover image. |

---

## services/

One file per feature. Each file contains plain async functions that call the API and return data. No React inside.

| File | What it does |
|---|---|
| `authService.js` | Handles login, register, and logout. |
| `postsService.js` | Gets the posts list, creates a post, deletes a post. |
| `requestsService.js` | Gets approved requests, gets the logged-in charity's own requests. |
| `offersService.js` | Gets available offers, gets the logged-in donor's own offers. |
| `applicationsService.js` | Sends an application, accepts, rejects, gets received, gets sent. |

---

## utils/

Small pure functions. Input goes in, output comes out. No API calls, no side effects.

| File | What it does |
|---|---|
| `formatDate.js` | Turns a raw date into a readable Arabic string like "5 مارس 2026". |
| `truncate.js` | Cuts text that is too long and adds "..." at the end. |

---

## constants/

Fixed values that are used in more than one place. Import from here instead of writing the same string twice.

| File | What it holds |
|---|---|
| `routes.js` | Every URL path in the app. Change a route here and it updates everywhere. |
| `categories.js` | The category list: food, clothing, medical, education. |

---

## styles/

| File | What it holds |
|---|---|
| `globals.css` | Every CSS variable — all colors, spacing values, border radius, and font. No component writes its own color. They all read from here. |

---
