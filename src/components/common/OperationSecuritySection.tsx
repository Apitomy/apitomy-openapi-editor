/**
 * Operation-level security requirements section
 */

import React, { useState } from 'react';
import {
    Button,
    DataList,
    DataListAction,
    DataListCell,
    DataListItem,
    DataListItemCells,
    DataListItemRow,
    Dropdown,
    DropdownItem,
    DropdownList,
    Label,
    MenuToggle
} from '@patternfly/react-core';
import { EllipsisVIcon, PlusIcon } from '@patternfly/react-icons';
import {
    Node,
    NodePathUtil,
    OpenApi30Operation,
    SecurityRequirement
} from '@apitomy/data-models';
import { useCommand } from '@hooks/useCommand';
import { ExpandablePanel } from '@components/common/ExpandablePanel';
import { SecurityRequirementModal, SecurityRequirementData } from '@components/modals/SecurityRequirementModal';
import { AddOperationSecurityRequirementCommand } from '@commands/AddOperationSecurityRequirementCommand';
import { DeleteOperationSecurityRequirementCommand } from '@commands/DeleteOperationSecurityRequirementCommand';
import { CompositeCommand } from '@commands/CompositeCommand';

export interface OperationSecuritySectionProps {
    /**
     * The operation to display/edit security requirements for
     */
    operation: OpenApi30Operation;
}

/**
 * Component for editing operation-level security requirements
 */
