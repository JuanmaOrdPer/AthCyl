#!/usr/bin/env python
"""
Utilidad de línea de comandos de Django para tareas administrativas.

Este script es el punto de entrada principal para gestionar el proyecto:
- Migraciones de base de datos
- Servidor de desarrollo
- Consola interactiva
- Pruebas unitarias
- y muchas otras tareas administrativas

Autor: Juan Manuel Ordás Periscal
Fecha: Mayo 2025
"""
import os
import sys


def main():
    """
    Ejecuta tareas administrativas de Django.
    
    Configura el entorno, importa las utilidades de Django,
    y ejecuta el comando solicitado.
    """
    # Establecer la configuración por defecto
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'athcyl.settings')
    
    try:
        # Importar las funciones de administración de Django
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        # Si Django no está instalado o no está en el PYTHONPATH
        raise ImportError(
            "No se pudo importar Django. ¿Está instalado y disponible "
            "en la variable de entorno PYTHONPATH? ¿Olvidaste "
            "activar el entorno virtual?"
        ) from exc
    
    # Ejecutar el comando solicitado
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    # Solo ejecutar la función principal si este script se ejecuta directamente
    main()