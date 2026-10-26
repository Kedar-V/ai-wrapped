# AI Wrapped: The Explanation Trap

Design-canvas prototype for a graduate AI Ethics session ("Who Is Owed Explainability and Transparency?").
All personas, scores and metrics are fictional. No backend or real streaming integration.

## Run it locally
The `.dc.html` boards load `project/support.js`, the Design Component runtime (a copy of the canvas's
own runtime, which bundles React). Serve the folder over HTTP and open the launcher:

    cd ai-wrapped
    python3 -m http.server 8000
    # open http://localhost:8000

Fonts load from Google Fonts, so the first load needs internet access.

## Files
- `index.html`: launcher linking the three boards
- `project/Main.dc.html`: interactive prototype (Welcome through Ethics Council, plus Instructor mode)
- `project/Architecture.dc.html`: experience map, journeys, data model, Q1-Q7 coverage
- `project/DesignSystem.dc.html`: tokens, type, motion, components
- `project/support.js`: runtime required by every `.dc.html` file (do not edit)
- `project/canvas.json`: canvas layout index (only used by the hosted canvas)

## Note
`support.js` is the canvas runtime, copied from the hosted artifact. It is not tested here as a
standalone page; if a board does not render, check the browser console and prefer the live canvas link.
