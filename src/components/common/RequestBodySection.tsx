/**
 * Request body section for editing request body on an operation
 */

import React, { useState } from 'react';
import {
    Button,
    Switch,
    DataList,
    DataListAction,
    DataListCell,
    DataListItem,
    DataListItemCells,
    DataListItemRow,
    Dropdown,
    DropdownItem,
    DropdownList,
    Label,
    MenuToggle,
    Tooltip, Form, Card, Alert,
} from '@patternfly/react-core';
import {
    EllipsisVIcon,
    PlusCircleIcon,
    TrashIcon,
} from '@patternfly/react-icons';
import {
    Node,
    NodePathUtil,
    OpenApi30Document,
    OpenApi30Operation,
    OpenApi31Document,
} from '@apitomy/data-models';
import { useCommand } from '@hooks/useCommand';
import { useSelection } from '@hooks/useSelection';
import { useDocument } from '@hooks/useDocument';
import { ExpandablePanel } from '@components/common/ExpandablePanel';
import { PropertyInput } from '@components/common/PropertyInput';
import { AddMimeTypeModal } from '@components/modals/AddMimeTypeModal';
import { EditMediaTypeSchemaModal } from '@components/modals/EditMediaTypeSchemaModal';
import { AddRequestBodyCommand } from '@commands/AddRequestBodyCommand';
import { DeleteRequestBodyCommand } from '@commands/DeleteRequestBodyCommand';
import { AddMediaTypeCommand } from '@commands/AddMediaTypeCommand';
import { DeleteMediaTypeCommand } from '@commands/DeleteMediaTypeCommand';
import { ChangeMediaTypeSchemaCommand } from '@commands/ChangeMediaTypeSchemaCommand';
import { ChangePropertyCommand } from '@commands/ChangePropertyCommand';

/** HTTP methods where a request body is unusual */
const UNUSUAL_BODY_METHODS = ['get', 'delete', 'options', 'head', 'trace'];

export interface RequestBodySectionProps {
    /**
     * The operation to edit the request body for
     */
    operation: OpenApi30Operation;

    /**
     * The HTTP method (e.g. "get", "post", "put")
     */
    method: string;
}

/**
 * Get the list of content media type names from a request body
 */
function getMediaTypeNames(requestBody: any): string[] {
    if (!requestBody) {
        return [];
    }
    const content = requestBody.getContent();
    if (!content) {
        return [];
    }
    return Object.keys(content);
}

/**
 * Get schema display info for a media type entry
 */
function getSchemaInfo(mediaType: any): { ref: string | null; type: string | null; display: string } {
    if (!mediaType) {
        return { ref: null, type: null, display: 'No schema' };
    }
    const schema = mediaType.getSchema?.();
    if (!schema) {
        return { ref: null, type: null, display: 'No schema' };
    }
    const ref = schema.get$ref?.();
    if (ref) {
        // Extract the schema name from the $ref
        const name = ref.split('/').pop() || ref;
        return { ref, type: null, display: `$ref: ${name}` };
    }
    const type = schema.getType?.();
    if (type) {
        return { ref: null, type, display: `type: ${type}` };
    }
    return { ref: null, type: null, display: 'No schema' };
}

/**
 * Get available schema names from the document
 */
function getAvailableSchemas(document: any): string[] {
    if (!document) {
        return [];
    }
    const components = (document as OpenApi30Document | OpenApi31Document).getComponents?.();
    if (!components) {
        return [];
    }
    const schemas = components.getSchemas?.();
    if (!schemas) {
        return [];
    }
    return Object.keys(schemas).sort();
}

/**
 * Request body section component for editing the request body on an operation
 */
