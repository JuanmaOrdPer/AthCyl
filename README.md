## 🚀 Características Principales

### 🔐 Autenticación y Seguridad
- **Inicio de sesión con correo electrónico** (no se utiliza nombre de usuario)
- **Autenticación JWT** para acceso seguro a la API
- **Almacenamiento seguro** de credenciales en el dispositivo
- **Protección CSRF y XSS** integrada
- **Comunicación cifrada** con el servidor

### 🏃‍♂️ Gestión de Entrenamientos
- **Registro manual** de entrenamientos con métricas detalladas
- **Importación automática** desde archivos GPX/TCX
- **Clasificación** por tipo de deporte (carrera, ciclismo, natación, etc.)
- **Búsqueda y filtrado** avanzado de actividades
- **Edición y eliminación** de entrenamientos

### 📊 Análisis y Estadísticas
- **Panel de estadísticas** con métricas clave
- **Gráficos interactivos** de rendimiento
- **Seguimiento de progreso** a lo largo del tiempo
- **Comparación** entre diferentes períodos
- **Exportación de datos** en múltiples formatos

### 🗺️ Mapas y Rutas
- **Visualización de rutas** en mapas interactivos
- **Perfil de elevación** detallado
- **Marcadores** para puntos de interés
- **Compartir rutas** con otros usuarios

## 🛠️ Tecnologías Utilizadas

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

## 🚀 Empezando

### Requisitos Previos

- Node.js 16+ y npm/yarn
- Python 3.8+
- PostgreSQL 12+
- Git
- Docker (opcional)

