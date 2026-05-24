/**
 * Servers section for editing server definitions
 */

import React, {useState} from 'react';
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
import {EllipsisVIcon, PlusIcon, ServerIcon, TrashIcon} from '@patternfly/react-icons';
import {
    Node,
    NodePathUtil,
    OpenApi30Server,
    OpenApiServersParent,
    Server,
    ServerVariable
} from '@apitomy/data-models';
import {useCommand} from '@hooks/useCommand';
import {useSelection} from '@hooks/useSelection';
import {ExpandablePanel} from '@components/common/ExpandablePanel';
import {ServerUrl} from '@components/common/ServerUrl';
import {NewServerModal} from '@components/modals/NewServerModal';
import {EditServerModal, ServerVariableData} from '@components/modals/EditServerModal';
import {AddServerCommand} from '@commands/AddServerCommand';
import {DeleteServerCommand} from '@commands/DeleteServerCommand';
import {DeleteAllServersCommand} from '@commands/DeleteAllServersCommand';
import {CompositeCommand} from '@commands/CompositeCommand';
import {ChangePropertyCommand} from '@commands/ChangePropertyCommand';

export interface ServersSectionProps {
    /**
     * The parent node (Document or PathItem) that supports servers
     */
    parent: Node & OpenApiServersParent;

    /**
     * Optional title for the section (defaults to "Servers")
     */
    title?: string;
}

/**
 * Servers section component for editing server definitions on any node that supports servers
 */
