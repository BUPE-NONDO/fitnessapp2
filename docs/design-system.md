# 🎨 FitnessApp Design System

A comprehensive, consistent UI/UX design system built with Tailwind CSS for the FitnessApp project.

## 📋 Table of Contents

- [Overview](#overview)
- [Color Palette](#color-palette)
- [Typography](#typography)
- [Components](#components)
- [Layout System](#layout-system)
- [Dark Mode](#dark-mode)
- [Usage Examples](#usage-examples)

## 🎯 Overview

The FitnessApp Design System provides a unified visual language and component library that ensures consistency across the entire application. Built on top of Tailwind CSS, it includes:

- **Consistent Color Palette** - Primary, secondary, success, warning, and error colors
- **Typography Scale** - Responsive text sizes and weights
- **Reusable Components** - Buttons, cards, inputs, badges, and more
- **Layout Utilities** - Grid, container, and spacing systems
- **Dark Mode Support** - Seamless light/dark theme switching
- **Accessibility** - WCAG 2.1 AA compliant components

## 🎨 Color Palette

### Primary Colors (Blue)
```css
primary-50:  #eff6ff  /* Very light blue */
primary-100: #dbeafe  /* Light blue */
primary-500: #3b82f6  /* Main blue */
primary-600: #2563eb  /* Dark blue */
primary-700: #1d4ed8  /* Darker blue */
primary-900: #1e3a8a  /* Darkest blue */
```

### Secondary Colors (Purple)
```css
secondary-50:  #faf5ff  /* Very light purple */
secondary-100: #f3e8ff  /* Light purple */
secondary-500: #a855f7  /* Main purple */
secondary-600: #9333ea  /* Dark purple */
secondary-700: #7c3aed  /* Darker purple */
```

### Semantic Colors
- **Success**: Green palette for positive actions
- **Warning**: Yellow/Orange palette for cautions
- **Error**: Red palette for errors and destructive actions
- **Neutral**: Gray palette for text and backgrounds

## 📝 Typography

### Heading Scale
```typescript
h1: 'text-3xl md:text-4xl font-bold'     // 30px/36px → 36px/40px
h2: 'text-2xl md:text-3xl font-bold'     // 24px/32px → 30px/36px
h3: 'text-xl md:text-2xl font-semibold'  // 20px/28px → 24px/32px
h4: 'text-lg md:text-xl font-semibold'   // 18px/28px → 20px/28px
h5: 'text-base md:text-lg font-medium'   // 16px/24px → 18px/28px
```

### Body Text
```typescript
body: 'text-sm md:text-base'             // 14px/20px → 16px/24px
caption: 'text-xs md:text-sm'            // 12px/16px → 14px/20px
label: 'text-sm font-medium'             // 14px/20px
```

## 🧩 Components

### Button Component
```tsx
import Button from '@/components/ui/Button';

// Variants
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="success">Success Action</Button>
<Button variant="warning">Warning Action</Button>
<Button variant="danger">Danger Action</Button>
<Button variant="ghost">Ghost Action</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// With icons
<Button leftIcon={<Icon />}>With Left Icon</Button>
<Button rightIcon={<Icon />}>With Right Icon</Button>

// Loading state
<Button isLoading>Loading...</Button>
```

### Card Component
```tsx
import Card from '@/components/ui/Card';

<Card variant="interactive">
  <Card.Header>
    <Card.Title>Card Title</Card.Title>
  </Card.Header>
  <Card.Content>
    Card content goes here...
  </Card.Content>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>
```

### Input Component
```tsx
import Input from '@/components/ui/Input';

<Input
  label="Email Address"
  placeholder="Enter your email"
  error="This field is required"
  leftIcon={<EmailIcon />}
/>
```

### Badge Component
```tsx
import Badge from '@/components/ui/Badge';

<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="neutral">Neutral</Badge>
```

## 📐 Layout System

### Container
```tsx
import Container from '@/components/ui/Container';

<Container size="lg">  {/* max-w-6xl */}
  Content goes here
</Container>
```

### Grid System
```tsx
import Grid from '@/components/ui/Grid';

<Grid cols={3} gap="md">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>
```

### Responsive Breakpoints
- **sm**: 640px and up
- **md**: 768px and up
- **lg**: 1024px and up
- **xl**: 1280px and up
- **2xl**: 1536px and up

## 🌙 Dark Mode

The design system includes full dark mode support:

```tsx
// Toggle dark mode
<html className="dark">
  <!-- Dark mode styles automatically applied -->
</html>
```

All components automatically adapt to dark mode using Tailwind's `dark:` prefix.

## 🎯 Usage Examples

### Goal Card Example
```tsx
<Card variant="interactive">
  <Card.Header>
    <div className="flex justify-between items-start">
      <div>
        <Card.Title>Lose Weight</Card.Title>
        <p className={getTypography('body')}>
          Lose 10kg in 3 months
        </p>
      </div>
      <Badge variant="success">Active</Badge>
    </div>
  </Card.Header>
  
  <Card.Content>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>Progress</span>
        <Badge variant="primary" size="sm">75%</Badge>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-blue-500 h-2 rounded-full w-3/4" />
      </div>
    </div>
  </Card.Content>
  
  <Card.Footer>
    <div className="flex space-x-2">
      <Button variant="ghost" size="sm">Edit</Button>
      <Button variant="ghost" size="sm">Delete</Button>
    </div>
  </Card.Footer>
</Card>
```

### Dashboard Layout Example
```tsx
<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
  <header className="bg-white dark:bg-gray-800 shadow-sm">
    <Container>
      <div className="flex justify-between items-center h-16">
        <h1 className={getTypography('h4')}>FitnessApp</h1>
        <Button variant="secondary" size="sm">Sign Out</Button>
      </div>
    </Container>
  </header>
  
  <main>
    <Container className="py-8">
      <Grid cols={3} gap="lg">
        <Card>Goal 1</Card>
        <Card>Goal 2</Card>
        <Card>Goal 3</Card>
      </Grid>
    </Container>
  </main>
</div>
```

## 🚀 Implementation

The design system is implemented using:

1. **Design System Configuration** (`/src/styles/design-system.ts`)
2. **UI Components** (`/src/components/ui/`)
3. **Tailwind Configuration** (`tailwind.config.js`)
4. **Global Styles** (`/src/index.css`)

## 📱 Responsive Design

All components are mobile-first and responsive:
- Typography scales appropriately
- Components adapt to screen size
- Touch-friendly interaction areas
- Optimized for both desktop and mobile

## ♿ Accessibility

The design system follows accessibility best practices:
- Proper color contrast ratios
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators
- ARIA labels where needed

## 🎨 Customization

To customize the design system:

1. Update colors in `tailwind.config.js`
2. Modify component variants in `design-system.ts`
3. Add new components in `/src/components/ui/`
4. Update global styles in `index.css`

---

**Live Demo**: https://fitness-app-bupe-staging.web.app

The design system ensures a consistent, professional, and accessible user experience across the entire FitnessApp.