### Instalación del Backend

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/athcyl.git
   cd athcyl/backend
   ```

2. Crear y activar un entorno virtual:
   ```bash
   python -m venv venv
   source venv/bin/activate  # En Windows: venv\Scripts\activate
   ```

3. Instalar dependencias:
   ```bash
   pip install -r requirements.txt
   ```

4. Configurar variables de entorno (crear un archivo `.env` en la carpeta `backend`):
   ```env
   DEBUG=True
   SECRET_KEY=tu-clave-secreta-aqui
   DB_NAME=athcyl_db
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_HOST=localhost
   DB_PORT=5432
   ```

5. Aplicar migraciones:
   ```bash
   python manage.py migrate
   ```

6. Crear un superusuario:
   ```bash
   python manage.py createsuperuser
   ```

7. Iniciar el servidor de desarrollo:
   ```bash
   python manage.py runserver
   ```

### Instalación del Frontend

1. Navegar al directorio del frontend:
   ```bash
   cd ../frontend
   ```

2. Instalar dependencias:
   ```bash
   npm install
   # o
   yarn install
   ```

3. Configurar la URL de la API en `src/config/api.js`:
   ```javascript
   export const API_BASE_URL = 'http://tu-servidor-backend:8000';
   ```

4. Iniciar la aplicación:
   ```bash
   npm start
   # o
   yarn start
   ```

## 📱 Uso

### Autenticación
1. Regístrate con tu correo electrónico y contraseña
2. Inicia sesión con tus credenciales
3. Tu sesión se mantendrá activa incluso después de cerrar la aplicación

### Añadir un Entrenamiento
1. Toca el botón "+" en la pantalla principal
2. Completa los detalles del entrenamiento
3. Opcionalmente, importa un archivo GPX/TCX
4. Guarda para registrar el entrenamiento

### Ver Estadísticas
1. Navega a la pestaña "Estadísticas"
2. Selecciona el rango de fechas que deseas analizar
3. Explora las diferentes métricas y gráficos disponibles

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor, lee nuestras [pautas de contribución](CONTRIBUTING.md) antes de enviar un pull request.

1. Haz un fork del proyecto
2. Crea una rama para tu característica (`git checkout -b feature/nueva-caracteristica`)
3. Haz commit de tus cambios (`git commit -m 'Añadir nueva característica'`)
4. Haz push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Contacto

Juan Manuel Ordás Periscal - [@tuusuario](https://twitter.com/tuusuario)

Enlace del proyecto: [https://github.com/tu-usuario/athcyl](https://github.com/tu-usuario/athcyl)

## 🙏 Agradecimientos

- A todos los contribuyentes que han ayudado a mejorar este proyecto
- A la comunidad de código abierto por las increíbles herramientas que hacen posible AthCyl

---

<div align="center">
  Hecho con ❤️ por el equipo de AthCyl
</div>

## Características Principales

- **Autenticación segura** por correo electrónico con JWT (JSON Web Tokens)
- **Registro e inicio de sesión** con tokens de acceso y actualización
- **Gestión de perfil de usuario** con información personal y preferencias
- **Registro de entrenamientos** manual o mediante archivos GPX/TCX
- **Seguimiento de métricas** como distancia, duración, ritmo y elevación
- **Visualización de rutas** en mapas interactivos
- **Estadísticas detalladas** con gráficos para analizar el rendimiento
- **Interfaz intuitiva** diseñada para móviles con React Native
- **Almacenamiento seguro** de credenciales y datos sensibles

## Características Técnicas

### Autenticación y Seguridad
- Autenticación por correo electrónico (no se utiliza nombre de usuario)
- Tokens JWT para autenticación sin estado
- Renovación automática de tokens de acceso
- Almacenamiento seguro de tokens en el dispositivo
- Comunicación segura mediante HTTPS
- Protección contra CSRF y XSS

### Gestión de Entrenamientos
- Registro manual de entrenamientos
- Importación desde archivos GPX/TCX
- Cálculo automático de métricas (distancia, ritmo, elevación, etc.)
- Clasificación de entrenamientos por tipo (carrera, ciclismo, natación, etc.)
- Búsqueda y filtrado de entrenamientos

### Análisis y Visualización
- Gráficos interactivos de rendimiento
- Mapa con rutas trazadas
- Estadísticas de progreso a lo largo del tiempo
- Comparación de entrenamientos
- Exportación de datos en múltiples formatos

## Tecnologías Utilizadas

### Backend
- **Python 3.8+**: Lenguaje de programación principal
- **Django 4.2.7**: Framework web de alto nivel
- **Django REST Framework 3.16.0**: Para construir la API RESTful
- **Django REST Framework JWT**: Para autenticación con tokens JWT
- **PostgreSQL 12+**: Base de datos relacional
- **Django Extensions**: Utilidades adicionales para desarrollo
- **Django SSL Server**: Para ejecutar con HTTPS en desarrollo
- **Gunicorn**: Servidor WSGI para producción
- **WhiteNoise**: Para servir archivos estáticos
- **psycopg2-binary**: Adaptador PostgreSQL para Python
- **bcrypt**: Para el hash seguro de contraseñas
- **gpxpy**: Para procesar archivos GPX
- **pandas**: Para análisis de datos
- **python-dateutil**: Utilidades para manejo de fechas
- **Pillow**: Para procesamiento de imágenes

### Frontend (React Native con Expo)
- **React Native 0.72.10**: Framework para aplicaciones móviles
- **Expo 49.0.8**: Plataforma para desarrollo móvil
- **React Navigation 6.1.7**: Navegación entre pantallas
- **Axios 1.4.0**: Cliente HTTP para la API
- **React Native Maps 1.7.1**: Visualización de mapas y rutas
- **React Native Chart Kit 6.12.0**: Gráficos interactivos
- **React Native Vector Icons 10.0.0**: Iconos para la interfaz
- **Expo Secure Store**: Almacenamiento seguro de tokens
- **Expo File System**: Manejo de archivos locales
- **React Native Reanimated 3.3.0**: Animaciones fluidas
- **Lottie React Native 5.1.6**: Animaciones avanzadas

### Desarrollo
- **ESLint**: Análisis de código estático
- **Prettier**: Formateo de código
- **Jest**: Framework de pruebas
- **Testing Library**: Pruebas de componentes
- **Git**: Control de versiones
- **GitHub**: Alojamiento de código
- **Docker**: Contenedorización
- **Postman**: Pruebas de API

### Producción
- **Nginx**: Servidor web y proxy inverso
- **Gunicorn**: Servidor WSGI
- **PostgreSQL**: Base de datos
- **Redis**: Caché y cola de tareas
- **Let's Encrypt**: Certificados SSL
- **GitHub Actions**: CI/CD

### Frontend (Optimizado para dispositivos móviles)
- **React Native con Expo**: Framework multiplataforma para desarrollo de aplicaciones móviles.
- **React Navigation**: Navegación fluida entre pantallas de la aplicación.
- **React Native Maps**: Visualización de rutas de entrenamiento con mapas nativos.
- **React Native Chart Kit**: Gráficos interactivos optimizados para dispositivos móviles.
- **Axios**: Cliente HTTP para comunicación segura con la API.
- **Expo Location**: Acceso a GPS para seguimiento preciso de rutas.
- **Expo Secure Store**: Almacenamiento seguro de credenciales de usuario.
- **Expo File System**: Manejo eficiente de archivos GPX/TCX.
- **Jest y Testing Library**: Framework de pruebas para componentes, servicios y pantallas.

### Seguridad
- **HTTPS**: Comunicación segura entre cliente y servidor.
- **Autenticación Básica**: Sistema de autenticación seguro.
- **Cifrado de Contraseñas**: Se utiliza bcrypt para asegurar las contraseñas.
- **Certificados SSL**: Generados para el entorno de desarrollo.

### Almacenamiento y Procesamiento de Datos
- **AsyncStorage**: Almacenamiento local en el dispositivo del usuario.
- **Procesamiento de archivos GPX/TCX**: Extracción y análisis de datos de entrenamiento.
- **PDFKit**: Para generar informes en formato PDF.
- **CSV**: Para exportar datos en formato CSV.

## Estructura del Proyecto

```
AthCyl/
├── backend/                    # Backend Django
│   ├── athcyl/                 # Configuración principal del proyecto
│   │   ├── __init__.py
│   │   ├── settings.py         # Configuración del proyecto
│   │   ├── urls.py             # Rutas principales de la API
│   │   ├── asgi.py             # Configuración ASGI
│   │   └── wsgi.py             # Configuración WSGI
│   │
│   ├── users/                  # App de usuarios
│   │   ├── __init__.py
│   │   ├── admin.py           # Configuración del admin
│   │   ├── apps.py            # Configuración de la app
│   │   ├── models.py          # Modelos de usuario
│   │   ├── serializers.py     # Serializadores para la API
│   │   ├── urls.py            # Rutas de la API de usuarios
│   │   └── views.py           # Vistas de la API de usuarios
│   │
│   ├── trainings/           # App de entrenamientos
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py          # Modelos de entrenamientos
│   │   ├── serializers.py     # Serializadores para la API
│   │   ├── urls.py            # Rutas de la API de entrenamientos
│   │   ├── views.py           # Vistas de la API de entrenamientos
│   │   └── parsers.py         # Parsers para archivos GPX/TCX
│   │
│   ├── stats/               # App de estadísticas
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py          # Modelos de estadísticas
│   │   ├── serializers.py     # Serializadores para estadísticas
│   │   ├── urls.py            # Rutas de la API de estadísticas
│   │   └── views.py           # Vistas de la API de estadísticas
│   │
│   ├── manage.py           # Script de administración
│   ├── requirements.txt       # Dependencias de Python
│   └── .env.example          # Variables de entorno de ejemplo
├── frontend/                   # Frontend React Native
│   ├── src/
│   │   ├── assets/            # Recursos estáticos (imágenes, fuentes, etc.)
│   │   │   ├── fonts/          # Fuentes personalizadas
│   │   │   ├── icons/           # Iconos de la aplicación
│   │   │   └── images/          # Imágenes de la aplicación
│   │   │
│   │   ├── components/       # Componentes reutilizables
│   │   │   ├── common/          # Componentes comunes (botones, inputs, etc.)
│   │   │   │   ├── Button.js
│   │   │   │   ├── Input.js
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── TrainingMap/     # Mapa para visualizar rutas
│   │   │   ├── TrainingChart/   # Gráficos de rendimiento
│   │   │   ├── TrainingCard/    # Tarjeta de entrenamiento
│   │   │   ├── StatsCard/      # Tarjeta de estadísticas
│   │   │   └── ...
│   │   │
│   │   ├── constants/        # Constantes de la aplicación
│   │   │   ├── theme.js        # Estilos y temas
│   │   │   └── config.js       # Configuración general
│   │   │
│   │   ├── contexts/        # Contextos de React
│   │   │   ├── AuthContext.js  # Autenticación
│   │   │   └── ThemeContext.js # Tema de la aplicación
│   │   │
│   │   ├── hooks/           # Custom Hooks
│   │   │   ├── useAuth.js      # Hook para autenticación
│   │   │   └── useTheme.js     # Hook para tema
│   │   │
│   │   ├── navigation/      # Navegación
│   │   │   ├── AppNavigator.js # Navegador principal
│   │   │   ├── AuthNavigator.js # Navegador de autenticación
│   │   │   └── MainNavigator.js # Navegador principal
│   │   │
│   │   ├── screens/         # Pantallas de la aplicación
│   │   │   ├── auth/            # Pantallas de autenticación
│   │   │   │   ├── LoginScreen.js
│   │   │   │   ├── RegisterScreen.js
│   │   │   │   └── ForgotPasswordScreen.js
│   │   │   │
│   │   │   └── main/          # Pantallas principales
│   │   │       ├── HomeScreen.js
│   │   │       ├── TrainingListScreen.js
│   │   │       ├── TrainingDetailScreen.js
│   │   │       ├── AddTrainingScreen.js
│   │   │       ├── StatsScreen.js
│   │   │       ├── ProfileScreen.js
│   │   │       └── SettingsScreen.js
│   │   │
│   │   ├── services/        # Servicios
│   │   │   ├── api.js          # Cliente de API
│   │   │   ├── auth.js         # Servicio de autenticación
│   │   │   ├── training.js     # Servicio de entrenamientos
│   │   │   └── storage.js      # Almacenamiento local
│   │   │
│   │   ├── store/          # Estado global (si se usa Redux)
│   │   │   ├── actions/
│   │   │   ├── reducers/
│   │   │   └── store.js
│   │   │
│   │   └── utils/          # Utilidades
│   │       ├── formatters.js   # Funciones de formateo
│   │       ├── validators.js   # Validaciones
│   │       └── helpers.js      # Funciones de ayuda
│   │
│   ├── App.js              # Punto de entrada de la aplicación
│   ├── app.json              # Configuración de Expo
│   ├── babel.config.js       # Configuración de Babel
│   ├── package.json          # Dependencias y scripts
│   └── ...
│
├── .gitignore             # Archivos ignorados por Git
├── .env.example             # Variables de entorno de ejemplo
├── docker-compose.yml       # Configuración de Docker Compose
├── Dockerfile               # Configuración de Docker
└── README.md               # Este archivo
├── setup_db.py                # Script para configurar la base de datos
├── create_db_user.py           # Script para crear usuario de base de datos
├── .env                        # Variables de entorno
└── README.md                   # Documentación del proyecto
```

## Requisitos del Sistema

### Backend
- Python 3.8 o superior
- PostgreSQL 12 o superior
- pip (gestor de paquetes de Python)
- virtualenv (recomendado)

### Frontend
- Node.js 16.x o superior
- npm 8.x o superior (o yarn)
- Expo CLI (`npm install -g expo-cli`)
- Android Studio / Xcode (para desarrollo móvil nativo)

### Desarrollo
- Git
- Docker y Docker Compose (opcional, para desarrollo con contenedores)
- Postman o similar (para probar la API)

## Configuración del Entorno de Desarrollo

### Backend

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/athcyl.git
   cd athcyl/backend
   ```

