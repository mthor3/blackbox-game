# BlackBox

A web-based implementation of the classic 1970s [BlackBox board game](https://en.wikipedia.org/wiki/Black_Box_(game)), built with React + TypeScript.

## Running the Game

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## How to Play

BlackBox is a deduction puzzle. Hidden atoms are placed inside an 8×8 grid. Your goal is to figure out where they are by firing rays into the box and observing how they behave.

### Modes

The game has two modes, switchable with the **Play / Test** buttons:

- **Playing...** — Fire rays into the box to gather clues. Click any port button along the border to send a ray in.
- **Testing...** — Place your marble guesses on the grid by clicking cells. Clicking a port in this mode animates a ray through your current guesses (not the hidden atoms), so you can reason about the results.

### Ray Results

When you fire a ray in Playing mode, the port button changes color:

| Result | Color | Meaning |
|--------|-------|---------|
| Hit | Red | The ray struck an atom head-on and was absorbed |
| Reflect | Yellow | The ray was deflected back out the same port it entered |
| Detour | Colored letter (A, B, C...) | The ray entered one port and exited another — both ports share the same letter |

In Testing mode, after the animation completes, the involved port button(s) pulse to indicate the result:
- **Red pulse** — Hit
- **Yellow pulse** — Reflect
- **Green pulse** — Detour (exit)

### Placing Guesses

Switch to **Testing...** mode and click grid cells to place or remove marble guesses. The counter next to the Submit button shows your progress (e.g. `3/4`).

### Scoring

Click **Submit** when you have placed all your guesses. Lower scores are better:

- Each ray fired in Playing mode costs **1 point** (detours cost **2** — one for each port used)
- Each incorrect guess costs **5 points**

### After the Game

After submitting, the board reveals the actual atom positions:

- **Green marble** — Correct guess
- **Red marble (pulsing)** — Wrong guess (your marble was in the wrong place)
- **Orange marble** — Missed atom (you didn't guess this one)

The game automatically switches to **Testing...** mode so you can fire rays against the real atom configuration and learn how it all fits together.

## Building for Production

```bash
npm run build
```

Output goes to the `dist/` folder.
