/**
 * Security section for editing security schemes and requirements
 */

import React, { useState } from 'react';
import {
    Button,
    DataList,
    DataListAction,
    DataListCell,
    DataListContent,
    DataListItem,
    DataListItemCells,
    DataListItemRow,
    DataListToggle,
    Dropdown,
    DropdownItem,
    DropdownList,
    Label,
    MenuToggle
} from '@patternfly/react-core';
import { EllipsisVIcon, PlusIcon, ShieldAltIcon, TrashIcon } from '@patternfly/react-icons';
import {
    NodePathUtil,
    OpenApi20Document,
    OpenApi30Document,
    OpenApi31Document,
    OpenApiDocument,
    SecurityRequirement,
    SecurityScheme
} from '@apitomy/data-models';
import { useDocument } from '@hooks/useDocument';
import { useCommand } from '@hooks/useCommand';
import { useSelection } from '@hooks/useSelection';
import { ExpandablePanel } from '@components/common/ExpandablePanel';
import { SecuritySchemeModal, SecuritySchemeData } from '@components/modals/SecuritySchemeModal';
import { SecurityRequirementModal, SecurityRequirementData } from '@components/modals/SecurityRequirementModal';
import { SecuritySchemeDetails } from '@components/forms/main/SecuritySchemeDetails';
import { AddSecuritySchemeCommand } from '@commands/AddSecuritySchemeCommand';
import { DeleteSecuritySchemeCommand } from '@commands/DeleteSecuritySchemeCommand';
import { DeleteAllSecuritySchemesCommand } from '@commands/DeleteAllSecuritySchemesCommand';
import { AddSecurityRequirementCommand } from '@commands/AddSecurityRequirementCommand';
import { DeleteSecurityRequirementCommand } from '@commands/DeleteSecurityRequirementCommand';
import { DeleteAllSecurityRequirementsCommand } from '@commands/DeleteAllSecurityRequirementsCommand';
import { CompositeCommand } from '@commands/CompositeCommand';

/**
 * Security section component for editing security schemes and requirements
 */
