# Product Requirements Document (PRD)

**Project Name:** OpenFable (Working Title)
**Type:** Progressive Web App (PWA)
**Version:** 1.0
**Status:** Draft

## 1. Executive Summary

OpenFable is a decentralized, high-performance Progressive Web App (PWA) designed to manage, discover, and write NFC tags for custom audio characters compatible with popular children's music players (e.g., FABA).

The application functions as a "Registry Viewer." It does not host content directly (except for a safe default registry) but allows users to import third-party JSON registries. It bridges the gap between digital audio files, 3D printable models, and physical NFC tags, providing a seamless user experience across mobile (Android/iOS) and desktop.

## 2. User Personas

* **The Maker Parent:** Tech-savvy, owns a 3D printer, wants to create custom stories for their children.
* **The Content Sharer:** Creates collections of characters and wants to share them via a simple link.
* **The Casual User:** Wants to browse available characters and easily understand how to make them work.

## 3. Functional Requirements

### 3.1 Registry Management

The core of the application is the "Registry," a remote JSON file containing character metadata.

* **Default Registry:** The app must ship with a hardcoded, immutable "Official Registry" containing legal/safe-to-use content (e.g., AI-generated songs, public domain stories).
* **Adding Custom Registries:**
* **Input Methods:** Direct URL entry or QR Code scanning.
* **Validation Logic:** Upon addition, the app fetches the JSON.
* *Success:* The JSON is parsed. If valid characters exist, the registry is added.
* *Partial Failure:* If the JSON structure is valid but specific characters are malformed, those characters are skipped (logged silently), and the valid ones are imported.
* *Total Failure:* If the JSON is unreachable, malformed, or contains *zero* valid characters, the operation aborts. A clear, user-friendly error message is displayed (e.g., "We couldn't read the character list from this link. Please check the URL.").


* **Storage:** Validated JSONs are cached locally (IndexedDB/LocalStorage) for offline access.


* **Updates:**
* **Background Refresh:** Triggered automatically upon app launch if the last update was older than `X` days (Configurable at build time, default: 3 days). This happens silently without blocking the UI.
* **Manual Refresh:** A "Check for Updates" button in the Settings/Registry Manager view.



### 3.2 Gallery & Discovery

* **View:** Grid layout of characters.
* **Sorting:** Default sort by `creation_date` (Newest first).
* **Search:** Real-time filtering by character `name`.
* **Performance:** Images must be lazy-loaded and aggressively cached. The UI must remain responsive during scrolling (virtualized list recommended for large datasets).

### 3.3 Character Detail View

Clicking a character opens a detailed view containing:

* **Visuals:**
* Main preview image.
* Optional image carousel (if `gallery_images` are provided in JSON).


* **Metadata:** Name, Author (if avail), Description.
* **Audio Actions:**
* **Play Preview:** Streaming player for `audio_sample_url`.
* **Download Pack:** Direct download of the `audio_zip_url` (contains files for the physical player).


* **3D Model Actions:**
* Support for multiple provider types: Direct Zip Download, Printables, MakerWorld, Thingiverse.
* Clicking these opens the specific app/website in a new tab.


* **NFC Writing (The "Magic"):**
* **Android (WebNFC):** A primary CTA button "Write to Tag". Tapping this and touching a tag writes the specific payload required by the player.
* **iOS (iPhone):** Since WebNFC is not supported, the button changes to "How to Write". Clicking it opens a modal/drawer with clear instructions (e.g., "Copy this code," "Download NFC Tools app," "Paste and Write").


* **Deep Link (Desktop Companion):** A reserved button for future integration to open a desktop helper app via a custom protocol (e.g., `openfable://load-zip?url=...`).

### 3.4 Deep Linking & Sharing

* **Share Functionality:** Users can share a specific character.
* **Link Structure:** The URL must contain the Character ID *and* the Registry URL.
* *Example:* `https://app.openfable.com/character?id=101&registry=https://user-repo.com/list.json`


