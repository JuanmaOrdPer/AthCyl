import { useEffect, useState } from 'react';
import { ColorSchemeName, useColorScheme as _useColorScheme } from 'react-native';

export function useColorScheme(): NonNullable<ColorSchemeName> {
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>('light');
  const systemColorScheme = _useColorScheme();

  useEffect(() => {
    // Aquí podrías agregar lógica para manejar el tema de la aplicación
    // Por ahora, simplemente usamos el esquema de color del sistema
    if (systemColorScheme) {
      setColorScheme(systemColorScheme);
    }
  }, [systemColorScheme]);

  return colorScheme || 'light';
}

export default useColorScheme;
