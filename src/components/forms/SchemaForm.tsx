/**
 * Schema form for editing schema definitions
 */

import React, {useState} from 'react';
import {Divider, Dropdown, DropdownItem, DropdownList, Form, MenuToggle, Title,} from '@patternfly/react-core';
import {EllipsisVIcon} from '@patternfly/react-icons';
import {useDocument} from '@hooks/useDocument';
import {useSelection} from '@hooks/useSelection';
import {useCommand} from '@hooks/useCommand';
import {OpenApiSchema} from '@apitomy/data-models';
import {PropertyInput} from '@components/common/PropertyInput';
import {DeleteSchemaCommand} from '@commands/DeleteSchemaCommand';

/**
 * Schema form component for editing schema definitions
 */
export const SchemaForm: React.FC = () => {
    const { document } = useDocument();
    const { selectedPath, selectRoot, navigationObject } = useSelection();
    const { executeCommand } = useCommand();

    const [isSchemaMenuOpen, setIsSchemaMenuOpen] = useState(false);

    // Extract schema information early (before hooks)
    const schema: OpenApiSchema = navigationObject as OpenApiSchema;
    const schemaName = schema.mapPropertyName();

    /**
     * Handle delete schema action
     */
    const handleDeleteSchema = () => {
        if (!schemaName) return;

        const command = new DeleteSchemaCommand(schemaName);
        executeCommand(command, `Delete schema ${schemaName}`);
        selectRoot();
        setIsSchemaMenuOpen(false);
    };

    // Conditional checks after all hooks
    if (!document || !selectedPath) {
        return <div>No schema selected</div>;
    }

    if (!schema) {
        return <div>Schema not found: {schemaName}</div>;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title headingLevel="h2" size="xl">
                    Schema: {schemaName}
                </Title>
                <Dropdown
                    isOpen={isSchemaMenuOpen}
                    onOpenChange={setIsSchemaMenuOpen}
                    popperProps={{ position: 'right' }}
                    toggle={(toggleRef) => (
                        <MenuToggle
                            ref={toggleRef}
                            variant="plain"
                            onClick={() => setIsSchemaMenuOpen(!isSchemaMenuOpen)}
                            aria-label="Schema actions menu"
                        >
                            <EllipsisVIcon />
                        </MenuToggle>
                    )}
                >
                    <DropdownList>
                        <DropdownItem
                            key="delete-schema"
                            onClick={handleDeleteSchema}
                        >
                            Delete schema
                        </DropdownItem>
                    </DropdownList>
                </Dropdown>
            </div>
            <p style={{ marginBottom: '1rem', color: 'var(--pf-v6-global--Color--200)' }}>
                Edit schema definition and properties
            </p>

            <Divider style={{ marginBottom: '1rem' }} />

            {/* Schema metadata form */}
            <Form>
                <PropertyInput
                    model={schema}
                    propertyName="title"
                    label="Title"
                    placeholder="Human-readable title for the schema"
                />

                <PropertyInput
                    model={schema}
                    propertyName="type"
                    label="Type"
                    placeholder="object, string, integer, array, etc."
                />

                <PropertyInput
                    model={schema}
                    propertyName="description"
                    label="Description"
                    type="textarea"
                    placeholder="Detailed description of the schema"
                />
            </Form>

            <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--pf-v6-global--Color--200)' }}>
                Changes are saved when you press Enter or when a field loses focus. Use Undo/Redo buttons to revert changes.
            </p>
        </div>
    );
};
