/**
 * Service for validating OpenAPI documents
 */

import { Document, Library, ValidationProblem, ValidationProblemSeverity } from '@apitomy/data-models';

/**
 * Represents a validation problem in the document
 */
export interface ValidationResult {
    /**
     * The validation problems found
     */
    problems: ValidationProblem[];

    /**
     * Total number of errors
     */
    errorCount: number;

    /**
     * Total number of warnings
     */
    warningCount: number;

    /**
     * Whether the document is valid (no errors)
     */
    isValid: boolean;
}

const EMPTY_RESULT: ValidationResult = {
    problems: [],
    errorCount: 0,
    warningCount: 0,
    isValid: true,
};

/**
 * Service for validating OpenAPI documents using apitomy-data-models
 */
export class ValidationService {
    /**
     * Validate the OpenAPI document
     */
    validate(document: Document | null): ValidationResult {
        if (!document) {
            return EMPTY_RESULT;
        }

        // Wrapped in try-catch to handle upstream bugs in @apitomy/data-models where certain
        // validation rules throw "Cannot convert undefined or null to object" on valid documents.
        let problems: ValidationProblem[];
        try {
            problems = Library.validate(document, null as any);
        } catch (e) {
            console.warn('[ValidationService] Upstream validation error caught:', e);
            return EMPTY_RESULT;
        }

        // Count errors and warnings
        let errorCount = 0;
        let warningCount = 0;

        problems.forEach((problem) => {
            if (problem.severity === ValidationProblemSeverity.high || problem.severity === ValidationProblemSeverity.medium) {
                errorCount++;
            } else if (problem.severity === ValidationProblemSeverity.low) {
                warningCount++;
            }
        });

        return {
            problems,
            errorCount,
            warningCount,
            isValid: errorCount === 0,
        };
    }

    /**
     * Get validation problems for a specific path in the document
     */
    getProblemsForPath(problems: ValidationProblem[], path: string): ValidationProblem[] {
        return problems.filter((problem) => {
            const problemPath = problem.nodePath?.toString() || '';
            return problemPath.startsWith(path);
        });
    }
}
