# Bill Splitting Application - Implementation Plan

**Project:** SplitBill - AI-Powered Bill Splitting Application
**Tech Stack:** Vite + React + TypeScript + shadcn/ui + Google Gemini API
**Started:** 2025-10-03

## Overview

Build a web application that splits restaurant bills among multiple people. Users upload a receipt image, Google Gemini AI extracts line items (with quantities expanded), tax, and tip. Users assign items to people, and the app calculates proportional costs including tax and tip distribution.

## Implementation Checkpoints

### ✅ Checkpoint 1: Setup & Environment Configuration (COMPLETED)
- [x] Install `@google/generative-ai` package
- [x] Create `.env` file with Gemini API key
- [x] Configure Vite to load environment variables (VITE_ prefix)
- [x] Set up TypeScript types for env variables in `vite-env.d.ts`

**Status:** Complete
**Files Modified:**
- `package.json` - Added @google/generative-ai dependency
- `.env` - Created with VITE_GEMINI_API_KEY
- `src/vite-env.d.ts` - Added ImportMetaEnv interface

---

### ✅ Checkpoint 2: File Upload Component (COMPLETED)
- [x] Add file input with image preview
- [x] Implement drag-and-drop functionality
- [x] Add file validation (JPG, PNG, HEIC, max 20MB)
- [x] Convert uploaded image to base64 for Gemini API

**Status:** Complete
**Files Modified:**
- `src/pages/Index.tsx` - Added file upload with drag-and-drop, validation, and base64 conversion

---

### ✅ Checkpoint 3: Gemini API Integration (COMPLETED)
- [x] Create API service to call Gemini Vision API
- [x] Send receipt image with structured prompt requesting JSON output
- [x] Parse response to extract: items (with individual entries for quantities), tax, tip, total
- [x] Handle duplicate items (e.g., "2 Burritos" → creates 2 separate burrito entries)
- [x] Add loading states and error handling

**Status:** Complete
**Files Created/Modified:**
- `src/services/gemini.ts` - Created Gemini API service with structured prompt for item extraction
- `src/pages/Index.tsx` - Added analyze receipt handler with loading states and error handling

---

### ✅ Checkpoint 4: Items Display & People Management (COMPLETED)
- [x] Display extracted items in an editable table
- [x] Add UI to create/remove people with names
- [x] Show subtotal, tax, tip, and total

**Status:** Complete
**Files Modified:**
- `src/pages/Index.tsx` - Added people management UI, items table display, and bill summary with subtotal/tax/tip/total

---

### ✅ Checkpoint 5: Item Assignment & Calculation (COMPLETED)
- [x] Add dropdown/select for each item to assign to a person
- [x] Calculate per-person costs:
  - [x] Sum assigned items for each person's subtotal
  - [x] Distribute tax proportionally (person's subtotal / total subtotal × tax)
  - [x] Distribute tip proportionally (person's subtotal / total subtotal × tip)
- [x] Display final amounts per person
- [x] **Enhanced:** Multiple people per item (split cost evenly)
- [x] **Enhanced:** Toggle between checkbox and dropdown assignment modes
- [x] **Enhanced:** Show items immediately (not only after adding people)
- [x] **Enhanced:** Only show split summary when all items assigned
- [x] **Enhanced:** Mock data for testing

**Status:** Complete
**Files Modified:**
- `src/pages/Index.tsx` - Added multi-person assignments, dual assignment modes, mock data, and improved UX

---

### ✅ Checkpoint 6: Polish & Final Features (COMPLETED)
- [x] Allow manual editing of extracted items/prices
- [x] Add "Start Over" button to reset the flow
- [x] Improve mobile responsiveness
- [x] Polish error states and loading UI

**Status:** Complete
**Files Modified:**
- `src/pages/Index.tsx` - Added inline item editing (name/price), delete items, Start Over button, mobile-responsive layouts, improved loading states with helper text, empty state handling, and enhanced drag-and-drop visual feedback

---

## Key Features

### Duplicate Item Handling
If a receipt shows "2 Burritos", the application will create 2 separate burrito entries in the items table so they can be assigned to individual people.

### Proportional Cost Distribution
- **Tax Distribution:** `(person's subtotal / total subtotal) × total tax`
- **Tip Distribution:** `(person's subtotal / total subtotal) × total tip`
- **Total Per Person:** `person's subtotal + person's tax + person's tip`

---

## Notes

- This is a Vite/React application (not Next.js), using client-side API calls
- Environment variables must be prefixed with `VITE_` to be accessible in the browser
- Using shadcn/ui components for consistent UI design
