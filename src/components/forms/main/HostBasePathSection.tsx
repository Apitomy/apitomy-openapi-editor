/**
 * Host and Base Path section for OpenAPI 2.0 documents
 */

import React, { useState } from 'react';
import { Checkbox, Form, FormGroup } from '@patternfly/react-core';
import { OpenApi20Document } from '@apitomy/data-models';
import { useDocument } from '@hooks/useDocument';
import { useCommand } from '@hooks/useCommand';
import { useSelection } from '@hooks/useSelection';
import { PropertyInput } from '@components/common/PropertyInput';
import { ExpandablePanel } from '@components/common/ExpandablePanel';
import { ChangePropertyCommand } from '@commands/ChangePropertyCommand';

/**
 * Host and Base Path section component for OpenAPI 2.0
 */
export const HostBasePathSection: React.FC = () => {
    const { document } = useDocument();
    const { executeCommand } = useCommand();
    const { select } = useSelection();
    const [isExpanded, setIsExpanded] = useState(true);

    if (!document) {
        return null;
    }

    const oaiDoc = document as OpenApi20Document;
    const currentSchemes = oaiDoc.getSchemes() || [];

    /**
     * Handle changing schemes array
     */
    const handleSchemeChange = (scheme: string, checked: boolean) => {
        // Fire selection event
        select(oaiDoc, "schemes");

        const schemes = [...currentSchemes];

        if (checked && !schemes.includes(scheme)) {
            schemes.push(scheme);
        } else if (!checked && schemes.includes(scheme)) {
            const index = schemes.indexOf(scheme);
            schemes.splice(index, 1);
        }

        const command = new ChangePropertyCommand(
            oaiDoc,
            'schemes',
            schemes.length > 0 ? schemes : null
        );
        executeCommand(command, `Update schemes`);
    };

    return (
        <ExpandablePanel
            title="Host & Base Path"
            nodePath="/host"
            isExpanded={isExpanded}
            onToggle={setIsExpanded}
            className="form__section"
        >
            <Form className="form__sectionbody">
                <PropertyInput
                    model={oaiDoc}
                    propertyName="host"
                    label="Host"
                    placeholder="api.example.com or api.example.com:8080"
                />

                <PropertyInput
                    model={oaiDoc}
                    propertyName="basePath"
                    label="Base Path"
                    placeholder="/v1 or /api"
                />

                <FormGroup
                    label="Schemes"
                    fieldId="schemes"
                    data-path="/"
                    data-property-name="schemes"
                    data-selectable="true"
                >
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <Checkbox
                            id="scheme-http"
                            label="http"
                            isChecked={currentSchemes.includes('http')}
                            onChange={(_event, checked) => handleSchemeChange('http', checked)}
                        />
                        <Checkbox
                            id="scheme-https"
                            label="https"
                            isChecked={currentSchemes.includes('https')}
                            onChange={(_event, checked) => handleSchemeChange('https', checked)}
                        />
                        <Checkbox
                            id="scheme-ws"
                            label="ws"
                            isChecked={currentSchemes.includes('ws')}
                            onChange={(_event, checked) => handleSchemeChange('ws', checked)}
                        />
                        <Checkbox
                            id="scheme-wss"
                            label="wss"
                            isChecked={currentSchemes.includes('wss')}
                            onChange={(_event, checked) => handleSchemeChange('wss', checked)}
                        />
                    </div>
                </FormGroup>
            </Form>
        </ExpandablePanel>
    );
};
