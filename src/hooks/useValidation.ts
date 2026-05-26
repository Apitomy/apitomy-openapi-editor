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

     
    const validationResult = useMemo(() => {
        return validationService.validate(document);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: version triggers re-validation
    }, [document, version]);

    return validationResult;
}
