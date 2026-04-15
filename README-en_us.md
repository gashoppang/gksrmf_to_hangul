# gksrmf-to-hangul

[한국어](./README.md) | English

This is a simple web app that converts English keyboard input into Hangul.  
For example, typing `gksrmf` converts to `한글` in real time.

It behaves like a single-window IME where the typed text is transformed in-place.

## Features

- Single-window IME-style behavior
- Converts two-set Korean keyboard input to Hangul instantly as you type
- Provides a button to copy the converted text
- No separate raw-English escape syntax

## Tech Stack

- React
- TypeScript
- Vite

## Getting Started

### Requirements

- Node.js 18 or later recommended
- npm

### Install

```bash
npm install
```

### Run the Development Server

```bash
npm run dev
```

Default URL:

```text
http://localhost:5173
```

### Build for Production

```bash
npm run build
```

### Preview the Build

```bash
npm run preview
```

## Environment Variables

You can create a `.env` file based on `.env.example`.

```env
VITE_PORT=5173
VITE_HOST=0.0.0.0
VITE_ALLOWED_HOSTS=
```

- `VITE_PORT`: Port for the dev server and preview server
- `VITE_HOST`: Host to bind the server to
- `VITE_ALLOWED_HOSTS`: Comma-separated list of allowed hosts

## Examples

- `gksrmf` -> `한글`
- `dkssudgktpdy` -> `안녕하세요`

## Project Structure

```text
src/
  App.tsx        Main UI and transliteration logic
  App.css        Component styles
  main.tsx       App entry point
  index.css      Global styles
```

## License

[MIT](./LICENSE)