2. **Configurar entorno virtual**
   ```bash
   # Linux/macOS
   python3 -m venv venv
   source venv/bin/activate
   
   # Windows
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. **Instalar dependencias**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configurar variables de entorno**
   Copiar el archivo `.env.example` a `.env` y configurar las variables necesarias:
   ```bash
   cp .env.example .env
   # Editar el archivo .env con tus configuraciones
   ```

5. **Configurar la base de datos**
   Asegúrate de tener PostgreSQL instalado y crear una base de datos vacía.
   Luego, ejecuta las migraciones:
   ```bash
   python manage.py migrate
   ```

6. **Crear superusuario**
   ```bash
   python manage.py createsuperuser
   ```

7. **Iniciar el servidor de desarrollo**
   ```bash
   python manage.py runserver
   ```
   O con HTTPS para desarrollo:
   ```bash
   python manage.py runsslserver
   ```

### Frontend

1. **Instalar dependencias**
   ```bash
   cd ../frontend
   npm install
   # o si usas yarn
   yarn install
   ```

2. **Configurar variables de entorno**
   Copiar el archivo `.env.example` a `.env` y configurar las variables necesarias:
   ```bash
   cp .env.example .env
   # Editar el archivo .env con tus configuraciones
   ```

3. **Iniciar la aplicación**
   ```bash
   # Para Android
   npm run android
   
   # Para iOS
   npm run ios
   
   # Para web
   npm run web
   ```

## Despliegue

### Backend (Producción)

1. **Configuración de producción**
   - Asegúrate de que `DEBUG=False` en producción
   - Configura `ALLOWED_HOSTS` con tu dominio
   - Configura `DATABASES` para usar tu base de datos de producción
   - Configura `STATIC_ROOT` y `MEDIA_ROOT`

2. **Recopilar archivos estáticos**
   ```bash
   python manage.py collectstatic --noinput
   ```

3. **Usar un servidor WSGI**
   Configura Gunicorn o uWSGI con Nginx como proxy inverso.

### Frontend (Producción)

1. **Construir para producción**
   ```bash
   expo build:web
   ```

2. **Desplegar la web**
   Los archivos generados estarán en `web-build/` y pueden ser servidos por cualquier servidor web estático.

## Estructura de la API

La API sigue el estándar RESTful y utiliza autenticación JWT. A continuación se detallan los endpoints principales:

### Autenticación

- `POST /api/auth/register/` - Registrar un nuevo usuario
- `POST /api/auth/login/` - Iniciar sesión (obtener tokens)
- `POST /api/auth/refresh/` - Renovar token de acceso
- `POST /api/auth/logout/` - Cerrar sesión (invalidar token)

### Usuarios

- `GET /api/users/me/` - Obtener perfil del usuario actual
- `PUT /api/users/me/` - Actualizar perfil del usuario actual
- `PATCH /api/users/me/` - Actualizar parcialmente el perfil

### Entrenamientos

- `GET /api/trainings/` - Listar entrenamientos
- `POST /api/trainings/` - Crear un nuevo entrenamiento
- `GET /api/trainings/{id}/` - Obtener detalles de un entrenamiento
- `PUT /api/trainings/{id}/` - Actualizar un entrenamiento
- `DELETE /api/trainings/{id}/` - Eliminar un entrenamiento
- `POST /api/trainings/import/` - Importar entrenamiento desde archivo GPX/TCX

### Estadísticas

- `GET /api/stats/` - Obtener estadísticas generales
- `GET /api/stats/weekly/` - Estadísticas semanales
- `GET /api/stats/monthly/` - Estadísticas mensuales
- `GET /api/stats/yearly/` - Estadísticas anuales

## Autenticación

La autenticación se realiza mediante JWT (JSON Web Tokens). El flujo es el siguiente:

1. El usuario inicia sesión con su email y contraseña
2. El servidor responde con un token de acceso y un token de actualización
3. El cliente debe incluir el token de acceso en el encabezado `Authorization: Bearer <token>`
4. Cuando el token de acceso expira, el cliente puede usar el token de actualización para obtener uno nuevo

### Ejemplo de autenticación

```http
POST /api/auth/login/
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

