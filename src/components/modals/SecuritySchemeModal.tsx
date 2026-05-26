/* eslint-disable react-hooks/set-state-in-effect -- modal/form state initialization */
/**
 * Modal for creating or editing a security scheme
 */

import React, { useState, useEffect } from 'react';
import {
    Button,
    Checkbox,
    Form,
    FormGroup,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Select,
    SelectOption,
    SelectList,
    MenuToggle,
    Tab,
    Tabs,
    TabTitleText,
    TextInput,
    TextArea
} from '@patternfly/react-core';
import { useDocument } from '@hooks/useDocument';

interface SecuritySchemeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: SecuritySchemeData) => void;
    editData?: SecuritySchemeData | null;
}

/**
 * OAuth2 flow configuration
 */
export interface OAuth2FlowConfig {
    authorizationUrl?: string;
    tokenUrl?: string;
    refreshUrl?: string;
}

export interface SecuritySchemeData {
    name: string;
    type: string;
    description: string;
    // API Key fields
    parameterName?: string;
    in?: string;
    // HTTP fields (3.0+)
    scheme?: string;
    bearerFormat?: string;
    // OAuth2 fields (2.0 - single flow)
    flow?: string;
    authorizationUrl?: string;
    tokenUrl?: string;
    // OAuth2 fields (3.0+ - multiple flows)
    oauth2Flows?: {
        implicit?: OAuth2FlowConfig;
        password?: OAuth2FlowConfig;
        clientCredentials?: OAuth2FlowConfig;
        authorizationCode?: OAuth2FlowConfig;
    };
    // OpenID Connect fields (3.0+)
    openIdConnectUrl?: string;
}

/**
 * Modal component for creating or editing a security scheme
 */
