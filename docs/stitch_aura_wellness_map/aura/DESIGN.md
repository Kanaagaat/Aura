---
name: Aura
colors:
  surface: '#fafaf5'
  surface-dim: '#dadad6'
  surface-bright: '#fafaf5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4ef'
  surface-container: '#eeeeea'
  surface-container-high: '#e8e8e4'
  surface-container-highest: '#e2e3de'
  on-surface: '#1a1c1a'
  on-surface-variant: '#424842'
  inverse-surface: '#2f312e'
  inverse-on-surface: '#f1f1ec'
  outline: '#727971'
  outline-variant: '#c2c8bf'
  surface-tint: '#44664a'
  primary: '#44664a'
  on-primary: '#ffffff'
  primary-container: '#7a9e7e'
  on-primary-container: '#13341c'
  inverse-primary: '#aad0ad'
  secondary: '#7b554a'
  on-secondary: '#ffffff'
  secondary-container: '#feccbe'
  on-secondary-container: '#7a5449'
  tertiary: '#7a5821'
  on-tertiary: '#ffffff'
  tertiary-container: '#b68e52'
  on-tertiary-container: '#402900'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c6ecc8'
  primary-fixed-dim: '#aad0ad'
  on-primary-fixed: '#00210b'
  on-primary-fixed-variant: '#2d4e33'
  secondary-fixed: '#ffdbd0'
  secondary-fixed-dim: '#ecbcae'
  on-secondary-fixed: '#2e140c'
  on-secondary-fixed-variant: '#603e34'
  tertiary-fixed: '#ffddb0'
  tertiary-fixed-dim: '#ecbf7e'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#5f410a'
  background: '#fafaf5'
  on-background: '#1a1c1a'
  surface-variant: '#e2e3de'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '300'
    lineHeight: '1.1'
    letterSpacing: 0.02em
  display-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1.3'
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 20px
    fontWeight: '400'
    lineHeight: '1.3'
  title-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.5'
  body-lg:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  caption:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-margin-mobile: 20px
  container-margin-desktop: 48px
  gutter: 16px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 40px
---

## Brand & Style
The brand personality is grounded, serene, and deeply intentional. It evokes the feeling of "morning light through linen curtains"—breathable, organic, and premium. The target audience consists of urban wellness enthusiasts who value mindfulness, community, and an editorial aesthetic.

The design style is a blend of **High-End Minimalism** and **Organic Softness**. It relies on generous whitespace (negative space), a muted natural palette, and sophisticated typography to create a sense of calm. Elements should feel weightless but tangible, avoiding heavy ornamentation in favor of subtle textures and refined proportions reminiscent of luxury lifestyle publications.

## Colors
The palette is inspired by natural pigments and soft shadows. 

- **Background & Surface:** Use the Warm White (#FAFAF7) for the base canvas to reduce harsh glare. White (#FFFFFF) is reserved for elevated cards and modals to create a subtle layered effect.
- **Primary Accent (Sage):** Used for primary actions, success states, and wellness-focused highlights.
- **Secondary Accent (Dusty Rose):** Used for social features, heart/likes, and soft notifications.
- **Tertiary Accent (Soft Amber):** Used for map markers, premium "gold" status, and evening-related events.
- **Neutrals:** Text uses a warm near-black to maintain high legibility without the clinical feel of pure black. Borders are kept extremely faint to guide the eye without creating rigid boxes.

## Typography
The typography follows an editorial hierarchy. **Playfair Display** (Serif) is used for headers and display moments to evoke a literary, premium feel. It should be used with "Light" weights and slight tracking (letter spacing) for a breathable appearance.

**DM Sans** (Sans-Serif) handles all functional UI tasks and body copy. It provides a clean, modern contrast to the serif headings. Maintain generous line-heights (1.5–1.6) for body text to ensure a relaxed reading experience. Labels use uppercase with wide tracking to differentiate them from body content without increasing visual weight.

## Layout & Spacing
The layout follows a **Fluid-Fixed hybrid model**. On mobile, a 4-column grid is used with 20px side margins. On desktop, content is contained within a max-width layout (1280px) to maintain the editorial feel, utilizing a 12-column grid.

Navigation is context-specific:
- **Mobile:** A fixed bottom navigation bar with soft frosted glass or solid white background.
- **Desktop:** A persistent left sidebar with high transparency and minimal iconography.

Spacing should feel "airy." Avoid packing elements tightly. Use `stack-lg` (40px) between major sections to allow the design to breathe. Gutters are consistently 16px to keep related elements cohesive.

## Elevation & Depth
This design system avoids traditional deep shadows in favor of **Tonal Layering** and **Micro-Shadows**. 

Depth is primarily achieved through the contrast between the Warm White (#FAFAF7) background and Pure White (#FFFFFF) surfaces. When shadows are necessary for high-level components like Modals or Floating Action Buttons, use a very diffused, low-opacity shadow: `0px 2px 16px rgba(0,0,0,0.06)`. 

For secondary depth, use 1px solid borders in #EEECE8. This "Ghost Border" technique defines boundaries without creating heavy visual breaks, maintaining the soft, light-filled aesthetic.

## Shapes
The shape language is organic and approachable. Sharp corners are entirely avoided. 

- **Cards:** Use a 20px radius to feel soft but structural.
- **Modals & Bottom Sheets:** Use a 28px radius on top corners to emphasize a "nesting" feeling.
- **Interactive Elements:** Buttons and tags use a full Pill shape (100px) to mimic smooth river stones or organic forms.

All imagery should also carry a subtle corner radius (at least 12px) to align with the soft-focus brand identity.

## Components
- **Buttons:** Primary buttons use the Sage (#7A9E7E) background with white text, always pill-shaped. Secondary buttons use a ghost style (border only) or a soft Dusty Rose tint.
- **Cards:** Surface color (#FFFFFF) with a faint 1px border (#EEECE8). Avoid heavy shadows unless the card is being actively dragged or is a top-level modal.
- **Chips/Pills:** Used for map categories (e.g., "Yoga," "Cafes"). Use the Soft Amber or Sage at 10% opacity for the background and 100% opacity for the text.
- **Input Fields:** Minimalist style. No background; only a bottom border in #EEECE8 that shifts to Sage on focus. Labels sit in the Label-MD typography style above the field.
- **Maps:** Use a custom "Lite" map style with reduced detail, utilizing the warm neutral palette to ensure UI elements pop against the map surface.
- **Navigation Bar:** Use thin, linear icons. Active states are indicated by the Primary Sage color and a small 4px dot below the icon.