Respuesta exitosa:

```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Contribución

1. Haz un fork del proyecto
2. Crea una rama para tu característica (`git checkout -b feature/nueva-caracteristica`)
3. Realiza tus cambios y haz commit (`git commit -am 'Añadir nueva característica'`)
4. Haz push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto

Si tienes alguna pregunta o sugerencia, no dudes en abrir un issue o contactar al equipo de desarrollo.

### Frontend
- Node.js 14+ y npm 6+
- Expo CLI
- Dependencias principales (ver `frontend/package.json`):
  - **UI y Navegación**:
    - React Native 0.72.10
    - Expo 49.0.8
    - React Navigation 6.1.7
    - React Native Paper 5.10.3
    - React Native Vector Icons 10.0.0
  
  - **Visualización de datos**:
    - React Native Maps 1.7.1 (para rutas de entrenamiento)
    - React Native Chart Kit 6.12.0 (para gráficos)
    - React Native SVG 13.9.0 (soporte para gráficos)
  
  - **Comunicación y almacenamiento**:
    - Axios 1.4.0 (cliente HTTP/HTTPS)
    - AsyncStorage 1.18.2 (almacenamiento local)
    - Expo Secure Store 12.3.1 (almacenamiento seguro para credenciales)
  
  - **Procesamiento de archivos**:
    - Expo Document Picker y File System (para selección y manejo de archivos)
    - Expo Image Picker (para selección de imágenes)
    - Mapbox ToGeoJSON y XMLDom (para procesamiento de archivos GPX/TCX)
  
  - **Exportación de datos**:
    - Expo Print y Sharing (para generar y compartir informes)
  
  - **Animaciones y experiencia de usuario**:
    - React Native Reanimated 3.3.0
    - Lottie React Native 5.1.6 (para animaciones avanzadas)

## Instalación

### Backend

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/AthCyl.git
   cd AthCyl
   ```