export const SecuritySection: React.FC = () => {
    const { document, specVersion } = useDocument();
    const { executeCommand } = useCommand();
    const { select } = useSelection();

    if (!document) {
        return null;
    }

    const oaiDoc = document as OpenApiDocument;

    const [isSchemesExpanded, setIsSchemesExpanded] = useState(true);
    const [isRequirementsExpanded, setIsRequirementsExpanded] = useState(true);
    const [openSchemeDropdownIndex, setOpenSchemeDropdownIndex] = useState<number | null>(null);
    const [openRequirementDropdownIndex, setOpenRequirementDropdownIndex] = useState<number | null>(null);
    const [expandedSchemeRows, setExpandedSchemeRows] = useState<Set<string>>(new Set());
    const [isSchemeModalOpen, setIsSchemeModalOpen] = useState(false);
    const [editSchemeData, setEditSchemeData] = useState<SecuritySchemeData | null>(null);
    const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
    const [editRequirementData, setEditRequirementData] = useState<SecurityRequirementData | null>(null);
    const [editRequirementIndex, setEditRequirementIndex] = useState<number | undefined>(undefined);

    /**
     * Get security schemes from the document, sorted alphabetically by name
     */
    const getSecuritySchemes = (): { name: string; scheme: SecurityScheme }[] => {
        let schemes: { name: string; scheme: SecurityScheme }[] = [];

        if (specVersion === '2.0') {
            const definitions = (oaiDoc as OpenApi20Document).getSecurityDefinitions();
            if (!definitions) return [];
            const names = definitions.getItemNames();
            schemes = names.map(name => ({
                name,
                scheme: definitions.getItem(name)
            }));
        } else {
            const components = (oaiDoc as OpenApi30Document | OpenApi31Document).getComponents();
            if (!components) return [];
            const schemesMap = components.getSecuritySchemes();
            if (!schemesMap) return [];
            schemes = Object.keys(schemesMap).map(name => ({
                name,
                scheme: schemesMap[name]
            }));
        }

        // Sort alphabetically by name
        return schemes.sort((a, b) => a.name.localeCompare(b.name));
    };

    /**
     * Get security requirements from the document
     */
    const getSecurityRequirements = (): SecurityRequirement[] => {
        return (oaiDoc as OpenApi20Document | OpenApi30Document | OpenApi31Document).getSecurity() || [];
    };

    /**
     * Get display label for security scheme type
     */
    const getSchemeTypeLabel = (scheme: SecurityScheme): string => {
        const type = scheme.getType();
        if (!type) return 'Unknown';

        if (specVersion === '2.0') {
            if (type === 'basic') return 'Basic Auth';
            if (type === 'apiKey') return 'API Key';
            if (type === 'oauth2') return 'OAuth2';
        } else {
            if (type === 'apiKey') return 'API Key';
            if (type === 'http') return 'HTTP';
            if (type === 'oauth2') return 'OAuth2';
            if (type === 'openIdConnect') return 'OpenID Connect';
        }
        return type;
    };

    /**
     * Get color for security scheme type badge
     */
    const getSchemeTypeColor = (scheme: SecurityScheme): 'blue' | 'teal' | 'green' | 'orange' | 'purple' | 'red' | 'orangered' | 'grey' | 'yellow' => {
        const type = scheme.getType();
        if (type === 'basic' || type === 'http') return 'blue';
        if (type === 'apiKey') return 'green';
        if (type === 'oauth2') return 'purple';
        if (type === 'openIdConnect') return 'teal';
        return 'grey';
    };

    const securitySchemes = getSecuritySchemes();
    const securityRequirements = getSecurityRequirements();

    /**
     * Toggle expansion of a security scheme row
     */
    const toggleSchemeRowExpansion = (name: string) => {
        setExpandedSchemeRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(name)) {
                newSet.delete(name);
            } else {
                newSet.add(name);
            }
            return newSet;
        });
    };

    /**
     * Handle creating a new security scheme
     */
    const handleCreateSecurityScheme = () => {
        setEditSchemeData(null);
        setIsSchemeModalOpen(true);
    };

    /**
     * Handle confirming security scheme (add or update)
     */
    const handleConfirmSecurityScheme = (data: SecuritySchemeData) => {
        if (editSchemeData) {
            // Edit mode - delete old and add new
            const deleteCommand = new DeleteSecuritySchemeCommand(editSchemeData.name);
            const addCommand = new AddSecuritySchemeCommand(data);
            const compositeCommand = new CompositeCommand(
                [deleteCommand, addCommand],
                `Update security scheme "${data.name}"`
            );
            executeCommand(compositeCommand, `Update security scheme "${data.name}"`);
        } else {
            // Create mode - add new scheme
            const command = new AddSecuritySchemeCommand(data);
            executeCommand(command, `Add security scheme "${data.name}"`);
        }
    };

    /**
     * Convert security scheme to SecuritySchemeData for editing
     */
    const convertSchemeToData = (name: string, scheme: SecurityScheme): SecuritySchemeData => {
        const data: SecuritySchemeData = {
            name,
            type: scheme.getType() || '',
            description: scheme.getDescription() || ''
        };

        const type = scheme.getType();

        if (type === 'apiKey') {
            data.parameterName = scheme.getName() || '';
            data.in = scheme.getIn() || 'header';
        } else if (type === 'http' && specVersion !== '2.0') {
            const scheme30 = scheme as any;
            data.scheme = scheme30.getScheme?.() || '';
            data.bearerFormat = scheme30.getBearerFormat?.() || '';
        } else if (type === 'oauth2') {
            if (specVersion === '2.0') {
                const scheme20 = scheme as any;
                data.flow = scheme20.getFlow?.() || '';
                data.authorizationUrl = scheme20.getAuthorizationUrl?.() || '';
                data.tokenUrl = scheme20.getTokenUrl?.() || '';
            } else {
                // OpenAPI 3.0+ - extract all flows
                const scheme30 = scheme as any;
                const flows = scheme30.getFlows?.();
                if (flows) {
                    data.oauth2Flows = {};

                    // Extract implicit flow
                    const implicitFlow = flows.getImplicit?.();
                    if (implicitFlow) {
                        data.oauth2Flows.implicit = {
                            authorizationUrl: implicitFlow.getAuthorizationUrl?.() || '',
                            refreshUrl: implicitFlow.getRefreshUrl?.() || '',
                        };
                    }

                    // Extract password flow
                    const passwordFlow = flows.getPassword?.();
                    if (passwordFlow) {
                        data.oauth2Flows.password = {
                            tokenUrl: passwordFlow.getTokenUrl?.() || '',
                            refreshUrl: passwordFlow.getRefreshUrl?.() || '',
                        };
                    }

                    // Extract clientCredentials flow
                    const clientCredentialsFlow = flows.getClientCredentials?.();
                    if (clientCredentialsFlow) {
                        data.oauth2Flows.clientCredentials = {
                            tokenUrl: clientCredentialsFlow.getTokenUrl?.() || '',
                            refreshUrl: clientCredentialsFlow.getRefreshUrl?.() || '',
                        };
                    }

                    // Extract authorizationCode flow
                    const authorizationCodeFlow = flows.getAuthorizationCode?.();
                    if (authorizationCodeFlow) {
                        data.oauth2Flows.authorizationCode = {
                            authorizationUrl: authorizationCodeFlow.getAuthorizationUrl?.() || '',
                            tokenUrl: authorizationCodeFlow.getTokenUrl?.() || '',
                            refreshUrl: authorizationCodeFlow.getRefreshUrl?.() || '',
                        };
                    }
                }
            }
        } else if (type === 'openIdConnect' && specVersion !== '2.0') {
            const scheme30 = scheme as any;
            data.openIdConnectUrl = scheme30.getOpenIdConnectUrl?.() || '';
        }

        return data;
    };

    /**
     * Handle deleting all security schemes
     */
    const handleDeleteAllSecuritySchemes = () => {
        const command = new DeleteAllSecuritySchemesCommand();
        executeCommand(command, 'Delete all security schemes');
    };

    /**
     * Handle deleting a security scheme
     */
    const handleDeleteSecurityScheme = (name: string) => {
        const command = new DeleteSecuritySchemeCommand(name);
        executeCommand(command, `Delete security scheme "${name}"`);
        setOpenSchemeDropdownIndex(null);
    };

    /**
     * Handle editing a security scheme
     */
    const handleEditSecurityScheme = (name: string) => {
        const schemeEntry = securitySchemes.find(s => s.name === name);
        if (schemeEntry) {
            const data = convertSchemeToData(schemeEntry.name, schemeEntry.scheme);
            setEditSchemeData(data);
            setIsSchemeModalOpen(true);
            select(schemeEntry.scheme);
        }
        setOpenSchemeDropdownIndex(null);
    };

    /**
     * Handle creating a new security requirement
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
            const deleteCommand = new DeleteSecurityRequirementCommand(editRequirementIndex);
            const addCommand = new AddSecurityRequirementCommand(data, editRequirementIndex);
            const compositeCommand = new CompositeCommand(
                [deleteCommand, addCommand],
                'Update security requirement'
            );
            executeCommand(compositeCommand, 'Update security requirement');
        } else {
            // Create mode - add new requirement
            const command = new AddSecurityRequirementCommand(data);
            executeCommand(command, 'Add security requirement');
        }
    };

    /**
     * Convert security requirement to SecurityRequirementData for editing
     */
    const convertRequirementToData = (requirement: SecurityRequirement): SecurityRequirementData => {
        const schemes: { [schemeName: string]: string[] } = {};
        const schemeNames = requirement.getItemNames();

        if (schemeNames) {
            schemeNames.forEach(schemeName => {
                const scopes = requirement.getItem(schemeName);
                // Clone the scopes array to avoid mutations to the original data
                schemes[schemeName] = scopes ? [...scopes] : [];
            });
        }

        return { schemes };
    };

    /**
     * Handle deleting all security requirements
     */
    const handleDeleteAllSecurityRequirements = () => {
        const command = new DeleteAllSecurityRequirementsCommand();
        executeCommand(command, 'Delete all security requirements');
    };

    /**
     * Handle deleting a security requirement
     */
    const handleDeleteSecurityRequirement = (index: number) => {
        const command = new DeleteSecurityRequirementCommand(index);
        executeCommand(command, `Delete security requirement`);
        setOpenRequirementDropdownIndex(null);
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
        setOpenRequirementDropdownIndex(null);
    };

    /**
     * Get requirement display text
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

    return (
        <>
            {/* Security Schemes Section */}
            <ExpandablePanel
                title="Security Schemes"
                nodePath={specVersion === '2.0' ? '/securityDefinitions' : '/components/securitySchemes'}
                isExpanded={isSchemesExpanded}
                onToggle={setIsSchemesExpanded}
                className="form__section"
                badgeCount={securitySchemes.length}
                actions={
                    <>
                        <Button
                            variant="plain"
                            icon={<PlusIcon />}
                            onClick={handleCreateSecurityScheme}
                            aria-label="Add security scheme"
                        />
                        <Button
                            variant="plain"
                            icon={<TrashIcon />}
                            onClick={handleDeleteAllSecuritySchemes}
                            isDisabled={securitySchemes.length === 0}
                            aria-label="Delete all security schemes"
                            isDanger
                        />
                    </>
                }
            >
                <div className="form__sectionbody">
                    {securitySchemes.length === 0 ? (
                        <p style={{ color: 'var(--pf-v6-global--Color--200)', fontStyle: 'italic' }}>
                            No security schemes defined. Use the + icon to create one.
                        </p>
                    ) : (
                        <DataList
                            aria-label="Security schemes list"
                            isCompact
                            onSelectableRowChange={(_evt, idx) => handleEditSecurityScheme(securitySchemes[parseInt(idx)]?.name)}
                            onSelectDataListItem={(_evt, idx) => handleEditSecurityScheme(securitySchemes[parseInt(idx)]?.name)}
                        >
                            {securitySchemes.map(({ name, scheme }, index) => {
                                const isExpanded = expandedSchemeRows.has(name);
                                return (
                                    <DataListItem
                                        key={name}
                                        id={`${index}`}
                                        data-path={NodePathUtil.createNodePath(scheme).toString()}
                                        data-selectable="true"
                                        isExpanded={isExpanded}
                                    >
                                        <DataListItemRow>
                                            <DataListToggle
                                                onClick={() => toggleSchemeRowExpansion(name)}
                                                isExpanded={isExpanded}
                                                id={`scheme-toggle-${name}`}
                                                aria-controls={`scheme-expand-${name}`}
                                            />
                                            <DataListItemCells
                                                dataListCells={[
                                                    <DataListCell key="name">
                                                        <div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <ShieldAltIcon style={{ color: '#666' }} />
                                                                <strong>{name}</strong>
                                                                <Label color={getSchemeTypeColor(scheme)}>
                                                                    {getSchemeTypeLabel(scheme)}
                                                                </Label>
                                                            </div>
                                                            {scheme.getDescription() && (
                                                                <div style={{ fontSize: '0.875rem', color: 'var(--pf-v6-global--Color--200)', marginTop: '0.25rem' }}>
                                                                    {scheme.getDescription()}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </DataListCell>
                                                ]}
                                            />
                                            <DataListAction
                                                aria-labelledby={`scheme-actions-${index}`}
                                                id={`scheme-actions-${index}`}
                                                aria-label="Security scheme actions"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Dropdown
                                                    isOpen={openSchemeDropdownIndex === index}
                                                    onSelect={() => setOpenSchemeDropdownIndex(null)}
                                                    onOpenChange={(isOpen: boolean) => setOpenSchemeDropdownIndex(isOpen ? index : null)}
                                                    popperProps={{ position: 'right' }}
                                                    toggle={(toggleRef) => (
                                                        <MenuToggle
                                                            ref={toggleRef}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenSchemeDropdownIndex(openSchemeDropdownIndex === index ? null : index);
                                                            }}
                                                            variant="plain"
                                                            aria-label={`Actions for security scheme ${name}`}
                                                        >
                                                            <EllipsisVIcon />
                                                        </MenuToggle>
                                                    )}
                                                >
                                                    <DropdownList>
                                                        <DropdownItem
                                                            key="edit"
                                                            onClick={() => handleEditSecurityScheme(name)}
                                                        >
                                                            Edit scheme
                                                        </DropdownItem>
                                                        <DropdownItem
                                                            key="delete"
                                                            onClick={() => handleDeleteSecurityScheme(name)}
                                                        >
                                                            Delete scheme
                                                        </DropdownItem>
                                                    </DropdownList>
                                                </Dropdown>
                                            </DataListAction>
                                        </DataListItemRow>
                                        <DataListContent
                                            aria-label="Security scheme details"
                                            id={`scheme-expand-${name}`}
                                            isHidden={!isExpanded}
                                        >
                                            <SecuritySchemeDetails scheme={scheme} specVersion={specVersion} />
                                        </DataListContent>
                                    </DataListItem>
                                );
                            })}
                        </DataList>
                    )}
                </div>
            </ExpandablePanel>

            {/* Security Requirements Section */}
            <ExpandablePanel
                title="Security Requirements"
                nodePath="/security"
                isExpanded={isRequirementsExpanded}
                onToggle={setIsRequirementsExpanded}
                className="form__section"
                badgeCount={securityRequirements.length}
                actions={
                    <>
                        <Button
                            variant="plain"
                            icon={<PlusIcon />}
                            onClick={handleCreateSecurityRequirement}
                            aria-label="Add security requirement"
                        />
                        <Button
                            variant="plain"
                            icon={<TrashIcon />}
                            onClick={handleDeleteAllSecurityRequirements}
                            isDisabled={securityRequirements.length === 0}
                            aria-label="Delete all security requirements"
                            isDanger
                        />
                    </>
                }
            >
                <div className="form__sectionbody">
                    {securityRequirements.length === 0 ? (
                        <p style={{ color: 'var(--pf-v6-global--Color--200)', fontStyle: 'italic' }}>
                            No security requirements defined. Use the + icon to create one.
                        </p>
                    ) : (
                        <DataList
                            aria-label="Security requirements list"
                            isCompact
                            selectedDataListItemId=""
                        >
                            {securityRequirements.map((requirement, index) => {
                                const { schemes, scopes } = getRequirementDisplayText(requirement);
                                return (
                                    <DataListItem
                                        key={index}
                                        id={`requirement-${index}`}
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
                                                aria-labelledby={`requirement-actions-${index}`}
                                                id={`requirement-actions-${index}`}
                                                aria-label="Security requirement actions"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Dropdown
                                                    isOpen={openRequirementDropdownIndex === index}
                                                    onSelect={() => setOpenRequirementDropdownIndex(null)}
                                                    onOpenChange={(isOpen: boolean) => setOpenRequirementDropdownIndex(isOpen ? index : null)}
                                                    popperProps={{ position: 'right' }}
                                                    toggle={(toggleRef) => (
                                                        <MenuToggle
                                                            ref={toggleRef}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenRequirementDropdownIndex(openRequirementDropdownIndex === index ? null : index);
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

            {/* Modals */}
            <SecuritySchemeModal
                isOpen={isSchemeModalOpen}
                onClose={() => {
                    setIsSchemeModalOpen(false);
                    setEditSchemeData(null);
                }}
                onConfirm={handleConfirmSecurityScheme}
                editData={editSchemeData}
            />

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
