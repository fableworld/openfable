# OpenFable Design System (OFDS) v1.0

**Version:** 1.0
**Status:** Final
**Target:** PWA Development (React/Vue/Svelte) & Mobile UX
**Philosophy:** *"The Magic Portal"* — A fluid and tactile bridge between the digital and the physical toy.

---

## 1. Foundations

### 1.1 Color Palette

Colors are chosen to be vibrant yet accessible, evoking creativity without being childish.

| Role Name | HEX Code | Description | Usage |
| --- | --- | --- | --- |
| **Primary (Brand)** | `#6366F1` | **Fable Indigo** | Main buttons, Active links, Brand identity. |
| **Primary (Hover)** | `#4F46E5` | **Indigo Dark** | Hover/active state of the primary button. |
| **Secondary (Magic)** | `#14B8A6` | **Spark Teal** | Gradients, Success icons, "Magic" elements. |
| **Danger / Error** | `#F43F5E` | **Maker Coral** | Error messages, Deletion, "Offline" badge. |
| **Background** | `#F8FAFC` | **Slate 50** | General app background (softer than white). |
| **Surface** | `#FFFFFF` | **Pure White** | Card background, Modals, Floating Menu. |
| **Text Main** | `#0F172A` | **Slate 900** | Headings, Main text. |
| **Text Muted** | `#64748B` | **Slate 500** | Metadata, Dates, Secondary descriptions. |

**CSS Variables Example:**

```css
:root {
  --color-primary: #6366F1;
  --color-secondary: #14B8A6;
  --color-danger: #F43F5E;
  --bg-app: #F8FAFC;
  --bg-surface: #FFFFFF;
  --text-main: #0F172A;
  --text-muted: #64748B;
}

```

### 1.2 Typography

A pairing that balances the playfulness of the content with the technical precision of the data.

* **Headings:** **Nunito** (Rounded Sans)
* *Characteristics:* Rounded, friendly, high readability.
* *Weights:* Bold (700), ExtraBold (800).


* **Body:** **Inter** (UI Sans)
* *Characteristics:* Neutral, excellent rendering of numbers (Tabular nums for versions/dates), clean.
* *Weights:* Regular (400), Medium (500), SemiBold (600).



**Typographic Scale (Mobile First):**

* **H1 (Page Title):** 28px / 1.2 (Nunito Bold)
* **H2 (Section Title):** 22px / 1.3 (Nunito Bold)
* **H3 (Card Title):** 18px / 1.4 (Nunito Bold)
* **Body:** 16px / 1.5 (Inter Regular)
* **Caption/Label:** 13px / 1.4 (Inter Medium - Uppercase tracking wide)

### 1.3 Iconography

* **Set:** **Phosphor Icons** (or Lucide React).
* **Style:** `Bold` or `Duotone`.
* **Stroke:** Rounded (`stroke-linecap: round`).
* **Examples:**
* *NFC Write:* `MagicWand` or `Broadcast`
* *Download:* `DownloadSimple`
* *Settings:* `GearSix`



---

## 2. UI Components

### 2.1 Buttons

**A. The "Magic Button" (Primary Action / NFC Write)**

* **Shape:** Full pill (`border-radius: 9999px`).
* **Background:** Horizontal linear gradient (from *Fable Indigo* to a slightly lighter tone).
* **Shadow:** `0px 8px 16px -4px rgba(99, 102, 241, 0.4)` (Colored shadow, not black).
* **Behavior:** Sticky at the bottom (mobile) or Hero block (desktop).
* **Active State:** `Scale(0.96)`.

**B. Secondary Button (Auxiliary Actions)**

* **Shape:** Pill or Rounded Rectangle (`border-radius: 12px`).
* **Background:** Transparent or `bg-slate-100`.
* **Text:** *Fable Indigo*.
* **Border:** Optional 1px solid *Indigo*.

### 2.2 Character Card (Gallery)

The most repeated element. It should feel like a collectible physical object.

* **Layout:** Grid (Masonry or Standard).
* **Container:** `bg-surface`, `border-radius: 20px`.
* **Image:** Aspect ratio 1:1 or 4:3. `Object-fit: cover`. Rounded top corners (20px), bottom 0.
* **Elevation (Shadow):**
* *Idle:* `0px 4px 6px -1px rgba(0, 0, 0, 0.05)` (Subtle).
* *Hover/Touch:* The shadow becomes soft Indigo and the card rises by 2px.


* **Loading State:** Skeleton Screen with "shimmer" effect (gray wave).

### 2.3 Navigation: The Floating Pill

As requested, navigation is not anchored to the edge but "floats".

* **Position:** `Fixed`, `Bottom: 24px`, Horizontally centered.
* **Appearance:**
* `Background: rgba(255, 255, 255, 0.85)` (Semi-transparent).
* `Backdrop-filter: blur(12px)` (Frosted glass effect).
* `Border-radius: 9999px` (Pill).
* `Box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1)`.


* **Content:** 3 Icons (Home, Scan/Search, Settings).
* **Active State:** The active icon has a *Spark Teal* dot below it or turns *Indigo*.
* **Scroll Behavior:**
* *Scroll Down:* The pill slides down (translateY) and disappears.
* *Scroll Up:* The pill reappears.



---

## 3. Motion & Feedback

### 3.1 Page Transitions (Shared Element)

When the user clicks a Card to see details:

* The card image **does not fade**. It fluidly "expands" toward the position of the hero image on the detail page.
* Technique: `View Transitions API` (if supported by the browser) or motion library (Framer Motion / Svelte Transition).
* Curve: `spring(stiffness: 300, damping: 30)` — A snappy yet elastic movement.

### 3.2 NFC Micro-Interaction (Success)

At the end of the tag writing:

1. The "Write Tag" button contracts, becoming a circle.
2. The color changes from *Indigo* to *Spark Teal*.
3. A "Check" icon is drawn (stroke animation).
4. Haptic feedback (vibration) on mobile devices.

### 3.3 Toast Notifications

Small alerts at the top or bottom (above the navbar).

* **Success:** *Spark Teal* left border, Check icon.
* **Error:** *Maker Coral* left border, Alert icon.
* **Animation:** Slide in from the bottom + Fade.

---

## 4. Implementation Guidelines (Dev Handoff)

1. **PWA Manifest:** Set `theme_color` to `#F8FAFC` (Background) to blend the phone's status bar with the app.
2. **Touch Targets:** Ensure every clickable area (especially in the Floating Pill and Card) is at least **48x48px**.
3. **Image Handling:** Implement native lazy-loading (`loading="lazy"`) on cards and use the `<picture>` tag to serve WebP where possible.
4. **Dark Mode (Future-proof):** Structure CSS variables so that by swapping `--bg-surface` to `#1E293B` and `--text-main` to `#F1F5F9`, the design remains solid without structural changes.