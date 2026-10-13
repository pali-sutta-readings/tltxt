# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

TLTXT is a small Vite + React + TypeScript page that embeds a tldraw whiteboard with one extra toolbar tool, `tltxt`. The tool opens a settings modal pre-filled with the clipboard text; on OK it splits the text into words and creates one tldraw text shape per word, laid out in lines with configurable spacing. The user then selects all, copies, and pastes the shapes into a board on tldraw.com, where each word can be selected on its own.

The page also offers a second, independent feature: the **Declensions bookmarklet**, a link the user drags to their bookmarks bar and clicks on tldraw.com to show a floating legend image of the colors used for the Pāli declension cases. See "Declensions bookmarklet" below.

Published at <https://pali-sutta-readings.github.io/tltxt/>.

tldraw is the stock npm package (`tldraw` ^3.15.6, pinned to the 3.x line — see below), customized only through its public extension points (`tools`, `overrides`, `components`, `assetUrls`). There is no patched copy of the library in this repo. `../tldraw` is a clean upstream checkout kept for reading the source; don't edit it expecting the app to change.

## Stay on tldraw 3.x (licensing)

Do not upgrade `tldraw` past the 3.x line. `npm install tldraw@latest` and `npm view tldraw version` point at 5.x; use `npm install tldraw@^3` instead.

From 4.0 on, the SDK requires a license key in production. On an HTTPS, non-localhost host (which is what the GitHub Pages site is) an unlicensed editor logs errors and stops rendering after five seconds. It keeps working on `localhost`, so `npm run dev` and `npm run preview` look fine and the breakage only shows after deploying. The keys are tied to a domain and expire: trial is 100 days, the free hobby license is granted at tldraw's discretion and needs renewing.

In 3.x a missing key only adds the "made with tldraw" watermark, which is how the site runs today.

An upgrade to 5.5.2 was tried in October 2026 and reverted for this reason. The code itself ported with two small changes, for whenever a license key is available:

- `editor.inputs.currentPagePoint` becomes `editor.inputs.getCurrentPagePoint()` (the property is deprecated in 5.x; the method does not exist in 3.x)
- React must be `^19.2.1` and Node `>=22.12.0`

`../tldraw` is at 3.9.0; the source matching the installed version is in `node_modules/tldraw/src` and `node_modules/@tldraw/editor/src`.

## Commands

```sh
npm run dev      # Vite dev server, served under /tltxt/
npm run lint     # eslint (one known react-refresh warning in src/App.tsx)
npx tsc -b       # type check only (noEmit)
npm run build    # tsc -b && vite build && touch dist/.nojekyll
npm run preview  # serve the built dist/
```

There are no tests.

## Deployment

`dist/` is git-ignored here but is itself a second clone of the same GitHub repo, checked out on the `gh-pages` branch. Deploying means `npm run build`, then committing and pushing from inside `dist/`. Consequences:

- `npm run build` rewrites the working tree of that deploy checkout. Don't run it just to verify a change; use `npm run lint` and `npx tsc -b`.
- Don't delete `dist/` — it would take the `.git` directory with it. (Vite's own clean step preserves `.git`.)
- `.nojekyll` is touched by the build script so GitHub Pages serves the files as-is.

## The `/tltxt/` base path

The site is a GitHub Pages project page, so everything lives under `/tltxt/`. `vite.config.ts` sets `base: '/tltxt/'`, which rewrites the absolute `/static/...` URLs in `index.html`. URLs that Vite does not see must carry the prefix by hand:

- the toolbar icon URL in `customAssetUrls` (`src/App.tsx`)
- the full `https://pali-sutta-readings.github.io/tltxt/static/...` image URLs in `src/declensions-legend-bookmarklet.js`

Files in `public/static/` are served unprocessed and are referenced by those fixed URLs, so renaming or moving one means updating every reference, including the bookmarklet.

## Architecture

**Tool registration (`src/App.tsx`)** follows the tldraw "add tool to toolbar" example: `uiOverrides.tools` adds the `tltxt` tool entry (shortcut `s`), `components.Toolbar` and `components.KeyboardShortcutsDialog` render it, and `<Tldraw tools={[TltxtTool]} initialState="tltxt">` makes it the active tool on load.

**The tool (`src/tltxt-tool.tsx`)** is a `StateNode` whose `onPointerDown` records the click position as the insert origin, reads the clipboard, fills the form and shows the modal. OK reads the form back, inserts, and switches to the `select` tool.

**The modal is not React.** Its markup is static HTML in `index.html` (`#tltxt-modal`), styled by `public/static/tltxt.css`, and driven with `document.getElementById`. Settings live in module-level `let` variables in `tltxt-tool.tsx` and are copied to and from the form inputs by element id, so adding a setting touches three places: the input in `index.html`, the module variable, and both `update_tltxt_form()` and `set_tltxt_values_and_insert()`.

The OK and Cancel handlers are set inside `onPointerDown` by assigning `onclick`, not with `addEventListener`, so each use of the tool replaces the handler. Adding listeners there instead makes OK insert the text once per previous use.

**Layout (`tldraw_text_insert`)** is measurement-driven: each word is created as a shape, then `editor.getShapePageBounds()` gives its real width, and the next word starts at `maxX + SPACE_X`. The next line starts at the last shape's `maxY + SPACE_Y`. `reflow_text()` does the optional wrapping beforehand by character count, keeping existing line breaks within a paragraph (for verse). Color is deliberately left unset so shapes take the current palette color and work in both light and dark themes.

## Declensions bookmarklet

Unrelated to the `tltxt` tool and to the tldraw editor on this page. Readers color-code words on a tldraw.com board by declension case; the bookmarklet puts the color legend on screen there, since tldraw.com itself can't be customized.

**What the user sees.** The intro text in `index.html` has a "Declensions" link (`#declensions-bookmarklet`, class `bm-link`) to drag to the bookmarks bar. Clicking the bookmark on any page appends a small floating panel (`#legend`, bottom right, 125px wide) containing the legend image. The panel can be dragged by its header or image and resized from its corner. The lightbulb button swaps between the white and black image and the matching panel colors, for tldraw's light and dark themes; the × button hides it. Clicking the bookmark again re-shows the same panel rather than creating a second one.

**Pieces.**

- `src/declensions-legend-bookmarklet.js` — the whole bookmarklet: CSS, markup and inline SVG icons in one template literal, plus the drag, close and theme handlers
- `public/static/cases-legend-white-large.png`, `cases-legend-black-large.png` — the legend images, loaded by the bookmarklet from the published site by absolute URL
- `createBookmarkletUri()` in `src/App.tsx` — turns the source into the link's `href`
- `.bm-link` in `public/static/tltxt.css` — the link's button styling

**How the link is built.** `App.tsx` imports the file with `?raw`, strips comments with a regex, wraps it in `javascript:(async function(){...})()`, URI-encodes it, and sets it as the `href` in the `Tldraw` `onMount` callback. In `index.html` the `href` is only a `#` placeholder, so the link does nothing until the editor has mounted. So that file:

- is plain JS, never bundled, transpiled or linted (eslint only covers `ts`/`tsx`), and must run standalone on a foreign page
- must survive naive comment stripping — a `//` inside a string or template literal is cut unless preceded by `:` or `\` (which is what keeps the `https://` URLs intact)
- can't import anything or use relative asset URLs

**Installed copies are snapshots.** A bookmark holds the code as it was when the user dragged the link, so a change to the bookmarklet reaches only people who drag it again. The images are the exception: they are fetched from the published site on every use, so replacing a PNG under the same name updates everyone, while renaming or moving one breaks every bookmark already installed.
