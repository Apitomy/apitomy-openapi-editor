/**
 * Command to update an existing security scheme
 */

import {
    Document,
    ModelTypeUtil,
    OpenApi20Document,
    OpenApi20SecurityScheme,
    OpenApi30Document,
    OpenApi30SecurityScheme,
    OpenApi31Document
} from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';
import { SecuritySchemeData } from '@components/modals/SecuritySchemeModal';

/**
 * Command to update an existing security scheme
 */
export class UpdateSecuritySchemeCommand extends BaseCommand {
    private _data: SecuritySchemeData;
    private _oldSchemeData: any = null;

    /**
     * Constructor
     * @param data Security scheme data (name must match existing scheme)
     */
    constructor(data: SecuritySchemeData) {
        super();
        this._data = data;
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'UpdateSecuritySchemeCommand';
    }

    /**
     * Execute the command - update the security scheme
     */
    execute(document: Document): void {
        if (ModelTypeUtil.isOpenApi2Model(document)) {
            this.executeForOpenApi20(document as OpenApi20Document);
        } else {
            this.executeForOpenApi30(document as OpenApi30Document | OpenApi31Document);
        }
    }

    /**
     * Execute for OpenAPI 2.0
     */
    private executeForOpenApi20(oaiDoc: OpenApi20Document): void {
        const definitions = oaiDoc.getSecurityDefinitions();
        if (!definitions) return;

        const existingScheme = definitions.getItem(this._data.name) as OpenApi20SecurityScheme;
        if (!existingScheme) return;

        // Save old state for undo
        this._oldSchemeData = {
            type: existingScheme.getType(),
            description: existingScheme.getDescription(),
            name: existingScheme.getName(),
            in: existingScheme.getIn(),
            flow: (existingScheme as any).getFlow?.(),
            authorizationUrl: (existingScheme as any).getAuthorizationUrl?.(),
            tokenUrl: (existingScheme as any).getTokenUrl?.()
        };

        // Update properties
        if (this._data.description !== undefined) {
            existingScheme.setDescription(this._data.description);
        }

        // Type-specific fields
        if (this._data.type === 'apiKey') {
            if (this._data.parameterName) {
                existingScheme.setName(this._data.parameterName);
            }
            if (this._data.in) {
                existingScheme.setIn(this._data.in);
            }
        } else if (this._data.type === 'oauth2') {
            if (this._data.flow) {
                (existingScheme as any).setFlow(this._data.flow);
            }
            if (this._data.authorizationUrl !== undefined) {
                (existingScheme as any).setAuthorizationUrl(this._data.authorizationUrl);
            }
            if (this._data.tokenUrl !== undefined) {
                (existingScheme as any).setTokenUrl(this._data.tokenUrl);
            }
        }
    }

    /**
     * Execute for OpenAPI 3.0/3.1
     */
    private executeForOpenApi30(oaiDoc: OpenApi30Document | OpenApi31Document): void {
        const components = oaiDoc.getComponents();
        if (!components) return;

        const securitySchemes = components.getSecuritySchemes();
        if (!securitySchemes) return;

        const existingScheme = securitySchemes[this._data.name] as OpenApi30SecurityScheme;
        if (!existingScheme) return;

        // Save old state for undo
        this._oldSchemeData = {
            type: existingScheme.getType(),
            description: existingScheme.getDescription(),
            name: existingScheme.getName(),
            in: existingScheme.getIn(),
            scheme: (existingScheme as any).getScheme?.(),
            bearerFormat: (existingScheme as any).getBearerFormat?.(),
            openIdConnectUrl: (existingScheme as any).getOpenIdConnectUrl?.()
        };

        // Update properties
        if (this._data.description !== undefined) {
            existingScheme.setDescription(this._data.description);
        }

        // Type-specific fields
        if (this._data.type === 'apiKey') {
            if (this._data.parameterName) {
                existingScheme.setName(this._data.parameterName);
            }
            if (this._data.in) {
                existingScheme.setIn(this._data.in);
            }
        } else if (this._data.type === 'http') {
            if (this._data.scheme) {
                (existingScheme as any).setScheme(this._data.scheme);
            }
            if (this._data.bearerFormat !== undefined) {
                (existingScheme as any).setBearerFormat(this._data.bearerFormat);
            }
        } else if (this._data.type === 'oauth2') {
            // Note: OAuth2 flows update is complex, simplified here
            // In a full implementation, we'd update the specific flow fields
        } else if (this._data.type === 'openIdConnect') {
            if (this._data.openIdConnectUrl) {
                (existingScheme as any).setOpenIdConnectUrl(this._data.openIdConnectUrl);
            }
        }
    }

    /**
     * Undo the command - restore old values
     */
    undo(document: Document): void {
        if (!this._oldSchemeData) return;

        if (ModelTypeUtil.isOpenApi2Model(document)) {
            const oaiDoc = document as OpenApi20Document;
            const definitions = oaiDoc.getSecurityDefinitions();
            if (!definitions) return;

            const scheme = definitions.getItem(this._data.name) as OpenApi20SecurityScheme;
            if (!scheme) return;

            scheme.setDescription(this._oldSchemeData.description);
            if (this._data.type === 'apiKey') {
                scheme.setName(this._oldSchemeData.name);
                scheme.setIn(this._oldSchemeData.in);
            } else if (this._data.type === 'oauth2') {
                (scheme as any).setFlow(this._oldSchemeData.flow);
                (scheme as any).setAuthorizationUrl(this._oldSchemeData.authorizationUrl);
                (scheme as any).setTokenUrl(this._oldSchemeData.tokenUrl);
            }
        } else {
            const oaiDoc = document as OpenApi30Document | OpenApi31Document;
            const components = oaiDoc.getComponents();
            if (!components) return;

            const securitySchemes = components.getSecuritySchemes();
            if (!securitySchemes) return;

            const scheme = securitySchemes[this._data.name] as OpenApi30SecurityScheme;
            if (!scheme) return;

            scheme.setDescription(this._oldSchemeData.description);
            if (this._data.type === 'apiKey') {
                scheme.setName(this._oldSchemeData.name);
                scheme.setIn(this._oldSchemeData.in);
            } else if (this._data.type === 'http') {
                (scheme as any).setScheme(this._oldSchemeData.scheme);
                (scheme as any).setBearerFormat(this._oldSchemeData.bearerFormat);
            } else if (this._data.type === 'openIdConnect') {
                (scheme as any).setOpenIdConnectUrl(this._oldSchemeData.openIdConnectUrl);
            }
        }
    }
}
