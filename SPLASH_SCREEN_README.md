# Registration Splash Screen

A beautiful splash screen component that displays after successful registration, featuring an interactive 3D lanyard animation and thank you message.

## Components

### SplashScreen
Main splash screen component that combines the lanyard animation with success messaging.

**Props:**
- `onClose?: () => void` - Optional callback when user clicks continue

### Lanyard
Interactive 3D lanyard component with physics simulation.

**Props:**
- `position?: [number, number, number]` - Camera position (default: [0, 0, 30])
- `gravity?: [number, number, number]` - Physics gravity (default: [0, -40, 0])
- `fov?: number` - Camera field of view (default: 20)
- `transparent?: boolean` - Background transparency (default: true)

## Setup Instructions

### 1. Install Required Dependencies
```bash
npm install three meshline @react-three/fiber @react-three/drei @react-three/rapier
```

### 2. Add Asset Files
Download the required assets from the [lanyard repository](https://github.com/srm-kzilla/lanyard) and place them in:
```
src/assets/lanyard/
├── card.glb
└── lanyard.png
```

### 3. Update Next.js Configuration
The `next.config.ts` already includes support for .glb files. If you need to modify it:

```typescript
const nextConfig: NextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: 'asset/resource',
    });
    return config;
  },
};
```

### 4. Type Declarations
The `global.d.ts` file already includes the necessary type declarations for meshline and 3D assets.

## Usage Example

```tsx
import { useState } from 'react';
import SplashScreen from '@/components/register/splash-screen';

export default function RegistrationForm() {
  const [showSplash, setShowSplash] = useState(false);

  const handleSuccessfulRegistration = () => {
    setShowSplash(true);
  };

  return (
    <div>
      {/* Your registration form */}
      <button onClick={handleSuccessfulRegistration}>
        Register
      </button>

      {showSplash && (
        <SplashScreen onClose={() => setShowSplash(false)} />
      )}
    </div>
  );
}
```

## Features

- **Interactive 3D Lanyard**: Physics-based animation with mouse interaction
- **Responsive Design**: Adapts to mobile and desktop screens
- **Customizable**: Easy to modify colors, text, and positioning
- **Accessibility**: Proper focus management and keyboard navigation
- **Performance**: Optimized rendering with proper cleanup

## Customization

### Changing the Message
Edit the text content in `src/components/register/splash-screen.tsx`:

```tsx
<h1 className="text-4xl md:text-6xl font-bold mb-6">
  Your Custom Message Here!
</h1>
```

### Styling
The component uses Tailwind CSS classes. Modify the styling by changing the class names in the component.

### Lanyard Configuration
Adjust the lanyard behavior by passing different props:

```tsx
<Lanyard
  position={[0, 0, 20]}
  gravity={[0, -30, 0]}
  fov={25}
/>
```

## Troubleshooting

### Assets Not Loading
- Ensure `card.glb` and `lanyard.png` are in `src/assets/lanyard/`
- Check that the files are not corrupted
- Verify Next.js configuration includes .glb support

### Performance Issues
- The component automatically reduces quality on mobile
- Consider lazy loading the component if needed

### Type Errors
- Ensure all required dependencies are installed
- Check that `global.d.ts` includes the meshline declarations