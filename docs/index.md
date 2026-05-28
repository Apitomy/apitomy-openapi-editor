# Apitomy OpenAPI Editor

A reusable React component for visual OpenAPI editing that can be embedded in any React
application. Design and edit OpenAPI specifications through an intuitive visual interface
without writing YAML or JSON directly.

## Key Features

- **Visual Editing** — inline property editing with auto-save for all major OpenAPI sections
- **Navigation Tree** — browse Paths, Schemas, Responses, and Tags with collapsible tree view
  and right-click context menus
- **Undo / Redo** — full command-pattern-based undo and redo for all editing operations
- **Validation** — real-time OpenAPI validation with clickable problem navigation
- **Source View** — toggle between visual editing and raw YAML/JSON source with format
  conversion and syntax highlighting
- **Multi-Version** — edit both OpenAPI 2.0 (Swagger) and OpenAPI 3.0.x documents

## Quick Links

- [Getting Started](getting-started.md) — Installation and embedding in your React app
- [User Guide](user-guide/index.md) — Component API, theming, and customization
- [GitHub Repository](https://github.com/Apitomy/apitomy-openapi-editor) — Source code and
  issues
- [npm Package](https://www.npmjs.com/package/@apitomy/openapi-editor) — Published releases

## Installation

=== "npm"

    ```bash
    npm install @apitomy/openapi-editor
    ```

=== "yarn"

    ```bash
    yarn add @apitomy/openapi-editor
    ```

## Peer Dependencies

The editor requires the following peer dependencies in your application:

```json
{
  "@apitomy/data-models": "^3.1.0",
  "@patternfly/react-core": "^6.0.0",
  "@patternfly/react-icons": "^6.0.0",
  "@patternfly/react-table": "^6.0.0",
  "@patternfly/react-code-editor": "^6.4.0",
  "react": "^18.0.0 || ^19.0.0",
  "react-dom": "^18.0.0 || ^19.0.0",
  "yaml": "^2.6.1",
  "zustand": "^5.0.0"
}
```

## Quick Start

```tsx
import { OpenAPIEditor } from '@apitomy/openapi-editor';

function App() {
    return (
        <OpenAPIEditor
            content={openApiDocument}
            onChange={(newContent) => console.log(newContent)}
        />
    );
}
```

## Community

All Apitomy projects are open source under the Apache License 2.0. We welcome contributions,
feedback, and ideas.

- **Issues**: Report bugs and request features on
  [GitHub Issues](https://github.com/Apitomy/apitomy-openapi-editor/issues)
