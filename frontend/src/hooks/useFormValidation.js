// src/hooks/useFormValidation.js
import { useState, useCallback } from 'react';

/**
 * Hook personalizado para validación de formularios
 * @param {Object} initialValues - Valores iniciales del formulario
 * @param {Function} validateFunction - Función de validación que retorna errores
 * @returns {Object} - Estados y métodos para manejo de formulario
 */
const useFormValidation = (initialValues = {}, validateFunction = () => ({})) => {
const [values, setValues] = useState(initialValues);
const [errors, setErrors] = useState({});
const [touched, setTouched] = useState({});

/**
   * Actualiza un campo del formulario
   * @param {string} name - Nombre del campo
   * @param {any} value - Valor del campo
   */
const handleChange = useCallback((name, value) => {
    setValues(prevValues => ({
        ...prevValues,
        [name]: value
    }));
    
    // Marcar como tocado
    if (!touched[name]) {
        setTouched(prev => ({
        ...prev,
        [name]: true
        }));
    }
    
    // Limpiar error si existe
    if (errors[name]) {
        setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
        });
    }
}, [errors, touched]);
/**
   * Valida el formulario completo
   * @returns {boolean} - True si el formulario es válido
   */
const validateForm = useCallback(() => {
    const newErrors = validateFunction(values);
    setErrors(newErrors);
    
    // Marcar todos los campos como tocados
    const allTouched = Object.keys(values).reduce((acc, key) => {
    acc[key] = true;
    return acc;
    }, {});
    setTouched(allTouched);
    
    return Object.keys(newErrors).length === 0;
}, [values, validateFunction]);

/**
   * Resetea el formulario a valores iniciales
   * @param {Object} newInitialValues - Nuevos valores iniciales (opcional)
   */
const resetForm = useCallback((newInitialValues = initialValues) => {
    setValues(newInitialValues);
    setErrors({});
    setTouched({});
}, [initialValues]);

return {
    values,
    errors,
    touched,
    handleChange,
    validateForm,
    resetForm,
    setValues
};
};

export default useFormValidation;