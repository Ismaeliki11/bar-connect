---
name: Professional Utility
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#002113'
  on-tertiary-container: '#009668'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

This design system is built for the high-output workplace, prioritizing clarity, speed, and cognitive ease. The aesthetic is rooted in **Corporate Modernism**, blending a systematic approach with a refined, understated elegance. It evokes a sense of reliability and precision, ensuring the UI stays out of the way of the user's tasks.

The target audience consists of professionals who require a functional workspace that remains comfortable during long periods of use. The emotional response is one of "quiet confidence"—a tool that feels capable, predictable, and exceptionally well-engineered. High whitespace is used not just for beauty, but as a functional tool to reduce visual noise in data-heavy environments.

## Colors

The palette is anchored by a deep Slate primary color, providing a grounded and authoritative foundation. A vibrant "Action Blue" serves as the secondary color, reserved strictly for interactive elements and primary call-to-actions to ensure clear affordance.

A Tertiary Emerald is utilized for success states and positive growth metrics, while a Neutral Slate palette handles borders, secondary text, and structural dividers. The default mode is Light, optimized for readability in standard office lighting environments, utilizing subtle off-white backgrounds to reduce screen glare.

## Typography

The design system utilizes **Inter** exclusively to achieve a functional, systematic look. As a variable font optimized for screens, it provides exceptional legibility at small sizes—crucial for dashboards and complex forms. 

Headlines utilize a tighter letter-spacing and heavier weights to create a strong visual hierarchy, while body text maintains a generous line height (1.5x) to ensure comfortable reading of long-form documentation. For data display, the use of Inter's tabular numbers feature is encouraged to ensure columns of figures align perfectly.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a 12-column structure for desktop and a 4-column structure for mobile. A strict 8px baseline grid governs all spatial relationships, ensuring a consistent vertical rhythm.

On desktop, the side margins are generous (48px) to frame the content, while gutters are kept at 24px to maintain a tight relationship between related data points. On mobile, margins compress to 16px to maximize screen real estate. Spacing between sections should follow a geometric progression (16, 24, 40) to create clear groupings of information.

## Elevation & Depth

Hierarchy is established primarily through **Tonal Layers** and **Low-Contrast Outlines**. Instead of heavy shadows, this design system uses subtle shifts in background color (e.g., a slightly darker gray for the sidebar vs. the main canvas) to define distinct functional areas.

Where depth is required for interactive overlays like modals or dropdowns, use "Ambient Shadows"—highly diffused, low-opacity (8-12%) blurs with no color tinting. This keeps the interface feeling light and flat, preventing the UI from feeling cluttered even when multiple layers are active.

## Shapes

The shape language is **Soft**, utilizing a 0.25rem (4px) base radius. This creates a professional look that is slightly more approachable than sharp corners without appearing too "consumer" or playful. 

Buttons and input fields share this consistent 4px radius. Larger containers, such as cards or modals, may scale up to a 0.5rem (8px) radius to maintain visual proportion. This geometric consistency reinforces the systematic, engineered nature of the workplace application.

## Components

### Buttons
Primary buttons use the Secondary Blue background with white text. Secondary buttons use a subtle Slate outline. All buttons have a height of 40px for standard actions and 32px for compact toolbar actions.

### Input Fields
Inputs are defined by a 1px border in a light neutral shade. Focus states must use a 2px blue ring with a 2px offset to ensure high visibility for keyboard navigation.

### Data Tables
Tables are a core component. Use horizontal dividers only; avoid vertical lines to reduce visual "striping." Use `body-sm` for cell content and `label-sm` (uppercase) for headers.

### Chips & Status Indicators
Status chips should use a "de-saturated" background with a high-contrast text label (e.g., a light green background with dark green text) to indicate status without overpowering the rest of the data.

### Cards
Cards are used to group related information. They should feature a simple 1px neutral border rather than a shadow, maintaining the flat, professional aesthetic of the system.

## Animations & Motion

Animations in BarConnect are not mere decorations; they are functional tools that provide feedback, establish hierarchy, and guide the user through the interface. Every interaction should feel intentional, smooth, and premium.

### Core Principles

1. **Purposeful & Professional**: Every animation must have a reason to exist. Avoid "bouncy" or "playful" animations that feel out of place in a professional tool. Favor snappy, fluid motions that reinforce the application's reliability.
2. **Subtlety is Key**: Motion should be felt more than seen. Use subtle changes in opacity and position. A 10px vertical shift or a 2% scale change is often enough to convey meaning.
3. **Responsive Timing**: Use consistent durations. 
   - **Snappy (0.2s - 0.3s)**: For micro-interactions like button presses or checkbox toggles.
   - **Fluid (0.4s - 0.6s)**: For page entrances and layout transitions.
4. **Natural Easing**: Always use custom cubic-bezier curves for a premium feel. Favor `[0.22, 1, 0.36, 1]` (Quart out) for a "snappy yet smooth" effect that feels high-end.

### Motion Patterns

- **Staggered Entrances**: When a list or a grid of items appears, they should enter one by one with a slight delay (0.05s - 0.1s stagger). This reduces cognitive load and makes the app feel "alive."
- **Layout Transitions**: Use Framer Motion's `layout` prop to smoothly animate elements as they change size or position. This is particularly effective when moving items between "Pending" and "Completed" states.
- **Interactive Feedback**: All clickable elements must respond to `whileTap` with a slight scale down (0.97 - 0.98) and `whileHover` with a subtle elevation or color shift.
- **Page Transitions**: Global transitions should utilize `AnimatePresence` with a consistent slide-and-fade effect (e.g., `initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }`).
- **Presence Cues**: Use `AnimatePresence` to handle element removal. Items being deleted or completed should exit gracefully (scale down or fade out) rather than disappearing instantly.

By following these guidelines, BarConnect maintains its identity as a professional, top-tier management tool where every pixel and every motion reflects quality and attention to detail.