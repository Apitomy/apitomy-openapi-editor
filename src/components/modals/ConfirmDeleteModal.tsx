import React from 'react';
import {
    Modal,
    ModalVariant,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
} from '@patternfly/react-core';

export interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string | React.ReactNode;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message
}) => {
    return (
        <Modal
            variant={ModalVariant.small}
            isOpen={isOpen}
            onClose={onClose}
            aria-labelledby="confirm-delete-modal-title"
            aria-describedby="confirm-delete-modal-body"
        >
            <ModalHeader title={title} labelId="confirm-delete-modal-title" />
            <ModalBody id="confirm-delete-modal-body">
                {message}
            </ModalBody>
            <ModalFooter>
                <Button key="cancel" variant="link" onClick={onClose}>
                    Cancel
                </Button>
                <Button key="confirm" variant="danger" onClick={() => {
                    onConfirm();
                    onClose();
                }}>
                    Delete
                </Button>
            </ModalFooter>
        </Modal>
    );
};
