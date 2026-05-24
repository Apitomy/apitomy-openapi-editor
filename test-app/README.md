# OpenAPI Editor Test Application

This is a test application for manually testing the Apitomy OpenAPI Editor component during development.

## Purpose

The test application provides a simple interface to:
- Test the OpenAPIEditor component in isolation
- Manually verify editor functionality
- Debug and develop new features
- Demonstrate component usage

## Getting Started

### Prerequisites

- Node.js (version 18 or higher recommended)
- npm

### Installation

From the root of the repository, install dependencies for the test app:

```bash
npm run test-app:install
```

Or navigate to the test-app directory and install directly:

```bash
cd test-app
npm install
```

### Running the Test Application

From the root of the repository:

```bash
npm run test-app:dev
```

Or from the test-app directory:

```bash
cd test-app
npm run dev
```

The application will start on `http://localhost:3000` and automatically open in your default browser.

## Features

The test application includes:

- **Sample OpenAPI Document**: A pre-loaded Pet Store API example for testing
- **Load Sample API Button**: Reloads the sample OpenAPI document
- **Load Empty API Button**: Loads a minimal empty OpenAPI 3.0.3 document
- **Console Logging**: All onChange events are logged to the browser console

## Testing Workflow

1. Start the test application with `npm run test-app:dev`
2. The editor will load with a sample Pet Store API
3. Interact with the editor component
4. Use the buttons to switch between sample and empty documents
5. Check the browser console for onChange events
6. Make changes to the OpenAPIEditor component in `src/components/editor/OpenAPIEditor.tsx`
7. The test app will hot-reload automatically with your changes

## Building for Production

To create a production build of the test app:

```bash
npm run test-app:build
```

## Notes

- The test app directly imports the OpenAPIEditor component from the source code (not from the built
  library), allowing for immediate hot-reload during development
- Path aliases are configured to match the main project, so imports work consistently
- The test app is not intended for distribution—it's a development tool only
