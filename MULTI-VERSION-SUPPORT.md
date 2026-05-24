# Multi-Version OpenAPI Support Implementation Plan

## Overview

This document outlines the strategy and implementation plan for supporting multiple OpenAPI specification
versions (2.0, 3.0, and 3.1) within the Apitomy OpenAPI Editor.

## Strategy: Hybrid Version-Aware Architecture

We use a **3-tier architecture** to elegantly support all OpenAPI versions:

### Tier 1: Universal Components
Components that work identically across all OpenAPI versions without modification.

**Examples:**
- Info metadata (title, version, description)
- Contact information
- License information
- Tag descriptions
- Common parameter types

**Implementation:**
- Use existing components as-is
- Leverage `@apitomy/data-models` polymorphic APIs
- No version-specific logic required

### Tier 2: Conditionally Rendered Components
Components that appear/disappear based on the OpenAPI version, using conditional rendering.

**Examples:**
- Servers (3.0+ only) vs Host/BasePath (2.0 only)
- Components (3.0+) vs Definitions (2.0)
- Security Schemes naming and structure
- Callback objects (3.0+)
- Webhooks (3.1+)

**Implementation:**
- Use `specVersion` from `useDocument()` hook
- Conditional rendering with version checks
- Share common UI patterns where possible

### Tier 3: Version-Specific Components
Components that require fundamentally different implementations per version.

**Examples:**
- Schema editors (different keywords and validation rules)
- Response editors (different structure in 2.0 vs 3.0+)
- Parameter editors (location and schema differences)
- Security requirement editors

**Implementation:**
- Create version-specific component variants
- Use factory pattern or conditional component selection
- Maximize code reuse through shared utilities

## Version Detection

### SpecVersion Type

```typescript
export type SpecVersion = '2.0' | '3.0' | '3.1' | null;
```

### Usage in Components

```typescript
import { useDocument } from '@hooks/useDocument';

const MyComponent = () => {
    const { specVersion } = useDocument();

    // Conditional rendering
    if (specVersion === '2.0') {
        return <OpenApi20Component />;
    }

    return <OpenApi30Component />;
};
```

### Version Detection Utilities

The `@apitomy/data-models` library provides type guards:

```typescript
import { ModelTypeUtil } from '@apitomy/data-models';

// Check version
if (ModelTypeUtil.isOpenApi2Model(document)) {
    // Handle OpenAPI 2.0
}

if (ModelTypeUtil.isOpenApi30Model(document)) {
    // Handle OpenAPI 3.0
}

if (ModelTypeUtil.isOpenApi31Model(document)) {
    // Handle OpenAPI 3.1
}
```

## Implementation Phases

### Phase 1: Foundation (COMPLETED ✓)

**Goal:** Establish version detection infrastructure

**Completed Work:**
- ✓ Created `SpecVersion` type in `useDocument.ts`
- ✓ Implemented `getSpecVersion()` function using `ModelTypeUtil`
- ✓ Added `specVersion` to `useDocument()` return value (derived, not stored)
- ✓ Added OpenAPI 2.0 example API to test app

**Files Modified:**
- `src/hooks/useDocument.ts`
- `test-app/src/App.tsx`

### Phase 2: Navigation & Routing (COMPLETED ✓)

**Goal:** Make navigation panel version-aware

**Completed Work:**
- ✓ Updated `NavigationPanel` to use `specVersion` from `useDocument()`
- ✓ Made `getPaths()` version-aware (works for all versions)
- ✓ Made `getSchemas()` version-aware:
  - Returns schemas from `definitions` for OpenAPI 2.0
  - Returns schemas from `components.schemas` for OpenAPI 3.0/3.1
- ✓ Updated `handleSchemaClick()` to select schemas from correct location
- ✓ Updated `handleCreateSchema()` to create correct NodePath based on version
- ✓ Updated `CreateSchemaCommand` to be version-aware:
  - Creates/removes schemas in `definitions` for OpenAPI 2.0
  - Creates/removes schemas in `components.schemas` for OpenAPI 3.0/3.1

