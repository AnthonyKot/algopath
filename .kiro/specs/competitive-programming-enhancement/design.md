# Refined Design Document: Competitive Handbook

## Overview

This design transforms the existing guide into a practical, static "handbook" for algorithm revision. The system will move from hardcoded HTML blocks to a data-driven JavaScript architecture that supports dynamic rendering, shared components, and a light/dark theme.

## Architecture

### Static Handbook Architecture

The system is a lightweight, frontend-only static site:
1.  **Data Layer (`data/problems.json`)**: A single JSON file containing the "Gold Standard" problem sets.
2.  **Logic Layer (`script.js`)**: Handles dynamic rendering, theme switching, and smooth navigation.
3.  **UI Components**: JavaScript-injected shared elements (Header/Footer) to maintain a DRY codebase.
4.  **Styling (`styles.css`)**: CSS Variable-based design system supporting immediate theme toggling.

### Technology Stack
- **Languages**: HTML5, CSS3, ES6+ JavaScript.
- **Data Format**: JSON.
- **Persistence**: `localStorage` for theme preferences.
- **Structure**: Static multipage (index + category pages).

## Components and Data Models

### Problem Data Model

Problems are stored in `problems.json` with the following structure:
```json
{
  "category_id": [
    {
      "id": "string",
      "title": "string",
      "difficulty": "Easy|Medium|Hard",
      "tags": ["string"],
      "description": "markdown-string",
      "code": "javascript-snippet-string",
      "complexity": { "time": "O(N)", "space": "O(1)" },
      "insight": "key-logic-hint"
    }
  ]
}
```

### UI Component Injection

Shared UI elements are injected via `script.js` to avoid duplication:
- `UI.injectHeader()`: Mounts the navigation and theme toggle.
- `UI.injectFooter()`: Mounts the copyright and secondary links.
- `UI.renderProblems(categoryId)`: Fetches data and populates the problem grid.

### Theme System

Uses CSS variables to ensure zero-flicker theme switching:
```css
:root { --bg: #fff; --text: #333; }
[data-theme="dark"] { --bg: #1a1a1a; --text: #eee; }
```

## AI-Assisted Learning

### Conversation Features
The AI assistant provides real-time help within the chat context:
- **Interview Tips**: Strategy guidance referencing problems from the guide
- **Debug on Example**: Run user code on problem inputs, provide execution traces

### Enrichment Content
Pre-generated content added to `problems.json`:
```json
{
  "follow_ups": [
    "What if the array contains negative numbers?",
    "Can you optimize space to O(1)?",
    "How would you handle duplicates?"
  ]
}
```

## Maintenance & Extensibility

1.  **Adding Problems**: Simply append a new object to the appropriate array in `problems.json`.
2.  **New Categories**: Create a new `.html` file with the standard mount points and call the renderer for the new ID.
3.  **Theming**: Add new variables to `:root` and `[data-theme="dark"]` to extend the palette.
