# Add Screen

Scaffold a new screen with proper Expo Router routing.

## Gather Info

Ask the user for:
1. **Screen name** (e.g., "Governance", "TokenDetail")
2. **Route type**: tab, modal, or nested route (e.g., `position/[id]`)
3. **Feature folder** in components (e.g., "governance", "token")

## Steps

### 1. Create route file

Create the route file in `app/`:
- **Tab**: `app/(tabs)/<name>.tsx` — also add tab config to `app/(tabs)/_layout.tsx`
- **Modal**: `app/<name>.tsx` — present as modal in stack
- **Nested**: `app/<path>.tsx` (e.g., `app/position/[id].tsx`)

The route file should be thin — import and render the screen component:
```tsx
import { ScreenName } from '../src/components/<feature>/ScreenName';

export default function ScreenNameRoute() {
  return <ScreenName />;
}
```

### 2. Create screen component

Create `src/components/<feature>/ScreenName.tsx`:
- Use `StyleSheet.create` for all styles
- Use colors from `../../theme/colors`
- Use `SafeAreaView` or `ScrollView` as root
- Dark theme: background `colors.background`, text `colors.text`
- PascalCase filename matching the component name
- Export as named export (not default)

### 3. If tab: update tab layout

Edit `app/(tabs)/_layout.tsx`:
- Add a new `<Tabs.Screen>` entry
- Pick an appropriate icon from `@expo/vector-icons`
- Match the existing tab styling

## Checklist
- [ ] Route file created in `app/`
- [ ] Screen component created in `src/components/<feature>/`
- [ ] Tab layout updated (if tab)
- [ ] Uses StyleSheet.create, dark theme colors
- [ ] Uses relative imports
- [ ] Type check passes: `npx tsc --noEmit`
