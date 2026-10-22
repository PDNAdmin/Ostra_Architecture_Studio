# Ostra Studio: home page hero

A drawing sheet that comes to life. A pen sketch of a courtyard house draws itself on load. Scrolling then turns the time of day from 08:00 to 18:30, and the shadows and wall shading move with the sun.

## Run it

```bash
node <scroll-craft skill>/scripts/serve.mjs --root site --port 4500
# or any static server pointed at site/
```

Open http://localhost:4500. It needs a server because ES modules don't load from `file://`.

## How it is built

| Layer | What it is | Rate |
|---|---|---|
| Paper | Dot grid on the bone canvas | 0.15x |
| Light | Live SVG: cast shadows, wall shading, tree shadows (`js/light.js`) | 1x |
| Ink | Remotion video of the pen drawing, multiplied onto the light layer | 1x |
| Notes | Orange sun path, leaders, chain dimension (`js/light.js`) | 1.15x |

- **One geometry file**, `js/house.js`, holds the boxes, the projection and the sun model. Remotion renders the ink from it and the browser computes the light from it, so they line up exactly.
- **Lenis** smooths the scroll. **GSAP ScrollTrigger** pins the hero for 2.1 viewport heights (1.4 on phones) and supplies one progress value that drives everything.
- **Video timeline:** the first 62% of the clip plays on load (footprints, walls, windows). Scrolling scrubs the rest (material hatching, paving, trees).
- **Accent paint** (orange roof, orange tree canopies, big sun) is the final inking pass. It stays off while the drawing is being made and goes on near the end of the scrub: sun first, then the roof, then the trees. The colours and timing are at the top of `js/light.js`.
- **Mobile** has its own composition: a separate portrait clip, text above the drawing, fewer notes and a shorter pin.
- **Reduced motion** gets no pin and no smooth scroll. It shows the finished drawing at 15:30 with everything visible.
- If the video fails or is slow (4.5 s), the finished poster drawing is shown instead.

## Philosophy section (`js/philosophy.js`)

The section follows the copy's before → after → how structure. One floor plan sits pinned beside the text, and scroll drives it through three states:

1. **Before:** a typical plan draws itself, with rooms along a hall. The dark north rooms are hatched, keynotes point out the problems, and the morning route measures 27.1 m.
2. **After:** the same rooms slide around a planted court. Light comes through a south window and reaches the chair (which turns orange), a sliding door opens to the court, and the route drops to 10.6 m.
3. **How we get there:** earlier drafts (cyan, dashed) slide into line, dimensions draw in, and a "Rev C · ready to build" stamp lands.

Numbered keynotes sit on the plan where each point applies and match a legend under it (sheet title, scale, keyed notes). Marker colour carries the meaning: ink for what goes wrong, orange for what changes, cyan for testing. Route lengths in the legend are measured from the drawn lines, not typed in. The room layouts, the route and the timing (`M`, `N`) are at the top of the file. With reduced motion, the finished plan and all three paragraphs show at once.

## Recent work (`js/work.js`, `css/work.css`)

On wide screens the section pins and scroll pans a row of drawing sheets sideways. Each sheet is a live ink axonometric, drawn one building part at a time (outline, then solid), so hidden lines never show through. Then trees appear, and last the house's **key idea** is painted orange and labelled "KEY IDEA" on the drawing: the cantilevered floor, the new garden wing, the glass room, the courtyard roof. The same words appear in the header key and on each card, so the three explain each other.

- **Drawing is tied to scroll** and only completes once the whole sheet is on screen. Sheets showing when the pan starts draw while the section scrolls up and finish as it pins. Later sheets start when half of them has slid in and finish when their right edge arrives. Scrolling back rewinds them.
- The project geometry is in `PROJECTS` at the top of `work.js`: boxes and gabled roofs in metres, plus windows, trees, fences and the key-idea anchor (`idea`, `ideaSide`). Add a project by adding an entry and a matching `<li data-project="...">` in `index.html`.
- Names, locations and years are `[placeholders]` until the client confirms them. The drawings are labelled illustrative.
- Short laptop screens get a tighter header so a whole sheet fits. Phones get a vertical stack, with each drawing finishing as it comes fully into view. Reduced motion shows finished drawings, and wide screens scroll sideways natively.

