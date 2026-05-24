/**
 * Panel for displaying validation problems
 */

import React from 'react';
import {
    Title,
    List,
    ListItem,
    Label,
    EmptyState,
    EmptyStateBody,
    Button,
} from '@patternfly/react-core';
import { ExclamationCircleIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@patternfly/react-icons';
import { useValidation } from '@hooks/useValidation';
import { useSelection } from '@hooks/useSelection';
import { ValidationProblem, ValidationProblemSeverity } from '@apitomy/data-models';

export interface ValidationPanelProps {
}

/**
 * Renders a single validation problem
 */
const ValidationProblemItem: React.FC<{ problem: ValidationProblem }> = ({ problem }) => {
    const { select } = useSelection();
    const isError = problem.severity === ValidationProblemSeverity.high || problem.severity === ValidationProblemSeverity.medium;
    const icon = isError ? (
        <ExclamationCircleIcon color="var(--pf-v6-global--danger-color--100)" />
    ) : (
        <ExclamationTriangleIcon color="var(--pf-v6-global--warning-color--100)" />
    );

    const handlePathClick = () => {
        if (problem.nodePath) {
            select(problem.nodePath, problem.property, true);
        }
    };

    // Build display text for path and property
    const getLocationText = () => {
        const pathText = problem.nodePath?.toString() || '';
        if (problem.property) {
            return `${pathText} (${problem.property})`;
        }
        return pathText;
    };

    return (
        <ListItem>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <div style={{ marginTop: '0.25rem' }}>{icon}</div>
                <div style={{ flex: 1 }}>
                    <div>
                        <Label color={isError ? 'red' : 'orange'} isCompact>
                            {problem.errorCode || (isError ? 'Error' : 'Warning')}
                        </Label>
                        {' '}
                        <strong>{problem.message}</strong>
                    </div>
                    {problem.nodePath && (
                        <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                            <Button
                                variant="link"
                                isInline
                                onClick={handlePathClick}
                                style={{ padding: 0, fontSize: '0.875rem' }}
                            >
                                {getLocationText()}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </ListItem>
    );
};

/**
 * Panel that displays validation problems
 */
export const ValidationPanel: React.FC<ValidationPanelProps> = () => {
    const { problems, errorCount, warningCount, isValid } = useValidation();

    return (
        <div style={{ padding: '1rem' }}>
            <Title headingLevel="h2" size="xl" style={{ marginBottom: '1rem' }}>
                Validation Problems
            </Title>

            {isValid && warningCount === 0 ? (
                <EmptyState>
                    <div style={{ marginBottom: '1rem' }}>
                        <CheckCircleIcon color="var(--pf-v6-global--success-color--100)" style={{ fontSize: '3rem' }} />
                    </div>
                    <Title headingLevel="h3" size="lg">
                        No Problems Found
                    </Title>
                    <EmptyStateBody>
                        The OpenAPI document is valid with no errors or warnings.
                    </EmptyStateBody>
                </EmptyState>
            ) : (
                <div>
                    <div style={{ marginBottom: '1rem' }}>
                        {errorCount > 0 && (
                            <Label color="red" isCompact style={{ marginRight: '0.5rem' }}>
                                {errorCount} {errorCount === 1 ? 'Error' : 'Errors'}
                            </Label>
                        )}
                        {warningCount > 0 && (
                            <Label color="orange" isCompact>
                                {warningCount} {warningCount === 1 ? 'Warning' : 'Warnings'}
                            </Label>
                        )}
                    </div>
                    <List isBordered isPlain>
                        {problems.map((problem, index) => (
                            <ValidationProblemItem key={index} problem={problem} />
                        ))}
                    </List>
                </div>
            )}
        </div>
    );
};
