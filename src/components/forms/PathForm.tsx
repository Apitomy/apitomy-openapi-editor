/* eslint-disable react-hooks/set-state-in-effect -- modal/form state initialization */
/**
 * Path form for editing path metadata and operations
 */

import React, {useEffect, useState} from 'react';
import {
    Divider,
    Dropdown,
    DropdownItem,
    DropdownList,
    Form,
    Label,
    MenuToggle,
    Tab,
    Tabs,
    Title
} from '@patternfly/react-core';
import {EllipsisVIcon} from '@patternfly/react-icons';
import {useDocument} from '@hooks/useDocument';
import {useCommand} from '@hooks/useCommand';
import {
    Extensible,
    Node,
    NodePathSegment,
    NodePathUtil,
    OpenApi20PathItem,
    OpenApi30Operation,
    OpenApi30PathItem,
    OpenApi31PathItem,
    OpenApiParameter,
    OpenApiServersParent
} from '@apitomy/data-models';
import {useSelection} from '@hooks/useSelection';
import {CreateOperationCommand} from '@commands/CreateOperationCommand';
import {DeleteOperationCommand} from '@commands/DeleteOperationCommand';
import {DeletePathCommand} from '@commands/DeletePathCommand';
import {CompositeCommand} from '@commands/CompositeCommand';
import {AddParameterCommand} from '@commands/AddParameterCommand';
import {DeleteParameterCommand} from '@commands/DeleteParameterCommand';
import {ChangePropertyCommand} from '@commands/ChangePropertyCommand';
import {PropertyInput} from '@components/common/PropertyInput';
import {PathLabel} from '@components/common/PathLabel';
import {ParameterSection} from '@components/common/ParameterSection';
import {ParameterModal} from '@components/modals/ParameterModal';
import {OperationForm} from './OperationForm';
import {ServersSection} from '@components/forms/main/ServersSection';
import {VendorExtensionsSection} from '@components/forms/main/VendorExtensionsSection';
import "./PathForm.css";

/**
 * Path form component for editing path metadata and operations
 */

// HTTP methods in display order with their label colors
const HTTP_METHODS = [
    { method: 'get', label: 'GET', color: 'blue' as const },
    { method: 'put', label: 'PUT', color: 'orange' as const },
    { method: 'post', label: 'POST', color: 'green' as const },
    { method: 'delete', label: 'DELETE', color: 'red' as const },
    { method: 'options', label: 'OPTIONS', color: 'purple' as const },
    { method: 'head', label: 'HEAD', color: 'teal' as const },
    { method: 'patch', label: 'PATCH', color: 'yellow' as const },
    { method: 'trace', label: 'TRACE', color: 'grey' as const },
];

