/**
 * Modal dialog for editing a server
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
    TextInput,
    FormHelperText,
    HelperText,
    HelperTextItem,
    Tabs,
    Tab,
    TabTitleText,
} from '@patternfly/react-core';
import { ServerUrl } from '@components/common/ServerUrl';
import {ServerVariable} from "@apitomy/data-models";

export interface ServerVariableData {
    variable: ServerVariable;
    name: string;
    default: string;
    description: string;
}

export interface EditServerModalProps {
    /**
     * Whether the modal is open
     */
    isOpen: boolean;

    /**
     * The server URL
     */
    serverUrl: string;

    /**
     * The current server description
     */
    currentDescription: string;

    /**
     * Server variables
     */
    variables: ServerVariableData[];

    /**
     * Callback when the modal is closed
     */
    onClose: () => void;

    /**
     * Callback when the user confirms changes
     */
    onConfirm: (description: string, variables: ServerVariableData[]) => void;
}

/**
 * Modal for editing a server
 */
export const EditServerModal: React.FC<EditServerModalProps> = ({
    isOpen,
    serverUrl,
    currentDescription,
    variables,
    onClose,
    onConfirm
}) => {
    const [description, setDescription] = useState('');
    const [editedVariables, setEditedVariables] = useState<ServerVariableData[]>([]);
    const [activeTabKey, setActiveTabKey] = useState<string | number>(0);

    /**
     * Update state when modal opens or props change
     */
    useEffect(() => {
        if (isOpen) {
            setDescription(currentDescription || '');
            setEditedVariables(variables.map(v => ({ ...v })));
            setActiveTabKey(0);
        }
    }, [isOpen, currentDescription, variables]);

    /**
     * Handle description change
     */
    const handleDescriptionChange = (_event: React.FormEvent<HTMLTextAreaElement>, value: string) => {
        setDescription(value);
    };

    /**
     * Handle variable default value change
     */
    const handleVariableDefaultChange = (index: number, value: string) => {
        const updated = [...editedVariables];
        updated[index].default = value;
        setEditedVariables(updated);
    };

    /**
     * Handle variable description change
     */
    const handleVariableDescriptionChange = (index: number, value: string) => {
        const updated = [...editedVariables];
        updated[index].description = value;
        setEditedVariables(updated);
    };

    /**
     * Handle form submission
     */
    const handleConfirm = () => {
        onConfirm(description, editedVariables);
        handleClose();
    };

    /**
     * Handle modal close
     */
    const handleClose = () => {
        setDescription('');
        setEditedVariables([]);
        onClose();
    };

    return (
        <Modal
            variant={ModalVariant.medium}
            isOpen={isOpen}
            onClose={handleClose}
            aria-labelledby="edit-server-modal-title"
            aria-describedby="edit-server-modal-body"
        >
            <ModalHeader title="Edit Server" labelId="edit-server-modal-title" />
            <ModalBody id="edit-server-modal-body">
                <Form>
                    <FormGroup label="Server URL" fieldId="server-url">
                        <div style={{ padding: '0.5rem 0', fontWeight: 'bold' }}>
                            <ServerUrl url={serverUrl} />
                        </div>
                        <FormHelperText>
                            <HelperText>
                                <HelperTextItem>
                                    The server URL cannot be changed
                                </HelperTextItem>
                            </HelperText>
                        </FormHelperText>
                    </FormGroup>

                    <FormGroup label="Description" fieldId="server-description">
                        <TextArea
                            type="text"
                            id="server-description"
                            name="server-description"
                            value={description}
                            onChange={handleDescriptionChange}
                            placeholder="Production server"
                            resizeOrientation="vertical"
                            rows={4}
                        />
                        <FormHelperText>
                            <HelperText>
                                <HelperTextItem>
                                    Optional description for the server
                                </HelperTextItem>
                            </HelperText>
                        </FormHelperText>
                    </FormGroup>

                    {editedVariables.length > 0 && (
                        <FormGroup label="Server Variables" fieldId="server-variables">
                            <Tabs
                                activeKey={activeTabKey}
                                onSelect={(_event, tabIndex) => setActiveTabKey(tabIndex)}
                                aria-label="Server variables tabs"
                            >
                                {editedVariables.map((variable, index) => (
                                    <Tab
                                        key={index}
                                        eventKey={index}
                                        title={<TabTitleText>{variable.name}</TabTitleText>}
                                    >
                                        <div style={{ padding: '1rem 0' }}>
                                            <FormGroup
                                                label="Default Value"
                                                isRequired
                                                fieldId={`variable-default-${index}`}
                                            >
                                                <TextInput
                                                    isRequired
                                                    type="text"
                                                    id={`variable-default-${index}`}
                                                    name={`variable-default-${index}`}
                                                    value={variable.default}
                                                    onChange={(_event, value) =>
                                                        handleVariableDefaultChange(index, value)
                                                    }
                                                    placeholder={`Default value for ${variable.name}`}
                                                />
                                                <FormHelperText>
                                                    <HelperText>
                                                        <HelperTextItem>
                                                            The default value for the {variable.name} variable
                                                        </HelperTextItem>
                                                    </HelperText>
                                                </FormHelperText>
                                            </FormGroup>

                                            <FormGroup
                                                label="Description"
                                                fieldId={`variable-description-${index}`}
                                            >
                                                <TextArea
                                                    type="text"
                                                    id={`variable-description-${index}`}
                                                    name={`variable-description-${index}`}
                                                    value={variable.description || ''}
                                                    onChange={(_event, value) =>
                                                        handleVariableDescriptionChange(index, value)
                                                    }
                                                    placeholder={`Description for ${variable.name}`}
                                                    resizeOrientation="vertical"
                                                    rows={3}
                                                />
                                                <FormHelperText>
                                                    <HelperText>
                                                        <HelperTextItem>
                                                            Optional description for the {variable.name} variable
                                                        </HelperTextItem>
                                                    </HelperText>
                                                </FormHelperText>
                                            </FormGroup>
                                        </div>
                                    </Tab>
                                ))}
                            </Tabs>
                        </FormGroup>
                    )}
                </Form>
            </ModalBody>
            <ModalFooter>
                <Button key="cancel" variant="link" onClick={handleClose}>
                    Cancel
                </Button>
                <Button key="confirm" variant="primary" onClick={handleConfirm}>
                    Save
                </Button>
            </ModalFooter>
        </Modal>
    );
};
