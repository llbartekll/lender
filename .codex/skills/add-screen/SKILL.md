---
name: add-screen
description: Scaffold a new Expo Router screen with a thin route file, feature component, and tab wiring when needed.
---

# Add Screen

Use this skill when the user asks to add or scaffold a new screen, tab route, modal route, or nested route.

## Gather
Collect:
1. Screen/component name (PascalCase)
2. Route type (`tab`, `modal`, or nested path like `position/[id]`)
3. Feature folder under `src/components/`

## Workflow
1. Create route file in `app/`.
- Tab: `app/(tabs)/<name>.tsx` and update `app/(tabs)/_layout.tsx`.
- Modal: `app/<name>.tsx`.
- Nested: `app/<path>.tsx`.

2. Keep route file thin; only render the screen component.

3. Create screen component in `src/components/<feature>/ScreenName.tsx`.
- Use `StyleSheet.create` only.
- Use colors from `src/theme/colors`.
- Use dark-theme background and text colors.
- Use named export.

4. Use relative imports.

5. Run type check: `npx tsc --noEmit`.

## Checklist
- [ ] Route file created in `app/`
- [ ] Screen component created in `src/components/<feature>/`
- [ ] Tabs layout updated if tab route
- [ ] `StyleSheet.create` and theme colors used
- [ ] Relative imports used
- [ ] Type check passes
