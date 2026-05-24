# Apitomy OpenAPI Editor - Implementation Plan

## Project Overview

A reusable React component for visual OpenAPI editing that can be embedded in React applications. This is a
reimplementation of the OpenAPI editor from apitomy-registry/ui/ui-editors, modernized for React with PatternFly 6.

## Technology Stack

- **React** with TypeScript
- **Vite** for build tooling
- **PatternFly 6** for UI components
- **Zustand** for state management
- **@apitomy/data-models v2.2.6** for OpenAPI parsing and command pattern

## Architecture Decisions

### State Management Strategy

- **Primary State**: OpenAPI document (from `@apitomy/data-models`) stored in Zustand
- **Commands**: Use `CommandFactory` and `ICommand` from data-models v2.2.6
- **Command History**: Implement custom undo/redo stack (OtEngine doesn't exist in 2.2.6)
- **Selection State**: Track current selection (path, definition, operation, etc.) in Zustand
- **UI State**: Modal visibility, drawer states, etc. in Zustand

### Service Layer

- React Contexts for service access
- Custom hooks for business logic
- Services: Document, Selection, Command, Validation, Features

### UI Patterns

- **Modal Dialogs**: Primary pattern for complex editing workflows (add/edit operations)
- **Inline Editing**: For simple field updates (text, numbers, booleans)
- **Minimize Modals**: Only use modals when necessary for complex multi-field operations

### Future Collaboration Support

- Design components to accept external command execution
- Use command pattern for all mutations (enables remote command replay)
- Keep selection state serializable
- Not implementing collaboration in MVP, but architecture supports it

## Project Structure

```
apitomy-openapi-editor/
├── docs/                       # Documentation
├── src/
│   ├── components/             # React components
│   │   ├── editor/            # Main editor components
│   │   ├── forms/             # Form components (main, path, operation, etc.)
│   │   ├── common/            # Reusable UI components
│   │   └── dialogs/           # Modal dialogs
│   ├── services/              # Business logic services
│   ├── stores/                # Zustand stores
│   ├── hooks/                 # Custom React hooks
│   ├── models/                # TypeScript types/interfaces
│   ├── commands/              # Custom commands (extending data-models)
│   └── utils/                 # Utility functions
├── examples/                   # Example applications
└── tests/                      # Test files
```

## Implementation Phases

### Phase 1: Project Foundation (Setup & Infrastructure)

#### Step 1: Create GitHub Repository
- Create private repository in Apitomy organization: `apitomy-openapi-editor`
- Initialize with Apache 2.0 license
- Add initial .gitignore for Node.js/TypeScript

#### Step 2: Initialize Project
- Create Vite + React + TypeScript project
- Configure TypeScript with strict settings
- Set up ESLint + Prettier
- Configure path aliases (@components, @services, etc.)

#### Step 3: Install Dependencies
- Install PatternFly 6 React components
- Install @apitomy/data-models@2.2.6
- Install Zustand
- Install dev dependencies (testing, etc.)

#### Step 4: Configure Build for npm
- Configure Vite library mode
- Set up externals (React, PatternFly)
- Configure package.json for publishing
- Add TypeScript declaration generation

#### Step 5: Initial Documentation
- Create README.md with project overview
- Add CONTRIBUTING.md
- Add LICENSE (Apache 2.0)
- Document component API (basic)

---

### Phase 2: Core Infrastructure (MVP Foundation)

#### Step 6: Create Zustand Store
- Document store (holds parsed OpenAPI document)
- Selection store (current path/node selection)
- Command store (command history for undo/redo)
- UI store (drawer open, modal states)

#### Step 7: Implement Core Services
- DocumentService: Load, parse, validate OpenAPI docs
- CommandService: Execute commands, undo/redo
- SelectionService: Track and update selections
- ValidationService: Integrate data-models validation

#### Step 8: Create Service Context Providers
- Wrap services in React Context
- Create custom hooks (useDocument, useCommand, useSelection)
- Wire up Zustand stores to services

#### Step 9: Build Main Editor Shell
- Create `OpenAPIEditor` component (main export)
- Accept props: initialContent, onChange, features, etc.
- Implement basic layout structure (PatternFly Page/PageSection)

---

### Phase 3: Basic Layout & Navigation (MVP UI)

#### Step 10: Implement Master/Detail Layout
- Master panel: Navigation tree (Paths, Schemas, Responses)
- Detail panel: Context-aware forms
- Use PatternFly Drawer or Split layout

#### Step 11: Create Navigation Tree
- Display list of paths
- Display list of data definitions/schemas
- Handle selection to update detail view
- Add basic search/filter

#### Step 12: Implement Title Bar
- Show document title (from info.title)
- Add undo/redo buttons
- Show validation status indicator
- Display save/export actions (if applicable)

---

### Phase 4: Core Editing Features (MVP Editing)

#### Step 13: Main/Info Form
- Edit API title, version, description
- Edit contact information
- Edit license
- Use inline editing components from PatternFly

#### Step 14: Path List & Basic Path Editing
- Display all paths in master panel
- Add/delete/rename paths (via modal dialogs)
- Edit path summary and description
- Add path parameters section

#### Step 15: Operation Editing
- Display operations (GET, POST, PUT, DELETE, etc.) within path
- Edit operation summary, description, operationId
- Add/remove operations (via modal dialogs)
- Basic tags support

#### Step 16: Request/Response Basics
- Edit request body (basic schema reference)
- Add/edit responses (via modal dialogs)
- Display response status codes
- Basic media type support (application/json)

---

### Phase 5: Schema & Data Types (Enhanced Editing)

#### Step 17: Schema/Definition List
- Display schemas in components/schemas
- Add/delete/rename schemas (via modal dialogs)
- Navigate to schema definition

#### Step 18: Schema Editor
- Edit schema type (object, array, string, etc.)
- Add/edit properties (via modal dialogs for complex types)
- Set required fields
- Basic validation rules (min, max, pattern, etc.)

#### Step 19: Schema Property Editor
- Inline property editing
- Property type selection
- Property constraints
- Nested object support

---

### Phase 6: Parameters & Security (Enhanced Features)

#### Step 20: Parameter Editors
- Path parameters
- Query parameters
- Header parameters
- Cookie parameters
- Modal dialogs for adding/editing parameters

#### Step 21: Security Schemes
- List security schemes
- Add/edit API key, OAuth2, HTTP auth (via modal dialogs)
- Security requirements on operations

---

### Phase 7: Validation & Polish (Quality & UX)

#### Step 22: Validation UI
- Problem drawer showing validation errors
- Inline validation indicators
- Click to navigate to problem location
- Validation severity levels

#### Step 23: Undo/Redo Implementation
- Command history stack
- Undo/redo keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- Visual feedback for undo/redo state

#### Step 24: Search & Navigation
- Global search across document
- Quick navigation to paths/schemas
- Breadcrumb navigation

---

### Phase 8: Publishing & Documentation (Release Prep)

#### Step 25: Examples & Demo
- Create example React app using the component
- Provide sample OpenAPI documents
- Show common use cases

#### Step 26: Documentation
- Component API documentation
- Props and callbacks reference
- Integration guide
- Customization options

#### Step 27: Testing & Build
- Unit tests for core logic
- Integration tests for key workflows
- Build optimization
- Bundle size analysis

#### Step 28: npm Publishing
- Configure package.json metadata
- Update LICENSE, README
- Create CHANGELOG
- Publish to npmjs.com

---

## MVP Scope (Minimum Viable Product)

The MVP will include:

- Basic project setup and infrastructure
- Main/Info editing (title, version, description, contact, license)
- Path list and basic path editing
- Operation editing within paths
- Basic request/response editing
- Schema list and basic schema editing
- Validation UI
- Undo/redo functionality

Features deferred post-MVP:

- Advanced security schemes
- Full parameter support (all types)
- Advanced schema features (allOf, oneOf, anyOf)
- Search and advanced navigation
- Collaborative editing
- Import/export utilities
- Extension (x-) support

## Success Criteria

- Component can be installed from npm
- Can load and parse OpenAPI 3.0.x documents
- Can perform basic editing operations
- Changes are validated
- Undo/redo works correctly
- Can be embedded in a React application
- Follows React and PatternFly 6 best practices