## Promises (`js/promises.js`, `css/promises.css`)

A quiet stretch after the drawing pan: the three principles from the copy deck in plain type on one fixed canvas. The section pins for about 3.4 screen heights, and the promises take turns:

1. A promise fades in faint.
2. Its words darken in reading order, then its supporting line appears.
3. After a short hold, it lifts away as the next one arrives.

After the third, "Meet the studio" fades in, and the page then moves on. Scrolling back runs it in reverse.

Everything sits on one centred axis. Each promise stays on a single line (`white-space: nowrap`), and its size follows the screen width (`min(display-l, 6.2vw)`, 7.4vw on phones), so the longest one fits from 360px to 1920px.

With reduced motion there is no pin: the promises sit as a plain list, fully visible. That's the default layout. The `promises--stage` class switches on the single-canvas layout only when motion is allowed.

## What clients say (`js/voices.js`, `css/voices.css`)

The visitor picks the worry closest to theirs (design, process or budget) and reads a client's answer. It's built as tabs: click to choose, or use arrow keys, Home and End. Choosing a worry swaps the quote: the old one lifts away and the new one reads in word by word. The first quote reads in when the section arrives.

- Quotes are placeholders that describe what each real quote should cover. The copy deck's rule applies: only verbatim quotes, each with the client's written permission.
- Phones show the worries as a row of tabs above the quote. With reduced motion, quotes switch instantly.

## Closing call to action: "The same change, three prices." (`js/close.js`, `css/close.css`)

The section pins for about 4.2 screen heights, and scroll plays a Remotion film (`remotion/src/CostOfChange.tsx`) of one house elevation through the project stages. The same request each time, a bigger garden window, costs more at every stage:

1. **Concept:** a pencil sketch. A light orange revision cloud appears, the small window is rubbed out (eraser smudge and crumbs), and the bigger one is sketched in. *"At concept, a change is an eraser."*
2. **Design:** crisp ink with dimension lines and a centre line. A sharper cloud appears, the window is redrawn, and two reissued sheets slide out behind the drawing. *"At design, it is a redraw."*
3. **Build:** brick coursing, roof tiles and scaffolding. A heavy doubled cloud appears, the bricks around the window break away and fall, raking shores go in, then a new steel lintel and the window are fitted. *"On site, it is a demolition."*
4. **The turn:** the film rewinds at speed to a blank page, and the stage marker slides back to **Consultation · You are here**. Then "Build it right the first time." and the consultation card arrive. The card has the design system's laser border, and its three boxes tick in turn.

Around the film, all live HTML/SVG and never baked into the video:
- Stage captions.
- A stage ruler with an orange marker.
- A chart of the two curves architects use: freedom to change falls, the cost of a change rises. It has no numbers.

Scroll budget inside the pin: film 0–72%, rewind 72–82%, call to action 84–97%. The stage start points in `close.js` (`STAGES`) match `CHANGE_T` in the Remotion component.

- **Phones:** a square render, captions above the film, no chart, a compact ruler.
- **Reduced motion, or a video that fails to load:** a readable static layout with the finished drawing, the captions as a list, the full chart and the call to action, with nothing pinned.
- **Re-render:** `cd remotion && node render-change.mjs` (`stills` for check frames). Convert the posters to JPEG as for the hero.

## Footer (`js/foot.js`, `css/foot.css`)

The site's title block, as on a drawing sheet:
- The closing line "Modern homes, drawn before they're built.", with "Planning a home?" and Book a consultation.
- Ruled cells for Work, Studio, Read and ask (Journal, Contact, Request credentials) and Office.
- A base row: © [Year], Privacy, Terms, Cookies, Accessibility, [Registration number], Back to top.

The large "Ostra" wordmark is the last drawing on the page. Its outline is traced as it arrives, then 45° hatching sweeps across the letters, finishing exactly when the footer's bottom edge meets the screen (the end of the page). Scrolling back rewinds it. Reduced motion shows it finished.

