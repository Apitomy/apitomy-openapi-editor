/**
 * Modal dialog for editing a vendor extension value
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
    TextArea,
    FormHelperText,
    HelperText,
    HelperTextItem,
} from '@patternfly/react-core';

export interface EditVendorExtensionModalProps {
    /**
     * Whether the modal is open
     */
    isOpen: boolean;

    /**
     * The extension name being edited
     */
    extensionName: string;

    /**
     * The current value of the extension
     */
    currentValue: any;

    /**
     * Callback when the modal is closed
     */
    onClose: () => void;

    /**
     * Callback when the user confirms the change
     */
    onConfirm: (name: string, value: any) => void;
}

/**
 * Modal for editing a vendor extension value
 */
export const EditVendorExtensionModal: React.FC<EditVendorExtensionModalProps> = ({
    isOpen,
    extensionName,
    currentValue,
    onClose,
    onConfirm
}) => {
    const [value, setValue] = useState('');
    const [validated, setValidated] = useState<'default' | 'success' | 'error'>('default');

    /**
     * Format the current value for display in textarea
     */
    const formatValue = (val: any): string => {
        if (val === null || val === undefined) {
            return '';
        }
        if (typeof val === 'string') {
            return val;
        }
        return JSON.stringify(val, null, 2);
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
     * Initialize value when modal opens or currentValue changes
     */
    useEffect(() => {
        if (isOpen) {
            const initialValue = formatValue(currentValue);
            setValue(initialValue);
            setValidated(validateValue(initialValue) ? 'success' : 'default');
        }
    }, [isOpen, currentValue]);

    /**
     * Handle value change
     */
    const handleValueChange = (_event: React.FormEvent<HTMLTextAreaElement>, value: string) => {
        setValue(value);
        if (value) {
            setValidated(validateValue(value) ? 'success' : 'error');
        } else {
            setValidated('default');
        }
    };

    /**
     * Handle form submission
     */
    const handleConfirm = () => {
        const valueValid = validateValue(value);

        if (valueValid) {
            const parsedValue = parseValue(value);
            onConfirm(extensionName, parsedValue);
            handleClose();
        } else {
            setValidated('error');
        }
    };

    /**
     * Handle modal close
     */
    const handleClose = () => {
        setValue('');
        setValidated('default');
        onClose();
    };

    const isValid = validated === 'success' || validated === 'default';

    return (
        <Modal
            variant={ModalVariant.small}
            isOpen={isOpen}
            onClose={handleClose}
            aria-labelledby="edit-extension-modal-title"
            aria-describedby="edit-extension-modal-body"
        >
            <ModalHeader title={`Edit ${extensionName}`} labelId="edit-extension-modal-title" />
            <ModalBody id="edit-extension-modal-body">
                <Form>
                    <FormGroup label="Value" fieldId="extension-value">
                        <TextArea
                            type="text"
                            id="extension-value"
                            name="extension-value"
                            value={value}
                            onChange={handleValueChange}
                            validated={validated}
                            placeholder='Enter a string, number, boolean, or JSON object/array'
                            resizeOrientation="vertical"
                            rows={6}
                            autoFocus
                        />
                        <FormHelperText>
                            <HelperText>
                                <HelperTextItem variant={validated}>
                                    {validated === 'error'
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
                    Save
                </Button>
            </ModalFooter>
        </Modal>
    );
};
