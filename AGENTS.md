# AGENTS.md

## Project Overview

"마음 버블" (Mind Bubble) is a healing & therapeutic stress-relief web application built on TanStack Start (React 19) and deployed on Netlify. It transforms personal worries and mental stresses into translucent floating thought bubbles that visitors can physically tap/click to pop and release, complete with tactile sound synthesis, particle bursts, and warm Korean affirmations.

## Architecture & Directory Structure

```
├── db/
│   ├── index.ts              # Netlify Database Drizzle client initialization
│   └── schema.ts             # Drizzle ORM schema (global_counters, released_burdens)
├── netlify/
│   └── database/
│       └── migrations/       # Managed SQL migrations for Netlify Database
├── public/
│   ├── favicon.ico
│   └── img/
│       └── clover-spirit.png # AI Gateway generated mascot asset (served via Netlify Image CDN)
├── src/
│   ├── components/
│   │   ├── AffirmationModal.tsx     # Saved affirmation drawer & sharing
│   │   ├── BreathingGuide.tsx       # 4-4 mindfulness breathing circle
│   │   ├── CloverMascot.tsx         # Mascot with reactive speech bubble
│   │   ├── FloatingBubbleItem.tsx   # Glassmorphism thought bubble with pop physics
│   │   └── SoundBar.tsx             # Ambient drone & FX sound toggles
│   ├── lib/
│   │   ├── affirmations.ts          # Healing affirmations, categories, & presets
│   │   ├── confetti.ts              # Particle burst helper using canvas-confetti
│   │   └── sound.ts                 # Zero-dependency Web Audio API sound synthesizer
│   ├── routes/
│   │   ├── __root.tsx               # Root route with Korean SEO meta tags
│   │   ├── index.tsx                # Main interactive stress-release experience
│   │   ├── api.stats.ts             # GET /api/stats: returns global release stats
│   │   └── api.release.ts           # POST /api/release: records released burden
│   ├── router.tsx                   # TanStack Router configuration
│   └── styles.css                   # Tailwind v4, custom keyframes, & typography
├── drizzle.config.ts                # Drizzle kit configuration
└── netlify.toml                     # Netlify build & dev configuration
```

## Key Conventions & Non-Obvious Decisions

1. **Web Audio API Sound Synthesis (`src/lib/sound.ts`)**:
   - Rather than relying on external audio MP3/WAV files that can fail due to CORS, 404s, or bandwidth constraints, all sound effects (pentatonic crystal chime pop, breeze wind sweep, and 174Hz Solfeggio stress-relief ambient drone) are dynamically synthesized in real-time via Web Audio API.

2. **Database Resilience**:
   - Both `/api/stats` and `/api/release` are wrapped in try-catch blocks with graceful fallbacks. If the Netlify Database is provisioning or cold-starting, the UI continues functioning seamlessly without showing any error states.

3. **Netlify Image CDN Integration**:
   - The mascot hero image is rendered using `<picture>` with source `/.netlify/images?url=/img/clover-spirit.png&w=480&fm=webp` and fallback to `/img/clover-spirit.png` for fast delivery and zero blur.

4. **Typography**:
   - Gowun Dodum and Gaegu Google fonts are imported in `src/styles.css` to provide an emotionally resonant, gentle Korean aesthetic that avoids clinical or generic system fonts.
