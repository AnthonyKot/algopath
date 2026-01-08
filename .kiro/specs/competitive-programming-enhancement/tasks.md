# Refined Implementation Plan: Competitive Handbook

## Overview

Transform the guide into a practical, data-driven handbook. This plan addresses all requirements: problem volume, advanced patterns, templates, contest strategy, and AI-assisted learning.

## Tasks

### 1. Foundation & Shared UI ✅
- [x] **1.1 Componentize Header/Footer**
  - Implement `UI` module in `script.js` to inject shared HTML.
  - Create mount points in all 9 HTML files.
  - Add theme toggle button to the header.
- [x] **1.2 CSS Variables & Theming**
  - Refactor `styles.css` to use CSS variables for colors.
  - Implement `ThemeSystem` in `script.js` with `localStorage` persistence.
  - Add smooth transitions for theme switching.

### 2. Data-Driven Problem System ✅
- [x] **2.1 Initialize Problem Database**
  - Create `data/problems.json` with the refined schema.
  - Populate with 10-15 "Gold Standard" problems per category.
  - Include metadata: difficulty, complexity, and key insights.
- [x] **2.2 Dynamic Problem Rendering**
  - Implement `ProblemRenderer` in `script.js`.
  - Replace hardcoded content in category pages with dynamic mount points.
  - Ensure syntax highlighting works with dynamically loaded content.

### 3. Polish & Optimization ✅
- [x] **3.1 Mobile Responsiveness**
  - Review code blocks and grids on mobile breakpoints.
  - Ensure the theme toggle is accessible on small screens.
- [x] **3.2 Navigation & Cleanup**
  - Standardize navigation links (Home vs Sub-pages).
  - Remove dead placeholder functions from `script.js`.
  - Validate all external resource links.

---

### 4. Problem Volume (Req 1)
- [ ] **4.1 Expand Problem Sets**
  - Add problems to reach 15+ per category (currently ~10).
  - Include CF rating range 1400-2400+.
  - Order by increasing difficulty within each category.
- [ ] **4.2 Detailed Solutions**
  - Add detailed walkthroughs for problems rated CF 1800+.
  - Include actual contest problems with attribution.

### 5. Advanced Pattern Coverage (Req 2)
- [ ] **5.1 Advanced DP**
  - Add: Digit DP, Bitmask DP, Tree DP, Convex Hull Optimization.
- [ ] **5.2 Advanced Trees**
  - Add: Heavy-Light Decomposition, Centroid Decomposition.
- [ ] **5.3 Advanced Strings**
  - Add: Suffix Arrays, Aho-Corasick, Manacher extensions.
- [ ] **5.4 Advanced Math**
  - Add: FFT, Matrix Exponentiation, Advanced Number Theory.

### 6. Template Library (Req 3)
- [ ] **6.1 Create Templates**
  - Copy-paste ready templates for all algorithms.
  - Include: Segment Trees, Fenwick Trees, Graph algorithms, String algorithms.
- [ ] **6.2 Template Format**
  - Add complexity information to each template.
  - Include usage examples.
  - Ensure templates work in contest environments (fast I/O).

### 7. Contest Strategy Guide (Req 4)
- [ ] **7.1 Strategy Content**
  - Time management strategies for different contest formats.
  - Speed coding techniques and implementation shortcuts.
- [ ] **7.2 Debugging Guide**
  - Debugging strategies and common error patterns.
  - Problem reading and pattern recognition training.
  - Approach selection based on constraints.

### 8. AI-Assisted Learning (Req 5)
- [ ] **8.1 Conversation Features**
  - Interview tips and problem-solving strategy guidance.
  - Debug user code on example inputs with execution traces.
- [ ] **8.2 Enrichment Content**
  - Add `follow_ups` field to problems in `problems.json`.
  - Pre-generate interviewer questions and problem variations.

## Checkpoints
- **Checkpoint 1**: ✅ Shared Header/Footer and Light/Dark mode functional.
- **Checkpoint 2**: ✅ All category pages rendering from `problems.json`.
- **Checkpoint 3**: Problem count reaches 15+ per category with templates.
- **Checkpoint 4**: AI enrichment content added to all problems.
