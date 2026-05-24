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

/**
 * Service for validating OpenAPI documents using apitomy-data-models
 */
export class ValidationService {
    /**
     * Validate the OpenAPI document
     */
    validate(document: Document | null): ValidationResult {
        if (!document) {
            return {
                problems: [],
                errorCount: 0,
                warningCount: 0,
                isValid: true,
            };
        }

        // Use the Library to validate the document (pass null for default severity registry)
        const problems = Library.validate(document, null as any);

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
