/**
 * Tags section for editing tag definitions
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
import { EllipsisVIcon, PlusIcon, TagIcon, TrashIcon } from '@patternfly/react-icons';
import {NodePathUtil, OpenApiDocument, Tag} from '@apitomy/data-models';
import { useDocument } from '@hooks/useDocument';
import { useCommand } from '@hooks/useCommand';
import { useSelection } from '@hooks/useSelection';
import { ExpandablePanel } from '@components/common/ExpandablePanel';
import { NewTagModal } from '@components/modals/NewTagModal';
import { RenameTagModal } from '@components/modals/RenameTagModal';
import { EditTagDescriptionModal } from '@components/modals/EditTagDescriptionModal';
import { AddTagCommand } from '@commands/AddTagCommand';
import { DeleteAllTagsCommand } from '@commands/DeleteAllTagsCommand';
import { DeleteTagCommand } from '@commands/DeleteTagCommand';
import { RenameTagCommand } from '@commands/RenameTagCommand';
import { ChangePropertyCommand } from '@commands/ChangePropertyCommand';

/**
 * Tags section component for editing tag definitions
 */
export const TagsSection: React.FC = () => {
    const { document } = useDocument();
    const { executeCommand } = useCommand();
    const { select } = useSelection();

    if (!document) {
        return null;
    }

    const oaiDoc = document as OpenApiDocument;
    const tags = oaiDoc.getTags() || [];

    const [isExpanded, setIsExpanded] = useState(true);
    const [isNewTagModalOpen, setIsNewTagModalOpen] = useState(false);
    const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
    const [renameTagName, setRenameTagName] = useState<string | null>(null);
    const [editTagName, setEditTagName] = useState<string | null>(null);
    const [editTagDescription, setEditTagDescription] = useState<string>('');

    /**
     * Handle creating a new tag
     */
    const handleCreateTag = (tagName: string, tagDescription: string) => {
        const command = new AddTagCommand(tagName, tagDescription);
        executeCommand(command, `Add tag "${tagName}"`);
    };

    /**
     * Handle deleting all tags
     */
    const handleDeleteAllTags = () => {
        const command = new DeleteAllTagsCommand();
        executeCommand(command, 'Delete all tags');
    };

    /**
     * Handle deleting a specific tag
     */
    const handleDeleteTag = (tagName: string) => {
        const command = new DeleteTagCommand(tagName);
        executeCommand(command, `Delete tag "${tagName}"`);
        setOpenDropdownIndex(null);
    };

    /**
     * Handle opening rename modal for a tag
     */
    const handleOpenRenameModal = (tagName: string) => {
        setRenameTagName(tagName);
        setOpenDropdownIndex(null);
    };

    /**
     * Handle renaming a tag
     */
    const handleRenameTag = (newName: string) => {
        if (renameTagName) {
            const command = new RenameTagCommand(renameTagName, newName);
            executeCommand(command, `Rename tag "${renameTagName}" to "${newName}"`);
        }
    };

    /**
     * Handle opening edit description modal for a tag
     */
    const handleOpenEditDescriptionModal = (tagIndex: string) => {
        const tag = oaiDoc.getTags()[parseInt(tagIndex)];
        // Fire selection event
        select(tag);
        setEditTagName(tag.getName());
        setEditTagDescription(tag.getDescription() || '');
    };

    /**
     * Handle changing tag description
     */
    const handleChangeTagDescription = (newDescription: string) => {
        if (editTagName) {
            // Find the tag node
            const tag = tags.find((t: Tag) => t.getName() === editTagName);
            if (tag) {
                const command = new ChangePropertyCommand(tag, 'description', newDescription);
                executeCommand(command, `Change description for tag "${editTagName}"`);
            }
        }
        setEditTagName(null);
        setEditTagDescription('');
    };

    return (
        <>
            <ExpandablePanel
                title="Tag Definitions"
                nodePath="/tags"
                isExpanded={isExpanded}
                onToggle={setIsExpanded}
                className="form__section"
                badgeCount={tags.length}
                actions={
                    <>
                        <Button
                            variant="plain"
                            icon={<PlusIcon />}
                            onClick={() => setIsNewTagModalOpen(true)}
                            aria-label="Add tag"
                        />
                        <Button
                            variant="plain"
                            icon={<TrashIcon />}
                            onClick={handleDeleteAllTags}
                            isDisabled={tags.length === 0}
                            aria-label="Delete all tags"
                            isDanger
                        />
                    </>
                }
            >
                <div className="form__sectionbody">
                    {tags.length === 0 ? (
                        <p style={{ color: 'var(--pf-v6-global--Color--200)', fontStyle: 'italic' }}>
                            No tags defined. Use the + icon to create one.
                        </p>
                    ) : (
                        <DataList
                            aria-label="Tag definitions list"
                            isCompact
                            selectedDataListItemId=""
                            onSelectableRowChange={(_evt, idx) => handleOpenEditDescriptionModal(idx)}
                            onSelectDataListItem={(_evt, idx) => handleOpenEditDescriptionModal(idx)}
                        >
                            {tags.map((tag: Tag, index: number) => (
                                <DataListItem
                                    key={index}
                                    id={`${index}`}
                                    data-path={NodePathUtil.createNodePath(tag).toString()}
                                    data-selectable="true"
                                >
                                    <DataListItemRow>
                                        <DataListItemCells
                                            dataListCells={[
                                                <DataListCell key="name">
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <TagIcon style={{ color: '#666' }} />
                                                            <strong>{tag.getName()}</strong>
                                                        </div>
                                                        {tag.getDescription() && (
                                                            <div style={{ fontSize: '0.875rem', color: 'var(--pf-v6-global--Color--200)', marginTop: '0.25rem' }}>
                                                                {tag.getDescription()}
                                                            </div>
                                                        )}
                                                    </div>
                                                </DataListCell>
                                            ]}
                                        />
                                        <DataListAction
                                            aria-labelledby={`tag-actions-${index}`}
                                            id={`tag-actions-${index}`}
                                            aria-label="Tag actions"
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
                                                        aria-label={`Actions for tag ${tag.getName()}`}
                                                    >
                                                        <EllipsisVIcon />
                                                    </MenuToggle>
                                                )}
                                            >
                                                <DropdownList>
                                                    <DropdownItem
                                                        key="edit"
                                                        onClick={() => {
                                                            handleOpenEditDescriptionModal(`${index}`);
                                                            setOpenDropdownIndex(null);
                                                        }}
                                                    >
                                                        Edit description
                                                    </DropdownItem>
                                                    <DropdownItem
                                                        key="rename"
                                                        onClick={() => handleOpenRenameModal(tag.getName())}
                                                    >
                                                        Rename tag
                                                    </DropdownItem>
                                                    <DropdownItem
                                                        key="delete"
                                                        onClick={() => handleDeleteTag(tag.getName())}
                                                    >
                                                        Delete tag
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

            {/* Tag modals */}
            <NewTagModal
                isOpen={isNewTagModalOpen}
                onClose={() => setIsNewTagModalOpen(false)}
                onConfirm={handleCreateTag}
            />

            <RenameTagModal
                isOpen={renameTagName !== null}
                currentName={renameTagName || ''}
                onClose={() => setRenameTagName(null)}
                onConfirm={handleRenameTag}
            />

            <EditTagDescriptionModal
                isOpen={editTagName !== null}
                tagName={editTagName || ''}
                currentDescription={editTagDescription}
                onClose={() => {
                    setEditTagName(null);
                    setEditTagDescription('');
                }}
                onConfirm={handleChangeTagDescription}
            />
        </>
    );
};
