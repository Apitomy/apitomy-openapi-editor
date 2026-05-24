/**
 * Operation form for editing operation metadata
 */

import React, { useState } from 'react';
import {
    Button,
    Divider,
    EmptyState,
    EmptyStateActions,
    EmptyStateBody,
    EmptyStateFooter,
    Form
} from '@patternfly/react-core';
import { OpenApi30Operation, OpenApiParameter } from '@apitomy/data-models';
import { PropertyInput } from '@components/common/PropertyInput';
import { ParameterSection } from '@components/common/ParameterSection';
import { RequestBodySection } from '@components/common/RequestBodySection';
import { ResponsesSection } from '@components/common/ResponsesSection';
import { OperationSecuritySection } from '@components/common/OperationSecuritySection';
import { ParameterModal } from '@components/modals/ParameterModal';
import { useCommand } from '@hooks/useCommand';
import { useSelection } from '@hooks/useSelection';
import { useDocument } from '@hooks/useDocument';
import { AddParameterCommand } from '@commands/AddParameterCommand';
import { DeleteParameterCommand } from '@commands/DeleteParameterCommand';
import { ChangePropertyCommand } from '@commands/ChangePropertyCommand';
import { CompositeCommand } from '@commands/CompositeCommand';

export interface OperationFormProps {
    /**
     * The operation to edit (null/undefined if it doesn't exist)
     */
    operation: OpenApi30Operation | undefined;

    /**
     * The HTTP method (get, post, put, etc.)
     */
    method: string;

    /**
     * The display label for the method (GET, POST, PUT, etc.)
     */
    label: string;

    /**
     * Callback when the user wants to create a new operation
     */
    onCreateOperation: () => void;
}

/**
 * Form component for editing an operation's metadata
 */
export const OperationForm: React.FC<OperationFormProps> = ({
    operation,
    method,
    label,
    onCreateOperation
}) => {
    const { executeCommand } = useCommand();
    const { select } = useSelection();
    const { specVersion } = useDocument();

    // Track expandable panel state
    const [isPathParametersExpanded, setIsPathParametersExpanded] = useState(false);
    const [isQueryParametersExpanded, setIsQueryParametersExpanded] = useState(false);
    const [isHeaderParametersExpanded, setIsHeaderParametersExpanded] = useState(false);
    const [isCookieParametersExpanded, setIsCookieParametersExpanded] = useState(false);

    // Track modal state
    const [isParameterModalOpen, setIsParameterModalOpen] = useState(false);
    const [parameterModalMode, setParameterModalMode] = useState<'create' | 'edit'>('create');
    const [parameterLocation, setParameterLocation] = useState<string>('query');
    const [editingParameter, setEditingParameter] = useState<any | null>(null);

    /**
     * Get parameters filtered by location
     */
    const getParametersByLocation = (location: string): OpenApiParameter[] => {
        if (!operation) {
            return [];
        }
        const parameters = operation.getParameters();
        if (!parameters || parameters.length === 0) {
            return [];
        }
        return parameters.filter((param: any) => {
            const paramIn = param.getIn?.() || param.in;
            return paramIn === location;
        });
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
        if (!operation) {
            console.error('Cannot save parameter: no operation selected');
            return;
        }

        if (parameterModalMode === 'create') {
            // Create new parameter
            const command = new AddParameterCommand(
                operation,
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
        if (!operation) {
            console.error('Cannot delete parameter: no operation selected');
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
            operation,
            paramName,
            paramLocation
        );

        const locationDisplayName = paramLocation.charAt(0).toUpperCase() + paramLocation.slice(1);
        executeCommand(command, `Delete ${locationDisplayName} parameter '${paramName}'`);
    };

    if (operation) {
        return (
            <div style={{ paddingTop: '1rem', paddingLeft: '20px', paddingRight: '20px' }}>
                <Form>
                    <PropertyInput
                        model={operation}
                        propertyName="summary"
                        label="Summary"
                        placeholder="Short summary of the operation"
                    />

                    <PropertyInput
                        model={operation}
                        propertyName="operationId"
                        label="Operation ID"
                        placeholder="Unique operation identifier"
                    />

                    <PropertyInput
                        model={operation}
                        propertyName="description"
                        label="Description"
                        type="textarea"
                        placeholder="Detailed description of the operation"
                    />
                </Form>

                <Divider style={{ margin: '1.5rem 0' }} />

                <ParameterSection
                    title="Path Parameters"
                    location="path"
                    isExpanded={isPathParametersExpanded}
                    onToggle={setIsPathParametersExpanded}
                    parameters={getParametersByLocation('path')}
                    onSelectParameter={handleEditParameter}
                    onEditParameter={handleEditParameter}
                />

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

                {specVersion !== '2.0' && operation && (
                    <RequestBodySection operation={operation} method={method} />
                )}

                {operation && (
                    <ResponsesSection operation={operation} />
                )}

                {operation && (
                    <OperationSecuritySection operation={operation} />
                )}

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
    }

    return (
        <div style={{ paddingTop: '1rem' }}>
            <EmptyState>
                <EmptyStateBody>
                    No {label} operation defined
                </EmptyStateBody>
                <EmptyStateFooter>
                    <EmptyStateActions>
                        <Button variant="primary" onClick={onCreateOperation}>
                            Create {label} operation
                        </Button>
                    </EmptyStateActions>
                </EmptyStateFooter>
            </EmptyState>
        </div>
    );
};
