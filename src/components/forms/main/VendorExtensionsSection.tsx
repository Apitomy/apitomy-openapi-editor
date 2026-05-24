/**
 * Vendor Extensions section for editing vendor extensions (x-* properties)
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
    MenuToggle
} from '@patternfly/react-core';
import { EllipsisVIcon, PlusIcon, TrashIcon } from '@patternfly/react-icons';
import {Extensible, Node, NodePathSegment, NodePathUtil} from '@apitomy/data-models';
import { useCommand } from '@hooks/useCommand';
import { ExpandablePanel } from '@components/common/ExpandablePanel';
import { AddVendorExtensionModal } from '@components/modals/AddVendorExtensionModal';
import { EditVendorExtensionModal } from '@components/modals/EditVendorExtensionModal';
import { AddExtensionCommand } from '@commands/AddExtensionCommand';
import { DeleteExtensionCommand } from '@commands/DeleteExtensionCommand';
import { ChangeExtensionCommand } from '@commands/ChangeExtensionCommand';
import { DeleteAllExtensionsCommand } from '@commands/DeleteAllExtensionsCommand';
import {useSelection} from "@hooks/useSelection.ts";

export interface VendorExtensionsSectionProps {
    /**
     * The parent node that implements Extensible
     */
    parent: Node & Extensible;

    /**
     * Optional title for the section (defaults to "Vendor Extensions")
     */
    title?: string;
}

/**
 * Vendor Extensions section component for editing vendor extensions on any extensible node
 */