export const RequestBodySection: React.FC<RequestBodySectionProps> = ({ operation, method }) => {
    const { executeCommand } = useCommand();
    const { select } = useSelection();
    const { document } = useDocument();

    const requestBody = operation.getRequestBody();
    const mediaTypeNames = getMediaTypeNames(requestBody);
    const availableSchemas = getAvailableSchemas(document);

    const [isExpanded, setIsExpanded] = useState(() => !!requestBody);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [isAddMimeTypeModalOpen, setIsAddMimeTypeModalOpen] = useState(false);
    const [editSchemaMediaTypeName, setEditSchemaMediaTypeName] = useState<string | null>(null);
    const [editSchemaCurrentRef, setEditSchemaCurrentRef] = useState<string | null>(null);
    const [editSchemaCurrentType, setEditSchemaCurrentType] = useState<string | null>(null);

    /**
     * Handle adding a request body
     */
    const handleAddRequestBody = () => {
        const command = new AddRequestBodyCommand(operation as unknown as Node);
        executeCommand(command, 'Add request body');
        setIsExpanded(true);
    };

    /**
     * Handle deleting the request body
     */
    const handleDeleteRequestBody = () => {
        const command = new DeleteRequestBodyCommand(operation as unknown as Node);
        executeCommand(command, 'Delete request body');
    };

    /**
     * Handle adding a media type
     */
    const handleAddMediaType = (mimeType: string) => {
        if (!requestBody) {
            return;
        }
        const command = new AddMediaTypeCommand(requestBody as unknown as Node, mimeType);
        executeCommand(command, `Add content type "${mimeType}"`);
    };

    /**
     * Handle deleting a media type
     */
    const handleDeleteMediaType = (mediaTypeName: string) => {
        if (!requestBody) {
            return;
        }
        const command = new DeleteMediaTypeCommand(requestBody as unknown as Node, mediaTypeName);
        executeCommand(command, `Delete content type "${mediaTypeName}"`);
        setOpenDropdownId(null);
    };

    /**
     * Handle opening the edit schema modal
     */
    const handleOpenEditSchemaModal = (mediaTypeName: string) => {
        const content = requestBody?.getContent();
        if (!content || !content[mediaTypeName]) {
            return;
        }
        const info = getSchemaInfo(content[mediaTypeName]);
        setEditSchemaMediaTypeName(mediaTypeName);
        setEditSchemaCurrentRef(info.ref);
        setEditSchemaCurrentType(info.type);
        setOpenDropdownId(null);
    };

    /**
     * Handle confirming a schema change
     */
    const handleConfirmSchemaChange = (schemaRef: string | null, schemaType: string | null) => {
        if (!requestBody || !editSchemaMediaTypeName) {
            return;
        }
        const content = requestBody.getContent();
        if (!content || !content[editSchemaMediaTypeName]) {
            return;
        }
        const mediaType = content[editSchemaMediaTypeName];
        const command = new ChangeMediaTypeSchemaCommand(
            mediaType as unknown as Node,
            schemaRef,
            schemaType
        );
        executeCommand(command, `Change schema for "${editSchemaMediaTypeName}"`);
        setEditSchemaMediaTypeName(null);
    };

    /**
     * Handle required checkbox change
     */
    const handleRequiredChange = (_event: React.FormEvent<HTMLInputElement>, checked: boolean | undefined) => {
        if (!requestBody) {
            return;
        }
        const command = new ChangePropertyCommand(
            requestBody as unknown as Node,
            'required',
            !!checked
        );
        executeCommand(command, `Set request body required to ${checked}`);
    };

    // No request body - show add button
    if (!requestBody) {
        return (
            <ExpandablePanel
                title="Request Body"
                isExpanded={isExpanded}
                onToggle={setIsExpanded}
                className="form__section"
                actions={
                    <Tooltip content="Add request body">
                        <Button
                            variant="plain"
                            aria-label="Add request body"
                            icon={<PlusCircleIcon />}
                            style={{ minWidth: 'auto', padding: '0.25rem' }}
                            onClick={handleAddRequestBody}
                        />
                    </Tooltip>
                }
            >
                <div className="form__sectionbody">
                    <p style={{ color: 'var(--pf-v6-global--Color--200)', fontStyle: 'italic' }}>
                        No request body defined. Use the + icon to create one.
                    </p>
                </div>
            </ExpandablePanel>
        );
    }

    // Has request body - render full section
    return (
        <>
            <ExpandablePanel
                title="Request Body"
                isExpanded={isExpanded}
                onToggle={setIsExpanded}
                className="form__section"
                badgeCount={mediaTypeNames.length}
                nodePath={NodePathUtil.createNodePath(requestBody)}
                actions={
                    <Tooltip content="Delete request body">
                        <Button
                            variant="plain"
                            icon={<TrashIcon />}
                            onClick={handleDeleteRequestBody}
                            aria-label="Delete request body"
                            isDanger
                        />
                    </Tooltip>
                }
            >
                <Card style={{ padding: '20px' }}>
                    {UNUSUAL_BODY_METHODS.includes(method.toLowerCase()) && (
                        <Alert
                            variant="warning"
                            isInline
                            title={`A request body is unusual for ${method.toUpperCase()} operations and may not be supported by all clients.`}
                            style={{ marginBottom: '1rem' }}
                        />
                    )}
                    <Form>
                        <PropertyInput
                            model={requestBody}
                            propertyName="description"
                            label="Description"
                            type="textarea"
                            fieldId="requestBody.description"
                            placeholder="Description of the request body"
                        />
                    </Form>

                    <div>
                        <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
                            <Switch
                                id="request-body-required"
                                label="Required"
                                isChecked={requestBody.isRequired?.() || false}
                                onChange={handleRequiredChange}
                            />
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: '1rem',
                            marginBottom: '0.5rem'
                        }}>
                            <strong style={{ fontSize: '0.875rem' }}>Content Types</strong>
                            <Tooltip content="Add content type">
                                <Button
                                    variant="plain"
                                    aria-label="Add content type"
                                    icon={<PlusCircleIcon />}
                                    style={{ minWidth: 'auto', padding: '0.25rem' }}
                                    onClick={() => setIsAddMimeTypeModalOpen(true)}
                                />
                            </Tooltip>
                        </div>

                        {mediaTypeNames.length === 0 ? (
                            <p style={{ color: 'var(--pf-v6-global--Color--200)', fontStyle: 'italic' }}>
                                No content types defined. Use the + icon to add one.
                            </p>
                        ) : (
                            <DataList
                                aria-label="Content types list"
                                isCompact
                                selectedDataListItemId=""
                                onSelectableRowChange={() => {}}
                                onSelectDataListItem={() => {}}
                            >
                                {mediaTypeNames.map((mtName, index) => {
                                    const content = requestBody.getContent();
                                    const mediaType = content[mtName];
                                    const schemaInfo = getSchemaInfo(mediaType);
                                    const dropdownId = `mt-${index}`;

                                    // Fire selection on click
                                    const handleRowClick = () => {
                                        if (mediaType) {
                                            select(mediaType);
                                        }
                                    };

                                    return (
                                        <DataListItem
                                            key={mtName}
                                            id={`${index}`}
                                            data-path={mediaType
                                                ? NodePathUtil.createNodePath(mediaType).toString()
                                                : undefined}
                                            data-selectable="true"
                                        >
                                            <DataListItemRow
                                                style={{ cursor: 'pointer' }}
                                                onClick={handleRowClick}
                                            >
                                                <DataListItemCells
                                                    dataListCells={[
                                                        <DataListCell key="media-type-info">
                                                            <div>
                                                                <div style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.5rem'
                                                                }}>
                                                                    <strong>{mtName}</strong>
                                                                    <Label isCompact color="grey">
                                                                        {schemaInfo.display}
                                                                    </Label>
                                                                </div>
                                                            </div>
                                                        </DataListCell>
                                                    ]}
                                                />
                                                <DataListAction
                                                    aria-labelledby={`media-type-action-${index}`}
                                                    id={`media-type-action-${index}`}
                                                    aria-label="Media type actions"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Dropdown
                                                        isOpen={openDropdownId === dropdownId}
                                                        onSelect={() => setOpenDropdownId(null)}
                                                        onOpenChange={(isOpen) =>
                                                            setOpenDropdownId(isOpen ? dropdownId : null)
                                                        }
                                                        popperProps={{ position: 'right' }}
                                                        toggle={(toggleRef) => (
                                                            <MenuToggle
                                                                ref={toggleRef}
                                                                aria-label="Media type kebab menu"
                                                                variant="plain"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setOpenDropdownId(
                                                                        openDropdownId === dropdownId
                                                                            ? null
                                                                            : dropdownId
                                                                    );
                                                                }}
                                                                isExpanded={openDropdownId === dropdownId}
                                                            >
                                                                <EllipsisVIcon />
                                                            </MenuToggle>
                                                        )}
                                                        shouldFocusToggleOnSelect
                                                    >
                                                        <DropdownList>
                                                            <DropdownItem
                                                                key="edit-schema"
                                                                onClick={() =>
                                                                    handleOpenEditSchemaModal(mtName)
                                                                }
                                                            >
                                                                Edit schema
                                                            </DropdownItem>
                                                            <DropdownItem
                                                                key="delete"
                                                                onClick={() =>
                                                                    handleDeleteMediaType(mtName)
                                                                }
                                                            >
                                                                Delete content type
                                                            </DropdownItem>
                                                        </DropdownList>
                                                    </Dropdown>
                                                </DataListAction>
                                            </DataListItemRow>
                                        </DataListItem>
                                    );
                                })}
                            </DataList>
                        )}
                    </div>
                </Card>
            </ExpandablePanel>

            {/* Add MIME Type Modal */}
            <AddMimeTypeModal
                isOpen={isAddMimeTypeModalOpen}
                onClose={() => setIsAddMimeTypeModalOpen(false)}
                onConfirm={handleAddMediaType}
                existingMimeTypes={mediaTypeNames}
            />

            {/* Edit Media Type Schema Modal */}
            <EditMediaTypeSchemaModal
                isOpen={editSchemaMediaTypeName !== null}
                mediaTypeName={editSchemaMediaTypeName || ''}
                currentSchemaRef={editSchemaCurrentRef}
                currentSchemaType={editSchemaCurrentType}
                availableSchemas={availableSchemas}
                onClose={() => {
                    setEditSchemaMediaTypeName(null);
                    setEditSchemaCurrentRef(null);
                    setEditSchemaCurrentType(null);
                }}
                onConfirm={handleConfirmSchemaChange}
            />
        </>
    );
};
