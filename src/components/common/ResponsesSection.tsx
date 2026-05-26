/* eslint-disable react-hooks/set-state-in-effect -- modal/form state initialization */
/**
 * Responses section for editing responses on an operation
 */

import React, { useState, useEffect } from 'react';
import {
    Button,
    Card,
    DataList,
    DataListAction,
    DataListCell,
    DataListItem,
    DataListItemCells,
    DataListItemRow,
    Dropdown,
    DropdownItem,
    DropdownList,
    Form,
    Label,
    MenuToggle,
    Tab,
    Tabs,
    Tooltip,
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
import { AddResponseModal } from '@components/modals/AddResponseModal';
import { AddResponseHeaderModal } from '@components/modals/AddResponseHeaderModal';
import { AddMimeTypeModal } from '@components/modals/AddMimeTypeModal';
import { EditMediaTypeSchemaModal } from '@components/modals/EditMediaTypeSchemaModal';
import { AddResponseCommand } from '@commands/AddResponseCommand';
import { DeleteResponseCommand } from '@commands/DeleteResponseCommand';
import { AddResponseHeaderCommand } from '@commands/AddResponseHeaderCommand';
import { DeleteResponseHeaderCommand } from '@commands/DeleteResponseHeaderCommand';
import { AddMediaTypeCommand } from '@commands/AddMediaTypeCommand';
import { DeleteMediaTypeCommand } from '@commands/DeleteMediaTypeCommand';
import { ChangeMediaTypeSchemaCommand } from '@commands/ChangeMediaTypeSchemaCommand';

export interface ResponsesSectionProps {
    /**
     * The operation to edit responses for
     */
    operation: OpenApi30Operation;
}

/**
 * Get the list of response status codes from an operation
 */
function getResponseCodes(operation: any): string[] {
    const responses = operation.getResponses?.();
    if (!responses) {
        return [];
    }
    const names = responses.getItemNames?.();
    return names || [];
}

/**
 * Get the list of content media type names from a response
 */
function getMediaTypeNames(response: any): string[] {
    if (!response) {
        return [];
    }
    const content = response.getContent?.();
    if (!content) {
        return [];
    }
    return Object.keys(content);
}

/**
 * Get the list of header names from a response
 */
function getHeaderNames(response: any): string[] {
    if (!response) {
        return [];
    }
    const headers = response.getHeaders?.();
    if (!headers) {
        return [];
    }
    return Object.keys(headers);
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
 * Get schema display info for a header
 */
function getHeaderSchemaInfo(header: any): { ref: string | null; type: string | null; display: string } {
    if (!header) {
        return { ref: null, type: null, display: '' };
    }
    const schema = header.getSchema?.();
    if (!schema) {
        return { ref: null, type: null, display: '' };
    }
    const ref = schema.get$ref?.();
    if (ref) {
        const name = ref.split('/').pop() || ref;
        return { ref, type: null, display: `$ref: ${name}` };
    }
    const type = schema.getType?.();
    if (type) {
        return { ref: null, type, display: type };
    }
    return { ref: null, type: null, display: '' };
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
 * Get the Label color for a response status code
 */
function getStatusCodeColor(statusCode: string): 'green' | 'blue' | 'teal' | 'orange' | 'red' | 'grey' {
    if (statusCode === 'default') {
        return 'grey';
    }
    const code = parseInt(statusCode, 10);
    if (isNaN(code)) {
        return 'grey';
    }
    if (code >= 100 && code < 200) {
        return 'teal';
    }
    if (code >= 200 && code < 300) {
        return 'green';
    }
    if (code >= 300 && code < 400) {
        return 'blue';
    }
    if (code >= 400 && code < 500) {
        return 'orange';
    }
    if (code >= 500 && code < 600) {
        return 'red';
    }
    return 'grey';
}

/**
 * Responses section component for editing responses on an operation
 */
export const ResponsesSection: React.FC<ResponsesSectionProps> = ({ operation }) => {
    const { executeCommand } = useCommand();
    const { select } = useSelection();
    const { document } = useDocument();

    const responseCodes = getResponseCodes(operation);
    const availableSchemas = getAvailableSchemas(document);

    const [isExpanded, setIsExpanded] = useState(() => responseCodes.length > 0);
    const [activeTab, setActiveTab] = useState<string | number>(
        () => responseCodes.length > 0 ? responseCodes[0] : ''
    );

    // Modal state
    const [isAddResponseModalOpen, setIsAddResponseModalOpen] = useState(false);
    const [isAddMimeTypeModalOpen, setIsAddMimeTypeModalOpen] = useState(false);
    const [isAddHeaderModalOpen, setIsAddHeaderModalOpen] = useState(false);
    const [headerModalMode, setHeaderModalMode] = useState<'create' | 'edit'>('create');
    const [editingHeaderName, setEditingHeaderName] = useState<string | undefined>(undefined);
    const [editingHeaderDescription, setEditingHeaderDescription] = useState<string | undefined>(undefined);
    const [editingHeaderSchemaRef, setEditingHeaderSchemaRef] = useState<string | null>(null);
    const [editingHeaderSchemaType, setEditingHeaderSchemaType] = useState<string | null>(null);

    // Edit schema modal state
    const [editSchemaMediaTypeName, setEditSchemaMediaTypeName] = useState<string | null>(null);
    const [editSchemaCurrentRef, setEditSchemaCurrentRef] = useState<string | null>(null);
    const [editSchemaCurrentType, setEditSchemaCurrentType] = useState<string | null>(null);

    // Dropdown state
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    // Auto-select first tab when responses change
     
    useEffect(() => {
        if (responseCodes.length > 0 && !responseCodes.includes(activeTab as string)) {
            setActiveTab(responseCodes[0]);
        }
    }, [responseCodes.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

    /**
     * Get the current response object for the active tab
     */
    const getActiveResponse = (): any => {
        if (!activeTab) {
            return null;
        }
        const responses = operation.getResponses?.();
        if (!responses) {
            return null;
        }
        return responses.getItem?.(activeTab as string) || null;
    };

    /**
     * Handle adding a response
     */
    const handleAddResponse = (statusCode: string, description: string) => {
        const command = new AddResponseCommand(operation as unknown as Node, statusCode, description);
        executeCommand(command, `Add response "${statusCode}"`);
        setActiveTab(statusCode);
        setIsExpanded(true);
    };

    /**
     * Handle deleting a response
     */
    const handleDeleteResponse = (statusCode: string) => {
        const command = new DeleteResponseCommand(operation as unknown as Node, statusCode);
        executeCommand(command, `Delete response "${statusCode}"`);
    };

    /**
     * Handle adding a media type to the active response
     */
    const handleAddMediaType = (mimeType: string) => {
        const response = getActiveResponse();
        if (!response) {
            return;
        }
        const command = new AddMediaTypeCommand(response as unknown as Node, mimeType);
        executeCommand(command, `Add content type "${mimeType}" to response "${activeTab}"`);
    };

    /**
     * Handle deleting a media type from the active response
     */
    const handleDeleteMediaType = (mediaTypeName: string) => {
        const response = getActiveResponse();
        if (!response) {
            return;
        }
        const command = new DeleteMediaTypeCommand(response as unknown as Node, mediaTypeName);
        executeCommand(command, `Delete content type "${mediaTypeName}" from response "${activeTab}"`);
        setOpenDropdownId(null);
    };

    /**
     * Handle opening the edit schema modal for a media type
     */
    const handleOpenEditSchemaModal = (mediaTypeName: string) => {
        const response = getActiveResponse();
        if (!response) {
            return;
        }
        const content = response.getContent?.();
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
     * Handle confirming a schema change on a media type
     */
    const handleConfirmSchemaChange = (schemaRef: string | null, schemaType: string | null) => {
        const response = getActiveResponse();
        if (!response || !editSchemaMediaTypeName) {
            return;
        }
        const content = response.getContent?.();
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
     * Handle opening the add header modal
     */
    const handleOpenAddHeaderModal = () => {
        setHeaderModalMode('create');
        setEditingHeaderName(undefined);
        setEditingHeaderDescription(undefined);
        setEditingHeaderSchemaRef(null);
        setEditingHeaderSchemaType(null);
        setIsAddHeaderModalOpen(true);
    };

    /**
     * Handle opening the edit header modal
     */
    const handleOpenEditHeaderModal = (headerName: string) => {
        const response = getActiveResponse();
        if (!response) {
            return;
        }
        const headers = response.getHeaders?.();
        if (!headers || !headers[headerName]) {
            return;
        }
        const header = headers[headerName];
        const schemaInfo = getHeaderSchemaInfo(header);

        setHeaderModalMode('edit');
        setEditingHeaderName(headerName);
        setEditingHeaderDescription(header.getDescription?.() || header.description || '');
        setEditingHeaderSchemaRef(schemaInfo.ref);
        setEditingHeaderSchemaType(schemaInfo.type);
        setIsAddHeaderModalOpen(true);
        setOpenDropdownId(null);
    };

    /**
     * Handle confirming a header add/edit
     */
    const handleConfirmHeader = (
        name: string,
        description: string,
        schemaRef: string | null,
        schemaType: string | null
    ) => {
        const response = getActiveResponse();
        if (!response) {
            return;
        }

        if (headerModalMode === 'edit') {
            // For edit mode, delete old header and add new one with same name
            const deleteCommand = new DeleteResponseHeaderCommand(response as unknown as Node, name);
            executeCommand(deleteCommand, `Delete header "${name}"`);
        }

        const command = new AddResponseHeaderCommand(
            response as unknown as Node,
            name,
            description,
            schemaType,
            schemaRef
        );
        executeCommand(command, `${headerModalMode === 'create' ? 'Add' : 'Update'} header "${name}"`);
        setIsAddHeaderModalOpen(false);
    };

    /**
     * Handle deleting a header
     */
    const handleDeleteHeader = (headerName: string) => {
        const response = getActiveResponse();
        if (!response) {
            return;
        }
        const command = new DeleteResponseHeaderCommand(response as unknown as Node, headerName);
        executeCommand(command, `Delete header "${headerName}"`);
        setOpenDropdownId(null);
    };

    // Get responses node path for selection
    const responses = operation.getResponses?.();
    const responsesNodePath = responses ? NodePathUtil.createNodePath(responses) : undefined;

    // No responses - show empty state with add button
    if (responseCodes.length === 0) {
        return (
            <>
                <ExpandablePanel
                    title="Responses"
                    isExpanded={isExpanded}
                    onToggle={setIsExpanded}
                    className="form__section"
                    actions={
                        <Tooltip content="Add response">
                            <Button
                                variant="plain"
                                aria-label="Add response"
                                icon={<PlusCircleIcon />}
                                style={{ minWidth: 'auto', padding: '0.25rem' }}
                                onClick={() => setIsAddResponseModalOpen(true)}
                            />
                        </Tooltip>
                    }
                >
                    <div className="form__sectionbody">
                        <p style={{ color: 'var(--pf-v6-global--Color--200)', fontStyle: 'italic' }}>
                            No responses defined. Use the + icon to add one.
                        </p>
                    </div>
                </ExpandablePanel>

                <AddResponseModal
                    isOpen={isAddResponseModalOpen}
                    onClose={() => setIsAddResponseModalOpen(false)}
                    onConfirm={handleAddResponse}
                    existingStatusCodes={responseCodes}
                />
            </>
        );
    }

    // Has responses - render tabs
    const activeResponse = getActiveResponse();
    const activeMediaTypeNames = getMediaTypeNames(activeResponse);
    const activeHeaderNames = getHeaderNames(activeResponse);
    const existingHeadersForModal = headerModalMode === 'create' ? activeHeaderNames : [];

    return (
        <>
            <ExpandablePanel
                title="Responses"
                isExpanded={isExpanded}
                onToggle={setIsExpanded}
                className="form__section"
                badgeCount={responseCodes.length}
                nodePath={responsesNodePath}
                actions={
                    <Tooltip content="Add response">
                        <Button
                            variant="plain"
                            aria-label="Add response"
                            icon={<PlusCircleIcon />}
                            style={{ minWidth: 'auto', padding: '0.25rem' }}
                            onClick={() => setIsAddResponseModalOpen(true)}
                        />
                    </Tooltip>
                }
            >
                <Card style={{ padding: '20px' }}>
                    <Tabs
                        activeKey={activeTab}
                        onSelect={(_event, tabIndex) => setActiveTab(tabIndex)}
                        aria-label="Response status code tabs"
                    >
                        {responseCodes.map((statusCode) => (
                            <Tab
                                key={statusCode}
                                eventKey={statusCode}
                                title={
                                    <Label color={getStatusCodeColor(statusCode)}>
                                        {statusCode}
                                    </Label>
                                }
                            >
                                <div style={{ padding: '1rem 0' }}>
                                    {/* Description */}
                                    <Form>
                                        <PropertyInput
                                            model={responses?.getItem?.(statusCode)}
                                            propertyName="description"
                                            label="Description"
                                            type="textarea"
                                            fieldId={`response.${statusCode}.description`}
                                            placeholder="Response description"
                                        />
                                    </Form>

                                    {/* Headers sub-section */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginTop: '1rem',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <strong style={{ fontSize: '0.875rem' }}>Headers</strong>
                                        <Tooltip content="Add header">
                                            <Button
                                                variant="plain"
                                                aria-label="Add header"
                                                icon={<PlusCircleIcon />}
                                                style={{ minWidth: 'auto', padding: '0.25rem' }}
                                                onClick={handleOpenAddHeaderModal}
                                            />
                                        </Tooltip>
                                    </div>

                                    {activeTab === statusCode && activeHeaderNames.length === 0 ? (
                                        <p style={{
                                            color: 'var(--pf-v6-global--Color--200)',
                                            fontStyle: 'italic'
                                        }}>
                                            No headers defined.
                                        </p>
                                    ) : activeTab === statusCode && (
                                        <DataList
                                            aria-label="Response headers list"
                                            isCompact
                                            selectedDataListItemId=""
                                            onSelectableRowChange={() => {}}
                                            onSelectDataListItem={() => {}}
                                        >
                                            {activeHeaderNames.map((headerName, index) => {
                                                const responseNode = responses?.getItem?.(statusCode);
                                                const headers = ((responseNode as any)?.getHeaders?.());
                                                const header = headers?.[headerName];
                                                const schemaInfo = getHeaderSchemaInfo(header);
                                                const dropdownId = `hdr-${statusCode}-${index}`;

                                                const handleRowClick = () => {
                                                    if (header) {
                                                        select(header);
                                                    }
                                                };

                                                return (
                                                    <DataListItem
                                                        key={headerName}
                                                        id={`header-${statusCode}-${index}`}
                                                        data-selectable="true"
                                                    >
                                                        <DataListItemRow
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={handleRowClick}
                                                        >
                                                            <DataListItemCells
                                                                dataListCells={[
                                                                    <DataListCell key="header-info">
                                                                        <div style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '0.5rem'
                                                                        }}>
                                                                            <strong>{headerName}</strong>
                                                                            {schemaInfo.display && (
                                                                                <Label isCompact color="grey">
                                                                                    {schemaInfo.display}
                                                                                </Label>
                                                                            )}
                                                                        </div>
                                                                    </DataListCell>
                                                                ]}
                                                            />
                                                            <DataListAction
                                                                aria-labelledby={`header-action-${statusCode}-${index}`}
                                                                id={`header-action-${statusCode}-${index}`}
                                                                aria-label="Header actions"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <Dropdown
                                                                    isOpen={openDropdownId === dropdownId}
                                                                    onSelect={() => setOpenDropdownId(null)}
                                                                    onOpenChange={(isOpen) =>
                                                                        setOpenDropdownId(
                                                                            isOpen ? dropdownId : null
                                                                        )
                                                                    }
                                                                    popperProps={{ position: 'right' }}
                                                                    toggle={(toggleRef) => (
                                                                        <MenuToggle
                                                                            ref={toggleRef}
                                                                            aria-label="Header kebab menu"
                                                                            variant="plain"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setOpenDropdownId(
                                                                                    openDropdownId === dropdownId
                                                                                        ? null
                                                                                        : dropdownId
                                                                                );
                                                                            }}
                                                                            isExpanded={
                                                                                openDropdownId === dropdownId
                                                                            }
                                                                        >
                                                                            <EllipsisVIcon />
                                                                        </MenuToggle>
                                                                    )}
                                                                    shouldFocusToggleOnSelect
                                                                >
                                                                    <DropdownList>
                                                                        <DropdownItem
                                                                            key="edit-header"
                                                                            onClick={() =>
                                                                                handleOpenEditHeaderModal(
                                                                                    headerName
                                                                                )
                                                                            }
                                                                        >
                                                                            Edit header
                                                                        </DropdownItem>
                                                                        <DropdownItem
                                                                            key="delete-header"
                                                                            onClick={() =>
                                                                                handleDeleteHeader(headerName)
                                                                            }
                                                                        >
                                                                            Delete header
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

                                    {/* Content Types sub-section */}
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

                                    {activeTab === statusCode && activeMediaTypeNames.length === 0 ? (
                                        <p style={{
                                            color: 'var(--pf-v6-global--Color--200)',
                                            fontStyle: 'italic'
                                        }}>
                                            No content types defined.
                                        </p>
                                    ) : activeTab === statusCode && (
                                        <DataList
                                            aria-label="Response content types list"
                                            isCompact
                                            selectedDataListItemId=""
                                            onSelectableRowChange={() => {}}
                                            onSelectDataListItem={() => {}}
                                        >
                                            {activeMediaTypeNames.map((mtName, index) => {
                                                const responseNode = responses?.getItem?.(statusCode);
                                                const content = ((responseNode as any)?.getContent?.());
                                                const mediaType = content?.[mtName];
                                                const schemaInfo = getSchemaInfo(mediaType);
                                                const dropdownId = `mt-${statusCode}-${index}`;

                                                const handleRowClick = () => {
                                                    if (mediaType) {
                                                        select(mediaType);
                                                    }
                                                };

                                                return (
                                                    <DataListItem
                                                        key={mtName}
                                                        id={`response-mt-${statusCode}-${index}`}
                                                        data-path={mediaType
                                                            ? NodePathUtil.createNodePath(
                                                                mediaType
                                                            ).toString()
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
                                                                    </DataListCell>
                                                                ]}
                                                            />
                                                            <DataListAction
                                                                aria-labelledby={
                                                                    `response-mt-action-${statusCode}-${index}`
                                                                }
                                                                id={
                                                                    `response-mt-action-${statusCode}-${index}`
                                                                }
                                                                aria-label="Media type actions"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <Dropdown
                                                                    isOpen={openDropdownId === dropdownId}
                                                                    onSelect={() =>
                                                                        setOpenDropdownId(null)
                                                                    }
                                                                    onOpenChange={(isOpen) =>
                                                                        setOpenDropdownId(
                                                                            isOpen ? dropdownId : null
                                                                        )
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
                                                                                    openDropdownId ===
                                                                                        dropdownId
                                                                                        ? null
                                                                                        : dropdownId
                                                                                );
                                                                            }}
                                                                            isExpanded={
                                                                                openDropdownId === dropdownId
                                                                            }
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
                                                                                handleOpenEditSchemaModal(
                                                                                    mtName
                                                                                )
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

                                    {/* Delete response button */}
                                    {activeTab === statusCode && (
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'flex-end',
                                            marginTop: '1rem'
                                        }}>
                                            <Button
                                                variant="danger"
                                                icon={<TrashIcon />}
                                                onClick={() => handleDeleteResponse(statusCode)}
                                            >
                                                Delete Response
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Tab>
                        ))}
                    </Tabs>
                </Card>
            </ExpandablePanel>

            {/* Add Response Modal */}
            <AddResponseModal
                isOpen={isAddResponseModalOpen}
                onClose={() => setIsAddResponseModalOpen(false)}
                onConfirm={handleAddResponse}
                existingStatusCodes={responseCodes}
            />

            {/* Add MIME Type Modal (for response content types) */}
            <AddMimeTypeModal
                isOpen={isAddMimeTypeModalOpen}
                onClose={() => setIsAddMimeTypeModalOpen(false)}
                onConfirm={handleAddMediaType}
                existingMimeTypes={activeMediaTypeNames}
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

            {/* Add/Edit Response Header Modal */}
            <AddResponseHeaderModal
                isOpen={isAddHeaderModalOpen}
                mode={headerModalMode}
                onClose={() => setIsAddHeaderModalOpen(false)}
                onConfirm={handleConfirmHeader}
                existingHeaders={existingHeadersForModal}
                availableSchemas={availableSchemas}
                initialName={editingHeaderName}
                initialDescription={editingHeaderDescription}
                initialSchemaRef={editingHeaderSchemaRef}
                initialSchemaType={editingHeaderSchemaType}
            />
        </>
    );
};
