/**
 * Navigation panel for the master section
 */

import React, { useState, useMemo } from 'react';
import {
    Nav,
    NavList,
    NavItem,
    Divider,
    SearchInput
} from '@patternfly/react-core';
import { useDocument } from '@hooks/useDocument';
import { useSelection } from '@hooks/useSelection';
import { useCommand } from '@hooks/useCommand';
import {
    OpenApi30Document,
    NodePath,
    OpenApiDocument,
    OpenApi31Document,
    OpenApi20Document,
    OpenApi20Definitions
} from '@apitomy/data-models';
import { CreatePathModal } from '@components/modals/CreatePathModal';
import { CreateSchemaModal } from '@components/modals/CreateSchemaModal';
import { CreatePathCommand } from '@commands/CreatePathCommand';
import { CreateSchemaCommand } from '@commands/CreateSchemaCommand';
import { DeletePathCommand } from '@commands/DeletePathCommand';
import { DeleteSchemaCommand } from '@commands/DeleteSchemaCommand';
import { NavigationPanelSection, ContextMenuAction } from './NavigationPanelSection';
import './NavigationPanel.css';

/**
 * Navigation panel component
 * Shows lists of paths and schemas
 */
export const NavigationPanel: React.FC = () => {
    const { document, specVersion } = useDocument();
    const { select, selectRoot, navigationObject, navigationObjectType } = useSelection();
    const { executeCommand } = useCommand();
    const [isCreatePathModalOpen, setIsCreatePathModalOpen] = useState(false);
    const [isCreateSchemaModalOpen, setIsCreateSchemaModalOpen] = useState(false);
    const [filterText, setFilterText] = useState('');

    /**
     * Get list of paths from the document
     */
    const getPaths = (): string[] => {
        if (!document) {
            return [];
        }
        const oaiDoc = document as OpenApiDocument;
        const paths = oaiDoc.getPaths();
        if (!paths) {
            return [];
        }
        return paths.getItemNames();
    };

    /**
     * Get list of schema names from the document
     */
    const getSchemas = (): string[] => {
        if (!document) {
            return [];
        }

        const oaiDoc = document as OpenApiDocument;

        if (specVersion === '2.0') {
            // For OpenAPI 2.0, get schemas from 'definitions'
            const definitions: OpenApi20Definitions = (oaiDoc as OpenApi20Document).getDefinitions();
            if (!definitions) {
                return [];
            }
            return definitions.getItemNames();
        } else {
            // For OpenAPI 3.0 and 3.1, get schemas from 'components.schemas'
            const components = (oaiDoc as OpenApi30Document | OpenApi31Document).getComponents();
            if (!components) {
                return [];
            }
            const schemas = components.getSchemas();
            if (!schemas) {
                return [];
            }
            return Object.keys(schemas);
        }
    };

    const paths = getPaths().sort();
    const schemas = getSchemas().sort();

    /**
     * Filtered paths and schemas
     */
    const filteredPaths = useMemo(() => {
        if (!filterText.trim()) return paths;
        const searchTerm = filterText.toLowerCase();
        return paths.filter(item => item.toLowerCase().includes(searchTerm));
    }, [paths, filterText]);
    const filteredSchemas = useMemo(() => {
        if (!filterText.trim()) return schemas;
        const searchTerm = filterText.toLowerCase();
        return schemas.filter(item => item.toLowerCase().includes(searchTerm));
    }, [schemas, filterText]);

    /**
     * Handle path selection
     */
    const handlePathClick = (path: string) => {
        const oaiDoc = document as OpenApi30Document | OpenApi20Document | OpenApi31Document;
        const pathItem = oaiDoc.getPaths().getItem(path);
        select(pathItem);
    };

    /**
     * Handle schema selection
     */
    const handleSchemaClick = (schemaName: string) => {
        const oaiDoc = document as OpenApiDocument;

        if (specVersion === '2.0') {
            // For OpenAPI 2.0, get schema from 'definitions'
            const definitions = (oaiDoc as OpenApi20Document).getDefinitions();
            if (definitions) {
                const schema = definitions.getItem(schemaName);
                select(schema);
            }
            return;
        } else {
            // For OpenAPI 3.0 and 3.1, get schema from 'components.schemas'
            const components = (oaiDoc as OpenApi30Document | OpenApi31Document).getComponents();
            if (components) {
                const schema = components.getSchemas()[schemaName];
                select(schema);
            }
        }
    };

    /**
     * Handle main/info selection
     */
    const handleMainClick = () => {
        selectRoot();
    };

    /**
     * Handle creating a new path
     */
    const handleCreatePath = (pathName: string) => {
        const command = new CreatePathCommand(pathName);
        executeCommand(command, `Create path ${pathName}`);

        // Select the newly created path
        const nodePath = NodePath.parse(`/paths/${pathName}`);
        select(nodePath);
    };

    /**
     * Handle creating a new schema
     */
    const handleCreateSchema = (schemaName: string) => {
        const command = new CreateSchemaCommand(schemaName);
        executeCommand(command, `Create schema ${schemaName}`);

        // Select the newly created schema
        handleSchemaClick(schemaName);
    };

    /**
     * Handle deleting a path from context menu
     */
    const handleDeletePath = (pathName: string) => {
        const command = new DeletePathCommand(pathName);
        executeCommand(command, `Delete path ${pathName}`);
        selectRoot();
    };

    /**
     * Handle deleting a schema from context menu
     */
    const handleDeleteSchema = (schemaName: string) => {
        const command = new DeleteSchemaCommand(schemaName);
        executeCommand(command, `Delete schema ${schemaName}`);
        selectRoot();
    };

    /**
     * Define context menu actions for paths
     */
    const pathActions: ContextMenuAction[] = [
        {
            label: 'Delete path',
            onClick: handleDeletePath,
        },
    ];

    /**
     * Define context menu actions for schemas
     */
    const schemaActions: ContextMenuAction[] = [
        {
            label: 'Delete schema',
            onClick: handleDeleteSchema,
        },
    ];

    return (
        <>
            <Nav aria-label="Navigation" onSelect={() => {}}>
                <NavList>
                    {/* Main/Info Section */}
                    <NavItem
                        itemId="main"
                        isActive={navigationObjectType === "info"}
                        onClick={handleMainClick}
                    >
                        API Info
                    </NavItem>

                    <Divider />

                    {/* Search/Filter Section */}
                    <div style={{ padding: '5px' }}>
                        <SearchInput
                            placeholder="Filter..."
                            value={filterText}
                            onChange={(_event, value) => setFilterText(value)}
                            onClear={() => setFilterText('')}
                        />
                    </div>

                    <Divider />

                    {/* Paths Section */}
                    <NavigationPanelSection
                        title="Paths"
                        items={filteredPaths}
                        actions={pathActions}
                        onCreateItem={() => setIsCreatePathModalOpen(true)}
                        itemType="path"
                        isFiltered={!!filterText}
                        onItemClick={handlePathClick}
                        isItemActive={(path) => navigationObjectType === "pathItem" && navigationObject?.mapPropertyName() === path}
                        nodePath="/paths"
                        isTooltipEnabled={true}
                    />

                    <Divider />

                    {/* Schemas Section */}
                    <NavigationPanelSection
                        title="Schemas"
                        itemType="schema"
                        items={filteredSchemas}
                        isFiltered={!!filterText}
                        actions={schemaActions}
                        onCreateItem={() => setIsCreateSchemaModalOpen(true)}
                        onItemClick={handleSchemaClick}
                        isItemActive={(schemaName) => navigationObjectType === "schema" && navigationObject?.mapPropertyName() === schemaName}
                        nodePath={specVersion === '2.0' ? '/definitions' : '/components/schemas'}
                    />
                </NavList>
            </Nav>

            {/* Create Path Modal */}
            <CreatePathModal
                isOpen={isCreatePathModalOpen}
                onClose={() => setIsCreatePathModalOpen(false)}
                onConfirm={handleCreatePath}
            />

            {/* Create Schema Modal */}
            <CreateSchemaModal
                isOpen={isCreateSchemaModalOpen}
                onClose={() => setIsCreateSchemaModalOpen(false)}
                onConfirm={handleCreateSchema}
            />
        </>
    );
};
