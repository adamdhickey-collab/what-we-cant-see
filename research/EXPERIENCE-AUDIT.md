# Experience audit, October 2026

> **Status, 24 October 2026: all 27 suggestions are built** on the
> `ride-rework` branch. Where the build differs from the list below:
>
> - **The ride is longer**: about 8 min 40 s plus the stops, up from 3 min
>   40 s, because lines now stay up as long as a reader needs and there are
>   two new chapters (the pre-show and Too fast, too slow).
> - **Chapter order** follows item 9 with one addition: *Too fast, too slow*
>   sits between *Too faint* and *Too small*.
> - **The lenses** (item 15) are infrared, radio, neutrinos, magnetic field
>   and dark matter. The bee's ultraviolet moved to a side fact: at dusk on a
>   shore there is nothing for it to show.
> - **The souvenir** (item 19) uses the meter's own totals; the meter counts
>   the viewer's clock time, pauses included.
> - **Scroll-driven phones** (item 24) step one line per scroll or swipe,
>   through the same director as every other control, rather than mapping
>   scroll position to time.
> - **The spot-it moments** (item 11): Chapter 4 offers a toggle for the
>   machine's picks rather than a quiz, since no viewer could find the
>   galaxies Zoobot flagged by eye.
> - **The fly-and-floodlight comparison** (item 7) was dropped; its numbers
>   would not hold up.

An audit of the working seven-chapter build, walked through at 1280×800 and
375×812, against one goal: make it feel like a ride. A general audience
should always know why they are seeing what they see, feel pulled from one
scene to the next, and leave with a few facts about their own perception they
cannot unsee. The philosophical edge stays.

## What is working

- The opening frame. The shore, the dusk and the seated figure land in the
  first second, and the closing return to the same frame is the right shape.
- The honesty system. Measured / inferred / illustrative tags and a sources
  ledger are rare and worth keeping, though not on screen all the time (P0.6).
- Chapter 4 is the best moment in the piece. Real data, a real search, and a
  reveal you can watch happen. It is the template for every other chapter.
- One clock, scrubbable, keyboard-accessible, reduced motion handled. The
  engineering will carry a bigger story without a rewrite.

## The diagnosis: why it feels unstructured

1. **There is a question but no promise.** The piece opens on "What we can't
   see" and "How much is out there that no eye was made to see?", then starts
   moving. A ride tells you in the queue what you are about to do and why it
   matters to *you*. Nothing here says "your senses edit reality, and we are
   going to find what they cut out."
2. **The spine is scale, but the interesting chapters aren't about scale.**
   Out (2, 3), then sideways into a light curve (4), then in (5), then AI (6),
   then home. Chapters 4 and 6 break the zoom, which is why the order feels
   arbitrary. The real thread, that each scene is a different *reason* we
   can't see something, is never named.
3. **Transitions are crossfades between unrelated places.** The cosmic web
   dissolves into a light curve; a star dissolves into "Now turn inward." No
   line hands the viewer from one to the next.
4. **It reads too fast to follow.** In Guided mode 22 of 39 lines leave the
   screen before an average reader (200 words a minute, eyes on text only)
   could finish them. The worst: Chapter 4's ExoMiner line, 40 words in 5
   seconds; Chapter 3's Zoobot line, 40 words in 10. With visuals competing,
   viewers skim, lose the thread and stop asking why.
5. **The vocabulary is a scientist's.** "10^9.1 m", "Inferred from a model ·
   source", pLDDT, box least squares, "redshift", "homogeneity". Every one is
   accurate, and each one is a small "this isn't for you."
6. **There is almost nothing to do in Guided mode.** Interaction lives behind
   Explore, so most viewers watch 3½ minutes of narration.
7. **"You" is missing.** The person on the shore is "someone." The piece's
   strongest material, how *your* perception works, never appears.

## Specific issues found in the walk-through

