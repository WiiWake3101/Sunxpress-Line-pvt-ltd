# Loading Screen Implementation

## Overview
A beautiful maritime-themed loading screen has been implemented with multiple loading scenarios.

## Components Created

### 1. **LoadingScreen.jsx** (Main Component)
The core loading UI with:
- **Animated ship with containers** - Floating animation with cargo containers
- **Wave animations** - Three-layer ocean wave effect
- **Company branding** - Sun Xpress Line logo and tagline
- **Loading dots** - Bouncing dot animation
- **Gradient background** - Maritime blue gradient theme

### 2. **InitialLoader.jsx**
Handles the initial app load (1.5 seconds):
- Shows when the app first loads
- Automatically fades out after loading
- Added to the root layout

### 3. **loading.js** (Route Loading)
Next.js convention for route-level loading:
- Automatically displays when navigating between pages
- Shows during server-side data fetching
- Built-in Next.js feature

### 4. **PageTransitionLoader.jsx** (Optional)
Client-side page transition loader:
- Can be added for smoother client-side transitions
- Currently created but not integrated

## How It Works

### Initial Load
When a user first visits the site:
1. `InitialLoader` displays immediately
2. Shows for 1.5 seconds
3. Fades out to reveal content

### Route Navigation
When navigating between pages (e.g., Home → About → Services):
1. Next.js automatically triggers `loading.js`
2. `LoadingScreen` displays during server-side rendering
3. Content appears when ready

## Customization Options

### Adjust Loading Duration
Edit `InitialLoader.jsx`:
```javascript
const timer = setTimeout(() => {
  setIsLoading(false);
}, 1500); // Change this value (in milliseconds)
```

### Change Colors
Edit the gradient in `LoadingScreen.jsx`:
```javascript
className="... bg-gradient-to-br from-[#0a3d62] via-[#1e5f8b] to-[#319795]"
// Modify these hex colors
```

### Customize Animation Speed
In the `<style jsx>` section of `LoadingScreen.jsx`:
- `float 3s` - Ship bounce speed
- `wave-animation 3s` - Wave speed
- `bounce 1.4s` - Dot bounce speed

### Disable Initial Loader
Remove from `app/layout.js`:
```javascript
// Remove this import and component
import InitialLoader from "../components/InitialLoader";
<InitialLoader />
```

## Adding Page Transition Loading (Optional)

To add smooth transitions between client-side route changes, add to your page components:

```javascript
import PageTransitionLoader from '@/components/PageTransitionLoader';

export default function Page() {
  return (
    <>
      <PageTransitionLoader />
      {/* Your page content */}
    </>
  );
}
```

## Theme Colors
Maritime Blue Palette:
- Primary: `#0a3d62` (Deep Ocean)
- Secondary: `#1e5f8b` (Ocean Blue)
- Accent: `#319795` (Teal)

## Animation Features
✅ Floating ship with rotation
✅ Multi-layer wave animation
✅ Bouncing loading dots
✅ Fade-in text animations
✅ Smooth transitions
✅ Responsive design

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS animations supported
- Hardware-accelerated transforms
- No external dependencies required
