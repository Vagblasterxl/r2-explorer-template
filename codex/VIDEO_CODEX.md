# VIDEO CODEX — Shot-Machine Verbs & Templates

**TL;DR: Castable verbs + fill-in templates for AI video (Veo/Grok-style), storyboarding,
editing rhythm, and packaging. Pairs with the STORY wing in SKILLS_CODEX.md: CAST-CALL
and SCENE feed directly into these.**

---

## WING V1 — THE SHOT GRAMMAR (the core formula)

Every AI-video prompt is one sentence built from six slots:

```
[SUBJECT doing one specific action] + [SETTING with time-of-day] + [CAMERA move]
+ [LENS/LOOK] + [LIGHT] + [one physical detail that sells realism]
```

Example: "A woman in a rain-soaked trench coat lights a cigarette on a fire escape,
downtown at 3am, slow push-in from across the alley, 85mm shallow focus, sodium-vapor
orange against blue shadow, smoke curling into the rain."

**Rules that make it good instead of cookie-cutter:**
1. ONE action per shot. Two actions = two shots.
2. The camera is a character: pick a move with intent (push = pressure, pull = loss,
   static = dread, handheld = panic, orbit = reveal).
3. Light tells the emotion before the subject does.
4. The "one physical detail" (steam, dust, a dripping tap) is what makes it feel shot,
   not rendered.

## WING V2 — CAMERA & LOOK TEMPLATES

| Template | Paste-ready fragment |
|----------|---------------------|
| **TENSION-PUSH** | "slow 10-second push-in, 50mm, no cuts, practical light flickering once" |
| **GOD-TILT** | "top-down crane descending into the scene, wide 24mm, long shadows at golden hour" |
| **STALKER-POV** | "handheld follow from 10 feet behind, 35mm, streetlights strobing past, breath fog" |
| **WHIP-REVEAL** | "static frame, subject exits left, whip-pan right to reveal <X>, motion blur, hard cut energy" |
| **MACRO-OPEN** | "extreme macro on <object>, rack focus out to reveal the room, dust motes in a light shaft" |
| **ORBIT-TURN** | "slow 180° orbit around subject as their expression changes, backlit rim light, 65mm" |
| **CRASH-ZOOM** | "sudden crash zoom to face on the beat, slight fisheye, overexposed flash frame" |
| **DOLLY-ZOOM** | "vertigo dolly-zoom, background stretching away, subject frozen, fluorescent hum lighting" |

## WING V3 — SCENE-TO-SHOTS VERBS

| Verb | Cast line |
|------|-----------|
| **SHOTLIST** | "Break scene <n> into 6-10 shots using the Shot Grammar. Each shot = one sentence, one action, numbered." |
| **COVERAGE** | "For shot <n>, give the 3-shot coverage: wide (geography), medium (relationship), close (cost)." |
| **PROMPT-PACK** | "Convert the shotlist into paste-ready Veo/Grok prompts: Grammar sentence + 'no text, no watermark, consistent character: <CANON description>' appended to each." |
| **CONTINUITY** | "Check the prompt-pack against CANON.md: wardrobe, props, time-of-day, screen direction. List violations." |
| **B-ROLL** | "Give 8 b-roll shots for <topic/place> that cut well against talking: textures, hands, weather, machines." |
| **RESHOOT** | "Shot <n> came out wrong (<what's wrong>). Rewrite the prompt changing ONLY the failing slot of the Grammar." |

## WING V4 — EDIT RHYTHM TEMPLATES

```
EDIT-A (music video):   cut ON the beat for verses, cut 1 frame BEFORE the beat on
                        chorus (feels like the video pushes the song)
EDIT-B (trailer):       3 rising pulses — 5 shots slow / 4 shots medium / 8 shots
                        accelerating — then silence + title card + one stinger
EDIT-C (short/reel):    hook frame at 0:00 (the END of the story), rewind structure,
                        payoff repeats at close. Nothing over 2 seconds before 0:10.
EDIT-D (doc scene):     let one shot run 8+ seconds for trust, then 3 quick inserts,
                        return wide. Repeat. Voice leads, picture follows.
EDIT-E (dread):         every shot 1 second longer than comfortable; cut only on
                        movement inside the frame; one jump-cut saved for the scare.
```
Cast: "Sequence the prompt-pack using EDIT-B; output the timeline as shot# + duration."

## WING V5 — PACKAGING VERBS (make it travel)

| Verb | Cast line |
|------|-----------|
| **THUMB-LAB** | "3 thumbnail concepts for <video>: one face+emotion, one object+mystery, one text≤3 words. Describe exactly, no generation needed." |
| **TITLE-AB** | "10 titles for <video>: 5 curiosity-gap, 5 plain-value. Mark the 2 you'd bet on and why." |
| **COLD-OPEN** | "Script the first 8 seconds: the most expensive-feeling moment first, context later." |
| **CHAPTERING** | "Cut <video/script> into chapters with timestamps and 2-4 word titles." |
| **CAPTION-PASS** | "Write the caption + 5 hashtags + the pinned comment (a question that starts arguments politely)." |
| **CROSS-CUT** | "Repurpose <video> into: 1 short (EDIT-C), 1 carousel of stills + captions, 1 text thread. Same facts, three shapes." |

## WING V6 — MUSIC×VIDEO FUSION (the two codices shake hands)

| Verb | Cast line |
|------|-----------|
| **SYNC-MAP** | "Map <song>'s arrangement grid (ARRANGE output) onto shots: what the camera does at every section change." |
| **DROP-SHOT** | "Design the drop moment: the shot, the cut pattern, and the one visual that lands WITH the 808." |
| **LYRIC-BOARD** | "Storyboard <song> literally vs. counter-literally (images that contrast the words). Recommend one." |
| **VISUALIZER** | "Spec a 4-shot looping visualizer for <track>: seamless loop points, no faces, hypnotic motion." |

## THE VIDEO PIPELINE (verbs chained)

```
(SCENE from Story wing) → SHOTLIST → COVERAGE → PROMPT-PACK → CONTINUITY
                        → [generate, pick takes] → RESHOOT failures
                        → EDIT-x sequence → COLD-OPEN → THUMB-LAB + TITLE-AB
                        → CAPTION-PASS → CROSS-CUT
```
For a music video: run ARRANGE (Music Codex) first, then SYNC-MAP replaces SHOTLIST.