- **Back to top** scrolls smoothly through Lenis.
- **Footer Work links** use the copy deck's New builds, Remodels and Extensions, which match the Work filters. The sitemap lists Residential, Commercial, Civic and Landscape instead, so confirm which set the studio wants.
- **The cookie banner** uses the copy deck's wording, with Accept all, Essential only and Manage (Essential always on, Analytics optional). The choice is kept in `localStorage` (`ostra-cookies`), and the banner doesn't return once a choice is made. If storage is blocked, it asks again next visit. It isn't wired to any analytics yet.

## Case study page (`case-study.html`, `js/case.js`, `css/case.css`)

The home page's courtyard card links here. The page follows the copy deck's case study template:
- Title and fact strip.
- The ink drawing, printed in top to bottom as you scroll.
- **Walk through it** (see below).
- The brief, the challenge, what we did (design, materials, build) and the result.
- The client quote, credits, next project, and "Have a site like this?" with Book a consultation.

All facts are `[placeholders]`.

**Walk through it** is a Remotion 3D film (`remotion/src/Walkthrough.tsx`, built with `@remotion/three` and three.js) of the hero's courtyard house, drawn as a presentation model with ink edges, sun and shadow. The section pins for about 5.5 screen heights, and the scroll walks the camera through eight stops:
1. Above the site.
2. The street.
3. The gap in the garden wall.
4. Across the court.
5. Through the sliding glass wall.
6. The orange reading chair in the sun.
7. The kitchen.
8. A look back out.

Orange rings in the film mark six features. Live captions with matching numbers, plus a room ruler, follow along.
- Phones get a portrait render. Reduced motion, or a failed video, shows a still and the captions as a list.
- **Re-render:** `cd remotion && node render-walk.mjs` (`stills` for check frames). The script deletes its temporary bundle, because the disk is tight.
- The house is built in code. A client glTF model can replace `House` in `Walkthrough.tsx` later.

## Work page (`work.html`, `js/work-page.js`, `css/work-page.css`)

- **Data** lives in `js/projects.js`: eight sample projects, clearly labelled on the page as stand-ins. After editing it, run `node tools/build-work.mjs`, which writes `work.html` with the masthead and footer copied from `index.html`.
- **Filter chips** ("Show me": All, New builds, Remodels, Extensions, In progress) rearrange the sheets in place with GSAP Flip and update `?show=` in the URL.
- **Sheets / Index switch.** Index view is a register of rows: job number, project, location, type, size and status. On desktop, the row's drawing follows the pointer.
- **Drawings** come from `js/drawings.js`, the engine shared with the home page. Each one inks itself as its sheet arrives and finishes once the sheet is fully on screen. The in-progress project (Sea Lane) is drawn in cyan construction lines.
- **Photos:** set `photo` on a project in `projects.js`, and the card shows the photograph, with the drawing revealed on hover.

## Walkthrough film

`remotion/src/Walkthrough.tsx` is now a 3D sketch: a white toon-shaded model with ink edges, walked at eye height. `node render-walk.mjs` writes:
- `exports/ostra-walkthrough-master.mp4`: 1920×1080, 16 s, high quality, no overlays. This is the master for AI video conversion.
- `site/assets/walk.mp4` and `walk-poster.jpg`: the site copy, with dense keyframes for scrubbing.

To use an AI version, replace `site/assets/walk.mp4` with it, keeping the same length so the captions stay in sync. It needs dense keyframes for smooth scrubbing:
`ffmpeg -i ai.mp4 -c:v libx264 -crf 23 -g 6 -pix_fmt yuv420p -an site/assets/walk.mp4`

## Re-render the motion (Remotion)

After changing `js/house.js` or `remotion/src/InkHouse.tsx`:

```bash
cd remotion
node render.mjs          # both videos + posters into site/assets
node render.mjs stills   # quick check frames into remotion/lab
```

Posters come out as PNG. Convert them to JPEG with the ffmpeg that ships with Remotion:
`node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe -i in.png -q:v 3 out.jpg`

## Placeholders to replace before launch

- Trust line: `[Years in practice]`, `[Number]`, `[Region]` (copy deck rule: nothing in brackets ships).
- The house is an illustrative drawing, labelled as such in the title block. Swap in a real flagship project's geometry when one is confirmed.
- The sun model is generic. Once the studio's city is confirmed, the path can use its real latitude.
- Page title still needs the city: "Ostra Studio: custom home architects in [city]".

