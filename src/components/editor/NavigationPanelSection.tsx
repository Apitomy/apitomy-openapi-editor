/**
 * Reusable navigation panel section component
 */

import React, { useState, useRef, useEffect } from 'react';
import "./NavigationPanelSection.css";
import {
    NavItem,
    Button,
    Menu,
    MenuContent,
    MenuList,
    MenuItem, Tooltip,
} from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { ExpandablePanel } from '@components/common/ExpandablePanel';
import { PathLabel } from "@components/common/PathLabel.tsx";

/**
 * Context menu action definition
 */
export interface ContextMenuAction {
    label: string;
    onClick: (itemName: string) => void;
    isDisabled?: (itemName: string) => boolean;
}

/**
 * Props for NavigationPanelSection
 */
export interface NavigationPanelSectionProps {
    /**
     * Section title (e.g., "Paths", "Schemas")
     */
    title: string;

    /**
     * List of item names to display
     */
    items: string[];

    /**
     * Context menu actions for items
     */
    actions: ContextMenuAction[];

    /**
     * Handler for creating a new item (triggered by + button)
     */
    onCreateItem: () => void;

    /**
     * Item type for IDs and labels (e.g., "path", "schema")
     */
    itemType: string;

    /**
     * Whether the list is currently filtered
     */
    isFiltered: boolean;

    /**
     * Handler called when an item is clicked
     */
    onItemClick: (itemName: string) => void;

    /**
     * Optional custom renderer for item content
     */
    isTooltipEnabled?: boolean;

    /**
     * Function to determine if an item is currently active/selected
     */
    isItemActive: (itemName: string) => boolean;

    /**
     * Optional node path for the section (for selection support)
     */
    nodePath?: string;
}

/**
 * NavigationPanelSection component
 * Renders a collapsible section with a list of items and context menus
 */
export const NavigationPanelSection: React.FC<NavigationPanelSectionProps> = ({
    title,
    items,
    actions,
    onCreateItem,
    itemType,
    isFiltered,
    onItemClick,
    isTooltipEnabled,
    isItemActive,
    nodePath,
}) => {
    // Manage expanded/collapsed state internally
    const [isExpanded, setIsExpanded] = useState(true);

    // Context menu state
    const [contextMenuItem, setContextMenuItem] = useState<string | null>(null);
    const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);

    const menuRef = useRef<HTMLDivElement>(null);

    /**
     * Handle click-away and escape key for context menu
     */
    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent | KeyboardEvent) => {
            // Close if Escape key is pressed
            if (event instanceof KeyboardEvent && event.key === 'Escape') {
                setContextMenuItem(null);
                setContextMenuPosition(null);
                return;
            }

            // Close if clicking outside the menu container
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setContextMenuItem(null);
                setContextMenuPosition(null);
            }
        };

        // Attach listeners when menu is open
        if (contextMenuItem) {
            window.addEventListener('click', handleOutsideClick, true);
            window.addEventListener('contextmenu', handleOutsideClick, true);
            window.addEventListener('keydown', handleOutsideClick);
        }

        return () => {
            window.removeEventListener('click', handleOutsideClick, true);
            window.removeEventListener('contextmenu', handleOutsideClick, true);
            window.removeEventListener('keydown', handleOutsideClick);
        };
    }, [contextMenuItem]);

    /**
     * Handle context menu open
     */
    const handleContextMenu = (event: React.MouseEvent, itemName: string) => {
        event.preventDefault();
        event.stopPropagation();
        setContextMenuItem(itemName);
        setContextMenuPosition({ x: event.clientX, y: event.clientY });
    };

    /**
     * Handle context menu action
     */
    const handleMenuAction = (action: ContextMenuAction) => {
        if (contextMenuItem) {
            action.onClick(contextMenuItem);
            setContextMenuItem(null);
            setContextMenuPosition(null);
        }
    };

    return (
        <>
            <ExpandablePanel
                title={title}
                nodePath={nodePath}
                isExpanded={isExpanded}
                onToggle={setIsExpanded}
                badgeCount={items.length}
                actions={
                    <Button
                        variant="plain"
                        aria-label={`Add ${itemType}`}
                        onClick={onCreateItem}
                        icon={<PlusCircleIcon />}
                        style={{ minWidth: 'auto', padding: '0.25rem' }}
                    />
                }
            >
                {items.length === 0 ? (
                    <NavItem itemId={`no-${itemType}s`} disabled>
                        {isFiltered ? `No matching ${itemType}s` : `No ${itemType}s defined`}
                    </NavItem>
                ) : (
                    (() => {
                        const deleteAction = actions.find(a => a.label.toLowerCase().includes('delete'));

                        return items.map((itemName) => {
                            const isActive = isItemActive(itemName);
                            const hasContextMenu = contextMenuItem === itemName;

                            return (
                                <NavItem
                                    key={itemName}
                                    itemId={`${itemType}-${itemName}`}
                                    isActive={isActive}
                                    onClick={() => onItemClick(itemName)}
                                    style={hasContextMenu ? { backgroundColor: 'var(--pf-v6-global--BackgroundColor--200)' } : undefined}
                                    className="nav-panel-item"
                                >
                                    <div className="nav-item-content">
                                        {isTooltipEnabled ? (
                                            <a
                                                className={hasContextMenu ? "pf-contextMenu nav-item-link" : "nav-item-link"}
                                                onContextMenu={(e) => handleContextMenu(e, itemName)}
                                                style={{ flexGrow: 1, overflowX: "hidden", textWrap: "nowrap" }}
                                            >
                                                <Tooltip content={<div>{itemName}</div>}>
                                                    <PathLabel path={itemName} />
                                                </Tooltip>
                                            </a>
                                        ) : (
                                            <a
                                                className={hasContextMenu ? "pf-contextMenu nav-item-link" : "nav-item-link"}
                                                onContextMenu={(e) => handleContextMenu(e, itemName)}
                                                style={{ flexGrow: 1 }}
                                            >
                                                {itemName}
                                            </a>
                                        )}
                                        {deleteAction && (
                                            <Button
                                                variant="plain"
                                                aria-label={`Delete ${itemType} ${itemName}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteAction.onClick(itemName);
                                                }}
                                                icon={<TrashIcon />}
                                                className="item-delete-button"
                                            />
                                        )}
                                    </div>
                                </NavItem>
                            );
                        });
                    })()
                )}
            </ExpandablePanel>

            {/* Context Menu */}
            {contextMenuItem && contextMenuPosition && (
                <div
                    ref={menuRef}
                    style={{
                        position: 'fixed',
                        left: contextMenuPosition.x,
                        top: contextMenuPosition.y,
                        zIndex: 9999,
                    }}
                >
                    <Menu
                        onSelect={() => {
                            setContextMenuItem(null);
                            setContextMenuPosition(null);
                        }}
                    >
                        <MenuContent>
                            <MenuList>
                                {actions.map((action, index) => (
                                    <MenuItem
                                        key={index}
                                        itemId={index}
                                        onClick={() => handleMenuAction(action)}
                                        isDisabled={action.isDisabled?.(contextMenuItem) ?? false}
                                    >
                                        {action.label}
                                    </MenuItem>
                                ))}
                            </MenuList>
                        </MenuContent>
                    </Menu>
                </div>
            )}
        </>
    );
};
