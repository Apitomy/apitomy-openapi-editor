/**
 * Reusable component for displaying a section of parameters (query, header, cookie, path)
 */

import React, { useState } from 'react';
import {
    Button,
    DataList,
    DataListItem,
    DataListItemRow,
    DataListItemCells,
    DataListCell,
    DataListAction,
    Dropdown,
    DropdownItem,
    DropdownList,
    Label,
    MenuToggle,
    Tooltip,
} from '@patternfly/react-core';
import { EllipsisVIcon, PlusCircleIcon } from '@patternfly/react-icons';
import {NodePathUtil, OpenApiParameter} from '@apitomy/data-models';
import { ExpandablePanel } from './ExpandablePanel';

export interface ParameterSectionProps {
    /**
     * The title of the section (e.g., "Query Parameters")
     */
    title: string;

    /**
     * The location/type of parameters (e.g., "query", "header", "cookie", "path")
     */
    location: string;

    /**
     * Whether the section is expanded
     */
    isExpanded: boolean;

    /**
     * Callback when the section is toggled
     */
    onToggle: (expanded: boolean) => void;

    /**
     * Array of parameters to display
     */
    parameters: OpenApiParameter[];

    /**
     * Optional callback when the add parameter button is clicked
     */
    onAddParameter?: () => void;

    /**
     * Optional callback when a parameter edit is requested
     */
    onEditParameter?: (parameter: OpenApiParameter, index: number) => void;

    /**
     * Optional callback when a parameter delete is requested
     */
    onDeleteParameter?: (parameter: OpenApiParameter, index: number) => void;

    /**
     * Optional callback when a parameter is selected
     */
    onSelectParameter?: (parameter: OpenApiParameter, index: number) => void;
}

/**
 * Component for displaying a section of parameters
 */
export const ParameterSection: React.FC<ParameterSectionProps> = ({
    title,
    location,
    isExpanded,
    onToggle,
    parameters,
    onAddParameter,
    onEditParameter,
    onDeleteParameter,
    onSelectParameter,
}) => {
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    return (
        <ExpandablePanel
            title={title}
            isExpanded={isExpanded}
            onToggle={onToggle}
            className="form__section"
            badgeCount={parameters.length}
            actions={
                onAddParameter ? (
                    <Tooltip content="Add parameter">
                        <Button
                            variant="plain"
                            aria-label={`Add ${location} parameter`}
                            icon={<PlusCircleIcon />}
                            style={{ minWidth: 'auto', padding: '0.25rem' }}
                            onClick={onAddParameter}
                        />
                    </Tooltip>
                ) : undefined
            }
        >
            <div className="form__sectionbody">
                {parameters.length === 0 ? (
                    <p style={{ color: 'var(--pf-v6-global--Color--200)', fontStyle: 'italic' }}>
                        No {location} parameters defined.{onAddParameter && ' Use the + icon to create one.'}
                    </p>
                ) : (
                    <DataList
                        aria-label={`${location} parameters list`}
                        isCompact
                        selectedDataListItemId=""
                        onSelectableRowChange={(_evt, idx) => {idx}}
                        onSelectDataListItem={(_evt, idx) => {idx}}
                    >
                        {parameters.map((param: any, index: number) => {
                            const paramName = param.getName?.() || param.name || 'Unnamed';
                            const paramRequired = param.getRequired?.() || param.required || false;
                            const paramType = param.getSchema?.()?.getType?.() || param.schema?.type || 'string';
                            const paramDescription = param.getDescription?.() || param.description || '';
                            const dropdownId = `${location}-${index}`;

                            // Compute data attributes for selection and highlighting
                            const pathString = NodePathUtil.createNodePath(param).toString();

                            return (
                                <DataListItem
                                    key={index}
                                    id={`${index}`}
                                    data-path={pathString}
                                    data-selectable="true"
                                >
                                    <DataListItemRow
                                        style={{ cursor: onEditParameter ? 'pointer' : 'default' }}
                                        onClick={() => {
                                            // Fire selection event
                                            if (onSelectParameter) {
                                                onSelectParameter(param, index);
                                            }
                                        }}
                                    >
                                        <DataListItemCells
                                            dataListCells={[
                                                <DataListCell key="parameter-info">
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <strong>{paramName}</strong>
                                                            <Label isCompact color="grey">{paramType}</Label>
                                                            {paramRequired && (
                                                                <Label isCompact color="orange">required</Label>
                                                            )}
                                                        </div>
                                                        {paramDescription && (
                                                            <div style={{ fontSize: '0.875rem', color: 'var(--pf-v6-global--Color--200)', marginTop: '0.25rem' }}>
                                                                {paramDescription}
                                                            </div>
                                                        )}
                                                    </div>
                                                </DataListCell>
                                            ]}
                                        />
                                        <DataListAction
                                            aria-labelledby={`parameter-action-${index}`}
                                            id={`parameter-action-${index}`}
                                            aria-label="Parameter actions"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Dropdown
                                                isOpen={openDropdownId === dropdownId}
                                                onSelect={() => setOpenDropdownId(null)}
                                                onOpenChange={(isOpen) => setOpenDropdownId(isOpen ? dropdownId : null)}
                                                popperProps={{ position: 'right' }}
                                                toggle={(toggleRef) => (
                                                    <MenuToggle
                                                        ref={toggleRef}
                                                        aria-label="Parameter kebab menu"
                                                        variant="plain"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenDropdownId(openDropdownId === dropdownId ? null : dropdownId);
                                                        }}
                                                        isExpanded={openDropdownId === dropdownId}
                                                    >
                                                        <EllipsisVIcon />
                                                    </MenuToggle>
                                                )}
                                                shouldFocusToggleOnSelect
                                            >
                                                <DropdownList>
                                                    <DropdownItem
                                                        key="edit"
                                                        onClick={() => {
                                                            // Open edit modal
                                                            if (onEditParameter) {
                                                                onEditParameter(param, index);
                                                            }
                                                            setOpenDropdownId(null);
                                                        }}
                                                    >
                                                        Edit parameter
                                                    </DropdownItem>
                                                    <DropdownItem
                                                        key="delete"
                                                        onClick={() => {
                                                            if (onDeleteParameter) {
                                                                onDeleteParameter(param, index);
                                                            }
                                                            setOpenDropdownId(null);
                                                        }}
                                                    >
                                                        Delete parameter
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
    );
};
