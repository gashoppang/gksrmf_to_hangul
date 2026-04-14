# gksrmf-to-hangul

[한국어](./README.md) | English

This is a simple web app that converts English keyboard input into Hangul.  
For example, entering `gksrmf` converts it to `한글`.

## Features

- Converts two-set Korean keyboard input into Hangul
- Updates the result instantly as you type
- Provides a button to copy the converted text
- Keeps raw English text unchanged when wrapped like `//hello world//`

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
- `dkssud //hello// gktpdy` -> `안녕 hello 하세요`

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
