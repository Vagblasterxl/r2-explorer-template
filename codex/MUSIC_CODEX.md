# MUSIC CODEX — Song-Machine Verbs & Templates

**TL;DR: Castable verbs + fill-in templates for writing, producing, and packaging music
with AI (Suno/Udio-style generators, lyric work, full album pipelines). Same cast syntax
as SKILLS_CODEX.md. Everything outputs files so the next verb can eat them.**

---

## WING M1 — SONGWRITING VERBS

| Verb | Cast line |
|------|-----------|
| **SEED** | "Give me 5 song seeds from <feeling/event/image>: each = title + one-line premise + the lie the narrator believes." |
| **LYRIC** | "Write lyrics for seed <n> using form <FORM below>. Concrete nouns only — no 'heart/soul/fire' unless earned. One image per line." |
| **HOOK-FORGE** | "Give me 10 hook candidates for <title>: ≤7 words each, singable on one breath, at least 3 with internal rhyme." |
| **REWRITE-HARDER** | "Take these lyrics and remove every cliché. Replace each with something only this narrator would say." |
| **PROSODY** | "Mark the stressed syllables in this chorus. Fix any line where melody stress would fight word stress." |
| **TITLE-STORM** | "30 titles in the <genre> register: 10 two-word, 10 with a place or name, 10 that are sentences." |
| **ANSWER-SONG** | "Write the reply-song to <existing song premise> from the other character's side." |

## WING M2 — SONG FORMS (fill-in skeletons)

```
FORM-A (pop standard):   V1 / PRE / CH / V2 / PRE / CH / BRIDGE / CH(x2, lift key or drop drums)
FORM-B (storyteller):    V1 / V2 / CH / V3 / CH / V4(twist) / CH(rewritten after the twist)
FORM-C (banger):         HOOK cold open / V1(8 bars) / HOOK / V2(8) / SWITCH(halftime 4) / HOOK x2
FORM-D (slow burn):      V1 sparse / V2 +drums / CH first time at 1:10 / strip / final CH huge
FORM-E (loop ballad):    Same 4 chords throughout; arrangement tells the story, not harmony.
```
Cast: "LYRIC seed 3 using FORM-D."

## WING M3 — GENERATOR PROMPTS (Suno/Udio-style templates)

The formula: `[genre fusion], [era/production], [tempo+key], [instrumentation, 3 items
max], [vocal description], [mood arc], [one weird detail]`

| Template | Fill-in |
|----------|---------|
| **CINEMATIC-TRAP** | "cinematic trap, 2024 polish, 140bpm F minor, sub-808 + solo cello + vinyl crackle, male half-sung half-spoken low register, menacing→triumphant, church bell on the drop" |
| **DESERT-ROCK** | "desert stoner rock, 70s tape warmth, 96bpm E, fuzz bass + tremolo guitar + tambourine, female blues belt, hypnotic→unhinged, engine sounds buried in the mix" |
| **NEON-SAD** | "synthwave ballad, 1986 production, 84bpm A minor, DX7 keys + gated snare + fretless bass, androgynous airy vocal, nostalgic→devastated, dial-tone outro" |
| **PORCH-FOLK** | "appalachian folk, single-mic room sound, 72bpm G, banjo + upright bass + boot stomps, weathered male voice close-mic'd, warm→haunted, screen-door creak percussion" |
| **GLITCH-SOUL** | "glitch soul / neo-RnB, 2026 experimental, 68bpm Eb, chopped choir + MPC swing + tape stop FX, melismatic female lead, sultry→defiant, voicemail sample bridge" |
| Cast **GEN-PROMPT** | "Build a generator prompt from <song/lyrics/mood> using the formula; give 3 variants: safe / weird / unhinged." |

## WING M4 — PRODUCTION VERBS

| Verb | Cast line |
|------|-----------|
| **ARRANGE** | "Map <song> onto a 16-section arrangement grid: what enters/exits each 8 bars. Nothing plays the whole song." |
| **REFERENCE** | "Name 3 reference tracks for <vibe>; for each: what to steal (one production trick) and what to avoid." |
| **MIX-PASS** | "Mix checklist for <track>: mono check, 200Hz mud, vocal 2-5k presence, sub mono below 100, de-ess, -14 LUFS master. Verdict per item." |
| **STEM-PLAN** | "List the stems <track> needs for a remix pack and what each must contain." |
| **TRANSITION** | "Give 5 ways to get from section <A> to <B>: a riser, a cut, a filter, a drop-out, a key pivot — scored per vibe." |

## WING M5 — CATALOG & RELEASE VERBS

| Verb | Cast line |
|------|-----------|
| **ALBUM-ARC** | "Sequence these <n> songs into a tracklist with an emotional arc: open strong, valley at 60%, land the ending. Justify each slot." |
| **EP-SPLIT** | "Split this pile of songs into EPs by mood-cluster; name each EP; flag songs that belong to none." |
| **COVER-BRIEF** | "Write the album-art brief for <project>: palette, one central image, type treatment, 3 reference styles. No faces unless asked." |
| **LINER** | "Write liner notes for <project> in 150 words: where it was made, what broke, what it's for." |
| **DROP-KIT** | "Make the release kit: 1 announcement post, 1 presave blurb, 3 shorts hooks (first 2 seconds each), 1 email." |
| **CATALOG-LEDGER** | "Append every finished track to MUSIC-LEDGER.md: title, date, form, prompt used, where the files live." |

## THE MUSIC PIPELINE (verbs chained)

```
SEED → LYRIC(FORM-x) → HOOK-FORGE → REWRITE-HARDER → PROSODY
     → GEN-PROMPT(3 variants) → [generate in Suno/Udio, pick winner]
     → ARRANGE → MIX-PASS → CATALOG-LEDGER → ALBUM-ARC → DROP-KIT
```
Every arrow is one cast. Any agent can pick up the chain at any arrow because each verb
left a file.
