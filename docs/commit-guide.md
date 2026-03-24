# How to Write Professional Commit Messages

## Quick Format

```
type: brief description (max 50 chars)

- What changed and why (if needed)
- Keep it simple and clear
```

## Common Types

- **feat**: new feature
- **fix**: bug fix
- **docs**: documentation changes
- **style**: formatting, missing semicolons, etc.
- **refactor**: code restructuring
- **test**: adding tests
- **chore**: maintenance tasks


## Good Examples

```
feat: add user login form

fix: resolve navbar overflow on mobile

docs: update API endpoint examples

refactor: simplify validation logic

chore: update dependencies
```

## Tips for Dev Branch

1. **Be specific but brief** - "fix login button" not "fix stuff"
2. **Use present tense** - "add feature" not "added feature"
3. **One commit = one purpose** - don't mix multiple unrelated changes
4. **Skip unnecessary details** - save long explanations for PRs

## When to Add Description

Only add details when the "why" isn't obvious:

```
fix: prevent duplicate user registration

- Added email validation before signup
- Check existing users in database first
```

## Common Mistakes to Avoid

❌ `updated files`  
❌ `fix bug`  
❌ `changes`  
❌ `WIP`

✅ `feat: add password reset email`  
✅ `fix: correct date format in reports`  
✅ `refactor: extract reusable button component`

## Commit Frequency

**Commit after each logical unit of work:**

✅ **Good times to commit:**
- Finished one feature/function (even if small)
- Fixed one bug
- Completed a specific task
- Code works and doesn't break anything
- Before switching to different task

❌ **Don't commit:**
- Every few minutes
- Broken/non-working code
- Half-finished features (unless on feature branch)
- End of day "just because"

### Practical Rule

**For small/medium projects:**
- 2-5 commits per day is normal
- Each commit = one complete, working change
- Test before you commit

**Think:** "Can I describe this change in one sentence?" → If yes, commit it!

## Quick Checklist

- [ ] Type prefix included?
- [ ] Description under 50 characters?
- [ ] Present tense used?
- [ ] Clear what changed?
- [ ] One logical change per commit?
- [ ] Code tested and working?

---

**Remember**: Your future self (and teammates) will thank you for clear commit messages!