export const ServersSection: React.FC<ServersSectionProps> = ({ parent, title = "Servers" }) => {
    const { executeCommand } = useCommand();
    const { select } = useSelection();

    const servers = parent.getServers() || [];
    const nodePath = NodePathUtil.createNodePath(parent);

    const [isExpanded, setIsExpanded] = useState(() => servers.length > 0);
    const [isNewServerModalOpen, setIsNewServerModalOpen] = useState(false);
    const [openServerDropdownIndex, setOpenServerDropdownIndex] = useState<number | null>(null);
    const [editServerUrl, setEditServerUrl] = useState<string | null>(null);
    const [editServerDescription, setEditServerDescription] = useState<string>('');
    const [editServerVariables, setEditServerVariables] = useState<ServerVariableData[]>([]);

    /**
     * Get a server by URL
     */
    const getServer = (serverUrl: string): Server => {
        const foundServer = servers.find((s: any) => s.getUrl() === serverUrl);
        if (!foundServer) {
            throw new Error(`Server not found: ${serverUrl}`);
        }
        return foundServer as Server;
    };

    /**
     * Handle creating a new server
     */
    const handleCreateServer = (serverUrl: string, serverDescription: string) => {
        const command = new AddServerCommand(parent, serverUrl, serverDescription);
        executeCommand(command, `Add server "${serverUrl}"`);
    };

    /**
     * Handle deleting all servers
     */
    const handleDeleteAllServers = () => {
        const command = new DeleteAllServersCommand(parent);
        executeCommand(command, 'Delete all servers');
    };

    /**
     * Handle deleting a specific server
     */
    const handleDeleteServer = (serverUrl: string) => {
        const command = new DeleteServerCommand(parent, serverUrl);
        executeCommand(command, `Delete server "${serverUrl}"`);
        setOpenServerDropdownIndex(null);
    };

    /**
     * Handle opening edit server modal
     */
    const handleOpenEditServerModal = (serverIndex: string) => {
        const server = servers[parseInt(serverIndex)] as OpenApi30Server;
        // Fire selection event
        select(server);
        setEditServerUrl(server.getUrl());
        setEditServerDescription(server.getDescription() || '');

        // Extract server variables
        const variables: ServerVariableData[] = [];
        const serverVariables = server.getVariables();
        if (serverVariables) {
            for (const varName of Object.keys(serverVariables)) {
                const variable = serverVariables[varName] as ServerVariable;
                variables.push({
                    variable: variable,
                    name: varName,
                    default: variable.getDefault() || '',
                    description: variable.getDescription() || ''
                });
            }
        }
        setEditServerVariables(variables);
    };

    /**
     * Handle updating server
     */
    const handleUpdateServer = (description: string, variables: ServerVariableData[]) => {
        if (editServerUrl) {
            // Create a composite command that will do the following:
            // 1. Update the Server description
            // 2. Update the default value and description for every server variable
            const server: Server = getServer(editServerUrl);
            const commands = [
                new ChangePropertyCommand(server, 'description', description)
            ];
            if (variables) {
                variables.forEach((variable) => {
                    commands.push(new ChangePropertyCommand(variable.variable, 'description', variable.description));
                    commands.push(new ChangePropertyCommand(variable.variable, 'default', variable.default));
                });
            }

            const commandDescription = `Update server "${editServerUrl}"`;
            const command = new CompositeCommand(commands, commandDescription);
            executeCommand(command, commandDescription);
        }
        setEditServerUrl(null);
        setEditServerDescription('');
        setEditServerVariables([]);
    };

    return (
        <>
            <ExpandablePanel
                title={title}
                nodePath={nodePath}
                isExpanded={isExpanded}
                onToggle={setIsExpanded}
                className="form__section"
                badgeCount={servers.length}
                actions={
                    <>
                        <Button
                            variant="plain"
                            icon={<PlusIcon />}
                            onClick={() => setIsNewServerModalOpen(true)}
                            aria-label="Add server"
                        />
                        <Button
                            variant="plain"
                            icon={<TrashIcon />}
                            onClick={handleDeleteAllServers}
                            isDisabled={servers.length === 0}
                            aria-label="Delete all servers"
                            isDanger
                        />
                    </>
                }
            >
                <div className="form__sectionbody">
                    {servers.length === 0 ? (
                        <p style={{ color: 'var(--pf-v6-global--Color--200)', fontStyle: 'italic' }}>
                            No servers defined. Use the + icon to create one.
                        </p>
                    ) : (
                        <DataList
                            aria-label="Servers list"
                            isCompact
                            selectedDataListItemId=""
                            onSelectableRowChange={(_evt, idx) => handleOpenEditServerModal(idx)}
                            onSelectDataListItem={(_evt, idx) => handleOpenEditServerModal(idx)}
                        >
                            {servers.map((server: any, index: number) => (
                                <DataListItem
                                    key={index}
                                    id={`${index}`}
                                    data-path={NodePathUtil.createNodePath(server).toString()}
                                    data-selectable="true"
                                >
                                    <DataListItemRow>
                                        <DataListItemCells
                                            dataListCells={[
                                                <DataListCell key="url">
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <ServerIcon style={{ color: '#666' }} />
                                                            <strong>
                                                                <ServerUrl url={server.getUrl()} />
                                                            </strong>
                                                        </div>
                                                        {server.getDescription() && (
                                                            <div style={{ fontSize: '0.875rem', color: 'var(--pf-v6-global--Color--200)', marginTop: '0.25rem' }}>
                                                                {server.getDescription()}
                                                            </div>
                                                        )}
                                                    </div>
                                                </DataListCell>
                                            ]}
                                        />
                                        <DataListAction
                                            aria-labelledby={`server-actions-${index}`}
                                            id={`server-actions-${index}`}
                                            aria-label="Server actions"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Dropdown
                                                isOpen={openServerDropdownIndex === index}
                                                onSelect={() => setOpenServerDropdownIndex(null)}
                                                onOpenChange={(isOpen: boolean) => setOpenServerDropdownIndex(isOpen ? index : null)}
                                                popperProps={{ position: 'right' }}
                                                toggle={(toggleRef) => (
                                                    <MenuToggle
                                                        ref={toggleRef}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenServerDropdownIndex(openServerDropdownIndex === index ? null : index);
                                                        }}
                                                        variant="plain"
                                                        aria-label={`Actions for server ${server.getUrl()}`}
                                                    >
                                                        <EllipsisVIcon />
                                                    </MenuToggle>
                                                )}
                                            >
                                                <DropdownList>
                                                    <DropdownItem
                                                        key="edit"
                                                        onClick={() => {
                                                            handleOpenEditServerModal(`${index}`);
                                                            setOpenServerDropdownIndex(null);
                                                        }}
                                                    >
                                                        Edit server
                                                    </DropdownItem>
                                                    <DropdownItem
                                                        key="delete"
                                                        onClick={() => handleDeleteServer(server.getUrl())}
                                                    >
                                                        Delete server
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

            {/* Server modals */}
            <NewServerModal
                isOpen={isNewServerModalOpen}
                onClose={() => setIsNewServerModalOpen(false)}
                onConfirm={handleCreateServer}
            />

            <EditServerModal
                isOpen={editServerUrl !== null}
                serverUrl={editServerUrl || ''}
                currentDescription={editServerDescription}
                variables={editServerVariables}
                onClose={() => {
                    setEditServerUrl(null);
                    setEditServerDescription('');
                    setEditServerVariables([]);
                }}
                onConfirm={handleUpdateServer}
            />
        </>
    );
};