## Sketch to render (Work page, home Recent work, case study)

Each project's ink drawing draws itself, then its finished render (`assets/work/<slug>.jpg`, plus `-800.jpg` for small screens) develops out of the key idea. An organic ink-bleed mask grows from the orange part (`focus` in `js/projects.js`: % across, % down in the render). The colour comes up from greyscale, and the drawing gives way. On Work sheets, a small "Key idea" pin then marks the spot on the photograph, in ink and bone rather than orange, because the design system keeps orange off photographs. It's all tied to scroll and rewinds on the way back up. Reduced motion shows the finished renders.

Source renders: `images/finished_arcitecture_rendering/image1-9.png`. Mapping:
5 Court House, 7 Long Reach, 3 Mill Lane, 6 Albert Terrace, 4 Orchard Barn, 9 Ashdown Studio, 2 Hollow Way, 8 Sea Lane (1 is an alternate Sea Lane view, saved as `sea-lane-2.jpg`).

## Contact and Thank you (`contact.html`, `thank-you.html`, `js/contact.js`, `css/contact.css`)

Built by `node tools/build-contact.mjs`, which reuses the masthead and footer from `index.html`. All copy comes from the copy deck: headline, labels, helper lines, error messages, the "Send my inquiry" button, the fit note and the thank-you text.

- **Your brief:** a drawing-sheet title block beside the form fills in as the visitor types (client, project, site, budget, start). Choosing a project type ink-draws that kind of house. The status reads "Ready to send" (cyan) once the required fields are complete. On narrow screens the sheet sits above the form.
- **Validation:** on submit, using the copy deck's messages. Errors clear as each field is fixed, focus moves to the first problem, and inputs get `aria-invalid` and `aria-describedby`.
- **Sending:** the design system's inline loader. A 1.25px orange line fills on the ink curve, then turns cyan on "Sent". Thank-you shows a "Received" stamp with today's date and the visitor's first name.
- **Not wired to a backend yet.** `send()` in `contact.js` only waits, then succeeds. Connect it to the studio's inbox or CRM (and add spam protection) before launch.
- **Budget ranges and the fit note** (£250k–£1m) are believable samples. The copy deck says the client sets them.
- Contact details (address, phone, email, hours) and the reply time stay as `[placeholders]`.

## Studio (`studio.html`, `js/studio.js`, `css/studio.css`)

Built by `node tools/build-studio.mjs`. The copy comes from the copy deck's Studio and Approach pages.

- **Redlines (principles).** Each principle starts as the usual industry habit, which a red-ink strike crosses out as you scroll. Ostra's rule then types in large, followed by its proof line. "Start with a floor plan / Start with how you live", "Talk money after the drawings / Say the cost early", "Build it, then fix it / Draw it until it's right."
- **The desk (approach).** A Remotion film (`remotion/src/Desk.tsx`, `node render-desk.mjs`) of a drafting table seen from above, pinned and scrubbed by scroll. Five layers land on it:
  1. A notepad (consultation: brief, budget, site sketch).
  2. Yellow trace (concept sketch).
  3. White trace (the dimensioned plan, with the court washed orange).
  4. A clipped site photo (build).
  5. The house guide and keys (handover).
  A live stage list beside the film opens the current stage's "What you get" and "Typical length" (copy deck table, lengths in brackets). Phones put the film above the list. Reduced motion shows a still and the full list.
- **People, credentials, "more" links** (Sustainability, Press, Careers) and the closing "Meet us before you commit." Bios and portraits are placeholders in the copy deck's bio frame.
- The render scripts now call `bundle({ enableCaching: false })`. Remotion's build cache had grown to 321 MB and filled the disk.

### Team ("drawn to scale")

