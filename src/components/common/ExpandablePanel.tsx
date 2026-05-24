/**
 * Custom expandable panel component with header actions
 */

import React, {ReactNode} from 'react';
import {Badge, Button} from '@patternfly/react-core';
import {AngleDownIcon, AngleRightIcon} from '@patternfly/react-icons';
import {NodePath, NodePathUtil} from '@apitomy/data-models';
import {useSelection} from '@hooks/useSelection';
import './ExpandablePanel.css';

export interface ExpandablePanelProps {
    /**
     * The title text to display in the header
     */
    title: string;

    /**
     * Whether the panel is expanded
     */
    isExpanded: boolean;

    /**
     * Extra class name
     */
    className?: string;

    /**
     * Callback when the panel is toggled
     */
    onToggle: (expanded: boolean) => void;

    /**
     * Optional action buttons to display on the right side of the header
     */
    actions?: ReactNode;

    /**
     * Optional badge count to display after the title
     */
    badgeCount?: number;

    /**
     * Optional data-path attribute for component identification
     */
    nodePath?: NodePath | string;

    /**
     * The content to display when expanded
     */
    children: ReactNode;
}

/**
 * Custom expandable panel with header and optional actions
 */
export const ExpandablePanel: React.FC<ExpandablePanelProps> = ({
    title,
    className,
    isExpanded,
    onToggle,
    actions,
    badgeCount,
    nodePath,
    children,
}) => {
    const { select } = useSelection();

    // Convert NodePath to string if needed
    const pathString = typeof nodePath === 'string' ? nodePath : nodePath?.toString();

    /**
     * Handle panel toggle - fire selection event if nodePath is defined
     */
    const handleToggle = () => {
        const newExpandedState = !isExpanded;

        // Fire selection event if nodePath is defined
        if (nodePath) {
            if (typeof nodePath === "string") {
                select(NodePathUtil.parseNodePath(nodePath));
            } else {
                select(nodePath as NodePath);
            }
        }

        // Call the original onToggle callback
        onToggle(newExpandedState);
    };

    return (
        <div
            className={`expandable-panel ${className || ''}`}
            data-path={pathString}
            data-selectable={pathString ? 'true' : undefined}
        >
            <div className="expandable-panel__header">
                <Button
                    variant="plain"
                    icon={isExpanded ? <AngleDownIcon /> : <AngleRightIcon />}
                    className="expandable-panel__toggle"
                    onClick={handleToggle}
                    aria-expanded={isExpanded}
                >
                    {title}
                    {(badgeCount !== undefined && badgeCount > 0) && (
                        <Badge isRead style={{ marginLeft: '0.5rem' }}>
                            {badgeCount}
                        </Badge>
                    )}
                </Button>
                {actions && (
                    <div className="expandable-panel__actions" onClick={(e) => e.stopPropagation()}>
                        {actions}
                    </div>
                )}
            </div>
            {isExpanded && (
                <div className="expandable-panel__content">
                    {children}
                </div>
            )}
        </div>
    );
};