**Files Modified:**
- `src/components/editor/NavigationPanel.tsx`
- `src/commands/CreateSchemaCommand.ts`

**Acceptance Criteria:**
- ✓ Navigation panel correctly displays schemas from appropriate location
- ✓ Clicking schemas selects the correct nodes for all versions
- ✓ Creating schemas works correctly for all versions
- ✓ Schema creation uses command pattern with proper undo/redo

### Phase 3: OpenAPI 2.0 Specific Features

**Goal:** Fully support OpenAPI 2.0 editing

**Tasks:**

#### 3.1: Host & Base Path Editor
- Create `HostBasePathSection` component for MainForm
- Properties: `host`, `basePath`, `schemes`
- Use `PropertyInput` for consistency

#### 3.2: Definitions Editor
- Create `DefinitionsSection` component
- List all definitions with expand/collapse
- Add/Edit/Delete definition operations
- Schema editor for definition content

#### 3.3: Responses (2.0 Style)
- Update response editors to handle 2.0 schema structure
- Support `schema` property directly (not in `content` object)
- Support `examples` (not `example` in `content`)

#### 3.4: Parameters (2.0 Style)
- Update parameter editors for 2.0 differences:
  - `type` directly on parameter (not in schema)
  - `collectionFormat` property
  - `items` for array types

#### 3.5: Security Definitions
- Create `SecurityDefinitionsSection` component
- Support 2.0 security definition types:
  - `basic`
  - `apiKey` (with `in` and `name`)
  - `oauth2` (with flows in 2.0 style)

**Files to Create:**
- `src/components/forms/HostBasePathSection.tsx`
- `src/components/forms/DefinitionsSection.tsx`
- `src/components/forms/SecurityDefinitionsSection.tsx`
- `src/components/editors/OpenApi20ResponseEditor.tsx`
- `src/components/editors/OpenApi20ParameterEditor.tsx`

**Files to Modify:**
- `src/components/forms/MainForm.tsx`
- `src/components/forms/PathForm.tsx`
- `src/components/forms/OperationForm.tsx`

**Acceptance Criteria:**
- Can fully edit OpenAPI 2.0 documents
- All 2.0-specific properties are editable
- Changes use command pattern for undo/redo
- Selection events fire appropriately

### Phase 4: OpenAPI 3.1 Specific Features

**Goal:** Support OpenAPI 3.1 additions

**Tasks:**

#### 4.1: Webhooks Support
- Create `WebhooksSection` component
- Similar structure to Paths
- Add/Edit/Delete webhook operations

#### 4.2: JSON Schema 2020-12 Support
- Update schema editors for 3.1 keywords:
  - `prefixItems`
  - `$dynamicRef` / `$dynamicAnchor`
  - `unevaluatedProperties`
  - `unevaluatedItems`

#### 4.3: License Identifier
- Add `identifier` field to license editor
- Conditional rendering (3.1 only)

#### 4.4: Info Summary
- Add `summary` field to info editor
- Conditional rendering (3.1 only)

**Files to Create:**
- `src/components/forms/WebhooksSection.tsx`
- `src/components/forms/WebhookForm.tsx`

**Files to Modify:**
- `src/components/forms/MainForm.tsx`
- `src/components/editors/SchemaEditor.tsx`
- `src/components/forms/InfoSection.tsx`

**Acceptance Criteria:**
- Can fully edit OpenAPI 3.1 documents
- All 3.1-specific properties are editable
- Webhooks function like paths with operations
- Selection events fire appropriately

### Phase 5: Schema Editor Enhancements

**Goal:** Create version-aware schema editor

**Tasks:**

#### 5.1: Schema Property Differences
- Create version-specific property lists:
  - 2.0: No `nullable`, use `x-nullable`
  - 3.0: Has `nullable` boolean
  - 3.1: Uses `type: [type, "null"]` or `anyOf`

#### 5.2: Discriminator Differences
- 2.0: Simple string property
- 3.0+: Object with `propertyName` and optional `mapping`

#### 5.3: Example vs Examples
- 2.0/3.0: `example` (singular)
- 3.0+: Also supports `examples` (plural object)

