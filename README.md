# AthCyl - Plataforma de Gestión Deportiva

![AthCyl Logo](frontend/assets/icon.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-4.2-092E20.svg)](https://www.djangoproject.com/)
[![React Native](https://img.shields.io/badge/React%20Native-0.72-61DAFB.svg)](https://reactnative.dev/)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/JuanmaOrdPer/AthCyl/issues)

Aplicación móvil para la gestión de actividades deportivas, diseñada para atletas y clubes deportivos de Castilla y León. Permite el registro de entrenamientos, seguimiento de rutas, generación de informes y análisis de rendimiento.

## 🎯 Características Principales

<details>
<summary>📊 Registro de Actividades</summary>

- Registro detallado de entrenamientos y competiciones
- Categorización por tipo de deporte (ciclismo, running, natación, etc.)
- Subida de archivos GPX/TCX/FIT
- Fotos y notas descriptivas
- Etiquetado y categorización
</details>

<details>
<summary>📍 Seguimiento en Tiempo Real</summary>

- Mapa interactivo con seguimiento GPS
- Métricas en tiempo real (distancia, velocidad, ritmo, elevación)
- Historial de rutas guardadas
- Notificaciones de hitos
- Compartición en tiempo real con contactos
</details>

<details>
<summary>📈 Análisis de Rendimiento</summary>

- Gráficos de progreso semanal/mensual/anual
- Estadísticas detalladas por actividad
- Comparativas de rendimiento
- Análisis de zonas de entrenamiento
- Exportación de informes en PDF/CSV
</details>

<details>
<summary>👥 Comunidad</summary>

- Perfiles de atletas detallados
- Compartición de rutas y logros
- Eventos y retos deportivos
- Clasificaciones y logros
- Sistema de mensajería entre usuarios
</details>

## 🛠️ Stack Tecnológico

### Backend (API REST)
- **Python 3.8+** - Lenguaje de programación principal
- **Django 4.2** - Framework web de alto nivel
- **Django REST Framework** - Para construir la API RESTful
- **Django REST Framework JWT** - Autenticación con tokens JWT
- **PostgreSQL** - Base de datos relacional
- **Gunicorn** - Servidor WSGI para producción
- **Nginx** - Servidor web y proxy inverso
- **Redis** - Caché y cola de tareas

### Frontend (Aplicación Móvil)
- **React Native con Expo** - Framework multiplataforma
- **React Navigation** - Navegación entre pantallas
- **React Native Maps** - Visualización de mapas
- **React Native Chart Kit** - Gráficos interactivos
- **Axios** - Cliente HTTP para la API
- **Redux Toolkit** - Gestión del estado global
- **React Native Paper** - Componentes de UI
- **Lottie** - Animaciones fluidas

### Herramientas de Desarrollo
- **Docker** - Contenedorización
- **Git** - Control de versiones
- **GitHub Actions** - CI/CD
- **ESLint & Prettier** - Formato de código
- **Jest & Testing Library** - Pruebas unitarias

## 🚀 Comenzando

### 📋 Prerrequisitos del Sistema

| Componente | Requerimiento | Notas |
|------------|--------------|-------|
| Node.js | 16.x o superior | [Descargar Node.js](https://nodejs.org/) |
| Python | 3.8+ | [Descargar Python](https://www.python.org/downloads/) |
| PostgreSQL | 12+ | [Descargar PostgreSQL](https://www.postgresql.org/download/) |
| Redis | Última versión | [Descargar Redis](https://redis.io/download) |
| Git | Última versión | [Descargar Git](https://git-scm.com/) |
| Expo CLI | Última versión | `npm install -g expo-cli` |
| Docker | Opcional | [Descargar Docker](https://www.docker.com/products/docker-desktop) |

### 🛠 Configuración del Entorno

[Sección de configuración anterior...]

## 🖥️ Estructura del Proyecto

```
AthCyl/
├── backend/               # Código del backend (Django)
│   ├── athcyl/            # Configuración principal del proyecto
│   ├── users/              # Aplicación de usuarios y autenticación
│   ├── trainings/          # Aplicación de entrenamientos
│   ├── stats/              # Aplicación de estadísticas
│   ├── manage.py           # Script de administración
│   └── requirements.txt    # Dependencias de Python
│
├── frontend/             # Código del frontend (React Native)
│   ├── assets/            # Recursos estáticos (imágenes, fuentes)
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── screens/       # Pantallas de la aplicación
│   │   ├── navigation/    # Configuración de navegación
│   │   ├── services/      # Servicios API
│   │   └── utils/         # Utilidades y helpers
│   ├── App.js             # Punto de entrada de la aplicación
│   └── app.config.js      # Configuración de Expo
│
├── docker/               # Configuración de Docker
├── docs/                  # Documentación adicional
└── README.md              # Este archivo
```

## 🔍 Guía de Solución de Problemas

### Problemas Comunes

<details>
<summary>❌ Error de Conexión con la API</summary>

**Síntomas:**
- La aplicación móvil no puede conectarse al backend
- Mensajes de error de red en la consola

**Solución:**
1. Verifica que el servidor backend esté en ejecución
2. Comprueba que la URL de la API sea correcta en `.env`
3. Asegúrate de que el puerto no esté siendo usado por otra aplicación
4. Verifica las reglas del firewall

```bash
# Verificar si el puerto está en uso
netstat -ano | findstr :8000  # Windows
lsof -i :8000                # macOS/Linux
```
</details>

<details>
<summary>🐛 Problemas con las Migraciones</summary>

**Síntomas:**
- Errores al ejecutar `python manage.py migrate`
- Falta de tablas en la base de datos

**Solución:**
1. Borra las migraciones conflictivas
2. Limpia la caché de migraciones
3. Vuelve a crear las migraciones

```bash
# Borrar migraciones
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
find . -path "*/migrations/*.pyc" -delete

# Recrear migraciones
python manage.py makemigrations
python manage.py migrate
```
</details>

## 🚀 Guía de Despliegue

### Configuración de Producción

1. **Variables de Entorno de Producción**
   ```env
   DEBUG=False
   SECRET_KEY=produccion_segura_aqui
   ALLOWED_HOSTS=tu-dominio.com,www.tu-dominio.com
   CORS_ALLOWED_ORIGINS=https://tu-dominio.com
   CSRF_TRUSTED_ORIGINS=https://tu-dominio.com
   ```

2. **Configuración de Gunicorn**
   ```ini
   # gunicorn.conf.py
   workers = 3
   worker_class = 'gthread'
   threads = 2
   bind = '0.0.0.0:8000'
   ```

3. **Configuración de Nginx**
   ```nginx
   server {
       listen 80;
       server_name tu-dominio.com;

       location / {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }


       location /static/ {
           alias /ruta/a/tus/archivos/static/;
       }

       location /media/ {
           alias /ruta/a/tus/archivos/media/;
       }
   }
   ```

### Despliegue con Docker

```bash
# Construir las imágenes
docker-compose -f docker-compose.prod.yml build

# Iniciar los contenedores
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 📚 Documentación de la API

### Autenticación

```http
POST /api/auth/token/
Content-Type: application/json

{
    "email": "usuario@ejemplo.com",
    "password": "contraseña"
}
```

### Obtener Perfil de Usuario

```http
GET /api/users/me/
Authorization: Bearer tu_token_jwt
```

### Crear un Nuevo Entrenamiento

```http
POST /api/trainings/
Authorization: Bearer tu_token_jwt
Content-Type: application/json

{
    "title": "Entrenamiento mañana",
    "sport_type": "running",
    "distance": 10.5,
    "duration": "01:30:00",
    "date": "2025-05-28T08:00:00Z"
}
```

### Ejemplo de Respuesta Exitosa

```json
{
    "id": 123,
    "title": "Entrenamiento mañana",
    "sport_type": "running",
    "distance": 10.5,
    "duration": "01:30:00",
    "date": "2025-05-28T08:00:00Z",
    "created_at": "2025-05-27T10:00:00Z",
    "user": 1
}
```

## 🤝 Cómo Contribuir

1. **Reportar Problemas**
   - Busca en los issues existentes para evitar duplicados
   - Proporciona información detallada sobre el problema
   - Incluye pasos para reproducir el error

2. **Enviar Pull Requests**
   - Crea una rama descriptiva para tu feature/fix
   - Sigue las guías de estilo de código
   - Incluye pruebas unitarias
   - Actualiza la documentación

3. **Guía de Estilo**
   - Usa ESLint y Prettier para formatear el código
   - Sigue las convenciones de nomenclatura de Python y JavaScript
   - Documenta funciones y componentes importantes

## 📝 Changelog

### [1.0.0] - 2025-05-28
#### Added
- Versión inicial del proyecto
- Autenticación JWT
- Gestión de entrenamientos básica
- Panel de estadísticas

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

## 📧 Contacto

- **Juan Manuel Ordás Periscal** - [@juanmaordper](https://github.com/JuanmaOrdPer)
- **Soporte Técnico**: soporte@athcyl.com
- **Sitio Web**: [https://athcyl.com](https://athcyl.com)

## 🙏 Agradecimientos

- A todos los contribuyentes que han ayudado a mejorar el proyecto
- A la comunidad de código abierto por las increíbles herramientas utilizadas
- A los beta testers por sus valiosos comentarios
