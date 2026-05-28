# Getting Started

This guide walks you through installing the Apitomy OpenAPI Editor and embedding it in your
React application.

## Prerequisites

- **React** 18.x or 19.x
- **PatternFly** 6.x (`@patternfly/react-core`, `@patternfly/react-icons`,
  `@patternfly/react-table`, `@patternfly/react-code-editor`)
- **Node.js** 18 or later

## Installation

Install the editor and its peer dependencies:

=== "npm"

    ```bash
    npm install @apitomy/openapi-editor @apitomy/data-models
    npm install @patternfly/react-core @patternfly/react-icons \
                @patternfly/react-table @patternfly/react-code-editor
    npm install yaml zustand
    ```

=== "yarn"

    ```bash
    yarn add @apitomy/openapi-editor @apitomy/data-models
    yarn add @patternfly/react-core @patternfly/react-icons \
             @patternfly/react-table @patternfly/react-code-editor
    yarn add yaml zustand
    ```

## PatternFly CSS

Import the PatternFly stylesheet in your application entry point:

```tsx
import '@patternfly/react-core/dist/styles/base.css';
```

## Basic Usage

The simplest way to use the editor is to pass an OpenAPI document as a string:

```tsx
import { OpenAPIEditor } from '@apitomy/openapi-editor';

const openApiDoc = `{
  "openapi": "3.0.3",
  "info": {
    "title": "My API",
    "version": "1.0.0"
  },
  "paths": {}
}`;

function App() {
    const handleChange = (updatedContent: string) => {
        console.log('Document updated:', updatedContent);
    };

    return (
        <OpenAPIEditor
            content={openApiDoc}
            onChange={handleChange}
        />
    );
}
```

## Loading from a File

You can load an OpenAPI document from a file or URL:

```tsx
import { useState, useEffect } from 'react';
import { OpenAPIEditor } from '@apitomy/openapi-editor';

function App() {
    const [content, setContent] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/openapi.json')
            .then(res => res.text())
            .then(setContent);
    }, []);

    if (!content) return <div>Loading...</div>;

    return (
        <OpenAPIEditor
            content={content}
            onChange={setContent}
        />
    );
}
```

## Editor Sections

The editor provides a three-panel layout:

1. **Navigation Panel** (left) — tree view of Paths, Schemas, Responses, and Tags with
   search filtering and right-click context menus
2. **Detail Panel** (center) — visual form-based editing for the selected item, or a source
   code editor for raw JSON/YAML editing
3. **Validation Panel** (bottom) — real-time validation problems with clickable navigation
   to the problematic node

## Dark Mode

The editor automatically respects the PatternFly dark theme. Add the `pf-v6-theme-dark` class
to your `<html>` element to enable dark mode:

```html
<html class="pf-v6-theme-dark">
```

## Next Steps

- [User Guide](user-guide/index.md) — Component API reference, theming, and customization