2. Crear un entorno virtual:
   ```bash
   python -m venv venv
   source venv/bin/activate  # En Windows: venv\Scripts\activate
   ```

3. Instalar dependencias:
   ```bash
   pip install -r requirements.txt
   ```

4. Configurar la base de datos PostgreSQL:
   ```bash
   # Crear usuario y base de datos (si no existe)
   python create_db_user.py
   
   # Configurar la base de datos y crear superusuario
   python setup_db.py
   ```

5. Iniciar el servidor con HTTPS:
   ```bash
   cd backend
   python run_https_server.py
   ```

6. Ejecutar el servidor de desarrollo con HTTPS:
   ```
   cd backend
   python manage.py runserver_plus --cert-file=certs/server.crt --key-file=certs/server.key
   ```
   Esto generará certificados SSL autofirmados y ejecutará el servidor con soporte HTTPS.

### Frontend

1. Instalar dependencias del frontend:
   ```bash
   cd frontend
   npm install
   ```

2. Resolver posibles conflictos de dependencias:
   ```bash
   npx expo install --fix
   ```
   
   > **Nota sobre la versión web**: El proyecto incluye polyfills para resolver problemas comunes al ejecutar la aplicación en un navegador:
   > - Módulos faltantes como `@react-native/normalize-colors` y `@react-native/assets-registry`
   > - Compatibilidad con iconos y componentes nativos
   > - Todos estos polyfills están configurados en `webpack.config.js` y `src/polyfills/index.js`

