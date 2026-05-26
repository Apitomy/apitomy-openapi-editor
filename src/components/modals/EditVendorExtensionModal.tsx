     
 
     
/**
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
 * Modal dialog for editing a vendor extension value
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
     * Whether the modal is open
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
     */
     
    isOpen: boolean;
     

     
    /**
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
     * The extension name being edited
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
     */
     
    extensionName: string;
     

     
    /**
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
     * The current value of the extension
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
     */
     
    currentValue: any;
     

     
    /**
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
     * Callback when the modal is closed
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
     */
     
    onClose: () => void;
     

     
    /**
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
     * Callback when the user confirms the change
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
     */
     
    onConfirm: (name: string, value: any) => void;
     
}
     

     
/**
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
 * Modal for editing a vendor extension value
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
     * Format the current value for display in textarea
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
     * Try to parse the value as JSON, return parsed value or original string
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
     * Validate the value
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
     * Initialize value when modal opens or currentValue changes
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
     */
     
     
     
    useEffect(() => {
     
        if (isOpen) {
     
            const initialValue = formatValue(currentValue);
     
            setValue(initialValue);
     
            setValidated(validateValue(initialValue) ? 'success' : 'default');
     
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
    }, [isOpen, currentValue]);
     

     
    /**
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
     * Handle value change
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
     * Handle form submission
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
     * Handle modal close
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
            <ModalHeader title={`Edit ${extensionName}`} labelId="edit-extension-modal-title" />
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
            <ModalBody id="edit-extension-modal-body">
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
                <Form>
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
                    <FormGroup label="Value" fieldId="extension-value">
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
                        <FormHelperText>
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
                            <HelperText>
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
                                <HelperTextItem variant={validated}>
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
                                    {validated === 'error'
     
                                        ? 'Invalid JSON format'
     
                                        : 'Enter a value (string, number, boolean, object, or array)'}
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
                                </HelperTextItem>
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
                            </HelperText>
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
                        </FormHelperText>
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
                    </FormGroup>
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
                </Form>
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
            </ModalBody>
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
            <ModalFooter>
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
                <Button key="cancel" variant="link" onClick={handleClose}>
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
                    Cancel
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
                </Button>
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
                <Button key="confirm" variant="primary" onClick={handleConfirm} isDisabled={!isValid}>
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
                    Save
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
                </Button>
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
            </ModalFooter>
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
        </Modal>
     
    );
     
};
