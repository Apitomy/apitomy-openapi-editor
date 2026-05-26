/* eslint-disable react-hooks/set-state-in-effect -- modal/form state initialization */
/**
 * Modal for adding or editing a response header
 */

import React, { useState, useEffect } from 'react';
import {
    Button,
    Form,
    FormGroup,
    FormSelect,
    FormSelectOption,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Radio,
    TextInput
} from '@patternfly/react-core';

interface AddResponseHeaderModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    onClose: () => void;
    onConfirm: (name: string, description: string, schemaRef: string | null, schemaType: string | null) => void;
    existingHeaders: string[];
    availableSchemas: string[];
    initialName?: string;
    initialDescription?: string;
    initialSchemaRef?: string | null;
    initialSchemaType?: string | null;
}

const INLINE_TYPES = ['string', 'number', 'integer', 'boolean', 'object', 'array'];

/**
 * Modal component for adding or editing a response header
 */
export const AddResponseHeaderModal: React.FC<AddResponseHeaderModalProps> = ({
    isOpen,
    mode,
    onClose,
    onConfirm,
    existingHeaders,
    availableSchemas,
    initialName,
    initialDescription,
    initialSchemaRef,
    initialSchemaType,
}) => {
    const [headerName, setHeaderName] = useState('');
    const [description, setDescription] = useState('');
    const [schemaMode, setSchemaMode] = useState<'type' | 'ref'>('type');
    const [selectedType, setSelectedType] = useState<string>('string');
    const [selectedRef, setSelectedRef] = useState<string>('');

    /**
     * Initialize state when modal opens
     */
     
    useEffect(() => {
        if (isOpen) {
            setHeaderName(initialName || '');
            setDescription(initialDescription || '');
            if (initialSchemaRef) {
                setSchemaMode('ref');
                setSelectedRef(initialSchemaRef);
                setSelectedType('string');
            } else if (initialSchemaType) {
                setSchemaMode('type');
                setSelectedType(initialSchemaType);
                setSelectedRef(availableSchemas.length > 0
                    ? `#/components/schemas/${availableSchemas[0]}`
                    : '');
            } else {
                setSchemaMode('type');
                setSelectedType('string');
                setSelectedRef(availableSchemas.length > 0
                    ? `#/components/schemas/${availableSchemas[0]}`
                    : '');
            }
        }
    }, [isOpen, initialName, initialDescription, initialSchemaRef, initialSchemaType, availableSchemas]);

    /**
     * Handle confirm
     */
    const handleConfirm = () => {
        const name = headerName.trim();
        if (!name) {
            return;
        }
        if (schemaMode === 'ref') {
            onConfirm(name, description, selectedRef || null, null);
        } else {
            onConfirm(name, description, null, selectedType || null);
        }
    };

    /**
     * Check if confirm should be disabled
     */
    const isConfirmDisabled = (): boolean => {
        const name = headerName.trim();
        if (!name) {
            return true;
        }
        // In create mode, don't allow duplicate header names
        if (mode === 'create' && existingHeaders.includes(name)) {
            return true;
        }
        return false;
    };

    const title = mode === 'create' ? 'Add Response Header' : 'Edit Response Header';

    return (
        <Modal
            variant="small"
            isOpen={isOpen}
            onClose={onClose}
            aria-labelledby="add-response-header-modal-title"
        >
            <ModalHeader
                title={title}
                labelId="add-response-header-modal-title"
            />
            <ModalBody>
                <Form>
                    <FormGroup label="Header name" fieldId="header-name" isRequired>
                        <TextInput
                            id="header-name"
                            placeholder="e.g., X-Rate-Limit"
                            value={headerName}
                            onChange={(_event, value) => setHeaderName(value)}
                            isDisabled={mode === 'edit'}
                            isRequired
                        />
                    </FormGroup>

                    <FormGroup label="Description" fieldId="header-description">
                        <TextInput
                            id="header-description"
                            placeholder="Header description"
                            value={description}
                            onChange={(_event, value) => setDescription(value)}
                        />
                    </FormGroup>

                    <FormGroup label="Schema" fieldId="header-schema-mode">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <Radio
                                id="header-schema-mode-type"
                                name="header-schema-mode"
                                label="Inline Type"
                                isChecked={schemaMode === 'type'}
                                onChange={() => setSchemaMode('type')}
                            />
                            <Radio
                                id="header-schema-mode-ref"
                                name="header-schema-mode"
                                label="Schema Reference"
                                isChecked={schemaMode === 'ref'}
                                onChange={() => setSchemaMode('ref')}
                            />
                        </div>
                    </FormGroup>

                    {schemaMode === 'type' && (
                        <FormGroup label="Type" fieldId="header-schema-type">
                            <FormSelect
                                id="header-schema-type"
                                value={selectedType}
                                onChange={(_event, value) => setSelectedType(value)}
                            >
                                {INLINE_TYPES.map((t) => (
                                    <FormSelectOption
                                        key={t}
                                        value={t}
                                        label={t}
                                    />
                                ))}
                            </FormSelect>
                        </FormGroup>
                    )}

                    {schemaMode === 'ref' && (
                        <FormGroup label="Schema reference" fieldId="header-schema-ref">
                            {availableSchemas.length > 0 ? (
                                <FormSelect
                                    id="header-schema-ref"
                                    value={selectedRef}
                                    onChange={(_event, value) => setSelectedRef(value)}
                                >
                                    {availableSchemas.map((name) => {
                                        const refValue = `#/components/schemas/${name}`;
                                        return (
                                            <FormSelectOption
                                                key={name}
                                                value={refValue}
                                                label={refValue}
                                            />
                                        );
                                    })}
                                </FormSelect>
                            ) : (
                                <p style={{
                                    color: 'var(--pf-v6-global--Color--200)',
                                    fontStyle: 'italic'
                                }}>
                                    No schemas defined. Add schemas in the Schemas section first.
                                </p>
                            )}
                        </FormGroup>
                    )}
                </Form>
            </ModalBody>
            <ModalFooter>
                <Button
                    variant="primary"
                    onClick={handleConfirm}
                    isDisabled={isConfirmDisabled()}
                >
                    {mode === 'create' ? 'Add' : 'Save'}
                </Button>
                <Button variant="link" onClick={onClose}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
};
