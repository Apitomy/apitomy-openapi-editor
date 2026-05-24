/**
 * Component for displaying detailed information about a security scheme
 */

import React from 'react';
import { SecurityScheme } from '@apitomy/data-models';

interface SecuritySchemeDetailsProps {
    scheme: SecurityScheme;
    specVersion: string | null;
}

/**
 * Displays type-specific details for a security scheme
 */
export const SecuritySchemeDetails: React.FC<SecuritySchemeDetailsProps> = ({ scheme, specVersion }) => {
    const type = scheme.getType();

    if (type === 'basic') {
        return (
            <div style={{ backgroundColor: 'var(--pf-v6-global--BackgroundColor--200)' }}>
                <p><strong>Type:</strong> Basic Authentication</p>
                <p style={{ marginTop: '0.5rem', color: 'var(--pf-v6-global--Color--200)' }}>
                    Uses HTTP Basic Authentication with username and password encoded in Base64.
                </p>
            </div>
        );
    }

    if (type === 'apiKey') {
        const paramName = scheme.getName();
        const inLocation = scheme.getIn();
        return (
            <div style={{ backgroundColor: 'var(--pf-v6-global--BackgroundColor--200)' }}>
                <p><strong>Parameter Name:</strong> {paramName || 'Not specified'}</p>
                <p style={{ marginTop: '0.5rem' }}><strong>Location:</strong> {inLocation || 'Not specified'}</p>
            </div>
        );
    }

    if (type === 'http' && specVersion !== '2.0') {
        const scheme30 = scheme as any;
        const httpScheme = scheme30.getScheme?.();
        const bearerFormat = scheme30.getBearerFormat?.();
        return (
            <div style={{ backgroundColor: 'var(--pf-v6-global--BackgroundColor--200)' }}>
                <p><strong>Scheme:</strong> {httpScheme || 'Not specified'}</p>
                {bearerFormat && (
                    <p style={{ marginTop: '0.5rem' }}><strong>Bearer Format:</strong> {bearerFormat}</p>
                )}
            </div>
        );
    }

    if (type === 'oauth2') {
        if (specVersion === '2.0') {
            return <OAuth2DetailsV2 scheme={scheme} />;
        } else {
            return <OAuth2DetailsV3 scheme={scheme} />;
        }
    }

    if (type === 'openIdConnect' && specVersion !== '2.0') {
        const scheme30 = scheme as any;
        const openIdConnectUrl = scheme30.getOpenIdConnectUrl?.();
        return (
            <div style={{ backgroundColor: 'var(--pf-v6-global--BackgroundColor--200)' }}>
                <p><strong>OpenID Connect URL:</strong> {openIdConnectUrl || 'Not specified'}</p>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: 'var(--pf-v6-global--BackgroundColor--200)' }}>
            <p style={{ color: 'var(--pf-v6-global--Color--200)' }}>No additional details available</p>
        </div>
    );
};

/**
 * OAuth2 details for OpenAPI 2.0
 */
const OAuth2DetailsV2: React.FC<{ scheme: SecurityScheme }> = ({ scheme }) => {
    const scheme20 = scheme as any;
    const flow = scheme20.getFlow?.();
    const authUrl = scheme20.getAuthorizationUrl?.();
    const tokenUrl = scheme20.getTokenUrl?.();
    const scopes = scheme20.getScopes?.();

    // Get scope names using MappedNode interface
    const scopeNames = scopes?.getItemNames?.() || [];

    return (
        <div style={{ backgroundColor: 'var(--pf-v6-global--BackgroundColor--200)' }}>
            <p><strong>Flow:</strong> {flow || 'Not specified'}</p>
            {authUrl && (
                <p style={{ marginTop: '0.5rem' }}><strong>Authorization URL:</strong> {authUrl}</p>
            )}
            {tokenUrl && (
                <p style={{ marginTop: '0.5rem' }}><strong>Token URL:</strong> {tokenUrl}</p>
            )}
            {scopeNames.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                    <strong>Scopes:</strong>
                    <ul style={{ marginTop: '0.25rem', marginLeft: '1.5rem' }}>
                        {scopeNames.map((scopeName: string) => (
                            <li key={scopeName}>{scopeName}: {scopes.getItem(scopeName)}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

/**
 * OAuth2 details for OpenAPI 3.0+
 */
const OAuth2DetailsV3: React.FC<{ scheme: SecurityScheme }> = ({ scheme }) => {
    const scheme30 = scheme as any;
    const flows = scheme30.getFlows?.();

    if (!flows) {
        return (
            <div style={{ backgroundColor: 'var(--pf-v6-global--BackgroundColor--200)' }}>
                <p style={{ color: 'var(--pf-v6-global--Color--200)' }}>No OAuth2 flows configured</p>
            </div>
        );
    }

    const renderFlow = (flowName: string, flow: any) => {
        if (!flow) return null;
        const authUrl = flow.getAuthorizationUrl?.();
        const tokenUrl = flow.getTokenUrl?.();
        const refreshUrl = flow.getRefreshUrl?.();
        const scopes = flow.getScopes?.();

        return (
            <div key={flowName} style={{ marginTop: '0.5rem' }}>
                <p><strong>{flowName}:</strong></p>
                <div style={{ marginLeft: '1rem' }}>
                    {authUrl && <p>Authorization URL: {authUrl}</p>}
                    {tokenUrl && <p>Token URL: {tokenUrl}</p>}
                    {refreshUrl && <p>Refresh URL: {refreshUrl}</p>}
                    {scopes && Object.keys(scopes).length > 0 && (
                        <div>
                            <strong>Scopes:</strong>
                            <ul style={{ marginLeft: '1.5rem' }}>
                                {Object.keys(scopes).map(scopeName => (
                                    <li key={scopeName}>{scopeName}: {scopes[scopeName]}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div style={{ backgroundColor: 'var(--pf-v6-global--BackgroundColor--200)' }}>
            {renderFlow('Implicit', flows.getImplicit?.())}
            {renderFlow('Password', flows.getPassword?.())}
            {renderFlow('Client Credentials', flows.getClientCredentials?.())}
            {renderFlow('Authorization Code', flows.getAuthorizationCode?.())}
        </div>
    );
};