export const OperationSecuritySection: React.FC<OperationSecuritySectionProps> = ({ operation }) => {
    const { executeCommand } = useCommand();

    const [isExpanded, setIsExpanded] = useState(false);
    const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
    const [editRequirementData, setEditRequirementData] = useState<SecurityRequirementData | null>(null);
    const [editRequirementIndex, setEditRequirementIndex] = useState<number | undefined>(undefined);
    const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);

    const securityRequirements: SecurityRequirement[] = operation.getSecurity() || [];

    /**
     * Convert a security requirement to SecurityRequirementData for editing
     */
    const convertRequirementToData = (requirement: SecurityRequirement): SecurityRequirementData => {
        const schemes: { [schemeName: string]: string[] } = {};
        const schemeNames = requirement.getItemNames();

        if (schemeNames) {
            schemeNames.forEach(schemeName => {
                const scopes = requirement.getItem(schemeName);
                schemes[schemeName] = scopes ? [...scopes] : [];
            });
        }

        return { schemes };
    };

    /**
     * Get display text for a security requirement
     */
    const getRequirementDisplayText = (requirement: SecurityRequirement): { schemes: string[]; scopes: string[] } => {
        const schemes: string[] = [];
        const scopes: string[] = [];

        const schemeNames = requirement.getItemNames();
        if (schemeNames) {
            schemeNames.forEach(schemeName => {
                const schemeScopes = requirement.getItem(schemeName);
                if (schemeName) {
                    schemes.push(schemeName);
                    if (schemeScopes && schemeScopes.length > 0) {
                        scopes.push(...schemeScopes);
                    }
                }
            });
        }

        return { schemes, scopes };
    };

    /**
     * Handle opening the create requirement modal
     */
    const handleCreateSecurityRequirement = () => {
        setEditRequirementData(null);
        setEditRequirementIndex(undefined);
        setIsRequirementModalOpen(true);
    };

    /**
     * Handle confirming security requirement (add or update)
     */
    const handleConfirmSecurityRequirement = (data: SecurityRequirementData) => {
        if (editRequirementData && editRequirementIndex !== undefined) {
            // Edit mode - delete old and add new at same index
            const deleteCommand = new DeleteOperationSecurityRequirementCommand(
                operation as unknown as Node, editRequirementIndex
            );
            const addCommand = new AddOperationSecurityRequirementCommand(
                operation as unknown as Node, data, editRequirementIndex
            );
            const compositeCommand = new CompositeCommand(
                [deleteCommand, addCommand],
                'Update operation security requirement'
            );
            executeCommand(compositeCommand, 'Update operation security requirement');
        } else {
            // Create mode - add new requirement
            const command = new AddOperationSecurityRequirementCommand(
                operation as unknown as Node, data
            );
            executeCommand(command, 'Add operation security requirement');
        }
    };

    /**
     * Handle editing a security requirement
     */
    const handleEditSecurityRequirement = (index: number) => {
        const requirement = securityRequirements[index];
        if (requirement) {
            const data = convertRequirementToData(requirement);
            setEditRequirementData(data);
            setEditRequirementIndex(index);
            setIsRequirementModalOpen(true);
        }
        setOpenDropdownIndex(null);
    };

    /**
     * Handle deleting a security requirement
     */
    const handleDeleteSecurityRequirement = (index: number) => {
        const command = new DeleteOperationSecurityRequirementCommand(
            operation as unknown as Node, index
        );
        executeCommand(command, 'Delete operation security requirement');
        setOpenDropdownIndex(null);
    };

    return (
        <>
            <ExpandablePanel
                title="Security Requirements"
                isExpanded={isExpanded}
                onToggle={setIsExpanded}
                className="form__section"
                badgeCount={securityRequirements.length}
                actions={
                    <Button
                        variant="plain"
                        icon={<PlusIcon />}
                        onClick={handleCreateSecurityRequirement}
                        aria-label="Add security requirement"
                    />
                }
            >
                <div className="form__sectionbody">
                    {securityRequirements.length === 0 ? (
                        <p style={{ color: 'var(--pf-v6-global--Color--200)', fontStyle: 'italic' }}>
                            No security requirements defined. Use the + icon to create one.
                        </p>
                    ) : (
                        <DataList
                            aria-label="Operation security requirements list"
                            isCompact
                            selectedDataListItemId=""
                        >
                            {securityRequirements.map((requirement, index) => {
                                const { schemes, scopes } = getRequirementDisplayText(requirement);
                                return (
                                    <DataListItem
                                        key={index}
                                        id={`op-requirement-${index}`}
                                        data-path={NodePathUtil.createNodePath(requirement).toString()}
                                        data-selectable="true"
                                    >
                                        <DataListItemRow>
                                            <DataListItemCells
                                                dataListCells={[
                                                    <DataListCell key="schemes">
                                                        <div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                                {schemes.map(schemeName => (
                                                                    <Label key={schemeName} color="blue">
                                                                        {schemeName}
                                                                    </Label>
                                                                ))}
                                                            </div>
                                                            {scopes.length > 0 && (
                                                                <div style={{ fontSize: '0.875rem', color: 'var(--pf-v6-global--Color--200)', marginTop: '0.25rem' }}>
                                                                    Scopes: {scopes.join(', ')}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </DataListCell>
                                                ]}
                                            />
                                            <DataListAction
                                                aria-labelledby={`op-requirement-actions-${index}`}
                                                id={`op-requirement-actions-${index}`}
                                                aria-label="Security requirement actions"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Dropdown
                                                    isOpen={openDropdownIndex === index}
                                                    onSelect={() => setOpenDropdownIndex(null)}
                                                    onOpenChange={(isOpen: boolean) => setOpenDropdownIndex(isOpen ? index : null)}
                                                    popperProps={{ position: 'right' }}
                                                    toggle={(toggleRef) => (
                                                        <MenuToggle
                                                            ref={toggleRef}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenDropdownIndex(openDropdownIndex === index ? null : index);
                                                            }}
                                                            variant="plain"
                                                            aria-label={`Actions for security requirement ${index}`}
                                                        >
                                                            <EllipsisVIcon />
                                                        </MenuToggle>
                                                    )}
                                                >
                                                    <DropdownList>
                                                        <DropdownItem
                                                            key="edit"
                                                            onClick={() => handleEditSecurityRequirement(index)}
                                                        >
                                                            Edit requirement
                                                        </DropdownItem>
                                                        <DropdownItem
                                                            key="delete"
                                                            onClick={() => handleDeleteSecurityRequirement(index)}
                                                        >
                                                            Delete requirement
                                                        </DropdownItem>
                                                    </DropdownList>
                                                </Dropdown>
                                            </DataListAction>
                                        </DataListItemRow>
                                    </DataListItem>
                                );
                            })}
                        </DataList>
                    )}
                </div>
            </ExpandablePanel>

            <SecurityRequirementModal
                isOpen={isRequirementModalOpen}
                onClose={() => {
                    setIsRequirementModalOpen(false);
                    setEditRequirementData(null);
                    setEditRequirementIndex(undefined);
                }}
                onConfirm={handleConfirmSecurityRequirement}
                editData={editRequirementData}
            />
        </>
    );
};
