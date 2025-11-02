Acrostic Projector Game
=======================

This is a simple static webpage intended for projecting a small acrostic/crossword-style game.

How to run locally
-------------------

1. Open `index.html` in your browser (double-click or use a local static server).
2. Click a numbered button (on the grid or in the clue list) to reveal that clue.
3. Type letters (A-Z) into the grid cells to answer. The pink column at the specified column collects letters across entries.

Files changed
------------

- `index.html` — main page and layout
- `css/styles.css` — styles for projector-friendly display
- `js/app.js` — game logic, clue reveal and cell input handling

Notes
-----
- Clues are initially hidden. Click a clue number to reveal it.
- The code is intentionally simple; you can extend the `ENTRIES` array in `js/app.js` to change puzzle layout and clues.
