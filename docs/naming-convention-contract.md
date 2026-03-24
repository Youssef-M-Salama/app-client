# 02 — Naming Convention

---

| What | Style | Why | Example |
|---|---|---|---|
| Component file | PascalCase | Components are like custom HTML tags — they start with a capital so React can tell them apart from regular HTML elements | `PostCard.jsx`, `EmptyState.jsx` |
| Page file | always `page.jsx` | Next.js requirement — the router only recognizes this exact name | `app/posts/page.jsx` |
| Service file | camelCase + Service | Lowercase because it is not a component. The Service suffix makes it clear this file talks to the API | `postsService.js`, `authService.js` |
| Util file | camelCase | Lowercase because it is not a component. Named after what it does | `formatDate.js`, `truncate.js` |
| Constants file | camelCase | Lowercase because it is not a component. Named after what it holds | `routes.js`, `categories.js` |
| CSS module file | same name as its component | Keeps the component and its styles together and easy to find | `PostCard.module.css` |
| Route folder | kebab-case | Next.js convention for URL segments. Hyphens are readable in a browser address bar | `browse-offers`, `my-requests` |
| Route group folder | (kebab-case) | Parentheses tell Next.js this folder is a group — it does not appear in the URL | `(auth)`, `(dashboard)` |
| Variable | camelCase | JavaScript standard. Starts lowercase to show it is a value, not a component | `postTitle`, `isLoading` |
| Function | camelCase | Same as variables. Starts lowercase | `formatDate()`, `handleSubmit()` |
| Fixed constant value | SCREAMING_SNAKE_CASE | All caps signals that this value never changes at runtime | `API_BASE_URL`, `MAX_PAGE_SIZE` |
| Boolean prop | camelCase starting with `is` or `has` | The `is` or `has` prefix makes it immediately clear this is true or false | `isLoading`, `hasImage` |
| Function prop | camelCase starting with `on` | The `on` prefix makes it clear this is an action triggered by the user | `onDelete`, `onSubmit` |
| Data prop | camelCase noun | Just name the thing it holds | `post`, `offer`, `userId` |

---
