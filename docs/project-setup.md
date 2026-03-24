# Project Setup

> Everything you need to install before writing a single line of code.

---

## What you need on your machine

| Tool | Why | Download |
|---|---|---|
| Node.js (v20 or higher) | Runs Next.js | https://nodejs.org |
| VS Code | Code editor | https://code.visualstudio.com |
| Git | Version control | https://git-scm.com |

To check if Node.js is already installed, open your terminal and run:
```
node -v
```
If you see a version number like `v20.x.x` you are good. If not, install it from the link above.

---

## Create the project

Open your terminal, go to the folder where you want the project to live, then run these commands one by one.

**1. Create the Next.js app**
```
npx create-next-app@latest App.Client
```

When it asks questions, answer like this:

| Question | Answer |
|---|---|
| Would you like to use TypeScript? | No |
| Would you like to use ESLint? | Yes |
| Would you like to use Tailwind CSS? | Yes |
| Would you like your code inside a `src/` directory? | No |
| Would you like to use App Router? | Yes |
| Would you like to use Turbopack? | Yes |
| Would you like to customize the import alias? | No |

**2. Go into the project folder**
```
cd App.Client
```

**3. Start the development server**
```
npm run dev
```

Open your browser and go to `http://localhost:3000`. You should see the Next.js welcome page.

---

## VS Code extensions

Install these from the VS Code extensions panel (the square icon on the left sidebar). Search by name.

| Extension | Why you need it |
|---|---|
| **ES7+ React/Redux/React-Native snippets** | Shortcuts to create components faster. Type `rafce` and press Tab to get a full component. |
| **Tailwind CSS IntelliSense** | Shows Tailwind class suggestions as you type. |
| **Prettier - Code Formatter** | Automatically formats your code on save so it always looks clean. |
| **Auto Rename Tag** | When you rename an opening HTML tag, the closing tag renames too. |
| **Path Intellisense** | Suggests file paths when you write an import. |
| **Error Lens** | Shows errors and warnings inline in your code instead of only in the bottom panel. |

---

## One setting to add in VS Code

This makes Prettier format your code every time you save a file.

Go to **File → Preferences → Settings**, search for `format on save`, and turn it on.

Or add this to your VS Code `settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

---

## After setup — clean the project

Next.js creates some demo files you do not need. Delete these:

- Everything inside `app/` except `layout.jsx` and `globals.css`
- The content inside `app/layout.jsx` — you will rewrite it
- The content inside `styles/globals.css` — you will rewrite it with your own CSS variables

Then you are ready to start Phase 0.

---

*Last updated: March 2026*