**Files to Modify:**
- `src/components/editors/SchemaEditor.tsx` (create if doesn't exist)
- `src/components/common/PropertyInput.tsx` (version awareness)

### Phase 6: Validation & Testing

**Goal:** Ensure correctness across all versions

**Tasks:**

#### 6.1: Version-Specific Validation
- Add validation rules per version
- Prevent using 3.0+ features in 2.0 documents
- Prevent using 3.1 features in 3.0 documents

#### 6.2: Test Coverage
- Create test suite for each version
- Test conversion between versions (if supported)
- Test all CRUD operations per version

#### 6.3: Example Documents
- Add comprehensive examples for each version
- Include complex scenarios (security, callbacks, webhooks)

**Files to Create:**
- `test-app/examples/openapi-2.0-complex.json`
- `test-app/examples/openapi-3.0-complex.json`
- `test-app/examples/openapi-3.1-complex.json`

## Code Patterns

### Pattern 1: Conditional Component Rendering

```typescript
import { useDocument } from '@hooks/useDocument';

export const MainForm = () => {
    const { specVersion } = useDocument();

    return (
        <div>
            {/* Universal - always show */}
            <InfoSection />
            <TagsSection />

            {/* Conditional - version specific */}
            {specVersion === '2.0' && (
                <HostBasePathSection />
            )}

            {(specVersion === '3.0' || specVersion === '3.1') && (
                <ServersSection />
            )}

            {specVersion === '3.1' && (
                <WebhooksSection />
            )}
        </div>
    );
};
```

### Pattern 2: Version-Specific Component Variants

```typescript
import { useDocument } from '@hooks/useDocument';
import { OpenApi20ParameterEditor } from './OpenApi20ParameterEditor';
import { OpenApi30ParameterEditor } from './OpenApi30ParameterEditor';

export const ParameterEditor = ({ parameter }) => {
    const { specVersion } = useDocument();

    if (specVersion === '2.0') {
        return <OpenApi20ParameterEditor parameter={parameter} />;
    }

    return <OpenApi30ParameterEditor parameter={parameter} />;
};
```

### Pattern 3: Shared Logic with Version Checks

```typescript
const handleSaveParameter = (name: string, type: string, required: boolean) => {
    const { specVersion } = useDocument();

    if (specVersion === '2.0') {
        // In 2.0, type goes directly on parameter
        const command = new ChangePropertyCommand(parameter, 'type', type);
        executeCommand(command);
    } else {
        // In 3.0+, type goes on schema
        const schema = parameter.getSchema();
        const command = new ChangePropertyCommand(schema, 'type', type);
        executeCommand(command);
    }
};
```

## Migration Considerations

### Version Conversion
- Consider adding "Upgrade to 3.0" feature for 2.0 documents
- Consider adding "Upgrade to 3.1" feature for 3.0 documents
- Handle breaking changes gracefully

### Data Model Compatibility
- The `@apitomy/data-models` library handles most version differences
- Use polymorphic methods where available
- Fall back to direct property access when necessary

### User Experience
- Clearly indicate document version in UI
- Warn when using version-inappropriate features
- Provide helpful error messages for version conflicts

## Success Metrics

1. All OpenAPI 2.0 documents can be fully edited
2. All OpenAPI 3.0 documents can be fully edited
3. All OpenAPI 3.1 documents can be fully edited
4. No regressions in existing 3.0 functionality
5. Command pattern works consistently across versions
6. Selection events fire correctly for all version-specific elements
7. Navigation tree accurately reflects version-appropriate structure

## References

- [OpenAPI 2.0 Specification](https://swagger.io/specification/v2/)
- [OpenAPI 3.0 Specification](https://swagger.io/specification/v3/)
- [OpenAPI 3.1 Specification](https://spec.openapis.org/oas/v3.1.0)
- [@apitomy/data-models Documentation](https://github.com/Apitomy/apitomy-data-models)

---

**Status:** Phases 1-2 Complete, Ready for Phase 3

**Last Updated:** 2026-01-06