| Where | What | Severity |
| --- | --- | --- |
| Ch 2, 0:36 | Sunlight line plays over a near-empty dark frame; the orbits are too faint to read | High |
| Ch 2, 0:54 | Text says "our galaxy" while the scale marker still reads "Nearest star"; the galaxy arrives 3 s later | Medium |
| Ch 2, 0:57 | "The Sun is here" label sits under the narration block | Medium |
| Ch 3, 1:06 | Web beat opens on a mostly dark frame | Medium |
| Ch 3, 1:22 | Zoobot's teal 1-in-70 is hard to pick out, so the claim has no visible referent | Medium |
| Ch 3, 1:35 | The observable-limit sphere reads as abstract wireframe ellipses | Low |
| Ch 4 | Scale navigator highlights "Earth" while showing a star's width (1.4 million km); confusing | Medium |
| Ch 4 | Lab panel's three charts have mono labels that assume chart literacy | Medium |
| Ch 5 | "Turn inward" jumps from a distant star to a cell without passing back through the person | High |
| Ch 6 | Protein's floating label collides with the panel; narration overlaps the molecule | Medium |
| Ch 6 | The consciousness line, the piece's biggest idea, gets 5 seconds as the chapter's last beat | High |
| Ch 7 | No interaction or payoff; ends on a question and stops | Medium |
| Intro | Lede is 40 abstract words; "Guided" vs "Explore" doesn't say what changes | Medium |
| Global | Narration block sits mid-left over the subject on most beats | Medium |
| Global | No sound, by design, which removes the single biggest "ride" lever | Medium |

## Suggestions, prioritized

### P0: Make it make sense (copy and pacing; days, not weeks)

1. **Name the thread: every chapter is a reason we can't see.** Retitle the
   chapters as the limits of perception, and say so in the intro: *Too far.
   Too faint. Too many. Too small. Too uncertain.* The chapter rail becomes a
   ride map instead of a list of poetic titles. (Proposed structure below.)
2. **Write a pre-show.** Before the shore, three short lines that make a
   promise: "Your eyes have a blind spot. Right now. Your brain paints over
   it so you never notice. It does that a lot. Let's go find what it's been
   leaving out." Then the shore.