export const PathForm: React.FC = () => {
    const { document, specVersion } = useDocument();
    const { executeCommand } = useCommand();
    const { selectedPath, selectedNode, selectRoot, navigationObject, select } = useSelection();

    // Extract path information early (before hooks)
    const pathItem: OpenApi20PathItem | OpenApi30PathItem | OpenApi31PathItem = navigationObject as OpenApi20PathItem | OpenApi30PathItem | OpenApi31PathItem;
    const pathName = pathItem.mapPropertyName();

    // Track selected operation tab
    const [selectedOperation, setSelectedOperation] = useState<string>('get');

    // Track dropdown open state
    const [isOperationMenuOpen, setIsOperationMenuOpen] = useState(false);
    const [isPathMenuOpen, setIsPathMenuOpen] = useState(false);

    // Sync operation tab when selection changes externally
     
    useEffect(() => {
        if (!selectedPath || !pathItem || !document) return;

        // Get the method from the node path
        const segments = selectedPath.toSegments();

        if (segments[0] === "/paths" && segments.length >= 3) {
            const method = segments[2].substring(1);
            setSelectedOperation(method);
        }
    }, [selectedPath, selectedNode, pathItem, document]);

    /**
     * Check if path has parameter placeholders
     */
    const hasPathParameters = (path: string): boolean => {
        return path.includes('{');
    };

    /**
     * Get parameters filtered by location
     */
    const getParametersByLocation = (location: string): OpenApiParameter[] => {
        const parameters = pathItem?.getParameters();
        if (!parameters || parameters.length === 0) {
            return [];
        }
        return parameters.filter((param: any) => {
            const paramIn = param.getIn?.() || param.in;
            return paramIn === location;
        });
    };

    // Track expandable panel state
    // Path Parameters: expanded if the path has variables
    // Query, Header, Cookie: always collapsed
    const [isPathParametersExpanded, setIsPathParametersExpanded] = useState(() => true);
    const [isQueryParametersExpanded, setIsQueryParametersExpanded] = useState(false);
    const [isHeaderParametersExpanded, setIsHeaderParametersExpanded] = useState(false);
    const [isCookieParametersExpanded, setIsCookieParametersExpanded] = useState(false);

    // Track modal state
    const [isParameterModalOpen, setIsParameterModalOpen] = useState(false);
    const [parameterModalMode, setParameterModalMode] = useState<'create' | 'edit'>('create');
    const [parameterLocation, setParameterLocation] = useState<string>('query');
    const [editingParameter, setEditingParameter] = useState<any | null>(null);

    /**
     * Handle creating a new operation using the command pattern
     */
    const handleCreateOperation = () => {
        if (!selectedPath) return;

        const command = new CreateOperationCommand(pathItem, selectedOperation);
        executeCommand(command, `Create ${selectedOperation.toUpperCase()} operation`);
    };

    /**
     * Handle deleting the selected operation
     */
    const handleDeleteSelectedOperation = () => {
        if (!selectedPath) return;

        // Get the current operation
        const selectedOpGetter = `get${selectedOperation.charAt(0).toUpperCase()}${selectedOperation.slice(1)}`;
        const operation = pathItem ? (pathItem as any)[selectedOpGetter]?.() as OpenApi30Operation | undefined : undefined;

        if (!operation) return;

        const command = new DeleteOperationCommand(pathItem, selectedOperation);
        executeCommand(command, `Delete ${selectedOperation.toUpperCase()} operation`);

        // Switch to 'get' after deletion
        setSelectedOperation('get');
        setIsOperationMenuOpen(false);
    };

    /**
     * Handle deleting all operations
     */
    const handleDeleteAllOperations = () => {
        if (!selectedPath || !pathItem) return;

        // Find all existing operations
        const existingMethods = HTTP_METHODS.filter(({ method }) => {
            const getter = `get${method.charAt(0).toUpperCase()}${method.slice(1)}`;
            return !!(pathItem as any)[getter]?.();
        }).map(m => m.method);

        if (existingMethods.length === 0) return;

        // Create a command for each operation to delete
        const deleteCommands = existingMethods.map(method =>
            new DeleteOperationCommand(pathItem, method)
        );

        // Wrap all delete commands in a composite command
        const compositeCommand = new CompositeCommand(
            deleteCommands,
            `Delete all operations (${existingMethods.length})`
        );

        // Execute the composite command
        compositeCommand.setSelection(NodePathUtil.createNodePath(pathItem));
        executeCommand(compositeCommand, `Delete all operations`);

        // Switch to 'get' after deletion
        setSelectedOperation('get');
        setIsOperationMenuOpen(false);
    };

    /**
     * Handle deleting the path
     */
    const handleDeletePath = () => {
        if (!selectedPath) return;

        const command = new DeletePathCommand(pathName);
        executeCommand(command, `Delete path ${pathName}`);

        // Navigate to root after deletion
        selectRoot();
        setIsPathMenuOpen(false);
    };

    /**
     * Handle opening the create parameter modal
     */
    const handleOpenCreateParameterModal = (location: string) => {
        setParameterModalMode('create');
        setParameterLocation(location);
        setEditingParameter(null);
        setIsParameterModalOpen(true);
    };

    /**
     * Handle closing the parameter modal
     */
    const handleCloseParameterModal = () => {
        setIsParameterModalOpen(false);
        setEditingParameter(null);
    };

    /**
     * Handle confirming parameter (create or edit)
     */
    const handleConfirmParameter = (name: string, description: string, required: boolean, type: string) => {
        if (!pathItem) {
            console.error('Cannot save parameter: no path item selected');
            return;
        }

        if (parameterModalMode === 'create') {
            // Create new parameter
            const command = new AddParameterCommand(
                pathItem,
                name,
                parameterLocation,
                description || null,
                required,
                type
            );

            const locationDisplayName = parameterLocation.charAt(0).toUpperCase() + parameterLocation.slice(1);
            executeCommand(command, `Add ${locationDisplayName} parameter '${name}'`);
        } else {
            // Edit existing parameter
            if (!editingParameter) {
                console.error('Cannot edit parameter: no parameter selected');
                return;
            }

            const commands = [];

            // Create command for description change
            const descriptionCommand = new ChangePropertyCommand(
                editingParameter,
                'description',
                description || null
            );
            commands.push(descriptionCommand);

            // Create command for required change
            const requiredCommand = new ChangePropertyCommand(
                editingParameter,
                'required',
                required
            );
            commands.push(requiredCommand);

            // Create command for type change (on the schema)
            const schema = editingParameter.getSchema?.() || editingParameter.schema;
            if (schema) {
                const typeCommand = new ChangePropertyCommand(
                    schema,
                    'type',
                    type
                );
                commands.push(typeCommand);
            }

            // Bundle all commands into a composite command
            const compositeCommand = new CompositeCommand(
                commands,
                `Edit parameter '${name}'`
            );

            // Execute the composite command
            const locationDisplayName = parameterLocation.charAt(0).toUpperCase() + parameterLocation.slice(1);
            executeCommand(compositeCommand, `Edit ${locationDisplayName} parameter '${name}'`);
        }
    };

    /**
     * Handle editing a parameter
     */
    const handleEditParameter = (parameter: OpenApiParameter, _index: number) => {
        // Fire selection event
        select(parameter);

        // Extract parameter details
        const paramLocation = parameter.getIn?.() || (parameter as any).in;

        // Open modal in edit mode
        setParameterModalMode('edit');
        setParameterLocation(paramLocation);
        setEditingParameter(parameter);
        setIsParameterModalOpen(true);
    };

    /**
     * Handle deleting a parameter
     */
    const handleDeleteParameter = (parameter: OpenApiParameter, _index: number) => {
        if (!pathItem) {
            console.error('Cannot delete parameter: no path item selected');
            return;
        }

        // Extract parameter details
        const paramName = parameter.getName?.() || (parameter as any).name;
        const paramLocation = parameter.getIn?.() || (parameter as any).in;

        if (!paramName || !paramLocation) {
            console.error('Cannot delete parameter: invalid parameter');
            return;
        }

        const command = new DeleteParameterCommand(
            pathItem,
            paramName,
            paramLocation
        );

        const locationDisplayName = paramLocation.charAt(0).toUpperCase() + paramLocation.slice(1);
        executeCommand(command, `Delete ${locationDisplayName} parameter '${paramName}'`);
    };

    // Conditional checks after all hooks
    if (!document || !selectedPath) {
        return <div>No path selected</div>;
    }

    if (!pathItem) {
        return <div>Path not found: {pathName}</div>;
    }

    return (
        <div className="path-form">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <Title headingLevel="h2" size="xl">
                    Path: <PathLabel path={pathName} />
                </Title>
                <Dropdown
                    isOpen={isPathMenuOpen}
                    onOpenChange={setIsPathMenuOpen}
                    popperProps={{ position: 'right' }}
                    toggle={(toggleRef) => (
                        <MenuToggle
                            ref={toggleRef}
                            variant="plain"
                            onClick={() => setIsPathMenuOpen(!isPathMenuOpen)}
                            aria-label="Path menu"
                        >
                            <EllipsisVIcon />
                        </MenuToggle>
                    )}
                >
                    <DropdownList>
                        <DropdownItem
                            key="delete-path"
                            onClick={handleDeletePath}
                        >
                            Delete path
                        </DropdownItem>
                    </DropdownList>
                </Dropdown>
            </div>
            <p style={{ marginBottom: '1rem', color: 'var(--pf-v6-global--Color--200)' }}>
                Edit path metadata and operations
            </p>

            <Divider style={{ marginBottom: '1rem' }} />

            {/* Path metadata form */}
            <Form>
                <PropertyInput
                    model={pathItem}
                    propertyName="summary"
                    label="Summary"
                    placeholder="Short summary of the path"
                />

                <PropertyInput
                    model={pathItem}
                    propertyName="description"
                    label="Description"
                    type="textarea"
                    placeholder="Detailed description of the path"
                />
            </Form>

            <Divider style={{ margin: '1.5rem 0' }} />

            {/* Servers section - only for OpenAPI 3.0 and 3.1 */}
            {specVersion !== '2.0' && (
                <ServersSection parent={pathItem as unknown as Node & OpenApiServersParent} />
            )}

            {hasPathParameters(pathName) && (
                <ParameterSection
                    title="Path Parameters"
                    location="path"
                    isExpanded={isPathParametersExpanded}
                    onToggle={setIsPathParametersExpanded}
                    parameters={getParametersByLocation('path')}
                    onSelectParameter={handleEditParameter}
                    onEditParameter={handleEditParameter}
                />
            )}

            <ParameterSection
                title="Query Parameters"
                location="query"
                isExpanded={isQueryParametersExpanded}
                onToggle={setIsQueryParametersExpanded}
                parameters={getParametersByLocation('query')}
                onAddParameter={() => handleOpenCreateParameterModal('query')}
                onSelectParameter={handleEditParameter}
                onEditParameter={handleEditParameter}
                onDeleteParameter={handleDeleteParameter}
            />

            <ParameterSection
                title="Header Parameters"
                location="header"
                isExpanded={isHeaderParametersExpanded}
                onToggle={setIsHeaderParametersExpanded}
                parameters={getParametersByLocation('header')}
                onAddParameter={() => handleOpenCreateParameterModal('header')}
                onSelectParameter={handleEditParameter}
                onEditParameter={handleEditParameter}
                onDeleteParameter={handleDeleteParameter}
            />

            <ParameterSection
                title="Cookie Parameters"
                location="cookie"
                isExpanded={isCookieParametersExpanded}
                onToggle={setIsCookieParametersExpanded}
                parameters={getParametersByLocation('cookie')}
                onAddParameter={() => handleOpenCreateParameterModal('cookie')}
                onSelectParameter={handleEditParameter}
                onEditParameter={handleEditParameter}
                onDeleteParameter={handleDeleteParameter}
            />

            <VendorExtensionsSection parent={pathItem as unknown as Node & Extensible} />

            <Divider style={{ margin: '1.5rem 0' }} />

            {/* Operation tabs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <Title headingLevel="h3" size="lg">
                    Operations
                </Title>
                <Dropdown
                    isOpen={isOperationMenuOpen}
                    onOpenChange={setIsOperationMenuOpen}
                    popperProps={{ position: 'right' }}
                    toggle={(toggleRef) => (
                        <MenuToggle
                            ref={toggleRef}
                            variant="plain"
                            onClick={() => setIsOperationMenuOpen(!isOperationMenuOpen)}
                            aria-label="Operation menu"
                        >
                            <EllipsisVIcon />
                        </MenuToggle>
                    )}
                >
                    <DropdownList>
                        <DropdownItem
                            key="delete-selected"
                            onClick={handleDeleteSelectedOperation}
                            isDisabled={(() => {
                                const selectedOpGetter = `get${selectedOperation.charAt(0).toUpperCase()}${selectedOperation.slice(1)}`;
                                const operation = pathItem ? (pathItem as any)[selectedOpGetter]?.() : undefined;
                                return !operation;
                            })()}
                        >
                            Delete selected operation
                        </DropdownItem>
                        <DropdownItem
                            key="delete-all"
                            onClick={handleDeleteAllOperations}
                            isDisabled={!HTTP_METHODS.some(({ method }) => {
                                const getter = `get${method.charAt(0).toUpperCase()}${method.slice(1)}`;
                                return !!(pathItem as any)[getter]?.();
                            })}
                        >
                            Delete all operations
                        </DropdownItem>
                    </DropdownList>
                </Dropdown>
            </div>

            <Tabs
                activeKey={selectedOperation}
                onSelect={(_event, tabKey) => {
                    const method = tabKey as string;
                    setSelectedOperation(method);

                    // Fire selection event for the operation
                    const getter = `get${method.charAt(0).toUpperCase()}${method.slice(1)}`;
                    const operation = (pathItem as any)[getter]?.() as OpenApi30Operation | undefined;

                    if (operation) {
                        // Operation exists - select it directly
                        select(operation);
                    } else {
                        // Operation doesn't exist - construct NodePath for where it would be
                        const operationPath = NodePathUtil.createNodePath(pathItem);
                        operationPath.append(new NodePathSegment(method, false));
                        select(operationPath);
                    }
                }}
                aria-label="Operations tabs"
                role="region"
            >
                {HTTP_METHODS.map(({ method, label, color }) => {
                    const getter = `get${method.charAt(0).toUpperCase()}${method.slice(1)}`;
                    const currentOperation = (pathItem as any)[getter]?.() as OpenApi30Operation | undefined;
                    const exists = !!currentOperation;

                    return (
                        <Tab
                            key={method}
                            eventKey={method}
                            title={
                                    <Label color={exists ? color : 'grey'}>
                                        {label}
                                    </Label>
                            }
                        >
                            <OperationForm
                                operation={currentOperation}
                                method={method}
                                label={label}
                                onCreateOperation={handleCreateOperation}
                            />
                        </Tab>
                    );
                })}
            </Tabs>

            <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--pf-v6-global--Color--200)' }}>
                Changes are saved when you press Enter or when a field loses focus. Use Undo/Redo buttons to revert changes.
            </p>

            {/* Parameter Modal (Create/Edit) */}
            <ParameterModal
                isOpen={isParameterModalOpen}
                mode={parameterModalMode}
                parameterLocation={parameterLocation}
                initialName={editingParameter ? (editingParameter.getName?.() || editingParameter.name) : undefined}
                initialDescription={editingParameter ? (editingParameter.getDescription?.() || editingParameter.description || '') : undefined}
                initialRequired={editingParameter ? (editingParameter.getRequired?.() || editingParameter.required || false) : undefined}
                initialType={editingParameter ? (editingParameter.getSchema?.()?.getType?.() || editingParameter.schema?.type || 'string') : undefined}
                onClose={handleCloseParameterModal}
                onConfirm={handleConfirmParameter}
            />
        </div>
    );
};
