 
/**
 * Modal for creating or editing a security requirement
 */

import React, { useState, useEffect } from 'react';
import {
    Button,
    Checkbox,
    Form,
    FormGroup,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    TextInput
} from '@patternfly/react-core';
import { useDocument } from '@hooks/useDocument';
import {
    OpenApi20Document,
    OpenApi30Document,
    OpenApi31Document,
    OpenApiDocument,
    SecurityScheme
} from '@apitomy/data-models';

interface SecurityRequirementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: SecurityRequirementData) => void;
    editData?: SecurityRequirementData | null;
}

export interface SecurityRequirementData {
    schemes: { [schemeName: string]: string[] };
}

interface SchemeSelection {
    name: string;
    selected: boolean;
    scopes: string;
    supportsScopes: boolean;
}

/**
 * Modal component for creating or editing a security requirement
 */
export const SecurityRequirementModal: React.FC<SecurityRequirementModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    editData
}) => {
    const { document, specVersion } = useDocument();
    const isEditMode = !!editData;

    const [schemeSelections, setSchemeSelections] = useState<SchemeSelection[]>([]);

    /**
     * Get security schemes from the document
     */
    const getSecuritySchemes = (): { name: string; scheme: SecurityScheme }[] => {
        if (!document) return [];

        const oaiDoc = document as OpenApiDocument;

        if (specVersion === '2.0') {
            const definitions = (oaiDoc as OpenApi20Document).getSecurityDefinitions();
            if (!definitions) return [];
            const names = definitions.getItemNames();
            return names.map(name => ({
                name,
                scheme: definitions.getItem(name)
            }));
        } else {
            const components = (oaiDoc as OpenApi30Document | OpenApi31Document).getComponents();
            if (!components) return [];
            const schemes = components.getSecuritySchemes();
            if (!schemes) return [];
            return Object.keys(schemes).map(name => ({
                name,
                scheme: schemes[name]
            }));
        }
    };

    /**
     * Check if a security scheme type supports scopes
     */
    const supportsScopes = (scheme: SecurityScheme): boolean => {
        const type = scheme.getType();
        return type === 'oauth2' || type === 'openIdConnect';
    };

    /**
     * Initialize scheme selections when modal opens
     */
    useEffect(() => {
        if (isOpen) {
            const schemes = getSecuritySchemes();
            const selections: SchemeSelection[] = schemes.map(({ name, scheme }) => {
                const selected = editData ? name in editData.schemes : false;
                const scopesArray = editData && editData.schemes[name] ? editData.schemes[name] : [];
                return {
                    name,
                    selected,
                    scopes: scopesArray.join(', '),
                    supportsScopes: supportsScopes(scheme)
                };
            });
            setSchemeSelections(selections);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-sync on modal open
    }, [isOpen, editData]);

    /**
     * Handle checkbox change for scheme selection
     */
    const handleSchemeToggle = (index: number, checked: boolean) => {
        setSchemeSelections(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], selected: checked };
            return updated;
        });
    };

    /**
     * Handle scopes input change
     */
    const handleScopesChange = (index: number, value: string) => {
        setSchemeSelections(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], scopes: value };
            return updated;
        });
    };

    /**
     * Reset modal state
     */
    const resetState = () => {
        setSchemeSelections([]);
    };

    /**
     * Handle modal close
     */
    const handleClose = () => {
        resetState();
        onClose();
    };

    /**
     * Handle confirm
     */
    const handleConfirm = () => {
        const data: SecurityRequirementData = {
            schemes: {}
        };

        schemeSelections.forEach(selection => {
            if (selection.selected) {
                const scopesArray = selection.scopes
                    .split(',')
                    .map(s => s.trim())
                    .filter(s => s.length > 0);
                data.schemes[selection.name] = scopesArray;
            }
        });

        onConfirm(data);
        handleClose();
    };

    /**
     * Check if form is valid
     */
    const isFormValid = (): boolean => {
        return schemeSelections.some(s => s.selected);
    };

    if (!document) {
        return null;
    }

    return (
        <Modal
            variant="medium"
            isOpen={isOpen}
            onClose={handleClose}
            aria-labelledby="security-requirement-modal-title"
        >
            <ModalHeader
                title={isEditMode ? "Edit Security Requirement" : "Add Security Requirement"}
                labelId="security-requirement-modal-title"
            />
            <ModalBody>
                {schemeSelections.length === 0 ? (
                    <p style={{ color: 'var(--pf-v6-global--Color--200)', fontStyle: 'italic' }}>
                        No security schemes defined. Please add security schemes first.
                    </p>
                ) : (
                    <Form>
                        <FormGroup label="Select security schemes to require:" fieldId="scheme-selections">
                            {schemeSelections.map((selection, index) => (
                                <div key={selection.name} style={{ marginBottom: '1rem' }}>
                                    <Checkbox
                                        id={`scheme-${index}`}
                                        label={selection.name}
                                        isChecked={selection.selected}
                                        onChange={(_event, checked) => handleSchemeToggle(index, checked)}
                                    />
                                    {selection.selected && selection.supportsScopes && (
                                        <div style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
                                            <FormGroup
                                                label="Scopes (comma-separated)"
                                                fieldId={`scopes-${index}`}
                                            >
                                                <TextInput
                                                    id={`scopes-${index}`}
                                                    value={selection.scopes}
                                                    onChange={(_event, value) => handleScopesChange(index, value)}
                                                    placeholder="e.g., read:pets, write:pets"
                                                />
                                            </FormGroup>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </FormGroup>
                    </Form>
                )}
            </ModalBody>
            <ModalFooter>
                <Button
                    variant="primary"
                    onClick={handleConfirm}
                    isDisabled={!isFormValid()}
                >
                    {isEditMode ? "Save" : "Add"}
                </Button>
                <Button variant="link" onClick={handleClose}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
};