export const VendorExtensionsSection: React.FC<VendorExtensionsSectionProps> = ({ parent, title = "Vendor Extensions" }) => {
    const { executeCommand } = useCommand();

    const extensions = parent.getExtensions() || {};
    const extensionNames = Object.keys(extensions);
    const parentNodePath = NodePathUtil.createNodePath(parent);
    const nodePath = NodePathUtil.createNodePath(parent);
    nodePath.append(new NodePathSegment("x-*", false));
    const { select } = useSelection();

    const [isExpanded, setIsExpanded] = useState(() => extensionNames.length > 0);
    const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editExtensionName, setEditExtensionName] = useState<string | null>(null);
    const [editExtensionValue, setEditExtensionValue] = useState<any>(null);

    /**
     * Handle adding a new vendor extension
     */
    const handleAddExtension = () => {
        setIsAddModalOpen(true);
    };

    /**
     * Handle confirming add vendor extension from modal
     */
    const handleConfirmAdd = (name: string, value: any) => {
        const command = new AddExtensionCommand(parent, name, value);
        executeCommand(command, `Add vendor extension "${name}"`);
    };

    /**
     * Handle deleting all vendor extensions
     */
    const handleDeleteAllExtensions = () => {
        const command = new DeleteAllExtensionsCommand(parent);
        executeCommand(command, 'Delete all vendor extensions');
    };

    /**
     * Handle deleting a specific vendor extension
     */
    const handleDeleteExtension = (name: string) => {
        select(parentNodePath, name);
        const command = new DeleteExtensionCommand(parent, name);
        executeCommand(command, `Delete vendor extension "${name}"`);
        setOpenDropdownIndex(null);
    };

    /**
     * Handle opening edit modal for a vendor extension
     */
    const handleOpenEditModal = (name: string) => {
        setEditExtensionName(name);
        setEditExtensionValue(extensions[name]);
        setOpenDropdownIndex(null);
        select(parentNodePath, name);
    };

    /**
     * Handle confirming edit vendor extension from modal
     */
    const handleConfirmEdit = (name: string, value: any) => {
        const command = new ChangeExtensionCommand(parent, name, value);
        executeCommand(command, `Change vendor extension "${name}"`);
    };

    /**
     * Format the extension value for display
     */
    const formatValue = (value: any): string => {
        if (value === null || value === undefined) {
            return '';
        }
        if (typeof value === 'string') {
            return value;
        }
        return JSON.stringify(value);
    };

    return (
        <>
            <ExpandablePanel
                title={title}
                nodePath={nodePath}
                isExpanded={isExpanded}
                onToggle={setIsExpanded}
                className="form__section"
                badgeCount={extensionNames.length}
                actions={
                    <>
                        <Button
                            variant="plain"
                            icon={<PlusIcon />}
                            onClick={handleAddExtension}
                            aria-label="Add vendor extension"
                        />
                        <Button
                            variant="plain"
                            icon={<TrashIcon />}
                            onClick={handleDeleteAllExtensions}
                            isDisabled={extensionNames.length === 0}
                            aria-label="Delete all vendor extensions"
                            isDanger
                        />
                    </>
                }
            >
                <div className="form__sectionbody">
                    {extensionNames.length === 0 ? (
                        <p style={{ color: 'var(--pf-v6-global--Color--200)', fontStyle: 'italic' }}>
                            No vendor extensions defined. Use the + icon to create one.
                        </p>
                    ) : (
                        <DataList
                            aria-label="Vendor extensions list"
                            isCompact
                            selectedDataListItemId=""
                            onSelectableRowChange={(_evt, idx) => {
                                const extensionName = extensionNames[parseInt(idx)];
                                handleOpenEditModal(extensionName);
                            }}
                            onSelectDataListItem={(_evt, idx) => {
                                const extensionName = extensionNames[parseInt(idx)];
                                handleOpenEditModal(extensionName);
                            }}
                        >
                            {extensionNames.map((name: string, index: number) => (
                                <DataListItem
                                    key={index}
                                    id={`${index}`}
                                    data-path={parentNodePath.toString()}
                                    data-property-name={name}
                                    data-selectable="true"
                                >
                                    <DataListItemRow>
                                        <DataListItemCells
                                            dataListCells={[
                                                <DataListCell key="name" width={2}>
                                                    <strong>{name}</strong>
                                                </DataListCell>,
                                                <DataListCell key="value" width={4}>
                                                    <div style={{
                                                        fontSize: '0.875rem',
                                                        color: 'var(--pf-v6-global--Color--200)',
                                                        fontFamily: 'monospace',
                                                        wordBreak: 'break-all'
                                                    }}>
                                                        {formatValue(extensions[name])}
                                                    </div>
                                                </DataListCell>
                                            ]}
                                        />
                                        <DataListAction
                                            aria-labelledby={`extension-actions-${index}`}
                                            id={`extension-actions-${index}`}
                                            aria-label="Extension actions"
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
                                                        aria-label={`Actions for vendor extension ${name}`}
                                                    >
                                                        <EllipsisVIcon />
                                                    </MenuToggle>
                                                )}
                                            >
                                                <DropdownList>
                                                    <DropdownItem
                                                        key="edit"
                                                        onClick={() => handleOpenEditModal(name)}
                                                    >
                                                        Edit extension
                                                    </DropdownItem>
                                                    <DropdownItem
                                                        key="delete"
                                                        onClick={() => handleDeleteExtension(name)}
                                                    >
                                                        Delete extension
                                                    </DropdownItem>
                                                </DropdownList>
                                            </Dropdown>
                                        </DataListAction>
                                    </DataListItemRow>
                                </DataListItem>
                            ))}
                        </DataList>
                    )}
                </div>
            </ExpandablePanel>

            {/* Add Vendor Extension Modal */}
            <AddVendorExtensionModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onConfirm={handleConfirmAdd}
            />

            {/* Edit Vendor Extension Modal */}
            <EditVendorExtensionModal
                isOpen={editExtensionName !== null}
                extensionName={editExtensionName || ''}
                currentValue={editExtensionValue}
                onClose={() => {
                    setEditExtensionName(null);
                    setEditExtensionValue(null);
                }}
                onConfirm={handleConfirmEdit}
            />
        </>
    );
};
