/**
 * Hook for document validation
 */

import { useMemo } from 'react';
import { useDocument } from './useDocument';
import { ValidationService, ValidationResult } from '@services/ValidationService';

const validationService = new ValidationService();

/**
 * Hook to get validation results for the current document
 */
export function useValidation(): ValidationResult {
    const { document, version } = useDocument();

    // eslint-disable-next-line react-hooks/exhaustive-deps -- version triggers re-validation on document mutation
    const validationResult = useMemo(() => {
        return validationService.validate(document);
    }, [document, version]);

    return validationResult;
}
