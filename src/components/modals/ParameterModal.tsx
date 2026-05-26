/* eslint-disable react-hooks/set-state-in-effect -- modal/form state initialization */
/**
 * Modal dialog for creating or editing a parameter (query, header, cookie, path)
 */

import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalVariant,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Form,
    FormGroup,
    TextInput,
    TextArea,
    FormHelperText,
    HelperText,
    HelperTextItem,
    FormSelect,
    FormSelectOption,
    Checkbox,
} from '@patternfly/react-core';

export interface ParameterModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    parameterLocation: string;
    initialName?: string;
    initialDescription?: string;
    initialRequired?: boolean;
    initialType?: string;
    onClose: () => void;
    onConfirm: (name: string, description: string, required: boolean, type: string) => void;
}

/**
 * Get display name for parameter location
 */
const getLocationDisplayName = (location: string): string => {
    const displayNames: Record<string, string> = {
        query: 'Query',
        header: 'Header',
        cookie: 'Cookie',
        path: 'Path',
    };
    return displayNames[location] || location;
};

/**
 * Modal for creating or editing a parameter
 */
export const ParameterModal: React.FC<ParameterModalProps> = ({
    isOpen,
    mode,
    parameterLocation,
    initialName = '',
    initialDescription = '',
    initialRequired = false,
    initialType = 'string',
    onClose,
    onConfirm
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [required, setRequired] = useState(false);
    const [type, setType] = useState('string');
    const [validated, setValidated] = useState<'default' | 'success' | 'error'>('default');

    /**
     * Initialize form fields when modal opens
     */
     
    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit') {
                setName(initialName);
                setDescription(initialDescription);
                setRequired(initialRequired);
                setType(initialType);
                setValidated('success'); // Name is already valid in edit mode
            } else {
                setName('');
                setDescription('');
                // Path parameters are always required
                setRequired(parameterLocation === 'path');
                setType('string');
                setValidated('default');
            }
        }
    }, [isOpen, mode, initialName, initialDescription, initialRequired, initialType, parameterLocation]);

    /**
     * Validate the parameter name
     */
    const validateName = (value: string): boolean => {
        if (!value) {
            return false;
        }

        // Parameter name must not contain spaces
        if (value.includes(' ')) {
            return false;
        }

        // Parameter name should be alphanumeric with underscores/hyphens
        const namePattern = /^[a-zA-Z0-9_-]+$/;
        if (!namePattern.test(value)) {
            return false;
        }

        return true;
    };

    /**
     * Handle name change
     */
    const handleNameChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
        setName(value);
        if (value) {
            setValidated(validateName(value) ? 'success' : 'error');
        } else {
            setValidated('default');
        }
    };

    /**
     * Handle description change
     */
    const handleDescriptionChange = (_event: React.FormEvent<HTMLTextAreaElement>, value: string) => {
        setDescription(value);
    };

    /**
     * Handle required checkbox change
     */
    const handleRequiredChange = (_event: React.FormEvent<HTMLInputElement>, checked: boolean) => {
        setRequired(checked);
    };

    /**
     * Handle type change
     */
    const handleTypeChange = (_event: React.FormEvent<HTMLSelectElement>, value: string) => {
        setType(value);
    };

    /**
     * Handle form submission
     */
    const handleConfirm = () => {
        if (validateName(name)) {
            // Path parameters are always required
            const isRequired = parameterLocation === 'path' ? true : required;
            onConfirm(name, description, isRequired, type);
            handleClose();
        } else {
            setValidated('error');
        }
    };

    /**
     * Handle modal close
     */
    const handleClose = () => {
        setName('');
        setDescription('');
        setRequired(false);
        setType('string');
        setValidated('default');
        onClose();
    };

    /**
     * Handle Enter key press (only in name field, not description)
     */
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleConfirm();
        }
    };

    const locationDisplayName = getLocationDisplayName(parameterLocation);
    const isEditMode = mode === 'edit';
    const modalTitle = isEditMode ? `Edit ${locationDisplayName} Parameter` : `Create ${locationDisplayName} Parameter`;

    return (
        <Modal
            variant={ModalVariant.small}
            isOpen={isOpen}
            onClose={handleClose}
            aria-labelledby="parameter-modal-title"
            aria-describedby="parameter-modal-body"
        >
            <ModalHeader title={modalTitle} labelId="parameter-modal-title" />
            <ModalBody id="parameter-modal-body">
                <Form>
                    <FormGroup label="Name" isRequired fieldId="parameter-name">
                        <TextInput
                            isRequired
                            type="text"
                            id="parameter-name"
                            name="parameter-name"
                            value={name}
                            onChange={handleNameChange}
                            onKeyDown={handleKeyDown}
                            validated={validated}
                            placeholder="limit"
                            autoFocus={!isEditMode}
                            isDisabled={isEditMode}
                        />
                        <FormHelperText>
                            <HelperText>
                                <HelperTextItem variant={validated}>
                                    {isEditMode
                                        ? 'Parameter name cannot be changed (use Rename action to rename)'
                                        : validated === 'error'
                                            ? 'Parameter name must be alphanumeric (underscores and hyphens allowed, no spaces)'
                                            : 'Enter the parameter name (e.g., limit, offset, filter)'}
                                </HelperTextItem>
                            </HelperText>
                        </FormHelperText>
                    </FormGroup>

                    <FormGroup label="Description" fieldId="parameter-description">
                        <TextArea
                            type="text"
                            id="parameter-description"
                            name="parameter-description"
                            value={description}
                            onChange={handleDescriptionChange}
                            placeholder="Describe the purpose of this parameter"
                            rows={3}
                            autoFocus={isEditMode}
                        />
                        <FormHelperText>
                            <HelperText>
                                <HelperTextItem>
                                    Optional description of what this parameter does
                                </HelperTextItem>
                            </HelperText>
                        </FormHelperText>
                    </FormGroup>

                    <FormGroup label="Type" fieldId="parameter-type">
                        <FormSelect
                            id="parameter-type"
                            name="parameter-type"
                            value={type}
                            onChange={handleTypeChange}
                            aria-label="Parameter type"
                        >
                            <FormSelectOption key="string" value="string" label="String" />
                            <FormSelectOption key="integer" value="integer" label="Integer" />
                            <FormSelectOption key="number" value="number" label="Number" />
                            <FormSelectOption key="boolean" value="boolean" label="Boolean" />
                        </FormSelect>
                        <FormHelperText>
                            <HelperText>
                                <HelperTextItem>
                                    Optional. Select the data type for this parameter (defaults to String)
                                </HelperTextItem>
                            </HelperText>
                        </FormHelperText>
                    </FormGroup>

                    <FormGroup fieldId="parameter-required">
                        <Checkbox
                            id="parameter-required"
                            name="parameter-required"
                            label="Required parameter"
                            isChecked={parameterLocation === 'path' ? true : required}
                            isDisabled={parameterLocation === 'path'}
                            onChange={handleRequiredChange}
                        />
                        <FormHelperText>
                            <HelperText>
                                <HelperTextItem>
                                    {parameterLocation === 'path'
                                        ? 'Path parameters are always required'
                                        : 'Check if this parameter must be provided in requests'}
                                </HelperTextItem>
                            </HelperText>
                        </FormHelperText>
                    </FormGroup>
                </Form>
            </ModalBody>
            <ModalFooter>
                <Button key="cancel" variant="link" onClick={handleClose}>
                    Cancel
                </Button>
                <Button key="confirm" variant="primary" onClick={handleConfirm} isDisabled={validated !== 'success'}>
                    {isEditMode ? 'Save' : 'Create'}
                </Button>
            </ModalFooter>
        </Modal>
    );
};
