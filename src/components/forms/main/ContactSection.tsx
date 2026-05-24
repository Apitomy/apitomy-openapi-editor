/**
 * Contact section for editing contact information
 */

import React, { useState } from 'react';
import { Form } from '@patternfly/react-core';
import { Node, NodePathUtil, OpenApiDocument } from '@apitomy/data-models';
import { useDocument } from '@hooks/useDocument';
import { PropertyInput } from '@components/common/PropertyInput';
import { ExpandablePanel } from '@components/common/ExpandablePanel';
import { CompositeCommand } from '@commands/CompositeCommand';
import { EnsureChildNodeCommand } from '@commands/EnsureChildNodeCommand';
import { ChangePropertyCommand } from '@commands/ChangePropertyCommand';
import { ICommand } from '@commands/ICommand';

/**
 * Contact section component for editing contact information
 */
export const ContactSection: React.FC = () => {
    const { document } = useDocument();
    const [isExpanded, setIsExpanded] = useState(true);

    if (!document) {
        return null;
    }

    const oaiDoc = document as OpenApiDocument;
    const info = oaiDoc.getInfo();
    const contact = info ? info.getContact() : null;

    /**
     * Command factory for changing contact properties
     * Ensures the info and contact nodes exist before changing properties
     */
    const ChangeContactPropertyCommandFactory = (
        _model: Node,
        propertyName: string,
        value: string,
        description: string
    ): ICommand => {
        return new CompositeCommand([
            new EnsureChildNodeCommand(NodePathUtil.createNodePath(oaiDoc), "info"),
            new EnsureChildNodeCommand(NodePathUtil.parseNodePath("/info"), "contact"),
            new ChangePropertyCommand("/info/contact", propertyName, value)
        ], description);
    };

    return (
        <ExpandablePanel
            title="Contact Information"
            nodePath="/info/contact"
            isExpanded={isExpanded}
            onToggle={setIsExpanded}
            className="form__section"
        >
            <Form className="form__sectionbody">
                <PropertyInput
                    model={contact}
                    propertyName="name"
                    label="Contact Name"
                    placeholder="API contact person or team"
                    commandFactory={ChangeContactPropertyCommandFactory}
                />

                <PropertyInput
                    model={contact}
                    propertyName="url"
                    label="Contact URL"
                    placeholder="URL for contact information"
                    commandFactory={ChangeContactPropertyCommandFactory}
                />

                <PropertyInput
                    model={contact}
                    propertyName="email"
                    label="Contact Email"
                    placeholder="email@example.com"
                    commandFactory={ChangeContactPropertyCommandFactory}
                />
            </Form>
        </ExpandablePanel>
    );
};
