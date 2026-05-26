/* eslint-disable react-hooks/set-state-in-effect -- modal/form state initialization */
/**
 * Modal for editing the schema of a media type entry
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
} from '@patternfly/react-core';

interface EditMediaTypeSchemaModalProps {
    isOpen: boolean;
    mediaTypeName: string;
    currentSchemaRef: string | null;
    currentSchemaType: string | null;
    availableSchemas: string[];
    onClose: () => void;
    onConfirm: (schemaRef: string | null, schemaType: string | null) => void;
}

const INLINE_TYPES = ['string', 'number', 'integer', 'boolean', 'object', 'array'];

/**
 * Modal component for editing the schema of a media type entry
 */
export const EditMediaTypeSchemaModal: React.FC<EditMediaTypeSchemaModalProps> = ({
    isOpen,
    mediaTypeName,
    currentSchemaRef,
    currentSchemaType,
    availableSchemas,
    onClose,
    onConfirm,
}) => {
    const [mode, setMode] = useState<'ref' | 'inline'>('ref');
    const [selectedRef, setSelectedRef] = useState<string>('');
    const [selectedType, setSelectedType] = useState<string>('object');

    /**
     * Initialize state when modal opens
     */
     
    useEffect(() => {
        if (isOpen) {
            if (currentSchemaRef) {
                setMode('ref');
                setSelectedRef(currentSchemaRef);
                setSelectedType('object');
            } else if (currentSchemaType) {
                setMode('inline');
                setSelectedRef(availableSchemas.length > 0
                    ? `#/components/schemas/${availableSchemas[0]}`
                    : '');
                setSelectedType(currentSchemaType);
            } else {
                setMode('ref');
                setSelectedRef(availableSchemas.length > 0
                    ? `#/components/schemas/${availableSchemas[0]}`
                    : '');
                setSelectedType('object');
            }
        }
    }, [isOpen, currentSchemaRef, currentSchemaType, availableSchemas]);

    /**
     * Handle confirm
     */
    const handleConfirm = () => {
        if (mode === 'ref') {
            onConfirm(selectedRef || null, null);
        } else {
            onConfirm(null, selectedType);
        }
    };

    /**
     * Check if confirm should be disabled
     */
    const isConfirmDisabled = (): boolean => {
        if (mode === 'ref') {
            return !selectedRef;
        }
        return !selectedType;
    };

    return (
        <Modal
            variant="small"
            isOpen={isOpen}
            onClose={onClose}
            aria-labelledby="edit-media-type-schema-modal-title"
        >
            <ModalHeader
                title={`Edit Schema - ${mediaTypeName}`}
                labelId="edit-media-type-schema-modal-title"
            />
            <ModalBody>
                <Form>
                    <FormGroup label="Schema type" fieldId="schema-mode">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <Radio
                                id="schema-mode-ref"
                                name="schema-mode"
                                label="Schema Reference"
                                isChecked={mode === 'ref'}
                                onChange={() => setMode('ref')}
                            />
                            <Radio
                                id="schema-mode-inline"
                                name="schema-mode"
                                label="Inline Type"
                                isChecked={mode === 'inline'}
                                onChange={() => setMode('inline')}
                            />
                        </div>
                    </FormGroup>

                    {mode === 'ref' && (
                        <FormGroup label="Schema reference" fieldId="schema-ref">
                            {availableSchemas.length > 0 ? (
                                <FormSelect
                                    id="schema-ref"
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

                    {mode === 'inline' && (
                        <FormGroup label="Type" fieldId="schema-type">
                            <FormSelect
                                id="schema-type"
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
                </Form>
            </ModalBody>
            <ModalFooter>
                <Button
                    variant="primary"
                    onClick={handleConfirm}
                    isDisabled={isConfirmDisabled()}
                >
                    Save
                </Button>
                <Button variant="link" onClick={onClose}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
};
