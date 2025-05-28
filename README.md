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
<summary>📈 Análisis de Rendimiento</summary>

- Gráficos de progreso semanal/mensual/anual
- Estadísticas detalladas por actividad
- Comparativas de rendimiento
- Análisis de zonas de entrenamiento
- Exportación de informes en PDF/CSV
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
| Git | Última versión | [Descargar Git](https://git-scm.com/) |
| Expo CLI | Última versión | `npm install -g expo-cli` |
| Docker | Opcional | [Descargar Docker](https://www.docker.com/products/docker-desktop) |

### 🛠 Configuración del Entorno

#### Backend

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/JuanmaOrdPer/AthCyl.git
   cd AthCyl/backend
   ```

2. **Crear y activar entorno virtual**
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate
   
   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Instalar dependencias**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configurar variables de entorno**
   Crea un archivo `.env` en la carpeta `backend` con:
   ```env
   DEBUG=True
   SECRET_KEY=tu_clave_secreta_aqui
   DATABASE_URL=postgres://usuario:contraseña@localhost:5432/athcyldb
   ALLOWED_HOSTS=localhost,127.0.0.1
   CORS_ALLOWED_ORIGINS=http://localhost:19006
   ```

5. **Aplicar migraciones**
   ```bash
   python manage.py migrate
   ```

6. **Crear superusuario**
   ```bash
   python manage.py createsuperuser
   ```

7. **Iniciar servidor de desarrollo**
   ```bash
   python manage.py runserver
   ```

#### Frontend

1. **Navegar al directorio del frontend**
   ```bash
   cd ../frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   Crea un archivo `.env` en la carpeta `frontend` con:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:8000/api
   ```

4. **Iniciar la aplicación**
   ```bash
   npx expo start
   ```

5. **Escanear el código QR** con la aplicación Expo Go en tu dispositivo móvil o usa un emulador.

#### Configuración de la Base de Datos

1. **Instalar PostgreSQL**
   - Descargar e instalar desde [postgresql.org](https://www.postgresql.org/download/)
   - Crear una base de datos llamada `athcyldb`

2. **Configurar usuario y permisos**
   ```sql
   CREATE USER athcyluser WITH PASSWORD 'tupassword';
   GRANT ALL PRIVILEGES ON DATABASE athcyldb TO athcyluser;
   ALTER USER athcyluser CREATEDB;
   ```

#### Variables de Entorno Completas

**Backend (.env)**
```env
# Configuración básica
DEBUG=True
SECRET_KEY=tu_clave_secreta_aqui
ALLOWED_HOSTS=localhost,127.0.0.1

# Base de datos
DATABASE_URL=postgres://usuario:contraseña@localhost:5432/athcyldb

# CORS y Seguridad
CORS_ALLOWED_ORIGINS=http://localhost:19006
CSRF_TRUSTED_ORIGINS=http://localhost:8000

# JWT
JWT_SECRET_KEY=tu_clave_jwt_secreta
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440

CACHE_TTL=300

# Email (configuración de ejemplo para desarrollo)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=localhost
EMAIL_PORT=1025
```

**Frontend (.env)**
```env
# API
EXPO_PUBLIC_API_URL=http://localhost:8000/api

# Mapas (obtén tu API key)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_aquí

# Sentry (opcional)
EXPO_PUBLIC_SENTRY_DSN=tu_dsn_de_sentry
```

#### Solución de Problemas Comunes

- **Error de conexión a la base de datos**: Verifica que PostgreSQL esté corriendo y que las credenciales en `.env` sean correctas.
- **Problemas con dependencias**: Ejecuta `pip freeze > requirements.txt` después de instalar nuevas dependencias.
- **Errores de migración**: Intenta borrar la base de datos y volver a crearla, luego ejecuta las migraciones de nuevo.
- **Problemas con CORS**: Asegúrate de que `CORS_ALLOWED_ORIGINS` incluya la URL de tu frontend.


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
