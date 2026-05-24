/**
 * Command to add a new security scheme to the document
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
import {OpenApiOAuthFlow} from "@apitomy/data-models";

/**
 * Command to add a new security scheme definition to the document
 */
export class AddSecuritySchemeCommand extends BaseCommand {
    private _data: SecuritySchemeData;
    private _index?: number;
    private _schemeCreated: boolean = false;

    /**
     * Constructor
     * @param data Security scheme data
     * @param index Optional index to insert the scheme at (for maintaining order during edits)
     */
    constructor(data: SecuritySchemeData, index?: number) {
        super();
        this._data = data;
        this._index = index;
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'AddSecuritySchemeCommand';
    }

    /**
     * Execute the command - add a new security scheme
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
        let definitions = oaiDoc.getSecurityDefinitions();
        if (!definitions) {
            definitions = oaiDoc.createSecurityDefinitions();
            oaiDoc.setSecurityDefinitions(definitions);
        }

        // Check if scheme already exists
        const existingScheme = definitions.getItem(this._data.name);
        if (existingScheme && this._index === undefined) {
            this._schemeCreated = false;
            return;
        }

        // Create new security scheme
        const newScheme = this.createOpenApi20Scheme(definitions);

        // Handle index-based insertion for maintaining order
        if (this._index !== undefined) {
            // Get all existing schemes
            const existingNames = definitions.getItemNames();
            const allSchemes: Array<{ name: string; scheme: any }> = [];

            // Collect all existing schemes
            existingNames.forEach(name => {
                if (name !== this._data.name) { // Skip if re-adding with same name
                    allSchemes.push({ name, scheme: definitions.getItem(name) });
                }
            });

            // Insert new scheme at specified index
            allSchemes.splice(this._index, 0, { name: this._data.name, scheme: newScheme });

            // Clear and re-add all schemes in order
            existingNames.forEach(name => definitions.removeItem(name));
            allSchemes.forEach(({ name, scheme }) => definitions.addItem(name, scheme));
        } else {
            // Simple add at end
            definitions.addItem(this._data.name, newScheme);
        }

        this._schemeCreated = true;
    }

    /**
     * Create OpenAPI 2.0 security scheme
     */
    private createOpenApi20Scheme(definitions: any): OpenApi20SecurityScheme {
        const newScheme = definitions.createSecurityScheme() as OpenApi20SecurityScheme;
        newScheme.setType(this._data.type);

        if (this._data.description) {
            newScheme.setDescription(this._data.description);
        }

        // Type-specific fields
        if (this._data.type === 'apiKey') {
            if (this._data.parameterName) {
                newScheme.setName(this._data.parameterName);
            }
            if (this._data.in) {
                newScheme.setIn(this._data.in);
            }
        } else if (this._data.type === 'oauth2') {
            if (this._data.flow) {
                newScheme.setFlow(this._data.flow);
            }
            if (this._data.authorizationUrl) {
                newScheme.setAuthorizationUrl(this._data.authorizationUrl);
            }
            if (this._data.tokenUrl) {
                newScheme.setTokenUrl(this._data.tokenUrl);
            }
            // Create empty scopes object
            const scopes = newScheme.createScopes();
            newScheme.setScopes(scopes);
        }

        return newScheme;
    }

    /**
     * Execute for OpenAPI 3.0/3.1
     */
    private executeForOpenApi30(oaiDoc: OpenApi30Document | OpenApi31Document): void {
        let components: any = oaiDoc.getComponents();
        if (!components) {
            components = oaiDoc.createComponents();
            oaiDoc.setComponents(components);
        }

        let securitySchemes = components.getSecuritySchemes();
        if (!securitySchemes) {
            securitySchemes = {};
        }

        // Check if scheme already exists
        if (securitySchemes[this._data.name] && this._index === undefined) {
            this._schemeCreated = false;
            return;
        }

        // Create new security scheme
        const newScheme = this.createOpenApi30Scheme(components);

        // Handle index-based insertion for maintaining order
        if (this._index !== undefined) {
            // Get all existing schemes
            const existingNames = Object.keys(securitySchemes);
            const allSchemes: Array<{ name: string; scheme: OpenApi30SecurityScheme }> = [];

            // Collect all existing schemes
            existingNames.forEach(name => {
                if (name !== this._data.name) { // Skip if re-adding with same name
                    allSchemes.push({ name, scheme: securitySchemes[name] as OpenApi30SecurityScheme });
                }
            });

            // Insert new scheme at specified index
            allSchemes.splice(this._index, 0, { name: this._data.name, scheme: newScheme });

            // Clear and re-add all schemes in order
            existingNames.forEach(name => components.removeSecurityScheme(name));
            allSchemes.forEach(({ name, scheme }) => components.addSecurityScheme(name, scheme));
        } else {
            // Simple add at end
            components.addSecurityScheme(this._data.name, newScheme);
        }

        this._schemeCreated = true;
    }

