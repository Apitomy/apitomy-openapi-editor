/**
 * Main/Info form for editing API metadata
 */

import React from 'react';
import "./MainForm.css";
import { Title, Label } from '@patternfly/react-core';
import { Extensible, Node, OpenApiServersParent } from '@apitomy/data-models';
import { useDocument } from '@hooks/useDocument';
import { InfoSection } from '@components/forms/main/InfoSection';
import { ContactSection } from '@components/forms/main/ContactSection';
import { LicenseSection } from '@components/forms/main/LicenseSection';
import { HostBasePathSection } from '@components/forms/main/HostBasePathSection';
import { ServersSection } from '@components/forms/main/ServersSection';
import { TagsSection } from '@components/forms/main/TagsSection';
import { SecuritySection } from '@components/forms/main/SecuritySection';
import { VendorExtensionsSection } from '@components/forms/main/VendorExtensionsSection';

/**
 * Main form component for editing API info
 */
export const MainForm: React.FC = () => {
    const { document, specVersion } = useDocument();

    if (!document) {
        return <div>No document loaded</div>;
    }

    return (
        <div className="__main_form">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Title headingLevel="h2" size="xl">
                    API Information
                </Title>
                {specVersion && (
                    <Label color="blue">
                        OpenAPI {specVersion}
                    </Label>
                )}
            </div>
            <p style={{ marginBottom: '1rem', color: 'var(--pf-v6-global--Color--200)' }}>
                Edit the basic information about your API
            </p>

            <InfoSection />

            <ContactSection />

            <LicenseSection />

            {/* Host & Base Path section - only for OpenAPI 2.0 */}
            {specVersion === '2.0' && (
                <HostBasePathSection />
            )}

            {/* Servers section - only for OpenAPI 3.0 and 3.1 */}
            {specVersion !== '2.0' && (
                <ServersSection parent={document as unknown as Node & OpenApiServersParent} />
            )}

            <TagsSection />

            <SecuritySection />

            <VendorExtensionsSection parent={document as unknown as Node & Extensible} />

            <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--pf-v6-global--Color--200)' }}>
                Changes are saved when you press Enter or when a field loses focus. Use Undo/Redo buttons to revert changes.
            </p>
        </div>
    );
};