* **Recipient Flow:**
1. User Y clicks the link.
2. App checks if `https://user-repo.com/list.json` is already known.
3. **If Unknown:** A prompt appears: *"This character belongs to a new collection. Do you want to add 'User Repo' to your library?"* (Options: Add, View Once, Cancel).
4. **If Known:** Directly opens the detail page.
5. **Error Handling:** If the registry is 404 or the ID doesn't exist, show a friendly "Character not found" page.



## 4. Data Model (JSON Schema)

The external JSON file must adhere to this structure:

```json
{
  "meta": {
    "name": "My Custom Collection",
    "version": "1.0",
    "maintainer": "User Name"
  },
  "characters": [
    {
      "id": "unique-uuid-or-string",
      "name": "Space Ranger",
      "created_at": "2023-10-27T10:00:00Z",
      "preview_image": "https://example.com/ranger_thumb.jpg",
      "gallery_images": [
        "https://example.com/ranger_side.jpg",
        "https://example.com/ranger_back.jpg"
      ],
      "audio_sample_url": "https://example.com/ranger_preview.mp3",
      "audio_zip_url": "https://example.com/ranger_pack.zip",
      "models_3d": [
        {
          "provider": "makerworld",
          "url": "https://makerworld.com/en/models/12345"
        },
        {
          "provider": "direct",
          "url": "https://example.com/ranger_stl.zip"
        }
      ],
      "nfc_payload": "The specific string/code needed for the tag"
    }
  ]
}

```

## 5. Non-Functional Requirements

### 5.1 Performance

* **Startup Time:** < 1.5 seconds on 4G networks (using Service Worker caching).
* **Offline Mode:** The app must be fully navigable offline (viewing previously cached text/images).
* **Image Optimization:** Automatic WebP format selection if supported.

### 5.2 Design System & UX

* **Aesthetic:** Modern, clean, "Fluid."
* *Colors:* Vibrant but accessible palette.
* *Typography:* Sans-serif, legible at small sizes.


* **Animations:**
* **Micro-interactions:** Subtle scaling when tapping cards.
* **Transitions:** Shared Element Transitions (hero animations) when moving from Gallery -> Detail view (image expands to fill screen).
* **Loading:** Skeleton screens (shimmer effect) instead of spinning wheels.


* **Feedback:** Toast notifications for success/error states (e.g., "Registry Added," "Tag Written Successfully").

### 5.3 Technical Constraints

* **Tech Stack:** React, Vue, or Svelte (recommended for performance).
* **PWA:** Must satisfy all "Installability" criteria (manifest.json, HTTPS, icons).
* **Storage:** IndexedDB for JSON data; Cache API for assets.

## 6. User Flows

### 6.1 Adding a Registry via QR

1. User opens "Settings" -> "Add Registry".
2. User taps "Scan QR".
3. Camera opens, scans code containing URL.
4. App displays spinner "Verifying Collection...".
5. App validates JSON.
6. Success Toast: "Collection Added!".
7. App redirects to Gallery, now populated with new items.

### 6.2 Writing NFC (Android)

1. User is on "Space Ranger" detail page.
2. User taps "Write Tag" button.
3. Browser prompt: "Ready to scan".
4. User holds NFC tag to phone.
5. Phone vibrates.
6. App shows Green Checkmark animation: "Tag Written!".

### 6.3 Writing NFC (iOS/Fallback)

1. User is on "Space Ranger" detail page.
2. User taps "How to Write" button.
3. Modal opens with text field containing `nfc_payload`.
4. User taps "Copy".
5. User switches to external NFC tool app to complete process.

## 7. Future Roadmap

* **Desktop Companion App:** Automatic downloading of the Audio Zip and extraction to the physical player's SD card.
* **User Favorites:** Ability to bookmark characters.
* **Dark Mode:** System-compliant dark theme.