    /**
     * Create OpenAPI 3.0/3.1 security scheme
     */
    private createOpenApi30Scheme(components: any): OpenApi30SecurityScheme {
        const newScheme = components.createSecurityScheme() as OpenApi30SecurityScheme;
        newScheme.setType(this._data.type);

        if (this._data.description) {
            newScheme.setDescription(this._data.description);
        }

        // Type-specific fields
        if (this._data.type === 'apiKey') {
            if (this._data.parameterName) {
                newScheme.setName(this._data.parameterName);
            }
            if (this._data.in) {
                newScheme.setIn(this._data.in);
            }
        } else if (this._data.type === 'http') {
            if (this._data.scheme) {
                newScheme.setScheme(this._data.scheme);
            }
            if (this._data.bearerFormat) {
                newScheme.setBearerFormat(this._data.bearerFormat);
            }
        } else if (this._data.type === 'oauth2') {
            // Create OAuth flows object
            const flows = newScheme.createOAuthFlows();

            // Handle multiple flows (OpenAPI 3.0+)
            if (this._data.oauth2Flows) {
                // Implicit flow
                if (this._data.oauth2Flows.implicit) {
                    const implicitFlow: OpenApiOAuthFlow = flows.createOAuthFlow() as OpenApiOAuthFlow;
                    if (this._data.oauth2Flows.implicit.authorizationUrl) {
                        implicitFlow.setAuthorizationUrl(this._data.oauth2Flows.implicit.authorizationUrl);
                    }
                    if (this._data.oauth2Flows.implicit.refreshUrl) {
                        implicitFlow.setRefreshUrl(this._data.oauth2Flows.implicit.refreshUrl);
                    }
                    // Create empty scopes
                    const scopes = {};
                    implicitFlow.setScopes(scopes);
                    flows.setImplicit(implicitFlow);
                }

                // Password flow
                if (this._data.oauth2Flows.password) {
                    const passwordFlow: OpenApiOAuthFlow = flows.createOAuthFlow() as OpenApiOAuthFlow;
                    if (this._data.oauth2Flows.password.tokenUrl) {
                        passwordFlow.setTokenUrl(this._data.oauth2Flows.password.tokenUrl);
                    }
                    if (this._data.oauth2Flows.password.refreshUrl) {
                        passwordFlow.setRefreshUrl(this._data.oauth2Flows.password.refreshUrl);
                    }
                    // Create empty scopes
                    const scopes = {};
                    passwordFlow.setScopes(scopes);
                    flows.setPassword(passwordFlow);
                }

                // Client Credentials flow
                if (this._data.oauth2Flows.clientCredentials) {
                    const clientCredsFlow: OpenApiOAuthFlow = flows.createOAuthFlow() as OpenApiOAuthFlow;
                    if (this._data.oauth2Flows.clientCredentials.tokenUrl) {
                        clientCredsFlow.setTokenUrl(this._data.oauth2Flows.clientCredentials.tokenUrl);
                    }
                    if (this._data.oauth2Flows.clientCredentials.refreshUrl) {
                        clientCredsFlow.setRefreshUrl(this._data.oauth2Flows.clientCredentials.refreshUrl);
                    }
                    // Create empty scopes
                    const scopes = {};
                    clientCredsFlow.setScopes(scopes);
                    flows.setClientCredentials(clientCredsFlow);
                }

                // Authorization Code flow
                if (this._data.oauth2Flows.authorizationCode) {
                    const authCodeFlow: OpenApiOAuthFlow = flows.createOAuthFlow() as OpenApiOAuthFlow;
                    if (this._data.oauth2Flows.authorizationCode.authorizationUrl) {
                        authCodeFlow.setAuthorizationUrl(this._data.oauth2Flows.authorizationCode.authorizationUrl);
                    }
                    if (this._data.oauth2Flows.authorizationCode.tokenUrl) {
                        authCodeFlow.setTokenUrl(this._data.oauth2Flows.authorizationCode.tokenUrl);
                    }
                    if (this._data.oauth2Flows.authorizationCode.refreshUrl) {
                        authCodeFlow.setRefreshUrl(this._data.oauth2Flows.authorizationCode.refreshUrl);
                    }
                    // Create empty scopes
                    const scopes = {};
                    authCodeFlow.setScopes(scopes);
                    flows.setAuthorizationCode(authCodeFlow);
                }

                newScheme.setFlows(flows);
            }
            // Handle single flow (backward compatibility with old data format)
            else if (this._data.flow) {
                // Create the appropriate flow
                if (this._data.flow === 'implicit') {
                    const implicitFlow: OpenApiOAuthFlow = flows.createOAuthFlow() as OpenApiOAuthFlow;
                    if (this._data.authorizationUrl) {
                        implicitFlow.setAuthorizationUrl(this._data.authorizationUrl);
                    }
                    // Create empty scopes
                    const scopes = {};
                    implicitFlow.setScopes(scopes);
                    flows.setImplicit(implicitFlow);
                } else if (this._data.flow === 'password') {
                    const passwordFlow: OpenApiOAuthFlow = flows.createOAuthFlow() as OpenApiOAuthFlow;
                    if (this._data.tokenUrl) {
                        passwordFlow.setTokenUrl(this._data.tokenUrl);
                    }
                    // Create empty scopes
                    const scopes = {};
                    passwordFlow.setScopes(scopes);
                    flows.setPassword(passwordFlow);
                } else if (this._data.flow === 'clientCredentials') {
                    const clientCredsFlow: OpenApiOAuthFlow = flows.createOAuthFlow() as OpenApiOAuthFlow;
                    if (this._data.tokenUrl) {
                        clientCredsFlow.setTokenUrl(this._data.tokenUrl);
                    }
                    // Create empty scopes
                    const scopes = {};
                    clientCredsFlow.setScopes(scopes);
                    flows.setClientCredentials(clientCredsFlow);
                } else if (this._data.flow === 'authorizationCode') {
                    const authCodeFlow: OpenApiOAuthFlow = flows.createOAuthFlow() as OpenApiOAuthFlow;
                    if (this._data.authorizationUrl) {
                        authCodeFlow.setAuthorizationUrl(this._data.authorizationUrl);
                    }
                    if (this._data.tokenUrl) {
                        authCodeFlow.setTokenUrl(this._data.tokenUrl);
                    }
                    // Create empty scopes
                    const scopes = {};
                    authCodeFlow.setScopes(scopes);
                    flows.setAuthorizationCode(authCodeFlow);
                }

                newScheme.setFlows(flows);
            }
        } else if (this._data.type === 'openIdConnect') {
            if (this._data.openIdConnectUrl) {
                newScheme.setOpenIdConnectUrl(this._data.openIdConnectUrl);
            }
        }

        return newScheme;
    }

    /**
     * Undo the command - remove the security scheme
     */
    undo(document: Document): void {
        if (!this._schemeCreated) {
            return;
        }

        if (ModelTypeUtil.isOpenApi2Model(document)) {
            const oaiDoc = document as OpenApi20Document;
            const definitions = oaiDoc.getSecurityDefinitions();
            if (definitions) {
                definitions.removeItem(this._data.name);
            }
        } else {
            const oaiDoc = document as OpenApi30Document | OpenApi31Document;
            const components = oaiDoc.getComponents();
            if (components) {
                components.removeSecurityScheme(this._data.name);
            }
        }
    }
}
