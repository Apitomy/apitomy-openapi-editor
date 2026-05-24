/**
 * Component for editing arrays of MIME types with common presets and custom input
 */

import React, { useState } from 'react';
import {
    Label,
    LabelGroup,
    FormGroup,
    Button
} from '@patternfly/react-core';
import { PlusIcon } from '@patternfly/react-icons';
import { AddMimeTypeModal } from '@components/modals/AddMimeTypeModal';
import {NodePath} from "@apitomy/data-models";
import {useSelection} from "@hooks/useSelection.ts";

interface MimeTypeArrayInputProps {
    label: string;
    value: string[];
    onChange: (newValue: string[]) => void;
    fieldId: string;
    propertyName: string;
    nodePath?: NodePath | null;
}

/**
 * Component for editing MIME type arrays
 */
export const MimeTypeArrayInput: React.FC<MimeTypeArrayInputProps> = ({
    label,
    value,
    onChange,
    nodePath,
    propertyName,
    fieldId
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { select } = useSelection();

    const currentMimeTypes = value || [];

    /**
     * Handle removing a MIME type
     */
    const handleRemoveType = (mimeType: string) => {
        if (nodePath) {
            select(nodePath, propertyName);
        }
        const newMimeTypes = currentMimeTypes.filter(mt => mt !== mimeType);
        onChange(newMimeTypes);
    };

    /**
     * Handle adding a MIME type from modal
     */
    const handleAddMimeType = (mimeType: string) => {
        if (!currentMimeTypes.includes(mimeType)) {
            const newMimeTypes = [...currentMimeTypes, mimeType];
            onChange(newMimeTypes);
        }
    };

    return (
        <>
            <FormGroup
                label={label}
                fieldId={fieldId}
                data-path={nodePath?.toString()}
                data-property-name={propertyName}
                data-selectable="true"
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {currentMimeTypes.length > 0 ? (
                        <LabelGroup style={{ flex: 1 }}>
                            {currentMimeTypes.map((mimeType) => (
                                <Label
                                    key={mimeType}
                                    color="blue"
                                    onClose={() => handleRemoveType(mimeType)}
                                >
                                    {mimeType}
                                </Label>
                            ))}
                        </LabelGroup>
                    ) : (
                        <div style={{
                            flex: 1,
                            color: 'var(--pf-v6-global--Color--200)',
                            fontStyle: 'italic',
                            fontSize: '0.875rem'
                        }}>
                            No MIME types configured
                        </div>
                    )}
                    <Button
                        variant="plain"
                        icon={<PlusIcon />}
                        onClick={() => {
                            if (nodePath) {
                                select(nodePath, propertyName);
                            }
                            setIsModalOpen(true);
                        }}
                        aria-label={`Add ${label.toLowerCase()}`}
                    >
                        Add
                    </Button>
                </div>
            </FormGroup>

            <AddMimeTypeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleAddMimeType}
                existingMimeTypes={currentMimeTypes}
            />
        </>
    );
};
