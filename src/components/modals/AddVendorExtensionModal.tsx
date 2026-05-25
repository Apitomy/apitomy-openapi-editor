/**
 * Modal dialog for adding a new vendor extension
 */

import React, { useState } from 'react';
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
} from '@patternfly/react-core';

export interface AddVendorExtensionModalProps {
    /**
     * Whether the modal is open
     */
    isOpen: boolean;

    /**
     * Callback when the modal is closed
     */
    onClose: () => void;

    /**
     * Callback when the user confirms creation
     */
    onConfirm: (name: string, value: any) => void;
}

/**
 * Modal for adding a new vendor extension
 */
export const AddVendorExtensionModal: React.FC<AddVendorExtensionModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [name, setName] = useState('');
    const [value, setValue] = useState('');
    const [nameValidated, setNameValidated] = useState<'default' | 'success' | 'error'>('default');
    const [valueValidated, setValueValidated] = useState<'default' | 'success' | 'error'>('default');

    /**
     * Validate the extension name
     */
    const validateName = (value: string): boolean => {
        if (!value) {
            return false;
        }

        // Name must start with x- or X-
        if (!value.toLowerCase().startsWith('x-')) {
            return false;
        }

        // Must have content after x-
        if (value.length <= 2) {
            return false;
        }

        return true;
    };

    /**
     * Try to parse the value as JSON, return parsed value or original string
     */
    const parseValue = (valueStr: string): any => {
        if (!valueStr) {
            return '';
        }

        // If it looks like JSON (starts with { or [), try to parse it
        const trimmed = valueStr.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            try {
                return JSON.parse(trimmed);
            } catch {
                // Return null to indicate parse error
                return null;
            }
        }

        // Try to parse as number or boolean
        if (trimmed === 'true') return true;
        if (trimmed === 'false') return false;
        if (trimmed === 'null') return null;

        // Check if it's a number
        const num = Number(trimmed);
        if (!isNaN(num) && trimmed !== '') {
            return num;
        }

        // Otherwise return as string
        return valueStr;
    };

    /**
     * Validate the value
     */
    const validateValue = (valueStr: string): boolean => {
        const parsed = parseValue(valueStr);
        // null here means JSON parse error
        if (valueStr.trim().startsWith('{') || valueStr.trim().startsWith('[')) {
            return parsed !== null;
        }
        return true;
    };

    /**
     * Handle name change
     */
    const handleNameChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
        setName(value);
        if (value) {
            setNameValidated(validateName(value) ? 'success' : 'error');
        } else {
            setNameValidated('default');
        }
    };

    /**
     * Handle value change
     */
    const handleValueChange = (_event: React.FormEvent<HTMLTextAreaElement>, value: string) => {
        setValue(value);
        if (value) {
            setValueValidated(validateValue(value) ? 'success' : 'error');
        } else {
            setValueValidated('default');
        }
    };

    /**
     * Handle form submission
     */
    const handleConfirm = () => {
        const nameValid = validateName(name);
        const valueValid = validateValue(value);

        if (nameValid && valueValid) {
            const parsedValue = parseValue(value);
            onConfirm(name, parsedValue);
            handleClose();
        } else {
            if (!nameValid) setNameValidated('error');
            if (!valueValid) setValueValidated('error');
        }
    };

    /**
     * Handle modal close
     */
    const handleClose = () => {
        setName('');
        setValue('');
        setNameValidated('default');
        setValueValidated('default');
        onClose();
    };

    /**
     * Handle Enter key press in name field
     */
    const handleNameKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // Move focus to value field
            document.getElementById('extension-value')?.focus();
        }
    };

    const isValid = nameValidated === 'success' && (valueValidated === 'success' || valueValidated === 'default');

    return (
        <Modal
            variant={ModalVariant.small}
            isOpen={isOpen}
            onClose={handleClose}
            aria-labelledby="add-extension-modal-title"
            aria-describedby="add-extension-modal-body"
        >
            <ModalHeader title="Add Vendor Extension" labelId="add-extension-modal-title" />
            <ModalBody id="add-extension-modal-body">
                <Form>
                    <FormGroup label="Extension Name" isRequired fieldId="extension-name">
                        <TextInput
                            isRequired
                            type="text"
                            id="extension-name"
                            name="extension-name"
                            value={name}
                            onChange={handleNameChange}
                            onKeyDown={handleNameKeyDown}
                            validated={nameValidated}
                            placeholder="x-custom-property"
                            autoFocus
                        />
                        <FormHelperText>
                            <HelperText>
                                <HelperTextItem variant={nameValidated}>
                                    {nameValidated === 'error'
                                        ? 'Extension name must start with "x-"'
                                        : 'Enter the extension name (must start with x-)'}
                                </HelperTextItem>
                            </HelperText>
                        </FormHelperText>
                    </FormGroup>

                    <FormGroup label="Value" fieldId="extension-value">
                        <TextArea
                            type="text"
                            id="extension-value"
                            name="extension-value"
                            value={value}
                            onChange={handleValueChange}
                            validated={valueValidated}
                            placeholder='Enter a string, number, boolean, or JSON object/array'
                            resizeOrientation="vertical"
                            rows={4}
                        />
                        <FormHelperText>
                            <HelperText>
                                <HelperTextItem variant={valueValidated}>
                                    {valueValidated === 'error'
                                        ? 'Invalid JSON format'
                                        : 'Enter a value (string, number, boolean, object, or array)'}
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
                <Button key="confirm" variant="primary" onClick={handleConfirm} isDisabled={!isValid}>
                    Add
                </Button>
            </ModalFooter>
        </Modal>
    );
};