3. Ejecutar el frontend:
   ```bash
   npm start
   ```
   
4. Acceder a la aplicación:
   - **Dispositivos móviles**: Escanear el código QR con la aplicación Expo Go
   - **Emuladores**: Presionar 'a' para Android o 'i' para iOS en la terminal
   
   > **Nota**: AthCyl está optimizada para dispositivos móviles, donde ofrece la mejor experiencia de usuario y acceso completo a sensores como GPS para seguimiento de rutas.

## Uso

### Backend

1. Acceder al panel de administración: `https://127.0.0.1:8000/admin/`
   - Utiliza las credenciales del superusuario creado anteriormente

2. API REST: `https://127.0.0.1:8000/`
   - La página principal muestra información sobre los endpoints disponibles
   - Usuarios: `https://127.0.0.1:8000/api/users/`
   - Entrenamientos: `https://127.0.0.1:8000/api/trainings/`
   - Estadísticas: `https://127.0.0.1:8000/api/stats/`

3. Autenticación:
   - Todas las peticiones a la API requieren autenticación básica
   - Puedes usar las credenciales del superusuario para probar la API

### Frontend

1. Pantallas principales:
   - **Inicio**: Resumen de actividad, entrenamientos recientes y objetivos
   - **Entrenamientos**: Lista de entrenamientos con opción de agregar nuevos
   - **Detalle de Entrenamiento**: Visualización detallada con mapas y gráficos
   - **Objetivos**: Gestión de objetivos de entrenamiento
   - **Perfil**: Gestión de datos del usuario

2. Funcionalidades principales:
   - Registro e inicio de sesión
   - Creación y edición de entrenamientos
   - Carga de archivos GPX/TCX
   - Visualización de estadísticas
   - Configuración de objetivos

## Pruebas

AthCyl incluye un conjunto completo de pruebas tanto para el backend como para el frontend, asegurando la calidad y estabilidad del código.

### Pruebas de Backend

Las pruebas de integración del backend verifican el funcionamiento correcto de la API REST:

```bash
cd backend
python tests/integration_tests.py
```

Estas pruebas cubren:
- Autenticación de usuarios
- Operaciones CRUD para entrenamientos
- Operaciones CRUD para objetivos
- Actualización de perfil de usuario
- Estadísticas de usuario

### Pruebas de Frontend

El frontend utiliza Jest y React Testing Library para probar componentes, servicios y pantallas:

```bash
cd frontend
npm test
```

Para ver la cobertura de código:

```bash
npm run test:coverage
```

Las pruebas del frontend cubren:

1. **Pruebas de autenticación**:
   - Pantalla de inicio de sesión
   - Contexto de autenticación

2. **Pruebas de servicios**:
   - Llamadas a la API
   - Servicios de geolocalización
   - Almacenamiento seguro

3. **Pruebas de componentes**:
   - Tarjetas de entrenamiento
   - Sistema de notificaciones

4. **Pruebas de pantallas**:
   - Pantalla de seguimiento de entrenamiento

## Contribución

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

1. Haz un fork del proyecto
2. Crea una rama para tu característica (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Haz push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

## Contacto

Juan Manuel Ordás - [juanma.ordas@gmail.com](mailto:juanma.ordas@gmail.com)

Enlace del proyecto: [https://github.com/juanma-ods/AthCyl](https://github.com/juanma-ods/AthCyl)
