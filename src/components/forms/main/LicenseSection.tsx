/**
 * License section for editing license information
 */

import React, {useState} from 'react';
import {Button} from '@patternfly/react-core';
import {PencilAltIcon} from '@patternfly/react-icons';
import {NodePathUtil, OpenApiDocument} from '@apitomy/data-models';
import {useDocument} from '@hooks/useDocument';
import {useCommand} from '@hooks/useCommand';
import {ExpandablePanel} from '@components/common/ExpandablePanel';
import {LicenseChooserModal} from '@components/modals/LicenseChooserModal';
import {CompositeCommand} from '@commands/CompositeCommand';
import {EnsureChildNodeCommand} from '@commands/EnsureChildNodeCommand';
import {ChangePropertyCommand} from '@commands/ChangePropertyCommand';
import {ICommand} from '@commands/ICommand';
import {findLicenseByName, LicenseMetaData} from '../../../data/licenses';
import './LicenseSection.css';
import {LicenseInfo} from "@components/common/LicenseInfo.tsx";

/**
 * License section component for editing license information
 */
export const LicenseSection: React.FC = () => {
    const { document } = useDocument();
    const { executeCommand } = useCommand();
    const [isExpanded, setIsExpanded] = useState(true);
    const [isChooserOpen, setIsChooserOpen] = useState(false);

    if (!document) {
        return null;
    }

    const oaiDoc = document as OpenApiDocument;
    const info = oaiDoc.getInfo();
    const license = info ? info.getLicense() : null;
    const licenseName = license ? license.getName() : '';

    // Try to find license info from our database
    const licenseMD: LicenseMetaData | undefined = findLicenseByName(licenseName);

    /**
     * Handle license selection from the chooser modal
     */
    const handleLicenseSelect = (selectedLicense: LicenseMetaData) => {
        const commands: ICommand[] = [
            new EnsureChildNodeCommand(NodePathUtil.createNodePath(oaiDoc), "info"),
            new EnsureChildNodeCommand(NodePathUtil.parseNodePath("/info"), "license"),
            new ChangePropertyCommand("/info/license", "name", selectedLicense.name),
            new ChangePropertyCommand("/info/license", "url", selectedLicense.url)
        ];

        executeCommand(
            new CompositeCommand(commands, `Set license to ${selectedLicense.name}`),
            `Set license to ${selectedLicense.name}`
        );
    };

    return (
        <>
            <ExpandablePanel
                title="License"
                nodePath="/info/license"
                isExpanded={isExpanded}
                onToggle={setIsExpanded}
                className="form__section"
                actions={
                    <Button
                        variant="plain"
                        icon={<PencilAltIcon />}
                        onClick={() => setIsChooserOpen(true)}
                    />
                }
            >
                <div className="form__sectionbody">
                    {/* License Display */}
                    {licenseMD ? (
                        <LicenseInfo
                            license={licenseMD}
                            isStandalone={true}
                            onClick={() => setIsChooserOpen(true)}
                        />
                    ) : <span><em>No license configured.  Use the pencil icon to set one.</em></span>}
                </div>
            </ExpandablePanel>

            {/* License Chooser Modal */}
            <LicenseChooserModal
                isOpen={isChooserOpen}
                onClose={() => setIsChooserOpen(false)}
                onSelect={handleLicenseSelect}
                currentLicenseName={licenseName}
            />
        </>
    );
};
