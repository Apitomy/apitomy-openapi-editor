/* eslint-disable react-hooks/set-state-in-effect -- modal/form state initialization */
/**
 * Modal dialog for renaming a tag
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
    FormHelperText,
    HelperText,
    HelperTextItem,
} from '@patternfly/react-core';

export interface RenameTagModalProps {
    /**
     * Whether the modal is open
     */
    isOpen: boolean;

    /**
     * The current tag name
     */
    currentName: string;

    /**
     * Callback when the modal is closed
     */
    onClose: () => void;

    /**
     * Callback when the user confirms the rename
     */
    onConfirm: (newName: string) => void;
}

/**
 * Modal for renaming a tag
 */
export const RenameTagModal: React.FC<RenameTagModalProps> = ({ isOpen, currentName, onClose, onConfirm }) => {
    const [tagName, setTagName] = useState('');
    const [validated, setValidated] = useState<'default' | 'success' | 'error'>('default');

     
    useEffect(() => {
        if (isOpen) {
            setTagName(currentName);
            setValidated('default');
        }
    }, [isOpen, currentName]);

    /**
     * Validate the tag name
     */
    const validateTagName = (value: string): boolean => {
        if (!value) {
            return false;
        }

        // Tag name can contain spaces and most characters, but shouldn't be just whitespace
        if (value.trim().length === 0) {
            return false;
        }

        return true;
    };

    /**
     * Handle tag name change
     */
    const handleTagNameChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
        setTagName(value);
        if (value) {
            setValidated(validateTagName(value) ? 'success' : 'error');
        } else {
            setValidated('default');
        }
    };

    /**
     * Handle form submission
     */
    const handleConfirm = () => {
        if (validateTagName(tagName) && tagName !== currentName) {
            onConfirm(tagName);
            handleClose();
        } else if (tagName === currentName) {
            // No change, just close
            handleClose();
        } else {
            setValidated('error');
        }
    };

    /**
     * Handle modal close
     */
    const handleClose = () => {
        setTagName('');
        setValidated('default');
        onClose();
    };

    /**
     * Handle Enter key press in tag name field
     */
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleConfirm();
        }
    };

    return (
        <Modal
            variant={ModalVariant.small}
            isOpen={isOpen}
            onClose={handleClose}
            aria-labelledby="rename-tag-modal-title"
            aria-describedby="rename-tag-modal-body"
            elementToFocus="#tag-name"
        >
            <ModalHeader title="Rename Tag" labelId="rename-tag-modal-title" />
            <ModalBody id="rename-tag-modal-body">
                <Form>
                    <FormGroup label="Tag Name" isRequired fieldId="tag-name">
                        <TextInput
                            isRequired
                            type="text"
                            id="tag-name"
                            name="tag-name"
                            value={tagName}
                            onChange={handleTagNameChange}
                            onKeyDown={handleKeyDown}
                            validated={validated}
                            placeholder="API Users"
                            autoFocus
                        />
                        <FormHelperText>
                            <HelperText>
                                <HelperTextItem variant={validated}>
                                    {validated === 'error'
                                        ? 'Tag name is required'
                                        : 'Enter the new tag name'}
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
                    Rename
                </Button>
            </ModalFooter>
        </Modal>
    );
};
