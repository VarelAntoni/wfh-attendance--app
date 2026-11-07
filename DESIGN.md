# DESIGN.md - Enterprise Workforce Presence Instrument
Part of Anti-Slop & Impeccable UI/UX System

## 1. Visual Personality & Archetype
- **Archetype**: Precision Workplace Instrument (Inspired by Linear, GitHub, and Dieter Rams' Principles of Good Design).
- **Core Stance**: Zero AI slop. No gratuitous purple gradients, no fuzzy glowing colored shadows, no frosted glass everywhere, no uniform pill shapes.
- **Rhythm**: Varied density, purposeful hierarchy. Data-dense where needed (tables, audit logs), spacious and focused where action is demanded (viewfinder attendance check-in).

## 2. Color Palette & Surface Tokens
- **Background Ground Plane**: `#F8FAFC` (Slate-50) / `#FFFFFF` (White)
- **Surfaces / Cards**: Clean white surfaces with crisp 1px borders (`#E2E8F0` / `border-slate-200`), elevated by razor-sharp micro-shadows (`0 1px 3px 0 rgb(0 0 0 / 0.04)`), never diffuse floating colored blobs.
- **Brand / Primary Action**: Deep Slate / Navy `#0F172A` (Slate-900) for primary buttons with crisp hover lift, with `#2563EB` (Cobalt Blue) used strictly for interactive links and active indicators.
- **Semantic Accents**:
  - `Present / Active`: Forest Emerald `#059669` (bg `#ECFDF5`, text `#065F46`, border `#A7F3D0`).
  - `Late / Attention`: Warm Amber `#D97706` (bg `#FFFBEB`, text `#92400E`, border `#FDE68A`).
  - `Danger / Destructive`: Crimson `#DC2626` (bg `#FEF2F2`, text `#991B1B`, border `#FECACA`).

## 3. Typography & Numerals
- **Typeface**: Inter / System UI Sans.
- **Headings**: `tracking-tight font-semibold text-slate-900`.
- **Labels & Metas**: `text-xs font-medium text-slate-500 uppercase tracking-wider`.
- **Numerical Data**: `font-mono tabular-nums` for all dates, timestamps, employee IDs (NIP), and statistical counts.

## 4. Components & Motion
- **Radii System**:
  - Small widgets / badges: `rounded-md` (6px)
  - Inputs / Buttons: `rounded-lg` (8px)
  - Cards / Modals: `rounded-xl` (12px)
  - Avoid `rounded-full` everywhere.
- **Micro-interactions**: Snappy 150ms transitions (`transition-all duration-150 ease-out`), active press scales (`active:scale-[0.99]`).
