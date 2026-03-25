# PixelForge

A Surf-enabled AI design tool — a public open-source demo of the [Surf protocol](https://surfjs.dev).

Create graphics manually via the canvas UI, or let AI agents create designs through typed Surf commands.

## Features

- 🎨 **Canvas editor** — Draw rectangles, circles, text, and lines with click+drag
- 🤖 **AI-ready** — Full Surf API for AI agents to create/modify designs programmatically
- 🌐 **Collaborate mode** — Real-time sync via Surf Live WebSocket
- ⌨️ **Keyboard shortcuts** — V, R, O, T, L for tools; Ctrl+Z undo/redo; Delete to remove
- 📤 **Export PNG** — Download your canvas as a high-res PNG

## Tech Stack

- **Next.js 16** (App Router)
- **react-konva** — Canvas rendering
- **Zustand** — State management
- **@surfjs/core + @surfjs/next + @surfjs/react** — Surf protocol
- **Tailwind CSS v4**

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3210](http://localhost:3210)

## Surf API

The Surf manifest is available at `/api/surf`:

```bash
curl http://localhost:3210/api/surf
```

### Commands

| Command | Description |
|---|---|
| `canvas.getState` | Get all current objects |
| `canvas.addRect` | Add a rectangle |
| `canvas.addCircle` | Add a circle |
| `canvas.addText` | Add text |
| `canvas.addLine` | Add a line |
| `canvas.updateObject` | Update object properties |
| `canvas.removeObject` | Remove an object |
| `canvas.clear` | Clear the canvas |
| `canvas.setGradient` | Apply gradient fill |
| `canvas.alignObjects` | Align objects |

### Example — AI creating a design

```bash
# Add a blue rectangle
curl -X POST http://localhost:3210/api/surf/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "canvas.addRect", "params": {"x": 100, "y": 100, "width": 300, "height": 200, "fill": "#0057FF"}}'

# Add a gradient circle
curl -X POST http://localhost:3210/api/surf/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "canvas.addCircle", "params": {"x": 400, "y": 300, "radius": 80}}'

# Set gradient on the circle
curl -X POST http://localhost:3210/api/surf/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "canvas.setGradient", "params": {"id": "<id>", "startColor": "#0057FF", "endColor": "#00C9B1"}}'
```

## Collaborate Mode

Toggle **Collaborate** in the top bar to connect to Surf Live. All connected clients share the same canvas state in real-time. AI agents can also interact with the shared canvas via the Surf API.

## License

MIT