3. **Add bridge lines.** Every chapter ends with a line that opens the next:
   - 2→3 "Distance hides things. But so does sheer number."
   - 3→4 "Sometimes the thing you're looking for is right in front of you,
     buried in noise."
   - 4→5 "We've been looking out. The strangest things might be in here."
     (with a cut back to the person's hand)
   - 5→6 "At this scale, nobody can look directly. So we've started asking
     machines to guess, and to tell us when they're guessing."
   - 6→7 "Which brings us back to the one instrument you carry everywhere."
4. **Fix the reading speed.** Two options, do both:
   - Cut every line to 18 words or fewer for a general audience. Move the
     detail (names, dates, counts) into an expandable "more" on each line or
     into the text version.
   - Time each beat from its word count (about 3 words a second, plus 1.5 s
     for the picture to land) rather than by hand, and add a check that fails
     the build when a line is shorter than its reading time.
5. **Talk to "you."** "You're sitting at the edge of the water" instead of
   "Someone is sitting." Second person is the cheapest way to make a viewer
   feel like the rider.
6. **Hide the jargon by default.** Keep the kind tags and sources, but behind
   a "Show the evidence" toggle (or a small dot that expands). Replace the
   scale readout's "10^9.1 m" with plain comparisons: "About the width of the
   Sun", "Wider than 10,000 Earths."
7. **Give every big number a body.** For each figure, one everyday
   comparison:
   - "If the Sun were a grapefruit in New York, the nearest star would be
     another grapefruit about as far away as Los Angeles."
   - "The Sun you see is the Sun of eight minutes ago."
   - "26 million galaxies. Look at one a second, without sleeping, and you'd
     finish in about ten months." (That's *why* Zoobot exists.)
   - "The planet dims its star by less than a fly crossing a stadium
     floodlight would." (Check the analogy's numbers before shipping.)
8. **Fix the dead frames and collisions** in the table above: brighten the
   orbits at 0:36, shift the galaxy beat 3 s later, move labels clear of the
   narration, and keep the narration out of the subject's third of the frame.

### P1: Restructure around perception and hidden systems (the ride)

9. **Adopt the "limits of perception" structure.** Same assets, new order
   and framing:

   | # | Ride scene | Why you can't see it | Show | Signature moment |
   | --- | --- | --- | --- | --- |
   | 0 | Pre-show: Your eyes | Your brain edits | Blind-spot test, 20 seconds | A dot vanishes on your own screen |
   | 1 | The shore | The edges of sense | Horizon, visible light as a sliver of the spectrum, Earth's motion | The shore is moving at over 1,000 km/h and you feel nothing |
   | 2 | Too far | Distance | Earth, Sun, orbits, galaxy (existing) | The galaxy, plus "95% of the universe is something we've never seen" |
   | 3 | Too many | Number and attention | Cosmic web; Zoobot as a looking machine | 26 million galaxies vs one pair of eyes |
   | 4 | Too faint | Signal in noise | Kepler (existing) | You try to find the planet yourself first, then the search does it |
   | 5 | Too small | Size | Your hand → cell → microbes → protein → atom | You are outnumbered by your own bacteria |
   | 6 | Too uncertain | Even our instruments have blind spots | AlphaFold confidence (existing) | The model's blind spot, shown in violet, mirrors yours from the pre-show |
   | 7 | Back on the shore | Now with new eyes | Same frame, with lens toggles | Switch on UV, infrared, radio, neutrinos: the same view, crowded |

   The arc becomes: your senses have limits → we built instruments to get
   past each one → we now see more than we can look at → so we built
   machines to look for us → and they have blind spots too → so what's still
   in front of you? That is the philosophical edge, and it explains why AI
   is in the piece at all: **AI here is an attention machine.** Zoobot and
   ExoMiner don't see farther; they look at more than any person could.

10. **Make the pre-show interactive: a blind-spot test.** Close your left
    eye, look at the cross, move closer, and the dot disappears. Then: "Your
    brain filled that hole with whatever was around it. It's been doing that
    your whole life." It's ten seconds, everyone can do it, and it earns the
    whole premise. Alternative or follow-up: a change-blindness flicker (two
    shore images, one thing different, most people miss it).

11. **"Can you spot it?" before every reveal.** The Chapter 4 pattern, done
    everywhere:
    - Ch 4: show the raw light curve and ask the viewer to tap where the
      planet is. They can't. Then the search finds it. Today the machine
      does it while they watch, which is less satisfying.
    - Ch 3: "Find the galaxies the AI flagged." Toggle Zoobot's teal on and
      off.
    - Ch 6: "Where do you think the model is least sure?" Then reveal the
      violet.
    One tap per chapter in Guided mode, with a skip, is enough to turn
    watching into riding.

12. **Run a live "hidden systems" counter.** A small persistent readout that
    ticks up from the moment they press Begin:
    - Neutrinos from the Sun that passed through you (about 65 billion per
      square centimeter per second)
    - Kilometers Earth carried you around the Sun (about 30 km a second)
    - Times your eyes jumped, each one edited out by your brain (about 3 a
      second)
    - Heartbeats (assume about 70 a minute and say so)
    At the end it becomes the souvenir (item 19). It is on-theme, it rewards
    staying, and it makes "hidden systems" physical.

13. **Add the dark-universe beat to Chapter 2.** The piece is called *What We
    Can't See* and never mentions that ordinary matter is about 5% of the
    universe. Show the galaxy spinning too fast for its visible stars, then a
    violet halo: "Something we can't see is holding it together." It is the
    biggest real case of the title and it uses the existing violet meaning
    (unresolved) exactly right.

14. **Rebuild Chapter 5 as "you, inward."** Cut from the stars back to the
    figure, then to their hand, then into it: skin, a cell, then the
    microbiome ("about as many bacterial cells live in you as human ones"),
    then p53, then the atom. Passing through the person answers "why are we
    here now" and adds the strongest hidden system people carry.

15. **Give the finale lenses.** Back on the shore, the viewer gets a row of
    toggles over the same frame: *Bee* (ultraviolet, flowers with landing
    strips), *Snake* (infrared, the person glows), *Radio* (the air full of
    phone and Wi-Fi signals, the faint Big Bang afterglow), *Neutrinos*
    (streaks through everything), *Gravity* (the dark matter halo, from
    Ch 2). Each one comes with a single line. The closing question then lands
    on a viewer who just saw the same scene five ways.

16. **Give the consciousness idea room.** Split Chapter 6's last beat into
    its own short scene, or move it into the finale, with time to sit. A
    line in that spirit: "A model can find a pattern without understanding
    it. You can look at something without noticing it. Neither is the same
    as being aware." Keep "open question."

### P2: Feel like a ride (production)

17. **Sound, opt-in but offered.** A "Sound on (recommended)" toggle on the
    intro. A low ambient bed per scene, a rising tone on each reveal, and
    optional voice narration (which also solves reading speed). Sound is the
    single biggest difference between a slideshow and a ride.
18. **A visual "wienie" for each scene.** Imagineering's trick: show
    something in the distance before you reach it. Seed the next scene's
    subject in the last few seconds of the current one: the galaxy's glow
    behind the orbits, the star dot inside the web, the hand silhouette
    before Chapter 5.
19. **A souvenir at the exit.** A shareable card: "In 4 minutes, 70
    quadrillion neutrinos passed through you, Earth carried you 7,000 km,
    and your brain hid 700 eye movements from you." Plus the closing
    question. It is the on-ride photo.
20. **Move the narration to a consistent caption zone** (lower third on
    desktop, below the picture on phone), so the subject owns the middle of
    the frame every time.
21. **Simplify the scale navigator** for the main view: fewer landmarks
    (You, Earth, Sun, Galaxy, Universe, Cell, Atom), friendly names, and a
    "zoom" verb. Keep the full logarithmic ruler in Explore.
22. **Plain-language instrument panels.** Chapter 4's charts get one-line
    human captions ("Each dot: one measurement of the star's brightness",
    "Stacked at 3.21 days: the dip appears") and the jargon moves to a
    tooltip. Same for "pLDDT".
23. **Retitle Guided and Explore** as "Take the ride" and "Wander", with one
    line each on the intro.

### P3: Bigger builds, later

24. **Scroll-driven mode on phones.** Scroll is the native "ride" input on a
    phone, and it lets everyone read at their own speed.
25. **More perception fact cards** as optional stops ("Did you know?" side
    doors off the main track), from the list below.
26. **A real galaxy-survey sample** in Chapter 3 (already on the README list),
    which upgrades "illustrative" to "measured" at the piece's big moment.
27. **A time-scales scene**: things too slow (continents drift about as
    fast as fingernails grow) and too fast (a hummingbird's wings) to see.
    It is a fifth limit of perception and a natural sequel chapter.

## Perception and hidden-systems facts to draw from

Each needs a source in `src/content/sources.ts` and a kind tag before it
ships. Flagged ones need care.

**Your senses**
- Each eye has a blind spot where the optic nerve leaves; the brain fills it
  in. (Testable on screen.)
- Sharp vision covers about 2 degrees of view, roughly your thumbnail at
  arm's length. The rest of the sharp world is your eyes jumping around and
  the brain stitching.
- Your eyes jump (saccade) about three times a second, and the brain
  suppresses the blur of each jump.
- Visible light is less than one octave of an electromagnetic spectrum that
  runs across dozens.
- Everything you see is a little in the past: the Moon by about 1.3
  seconds, the Sun by 8 minutes 20 seconds, and the brain itself works
  roughly a tenth of a second behind the world and predicts to cover it.

**Your attention**
- In the "invisible gorilla" study (Simons and Chabris, 1999), about half of
  viewers counting basketball passes didn't notice a person in a gorilla
  suit walk through.
- Change blindness: people routinely miss large changes between two images
  separated by a brief flicker.
- Conscious thought runs at around 10 bits a second, while the senses take
  in vastly more (Zheng and Meister, *Neuron*, 2024). *Avoid the older,
  poorly sourced "11 million vs 40 bits" figure.*

**Other animals' worlds (Umwelt)**
- Bees see ultraviolet; many flowers have UV patterns that guide them to
  nectar.
- Pit vipers sense infrared and "see" warm bodies in the dark.
- Many birds sense Earth's magnetic field.
- *Mantis shrimp:* 12 or more kinds of color receptor, but tests show they
  discriminate color *worse* than we do. A good "even the fun fact needed
  checking" moment.

**Hidden systems**
- Ordinary matter is about 5% of the universe's contents; dark matter about
  27%, dark energy about 68% (Planck).
- About 65 billion solar neutrinos pass through each square centimeter of
  you every second.
- You are moving about 1,670 km/h at the equator as Earth turns, and about
  107,000 km/h around the Sun.
- Some of the static on an old analog TV was the afterglow of the Big Bang.
- GPS only works because it corrects for relativity: satellite clocks run
  about 38 microseconds a day fast relative to the ground.
- About as many bacterial cells live in and on you as human cells (Sender,
  Fuchs and Milo, 2016).
- *Fungal "wood wide web":* popular claims outran the evidence (Karst et
  al., 2023). Useful as a case of a hidden system that still needs checking.

## Proposed opening, as a script sample

> **Pre-show.** *(Black. A cross and a dot.)* Close your left eye. Look at the
> cross. Lean in slowly. *(The dot vanishes.)* That's your blind spot. You
> have one in each eye, right now. Your brain fills it in so you never
> notice.
>
> It edits a lot more than that. Let's go find what it's leaving out.
>
> **1 · The shore.** You're sitting at the edge of the water. The sun went
> down a few minutes ago.
>
> Everything you can see ends 4.7 kilometers away, where the Earth curves out
> of sight.
>
> And it feels perfectly still. It isn't: the shore is spinning with the
> planet at over 1,000 kilometers an hour. (Exact figure depends on latitude:
> 1,670 at the equator.)
>
> Your eyes evolved to see what helped you survive here. So what's out
> there that they weren't made for?
>
> **2 · Too far.** …
