# Apitomy OpenAPI Editor

A reusable React component for visual OpenAPI editing that can be embedded in React applications.

## Overview

The Apitomy OpenAPI Editor is a modern, React-based visual editor for OpenAPI specifications
(versions 2.0 and 3.0.x). It provides an intuitive interface for creating, editing, and managing
OpenAPI documents without requiring direct YAML or JSON manipulation.

### Features

- **Multi-version support** - Edit both OpenAPI 2.0 (Swagger) and OpenAPI 3.0.x documents
- **Visual editing** - Inline property editing with auto-save for all major sections
- **Navigation tree** - Browse Paths, Schemas, Responses, and Tags with right-click context menus
- **Undo/Redo** - Full command-pattern-based undo/redo support
- **Validation** - Real-time OpenAPI validation with clickable problem navigation
- **Source view** - Toggle between visual editing and raw YAML/JSON source
- **Paths & Operations** - Create, delete, and edit paths and HTTP operations (GET, POST, PUT,
  DELETE, PATCH, OPTIONS, HEAD)
- **Schemas** - Create, delete, and edit schema definitions
- **Servers** - Manage servers with variable substitution (OpenAPI 3.0)
- **Tags** - Create, rename, delete, and describe tags
- **Security** - Manage security schemes (API Key, HTTP, OAuth2, OpenID Connect) and security
  requirements
- **Parameters** - Add, edit, and delete query, header, path, and cookie parameters
- **Vendor extensions** - Add, edit, and delete custom `x-*` extension properties
- **License chooser** - Visual license picker with common open-source licenses
- **Selection events** - Subscribe to selection changes for integration with external tools
- **Dark theme** - Supports PatternFly dark theme

## Quickstart

To quickly try out the OpenAPI Editor with a test application:

```bash
# Clone the repository
git clone https://github.com/Apitomy/apitomy-openapi-editor.git
cd apitomy-openapi-editor

# Install dependencies
yarn install

# Install test app dependencies
yarn test-app:install

# Start the test application
yarn test-app:dev
```

The test application will start on `http://localhost:3000` (or the next available port). This
provides a full-featured demo of the OpenAPI Editor with sample data and all features enabled.

## Usage

```tsx
import { OpenAPIEditor, DocumentChangeEvent, SelectionChangeEvent } from '@apitomy/openapi-editor';

function App() {
    const handleChange = (event: DocumentChangeEvent) => {
        console.log('Document dirty:', event.isDirty);
        // Call event.getContent() only when you need to save
    };

    const handleSelectionChange = (event: SelectionChangeEvent) => {
        console.log('Selected path:', event.path.toString());
    };

    return (
        <OpenAPIEditor
            initialContent={yourOpenAPIDocument}
            onChange={handleChange}
            onSelectionChange={handleSelectionChange}
        />
    );
}
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `initialContent` | `object \| string` | The initial OpenAPI content (JSON object or JSON string) |
| `onChange` | `(event: DocumentChangeEvent) => void` | Fired when the document changes |
| `onSelectionChange` | `(event: SelectionChangeEvent) => void` | Fired when the selection changes |
| `features` | `EditorFeatures` | Optional feature flags |

### DocumentChangeEvent

| Field | Type | Description |
|-------|------|-------------|
| `isDirty` | `boolean` | Whether the document has unsaved changes |
| `version` | `number` | Incrementing version number for tracking changes |
| `getContent` | `() => object \| null` | Accessor to retrieve current content (call only when saving) |

## Peer Dependencies

This library requires the following peer dependencies to be installed by the consuming application:

```json
{
    "@apitomy/data-models": "^2.2.6",
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

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Links

- [GitHub Repository](https://github.com/Apitomy/apitomy-openapi-editor)
- [Issue Tracker](https://github.com/Apitomy/apitomy-openapi-editor/issues)
- [Apitomy Project](https://www.apitomy.io/)