export const SecuritySchemeModal: React.FC<SecuritySchemeModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    editData
}) => {
    const { specVersion } = useDocument();
    const isEditMode = !!editData;

    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [description, setDescription] = useState('');
    const [parameterName, setParameterName] = useState('');
    const [inLocation, setInLocation] = useState('header');
    const [httpScheme, setHttpScheme] = useState('');
    const [bearerFormat, setBearerFormat] = useState('');
    // OAuth2 2.0 single flow
    const [flow, setFlow] = useState('');
    const [authorizationUrl, setAuthorizationUrl] = useState('');
    const [tokenUrl, setTokenUrl] = useState('');
    // OAuth2 3.0+ multiple flows - enabled flows
    const [enabledFlows, setEnabledFlows] = useState<Set<string>>(new Set());
    // OAuth2 3.0+ multiple flows - implicit
    const [implicitAuthUrl, setImplicitAuthUrl] = useState('');
    const [implicitRefreshUrl, setImplicitRefreshUrl] = useState('');
    // OAuth2 3.0+ multiple flows - password
    const [passwordTokenUrl, setPasswordTokenUrl] = useState('');
    const [passwordRefreshUrl, setPasswordRefreshUrl] = useState('');
    // OAuth2 3.0+ multiple flows - clientCredentials
    const [clientCredentialsTokenUrl, setClientCredentialsTokenUrl] = useState('');
    const [clientCredentialsRefreshUrl, setClientCredentialsRefreshUrl] = useState('');
    // OAuth2 3.0+ multiple flows - authorizationCode
    const [authCodeAuthUrl, setAuthCodeAuthUrl] = useState('');
    const [authCodeTokenUrl, setAuthCodeTokenUrl] = useState('');
    const [authCodeRefreshUrl, setAuthCodeRefreshUrl] = useState('');
    // OpenID Connect
    const [openIdConnectUrl, setOpenIdConnectUrl] = useState('');

    const [isTypeSelectOpen, setIsTypeSelectOpen] = useState(false);
    const [isInSelectOpen, setIsInSelectOpen] = useState(false);
    const [isHttpSchemeSelectOpen, setIsHttpSchemeSelectOpen] = useState(false);
    const [isFlowSelectOpen, setIsFlowSelectOpen] = useState(false);
    const [activeOAuth2Tab, setActiveOAuth2Tab] = useState<string | number>('implicit');

    /**
     * Load edit data when modal opens in edit mode
     */
     
    useEffect(() => {
        if (isOpen && editData) {
            setName(editData.name || '');
            setType(editData.type || '');
            setDescription(editData.description || '');
            setParameterName(editData.parameterName || '');
            setInLocation(editData.in || 'header');
            setHttpScheme(editData.scheme || '');
            setBearerFormat(editData.bearerFormat || '');
            setFlow(editData.flow || '');
            setAuthorizationUrl(editData.authorizationUrl || '');
            setTokenUrl(editData.tokenUrl || '');
            setOpenIdConnectUrl(editData.openIdConnectUrl || '');

            // Load OAuth2 3.0+ multiple flows
            if (editData.oauth2Flows) {
                const enabled = new Set<string>();

                if (editData.oauth2Flows.implicit) {
                    enabled.add('implicit');
                    setImplicitAuthUrl(editData.oauth2Flows.implicit.authorizationUrl || '');
                    setImplicitRefreshUrl(editData.oauth2Flows.implicit.refreshUrl || '');
                }
                if (editData.oauth2Flows.password) {
                    enabled.add('password');
                    setPasswordTokenUrl(editData.oauth2Flows.password.tokenUrl || '');
                    setPasswordRefreshUrl(editData.oauth2Flows.password.refreshUrl || '');
                }
                if (editData.oauth2Flows.clientCredentials) {
                    enabled.add('clientCredentials');
                    setClientCredentialsTokenUrl(editData.oauth2Flows.clientCredentials.tokenUrl || '');
                    setClientCredentialsRefreshUrl(editData.oauth2Flows.clientCredentials.refreshUrl || '');
                }
                if (editData.oauth2Flows.authorizationCode) {
                    enabled.add('authorizationCode');
                    setAuthCodeAuthUrl(editData.oauth2Flows.authorizationCode.authorizationUrl || '');
                    setAuthCodeTokenUrl(editData.oauth2Flows.authorizationCode.tokenUrl || '');
                    setAuthCodeRefreshUrl(editData.oauth2Flows.authorizationCode.refreshUrl || '');
                }

                setEnabledFlows(enabled);
            }
        }
    }, [isOpen, editData]);

    /**
     * Get available security scheme types based on spec version
     */
    const getAvailableTypes = (): { value: string; label: string }[] => {
        if (specVersion === '2.0') {
            return [
                { value: 'basic', label: 'Basic Authentication' },
                { value: 'apiKey', label: 'API Key' },
                { value: 'oauth2', label: 'OAuth 2.0' }
            ];
        } else {
            return [
                { value: 'apiKey', label: 'API Key' },
                { value: 'http', label: 'HTTP' },
                { value: 'oauth2', label: 'OAuth 2.0' },
                { value: 'openIdConnect', label: 'OpenID Connect' }
            ];
        }
    };

    /**
     * Get available "in" locations for API Key
     */
    const getInLocations = (): { value: string; label: string }[] => {
        if (specVersion === '2.0') {
            return [
                { value: 'header', label: 'Header' },
                { value: 'query', label: 'Query Parameter' }
            ];
        } else {
            return [
                { value: 'header', label: 'Header' },
                { value: 'query', label: 'Query Parameter' },
                { value: 'cookie', label: 'Cookie' }
            ];
        }
    };

    /**
     * Get available HTTP authentication schemes from IANA registry
     * https://www.iana.org/assignments/http-authschemes/http-authschemes.xhtml
     */
    const getHttpSchemes = (): { value: string; label: string }[] => {
        return [
            { value: 'Basic', label: 'Basic' },
            { value: 'Bearer', label: 'Bearer' },
            { value: 'Concealed', label: 'Concealed' },
            { value: 'Digest', label: 'Digest' },
            { value: 'DPoP', label: 'DPoP' },
            { value: 'GNAP', label: 'GNAP' },
            { value: 'HOBA', label: 'HOBA' },
            { value: 'Mutual', label: 'Mutual' },
            { value: 'Negotiate', label: 'Negotiate' },
            { value: 'OAuth', label: 'OAuth' },
            { value: 'PrivateToken', label: 'PrivateToken' },
            { value: 'SCRAM-SHA-1', label: 'SCRAM-SHA-1' },
            { value: 'SCRAM-SHA-256', label: 'SCRAM-SHA-256' },
            { value: 'vapid', label: 'vapid' }
        ];
    };

    /**
     * Get available OAuth2 flows
     */
    const getOAuth2Flows = (): { value: string; label: string }[] => {
        if (specVersion === '2.0') {
            return [
                { value: 'implicit', label: 'Implicit' },
                { value: 'password', label: 'Password' },
                { value: 'application', label: 'Application' },
                { value: 'accessCode', label: 'Access Code' }
            ];
        } else {
            return [
                { value: 'implicit', label: 'Implicit' },
                { value: 'password', label: 'Password' },
                { value: 'clientCredentials', label: 'Client Credentials' },
                { value: 'authorizationCode', label: 'Authorization Code' }
            ];
        }
    };

    /**
     * Reset modal state
     */
    const resetState = () => {
        setName('');
        setType('');
        setDescription('');
        setParameterName('');
        setInLocation('header');
        setHttpScheme('');
        setBearerFormat('');
        setFlow('');
        setAuthorizationUrl('');
        setTokenUrl('');
        setOpenIdConnectUrl('');
        // Reset OAuth2 3.0+ flows
        setEnabledFlows(new Set());
        setImplicitAuthUrl('');
        setImplicitRefreshUrl('');
        setPasswordTokenUrl('');
        setPasswordRefreshUrl('');
        setClientCredentialsTokenUrl('');
        setClientCredentialsRefreshUrl('');
        setAuthCodeAuthUrl('');
        setAuthCodeTokenUrl('');
        setAuthCodeRefreshUrl('');
    };

    /**
     * Handle modal close
     */
    const handleClose = () => {
        resetState();
        onClose();
    };

    /**
     * Handle confirm
     */
    const handleConfirm = () => {
        const data: SecuritySchemeData = {
            name: name.trim(),
            type,
            description: description.trim()
        };

        if (type === 'apiKey') {
            data.parameterName = parameterName.trim();
            data.in = inLocation;
        } else if (type === 'http') {
            data.scheme = httpScheme.trim();
            data.bearerFormat = bearerFormat.trim();
        } else if (type === 'oauth2') {
            if (specVersion === '2.0') {
                // OpenAPI 2.0 - single flow
                data.flow = flow;
                data.authorizationUrl = authorizationUrl.trim();
                data.tokenUrl = tokenUrl.trim();
            } else {
                // OpenAPI 3.0+ - multiple flows
                data.oauth2Flows = {};

                if (enabledFlows.has('implicit')) {
                    data.oauth2Flows.implicit = {
                        authorizationUrl: implicitAuthUrl.trim(),
                    };
                    if (implicitRefreshUrl.trim()) {
                        data.oauth2Flows.implicit.refreshUrl = implicitRefreshUrl.trim();
                    }
                }

                if (enabledFlows.has('password')) {
                    data.oauth2Flows.password = {
                        tokenUrl: passwordTokenUrl.trim(),
                    };
                    if (passwordRefreshUrl.trim()) {
                        data.oauth2Flows.password.refreshUrl = passwordRefreshUrl.trim();
                    }
                }

                if (enabledFlows.has('clientCredentials')) {
                    data.oauth2Flows.clientCredentials = {
                        tokenUrl: clientCredentialsTokenUrl.trim(),
                    };
                    if (clientCredentialsRefreshUrl.trim()) {
                        data.oauth2Flows.clientCredentials.refreshUrl = clientCredentialsRefreshUrl.trim();
                    }
                }

                if (enabledFlows.has('authorizationCode')) {
                    data.oauth2Flows.authorizationCode = {
                        authorizationUrl: authCodeAuthUrl.trim(),
                        tokenUrl: authCodeTokenUrl.trim(),
                    };
                    if (authCodeRefreshUrl.trim()) {
                        data.oauth2Flows.authorizationCode.refreshUrl = authCodeRefreshUrl.trim();
                    }
                }
            }
        } else if (type === 'openIdConnect') {
            data.openIdConnectUrl = openIdConnectUrl.trim();
        }

        onConfirm(data);
        handleClose();
    };

    /**
     * Check if form is valid
     */
    const isFormValid = (): boolean => {
        if (!name.trim() || !type) return false;

        if (type === 'apiKey') {
            return !!parameterName.trim() && !!inLocation;
        } else if (type === 'http') {
            return !!httpScheme.trim();
        } else if (type === 'oauth2') {
            if (specVersion === '2.0') {
                // OpenAPI 2.0 - validate single flow
                if (!flow) return false;
                if (flow === 'implicit' || flow === 'accessCode') {
                    if (!authorizationUrl.trim()) return false;
                }
                if (flow === 'password' || flow === 'application' || flow === 'accessCode') {
                    if (!tokenUrl.trim()) return false;
                }
            } else {
                // OpenAPI 3.0+ - validate multiple flows
                if (enabledFlows.size === 0) return false;

                // Validate implicit flow
                if (enabledFlows.has('implicit')) {
                    if (!implicitAuthUrl.trim()) return false;
                }

                // Validate password flow
                if (enabledFlows.has('password')) {
                    if (!passwordTokenUrl.trim()) return false;
                }

                // Validate clientCredentials flow
                if (enabledFlows.has('clientCredentials')) {
                    if (!clientCredentialsTokenUrl.trim()) return false;
                }

                // Validate authorizationCode flow
                if (enabledFlows.has('authorizationCode')) {
                    if (!authCodeAuthUrl.trim() || !authCodeTokenUrl.trim()) return false;
                }
            }
        } else if (type === 'openIdConnect') {
            return !!openIdConnectUrl.trim();
        }

        return true;
    };

    const availableTypes = getAvailableTypes();
    const inLocations = getInLocations();
    const httpSchemes = getHttpSchemes();
    const oauth2Flows = getOAuth2Flows();

    return (
        <Modal
            variant="medium"
            isOpen={isOpen}
            onClose={handleClose}
            aria-labelledby="security-scheme-modal-title"
            elementToFocus="#scheme-name"
        >
            <ModalHeader
                title={isEditMode ? "Edit Security Scheme" : "Add Security Scheme"}
                labelId="security-scheme-modal-title"
            />
            <ModalBody>
                <Form>
                    <FormGroup label="Name" isRequired fieldId="scheme-name">
                        <TextInput
                            id="scheme-name"
                            value={name}
                            onChange={(_event, value) => setName(value)}
                            placeholder="e.g., api_key, oauth2"
                            isDisabled={isEditMode}
                        />
                    </FormGroup>

                    <FormGroup label="Type" isRequired fieldId="scheme-type">
                        <Select
                            id="scheme-type"
                            isOpen={isTypeSelectOpen}
                            selected={type}
                            onSelect={(_event, value) => {
                                setType(value as string);
                                setIsTypeSelectOpen(false);
                            }}
                            onOpenChange={(isOpen) => setIsTypeSelectOpen(isOpen)}
                            toggle={(toggleRef) => (
                                <MenuToggle
                                    ref={toggleRef}
                                    onClick={() => setIsTypeSelectOpen(!isTypeSelectOpen)}
                                    isExpanded={isTypeSelectOpen}
                                    style={{ width: '100%' }}
                                >
                                    {type ? availableTypes.find(t => t.value === type)?.label : 'Select a type...'}
                                </MenuToggle>
                            )}
                        >
                            <SelectList>
                                {availableTypes.map((typeOption) => (
                                    <SelectOption key={typeOption.value} value={typeOption.value}>
                                        {typeOption.label}
                                    </SelectOption>
                                ))}
                            </SelectList>
                        </Select>
                    </FormGroup>

                    <FormGroup label="Description" fieldId="scheme-description">
                        <TextArea
                            id="scheme-description"
                            value={description}
                            onChange={(_event, value) => setDescription(value)}
                            placeholder="Description of this security scheme"
                            rows={3}
                        />
                    </FormGroup>

                    {/* API Key specific fields */}
                    {type === 'apiKey' && (
                        <>
                            <FormGroup label="Location" isRequired fieldId="in-location">
                                <Select
                                    id="in-location"
                                    isOpen={isInSelectOpen}
                                    selected={inLocation}
                                    onSelect={(_event, value) => {
                                        setInLocation(value as string);
                                        setIsInSelectOpen(false);
                                    }}
                                    onOpenChange={(isOpen) => setIsInSelectOpen(isOpen)}
                                    toggle={(toggleRef) => (
                                        <MenuToggle
                                            ref={toggleRef}
                                            onClick={() => setIsInSelectOpen(!isInSelectOpen)}
                                            isExpanded={isInSelectOpen}
                                            style={{ width: '100%' }}
                                        >
                                            {inLocations.find(l => l.value === inLocation)?.label}
                                        </MenuToggle>
                                    )}
                                >
                                    <SelectList>
                                        {inLocations.map((location) => (
                                            <SelectOption key={location.value} value={location.value}>
                                                {location.label}
                                            </SelectOption>
                                        ))}
                                    </SelectList>
                                </Select>
                            </FormGroup>

                            <FormGroup label="Parameter Name" isRequired fieldId="parameter-name">
                                <TextInput
                                    id="parameter-name"
                                    value={parameterName}
                                    onChange={(_event, value) => setParameterName(value)}
                                    placeholder="e.g., X-API-Key, api_key"
                                />
                            </FormGroup>
                        </>
                    )}

                    {/* HTTP specific fields (3.0+ only) */}
                    {type === 'http' && specVersion !== '2.0' && (
                        <>
                            <FormGroup label="Scheme" isRequired fieldId="http-scheme">
                                <Select
                                    id="http-scheme"
                                    isOpen={isHttpSchemeSelectOpen}
                                    selected={httpScheme}
                                    onSelect={(_event, value) => {
                                        setHttpScheme(value as string);
                                        setIsHttpSchemeSelectOpen(false);
                                    }}
                                    onOpenChange={(isOpen) => setIsHttpSchemeSelectOpen(isOpen)}
                                    toggle={(toggleRef) => (
                                        <MenuToggle
                                            ref={toggleRef}
                                            onClick={() => setIsHttpSchemeSelectOpen(!isHttpSchemeSelectOpen)}
                                            isExpanded={isHttpSchemeSelectOpen}
                                            style={{ width: '100%' }}
                                        >
                                            {httpScheme || 'Select a scheme...'}
                                        </MenuToggle>
                                    )}
                                >
                                    <SelectList>
                                        {httpSchemes.map((scheme) => (
                                            <SelectOption key={scheme.value} value={scheme.value}>
                                                {scheme.label}
                                            </SelectOption>
                                        ))}
                                    </SelectList>
                                </Select>
                            </FormGroup>

                            {httpScheme.toLowerCase() === 'bearer' && (
                                <FormGroup label="Bearer Format" fieldId="bearer-format">
                                    <TextInput
                                        id="bearer-format"
                                        value={bearerFormat}
                                        onChange={(_event, value) => setBearerFormat(value)}
                                        placeholder="e.g., JWT"
                                    />
                                </FormGroup>
                            )}
                        </>
                    )}

                    {/* OAuth2 specific fields */}
                    {type === 'oauth2' && specVersion === '2.0' && (
                        <>
                            <FormGroup label="Flow" isRequired fieldId="oauth2-flow">
                                <Select
                                    id="oauth2-flow"
                                    isOpen={isFlowSelectOpen}
                                    selected={flow}
                                    onSelect={(_event, value) => {
                                        setFlow(value as string);
                                        setIsFlowSelectOpen(false);
                                    }}
                                    onOpenChange={(isOpen) => setIsFlowSelectOpen(isOpen)}
                                    toggle={(toggleRef) => (
                                        <MenuToggle
                                            ref={toggleRef}
                                            onClick={() => setIsFlowSelectOpen(!isFlowSelectOpen)}
                                            isExpanded={isFlowSelectOpen}
                                            style={{ width: '100%' }}
                                        >
                                            {flow ? oauth2Flows.find(f => f.value === flow)?.label : 'Select a flow...'}
                                        </MenuToggle>
                                    )}
                                >
                                    <SelectList>
                                        {oauth2Flows.map((flowOption) => (
                                            <SelectOption key={flowOption.value} value={flowOption.value}>
                                                {flowOption.label}
                                            </SelectOption>
                                        ))}
                                    </SelectList>
                                </Select>
                            </FormGroup>

                            {(flow === 'implicit' || flow === 'accessCode') && (
                                <FormGroup label="Authorization URL" isRequired fieldId="authorization-url">
                                    <TextInput
                                        id="authorization-url"
                                        value={authorizationUrl}
                                        onChange={(_event, value) => setAuthorizationUrl(value)}
                                        placeholder="https://example.com/oauth/authorize"
                                    />
                                </FormGroup>
                            )}

                            {(flow === 'password' || flow === 'application' || flow === 'accessCode') && (
                                <FormGroup label="Token URL" isRequired fieldId="token-url">
                                    <TextInput
                                        id="token-url"
                                        value={tokenUrl}
                                        onChange={(_event, value) => setTokenUrl(value)}
                                        placeholder="https://example.com/oauth/token"
                                    />
                                </FormGroup>
                            )}
                        </>
                    )}

                    {/* OAuth2 specific fields (3.0+ - multiple flows) */}
                    {type === 'oauth2' && specVersion !== '2.0' && (
                        <FormGroup label="OAuth2 Flows" isRequired fieldId="oauth2-flows">
                            <Tabs
                                activeKey={activeOAuth2Tab}
                                onSelect={(_event, tabIndex) => setActiveOAuth2Tab(tabIndex)}
                                aria-label="OAuth2 flows"
                            >
                                {/* Implicit Flow Tab */}
                                <Tab
                                    eventKey="implicit"
                                    title={<TabTitleText>Implicit</TabTitleText>}
                                    aria-label="Implicit flow"
                                >
                                    <div style={{ marginTop: '1rem' }}>
                                        <Checkbox
                                            id="flow-implicit-enabled"
                                            label="Enable Implicit flow"
                                            isChecked={enabledFlows.has('implicit')}
                                            onChange={(_event, checked) => {
                                                const newFlows = new Set(enabledFlows);
                                                if (checked) {
                                                    newFlows.add('implicit');
                                                } else {
                                                    newFlows.delete('implicit');
                                                }
                                                setEnabledFlows(newFlows);
                                            }}
                                            style={{ marginBottom: '1rem' }}
                                        />
                                        <FormGroup label="Authorization URL" isRequired fieldId="implicit-auth-url">
                                            <TextInput
                                                id="implicit-auth-url"
                                                value={implicitAuthUrl}
                                                onChange={(_event, value) => setImplicitAuthUrl(value)}
                                                placeholder="https://example.com/oauth/authorize"
                                                isDisabled={!enabledFlows.has('implicit')}
                                            />
                                        </FormGroup>
                                        <FormGroup label="Refresh URL" fieldId="implicit-refresh-url">
                                            <TextInput
                                                id="implicit-refresh-url"
                                                value={implicitRefreshUrl}
                                                onChange={(_event, value) => setImplicitRefreshUrl(value)}
                                                placeholder="https://example.com/oauth/refresh"
                                                isDisabled={!enabledFlows.has('implicit')}
                                            />
                                        </FormGroup>
                                    </div>
                                </Tab>

                                {/* Password Flow Tab */}
                                <Tab
                                    eventKey="password"
                                    title={<TabTitleText>Password</TabTitleText>}
                                    aria-label="Password flow"
                                >
                                    <div style={{ marginTop: '1rem' }}>
                                        <Checkbox
                                            id="flow-password-enabled"
                                            label="Enable Password flow"
                                            isChecked={enabledFlows.has('password')}
                                            onChange={(_event, checked) => {
                                                const newFlows = new Set(enabledFlows);
                                                if (checked) {
                                                    newFlows.add('password');
                                                } else {
                                                    newFlows.delete('password');
                                                }
                                                setEnabledFlows(newFlows);
                                            }}
                                            style={{ marginBottom: '1rem' }}
                                        />
                                        <FormGroup label="Token URL" isRequired fieldId="password-token-url">
                                            <TextInput
                                                id="password-token-url"
                                                value={passwordTokenUrl}
                                                onChange={(_event, value) => setPasswordTokenUrl(value)}
                                                placeholder="https://example.com/oauth/token"
                                                isDisabled={!enabledFlows.has('password')}
                                            />
                                        </FormGroup>
                                        <FormGroup label="Refresh URL" fieldId="password-refresh-url">
                                            <TextInput
                                                id="password-refresh-url"
                                                value={passwordRefreshUrl}
                                                onChange={(_event, value) => setPasswordRefreshUrl(value)}
                                                placeholder="https://example.com/oauth/refresh"
                                                isDisabled={!enabledFlows.has('password')}
                                            />
                                        </FormGroup>
                                    </div>
                                </Tab>

                                {/* Client Credentials Flow Tab */}
                                <Tab
                                    eventKey="clientCredentials"
                                    title={<TabTitleText>Client Credentials</TabTitleText>}
                                    aria-label="Client credentials flow"
                                >
                                    <div style={{ marginTop: '1rem' }}>
                                        <Checkbox
                                            id="flow-clientCredentials-enabled"
                                            label="Enable Client Credentials flow"
                                            isChecked={enabledFlows.has('clientCredentials')}
                                            onChange={(_event, checked) => {
                                                const newFlows = new Set(enabledFlows);
                                                if (checked) {
                                                    newFlows.add('clientCredentials');
                                                } else {
                                                    newFlows.delete('clientCredentials');
                                                }
                                                setEnabledFlows(newFlows);
                                            }}
                                            style={{ marginBottom: '1rem' }}
                                        />
                                        <FormGroup label="Token URL" isRequired fieldId="client-credentials-token-url">
                                            <TextInput
                                                id="client-credentials-token-url"
                                                value={clientCredentialsTokenUrl}
                                                onChange={(_event, value) => setClientCredentialsTokenUrl(value)}
                                                placeholder="https://example.com/oauth/token"
                                                isDisabled={!enabledFlows.has('clientCredentials')}
                                            />
                                        </FormGroup>
                                        <FormGroup label="Refresh URL" fieldId="client-credentials-refresh-url">
                                            <TextInput
                                                id="client-credentials-refresh-url"
                                                value={clientCredentialsRefreshUrl}
                                                onChange={(_event, value) => setClientCredentialsRefreshUrl(value)}
                                                placeholder="https://example.com/oauth/refresh"
                                                isDisabled={!enabledFlows.has('clientCredentials')}
                                            />
                                        </FormGroup>
                                    </div>
                                </Tab>

                                {/* Authorization Code Flow Tab */}
                                <Tab
                                    eventKey="authorizationCode"
                                    title={<TabTitleText>Authorization Code</TabTitleText>}
                                    aria-label="Authorization code flow"
                                >
                                    <div style={{ marginTop: '1rem' }}>
                                        <Checkbox
                                            id="flow-authorizationCode-enabled"
                                            label="Enable Authorization Code flow"
                                            isChecked={enabledFlows.has('authorizationCode')}
                                            onChange={(_event, checked) => {
                                                const newFlows = new Set(enabledFlows);
                                                if (checked) {
                                                    newFlows.add('authorizationCode');
                                                } else {
                                                    newFlows.delete('authorizationCode');
                                                }
                                                setEnabledFlows(newFlows);
                                            }}
                                            style={{ marginBottom: '1rem' }}
                                        />
                                        <FormGroup label="Authorization URL" isRequired fieldId="auth-code-auth-url">
                                            <TextInput
                                                id="auth-code-auth-url"
                                                value={authCodeAuthUrl}
                                                onChange={(_event, value) => setAuthCodeAuthUrl(value)}
                                                placeholder="https://example.com/oauth/authorize"
                                                isDisabled={!enabledFlows.has('authorizationCode')}
                                            />
                                        </FormGroup>
                                        <FormGroup label="Token URL" isRequired fieldId="auth-code-token-url">
                                            <TextInput
                                                id="auth-code-token-url"
                                                value={authCodeTokenUrl}
                                                onChange={(_event, value) => setAuthCodeTokenUrl(value)}
                                                placeholder="https://example.com/oauth/token"
                                                isDisabled={!enabledFlows.has('authorizationCode')}
                                            />
                                        </FormGroup>
                                        <FormGroup label="Refresh URL" fieldId="auth-code-refresh-url">
                                            <TextInput
                                                id="auth-code-refresh-url"
                                                value={authCodeRefreshUrl}
                                                onChange={(_event, value) => setAuthCodeRefreshUrl(value)}
                                                placeholder="https://example.com/oauth/refresh"
                                                isDisabled={!enabledFlows.has('authorizationCode')}
                                            />
                                        </FormGroup>
                                    </div>
                                </Tab>
                            </Tabs>
                        </FormGroup>
                    )}

                    {/* OpenID Connect specific fields (3.0+ only) */}
                    {type === 'openIdConnect' && specVersion !== '2.0' && (
                        <FormGroup label="OpenID Connect URL" isRequired fieldId="openid-connect-url">
                            <TextInput
                                id="openid-connect-url"
                                value={openIdConnectUrl}
                                onChange={(_event, value) => setOpenIdConnectUrl(value)}
                                placeholder="https://example.com/.well-known/openid-configuration"
                            />
                        </FormGroup>
                    )}
                </Form>
            </ModalBody>
            <ModalFooter>
                <Button
                    variant="primary"
                    onClick={handleConfirm}
                    isDisabled={!isFormValid()}
                >
                    {isEditMode ? "Save" : "Add"}
                </Button>
                <Button variant="link" onClick={handleClose}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
};
