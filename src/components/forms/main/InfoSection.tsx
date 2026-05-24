/**
 * Info section for editing API information
 */

import React, { useState } from 'react';
import { Form } from '@patternfly/react-core';
import { Node, NodePathUtil, OpenApiDocument, OpenApi20Document } from '@apitomy/data-models';
import { useDocument } from '@hooks/useDocument';
import { useCommand } from '@hooks/useCommand';
import { PropertyInput } from '@components/common/PropertyInput';
import { MimeTypeArrayInput } from '@components/common/MimeTypeArrayInput';
import { ExpandablePanel } from '@components/common/ExpandablePanel';
import { CompositeCommand } from '@commands/CompositeCommand';
import { EnsureChildNodeCommand } from '@commands/EnsureChildNodeCommand';
import { ChangePropertyCommand } from '@commands/ChangePropertyCommand';
import { ICommand } from '@commands/ICommand';

/**
 * Info section component for editing API information
 */
export const InfoSection: React.FC = () => {
    const { document, specVersion } = useDocument();
    const { executeCommand } = useCommand();
    const [isExpanded, setIsExpanded] = useState(true);

    if (!document) {
        return null;
    }

    const oaiDoc = document as OpenApiDocument;
    const info = oaiDoc.getInfo();

    /**
     * Command factory for changing info properties
     * Ensures the info node exists before changing properties
     */
    const ChangeInfoPropertyCommandFactory = (
        _model: Node,
        propertyName: string,
        value: string,
        description: string
    ): ICommand => {
        return new CompositeCommand([
            new EnsureChildNodeCommand(NodePathUtil.createNodePath(oaiDoc), "info"),
            new ChangePropertyCommand("/info", propertyName, value)
        ], description);
    };

    /**
     * Handle changing consumes array (OpenAPI 2.0 only)
     */
    const handleConsumesChange = (newConsumes: string[]) => {
        const command = new ChangePropertyCommand(
            oaiDoc,
            'consumes',
            newConsumes.length > 0 ? newConsumes : null
        );
        executeCommand(command, 'Update consumes');
    };

    /**
     * Handle changing produces array (OpenAPI 2.0 only)
     */
    const handleProducesChange = (newProduces: string[]) => {
        const command = new ChangePropertyCommand(
            oaiDoc,
            'produces',
            newProduces.length > 0 ? newProduces : null
        );
        executeCommand(command, 'Update produces');
    };

    return (
        <ExpandablePanel
            title="API Info"
            nodePath="/info"
            isExpanded={isExpanded}
            onToggle={setIsExpanded}
            className="form__section"
        >
            <Form className="form__sectionbody">
                <PropertyInput
                    model={info!}
                    propertyName="title"
                    label="Title"
                    commandFactory={ChangeInfoPropertyCommandFactory}
                />

                <PropertyInput
                    model={info!}
                    propertyName="version"
                    label="Version"
                    commandFactory={ChangeInfoPropertyCommandFactory}
                />

                <PropertyInput
                    model={info!}
                    propertyName="description"
                    label="Description"
                    type="textarea"
                    commandFactory={ChangeInfoPropertyCommandFactory}
                />

                <PropertyInput
                    model={info!}
                    propertyName="termsOfService"
                    label="Terms of Service"
                    placeholder="URL to terms of service"
                    commandFactory={ChangeInfoPropertyCommandFactory}
                />

                {/* Consumes and Produces - only for OpenAPI 2.0 */}
                {specVersion === '2.0' && (
                    <>
                        <MimeTypeArrayInput
                            label="Consumes (Inputs)"
                            value={(oaiDoc as OpenApi20Document).getConsumes() || []}
                            onChange={handleConsumesChange}
                            propertyName="consumes"
                            nodePath={NodePathUtil.createNodePath(oaiDoc)}
                            fieldId="consumes"
                        />

                        <MimeTypeArrayInput
                            label="Produces (Outputs)"
                            value={(oaiDoc as OpenApi20Document).getProduces() || []}
                            onChange={handleProducesChange}
                            propertyName="produces"
                            nodePath={NodePathUtil.createNodePath(oaiDoc)}
                            fieldId="produces"
                        />
                    </>
                )}
            </Form>
        </ExpandablePanel>
    );
};