- **Cutouts.** `node tools/key-team.mjs` cuts each portrait out of its orange backdrop (`assets/team/team-0N.png`) into `team-0N.webp` with transparency. The subjects are pure greyscale, so the chroma is all backdrop. The page serves only the WebP files; the PNGs are the sources.
- **The sheet.** Each person is a scale figure on a drawing sheet, with a sheet number, a 1:1 dimension line and a title block (name, role, what they do for you).
- **On scroll.** The CSS orange plate inks up the sheet, and the portrait develops from a pale trace as it rises into place. The head breaks out above the sheet.
- **On hover (desktop).** Everyone else's plate turns back to paper and their portrait fades. The portrait drifts with the pointer and the name underlines in orange.
- **Placeholders.** The names and roles in `TEAM` (`tools/build-studio.mjs`) are stand-ins, and the portraits are AI-generated. Replace both with real staff before launch.

## Generated photography (`assets/photos/`)

`node tools/process-photos.mjs` turns the PNGs in `assets/all_generated_architecture_images/` into `<name>.jpg` (full width) and `<name>-800.jpg`. The PNG folder is source only and is not served.

- **Case study, "The finished house"** (`case-study.html`, `js/case.js`): five Court House views slide past in a pinned horizontal track. Beside them, a key plan drawn from `js/house.js` moves a camera dot and view cone to where each photo was taken; the positions are in each figure's `data-cam` (x, y, heading, field of view). On phones the plan shows all five positions at once.
- **Work cards** (`tools/build-work.mjs`): once the render has developed, a "From the ground" snapshot (`photos/ground/<slug>`) is taped to the sheet. On hover it enlarges and straightens. GSAP moves the outer span, and CSS scales the inner `.wx-card__paper`.
- **Studio "more" links**: on desktop, each link's photo opens from its centre and trails the pointer. On touch screens it sits above the text.
- **Contact**: the studio interior, under "Rather talk now?".

## Content pages (built 2026-10-22)

Shared parts: `tools/lib.mjs` (head, masthead and footer taken from `index.html`, CTA, crumbs), `js/page.js` (smooth scroll, menu, reveals, magnetic buttons) and `css/page.css`. Pages are flat files until there is a host; map them to clean URLs then.

| Build command | Writes |
|---|---|
| `node tools/build-journal.mjs` | `journal.html` and six `journal-<slug>.html` articles (data in `tools/journal-data.mjs`; drawn covers in `tools/covers.mjs`) |
| `node tools/build-pages.mjs` | `sustainability.html` (the sun-path section, `js/sun.js`) |
| `node tools/build-utility.mjs` | press, careers, careers-architect, credentials (`js/credentials.js`), privacy, terms, cookies, accessibility, 404 |
| `node tools/build-work.mjs` | `work.html` and `work-new-builds.html` |
| `node tools/build-cases.mjs` | `case-<slug>.html` for the seven projects other than Court House, and links Court House to the next one |

Rules from the copy deck that shaped these pages:
- A journal tag or work type only gets its own page once it holds three or more items. Journal topics are filters for now, and so are Remodels and Extensions.
- If Ostra has no documented press yet, hide `press.html` and its links rather than show an empty list.
- All copy now comes from the story bible, `tools/story.mjs` (summary in `docs/story-bible.md`). Change a fact there, then rerun the builders.
- The legal pages need legal review.

The video frames for the walkthrough are in `assets/video-frames/`; the prompt is in `docs/asset-prompts.md` (section C).

## Photoreal walkthrough (Court House)

- **Source:** `assets/video-frames/court-house-walk-source.mp4`, an AI-generated film: 8 s, 1920×1080, 24 fps. It is not served.
- **Served versions:** re-encoded with ffmpeg (the copy in `remotion/node_modules/@remotion/compositor-win32-x64-msvc/`). There is no audio, and there is a keyframe every 6 frames so scroll scrubbing stays smooth.
  - `assets/house-walk.mp4`: 1600×900, 6.8 MB.
  - `assets/house-walk-mobile.mp4`: an 800×800 centre crop, 2.6 MB.
  - Each has a `-poster.jpg`.
- **Home, "Step inside"** (`css/walkin.css`, `js/walkin.js`, between Recent work and the promises):
  - The film opens out of a door-sized slot, then scroll walks the camera from the lane, through the oak door and into the court.
  - Seven callouts are live text pinned to features. Each has an x,y in the source frame (`data-note`) and a time window (`data-from`, `data-to`).
- **Case study, "Walk through it":** now plays this film, replacing the Remotion 3D sketch, with captions and the room ruler re-timed to it.
