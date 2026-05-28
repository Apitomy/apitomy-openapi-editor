# User Guide

This guide covers the component API, architecture, and customization options for the Apitomy
OpenAPI Editor.

!!! note "Under Development"
    This user guide is under active development. New sections will be added over time.

## Table of Contents

- [Architecture](#architecture)
- [Supported Specifications](#supported-specifications)
- [Editing Features](#editing-features)
- [Command Pattern](#command-pattern)
- [Developing the Editor](#developing-the-editor)

---

## Architecture

The editor is built on several key technologies:

| Technology | Purpose |
|-----------|---------|
| [React](https://react.dev/) | UI component framework |
| [PatternFly 6](https://www.patternfly.org/) | Design system and component library |
| [Apitomy Data Models](https://www.apitomy.io/projects/data-models/) | OpenAPI document parsing, manipulation, and validation |
| [Zustand](https://zustand.docs.pmnd.rs/) | State management |
| [YAML](https://eemeli.org/yaml/) | YAML parsing and serialization |

### State Management

The editor uses Zustand stores for state management:

- **Document Store** — holds the parsed OpenAPI document and version counter
- **Selection Store** — tracks the currently selected node in the navigation tree

### Document Model

The editor uses the [Apitomy Data Models](https://www.apitomy.io/projects/data-models/)
library to parse, manipulate, and validate OpenAPI documents. All editing operations use the
library's visitor and command patterns, ensuring correct document manipulation with full
undo/redo support.

---

## Supported Specifications

| Specification | Visual Editing | Source Editing | Validation |
|--------------|:-:|:-:|:-:|
| OpenAPI 2.0 (Swagger) | ✓ | ✓ | ✓ |
| OpenAPI 3.0.x | ✓ | ✓ | ✓ |
| OpenAPI 3.1.x | ✓ | ✓ | ✓ |

---

## Editing Features

### Visual Editing

The visual editor provides inline editing for:

- **Document Info** — title, description, version, contact, license
- **Paths** — add, rename, delete paths
- **Operations** — add, edit, delete operations with full parameter, request body, and
  response editing
- **Schemas** — add, edit, delete schema definitions with property management
- **Security** — security schemes and security requirements
- **Servers** — server definitions with variable support
- **Tags** — tag definitions with descriptions
- **Vendor Extensions** — add, edit, delete `x-*` extensions on any node

### Source Editing

Toggle to the source view to edit raw JSON or YAML with:

- **Syntax highlighting** via Monaco Editor
- **Format switching** — convert between JSON and YAML on the fly
- **Auto-formatting** — format the source code with one click
- **Validation** — real-time parse error detection
- **Save** — apply source changes back to the visual model

### Context Menus

Right-click on items in the navigation tree to access context actions:

- Add new child items (operations, parameters, responses)
- Rename or delete items
- Clone operations

---

## Command Pattern

All editing operations use the command pattern from the
[Apitomy Data Models](https://www.apitomy.io/projects/data-models/) library. This provides:

- **Undo/Redo** — every editing operation can be undone and redone
- **Composability** — multiple commands can be grouped into a single undoable operation
- **Consistency** — commands ensure the document model stays valid after each mutation

### Using Commands

The editor exposes the `useCommand` hook for executing commands:

```tsx
import { useCommand } from '@apitomy/openapi-editor';

function MyComponent() {
    const { executeCommand, undo, redo, canUndo, canRedo } = useCommand();

    const handleAddPath = () => {
        const command = new CreatePathCommand('/new-path');
        executeCommand(command, 'Add new path');
    };
}
```

---

## Developing the Editor

### Local Development

The project includes a demo application for iterative development:

```bash
npm install
npm run dev
```

This starts a Vite dev server with a showcase application demonstrating all editor components.

### Building

```bash
npm run build
```

The build produces ESM and CJS bundles in the `dist/` directory along with TypeScript
declarations.

### Linting

```bash
npm run lint
```

### Project Structure

```
src/
├── components/         # React components
│   ├── common/         # Shared components (sections, inputs, modals)
│   ├── editor/         # Top-level editor layout (nav, detail, validation panels)
│   ├── forms/          # Form views for different node types
│   └── modals/         # Modal dialogs
├── commands/           # Command pattern implementations
├── hooks/              # React hooks (useDocument, useCommand, useSelection)
├── models/             # TypeScript type definitions
├── services/           # Document, selection, and validation services
├── stores/             # Zustand state stores
├── utils/              # Utility functions
└── visitors/           # Data models visitor implementations
```
