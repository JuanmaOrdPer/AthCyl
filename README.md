# AthCyl - Aplicación de Gestión de Entrenamientos Deportivos

AthCyl es una aplicación multiplataforma diseñada para facilitar la gestión y análisis de entrenamientos deportivos. Permite a los usuarios registrar sus sesiones manualmente o mediante la integración con archivos GPX/TCX, formatos ampliamente utilizados en dispositivos deportivos. La aplicación ofrece estadísticas avanzadas y visualización de rutas para ayudar a los usuarios a mejorar su rendimiento.

## Características Principales

- **Registro e inicio de sesión seguro** utilizando PostgreSQL y autenticación básica
- **Comunicación segura mediante HTTPS** para proteger los datos de los usuarios
- **Subida de entrenamientos** manualmente o mediante archivos GPX/TCX
- **Visualización de estadísticas y métricas personalizadas** con gráficos interactivos
- **Visualización de rutas en mapas** para analizar los recorridos de entrenamiento
- **Exportación de datos** en formato PDF o CSV para análisis externo
- **Configuración de objetivos personalizados** y seguimiento del progreso
- **Sistema de logros y medallas** para motivar a los usuarios

## Tecnologías Utilizadas

### Backend
- **Python con Django REST Framework**: Crea una API sólida, escalable y segura.
- **PostgreSQL**: Base de datos relacional robusta para almacenamiento persistente.
- **Django Extensions**: Proporciona herramientas adicionales para el desarrollo.
- **Django SSL Server**: Permite ejecutar el servidor de desarrollo con HTTPS.
- **Werkzeug**: Proporciona herramientas de depuración y servidor mejorado.

### Frontend (Optimizado para dispositivos móviles)
- **React Native con Expo**: Framework multiplataforma para desarrollo de aplicaciones móviles.
- **React Navigation**: Navegación fluida entre pantallas de la aplicación.
- **React Native Maps**: Visualización de rutas de entrenamiento con mapas nativos.
- **React Native Chart Kit**: Gráficos interactivos optimizados para dispositivos móviles.
- **Axios**: Cliente HTTP para comunicación segura con la API.
- **Expo Location**: Acceso a GPS para seguimiento preciso de rutas.
- **Expo Secure Store**: Almacenamiento seguro de credenciales de usuario.
- **Expo File System**: Manejo eficiente de archivos GPX/TCX.

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
├── backend/                    # Django REST Framework
│   ├── athcyl/                 # Proyecto principal
│   │   ├── settings.py         # Configuración del proyecto
│   │   ├── urls.py             # Configuración de rutas
│   │   └── views.py            # Vistas principales
│   ├── users/                  # App para gestión de usuarios
│   │   ├── models.py           # Modelos de usuario
│   │   ├── serializers.py      # Serializadores para API
│   │   ├── views.py            # Vistas de la API
│   │   └── urls.py             # Rutas de la API
│   ├── trainings/              # App para gestión de entrenamientos
│   │   ├── models.py           # Modelos de entrenamiento
│   │   ├── serializers.py      # Serializadores para API
│   │   ├── views.py            # Vistas de la API
│   │   └── urls.py             # Rutas de la API
│   ├── stats/                  # App para estadísticas
│   │   ├── models.py           # Modelos de estadísticas
│   │   ├── serializers.py      # Serializadores para API
│   │   ├── views.py            # Vistas de la API
│   │   └── urls.py             # Rutas de la API
│   ├── run_https_server.py     # Script para ejecutar servidor HTTPS
│   ├── create_superuser.py     # Script para crear superusuarios
│   └── manage.py              # Script de administración de Django
├── frontend/                   # React Native con Expo
│   ├── src/                    # Código fuente principal
│   │   ├── components/          # Componentes reutilizables
│   │   │   ├── TrainingMap/       # Componente para visualizar rutas
│   │   │   ├── TrainingChart/     # Componente para gráficos
│   │   │   ├── TrainingStats/     # Componente para estadísticas
│   │   │   ├── TrainingCard/      # Componente para mostrar entrenamientos
│   │   │   ├── TrainingForm/      # Formulario de entrenamientos
│   │   │   ├── GoalCard/          # Componente para mostrar objetivos
│   │   │   ├── GoalForm/          # Formulario de objetivos
│   │   │   ├── ActivitySummary/   # Resumen de actividad
│   │   │   ├── AchievementCard/   # Componente para logros
│   │   │   └── NotificationBanner/ # Componente para notificaciones
│   │   ├── screens/             # Pantallas de la aplicación
│   │   │   ├── auth/              # Pantallas de autenticación
│   │   │   │   ├── LoginScreen.js    # Pantalla de inicio de sesión
│   │   │   │   └── RegisterScreen.js # Pantalla de registro
│   │   │   └── main/              # Pantallas principales
│   │   │       ├── HomeScreen.js      # Pantalla de inicio
│   │   │       ├── TrainingDetailScreen.js # Detalle de entrenamiento
│   │   │       ├── AddTrainingScreen.js # Añadir entrenamiento
│   │   │       ├── GoalsScreen.js     # Pantalla de objetivos
│   │   │       ├── ProfileScreen.js   # Pantalla de perfil
│   │   │       └── AchievementsScreen.js # Pantalla de logros
│   │   ├── contexts/            # Contextos de React
│   │   │   ├── AuthContext.js      # Contexto de autenticación
│   │   │   └── NotificationContext.js # Contexto de notificaciones
│   │   ├── services/            # Servicios para API
│   │   │   └── api.js             # Configuración de Axios para API
│   │   ├── navigation/          # Configuración de navegación
│   │   │   └── AppNavigator.js    # Navegador principal
│   │   └── utils/               # Utilidades
│   │       └── helpers.js         # Funciones auxiliares
│   ├── assets/                 # Imágenes y recursos estáticos
│   ├── App.js                  # Punto de entrada de la aplicación
│   ├── package.json            # Dependencias y scripts
│   └── webpack.config.js        # Configuración para versión web
├── setup_db.py                # Script para configurar la base de datos
├── create_db_user.py           # Script para crear usuario de base de datos
├── .env                        # Variables de entorno
└── README.md                   # Documentación del proyecto
```

## Requisitos

### Backend
- Python 3.8+
- PostgreSQL 12+
- Dependencias de Python (ver `requirements.txt`):
  - Django 4.2.7 y Django REST Framework
  - django-sslserver y django-extensions para soporte HTTPS
  - Werkzeug y pyOpenSSL para certificados SSL
  - psycopg2-binary para conexión a PostgreSQL
  - gpxpy para procesamiento de archivos GPX
  - pandas para análisis de datos
  - bcrypt para cifrado de contraseñas
  - reportlab, python-pptx y openpyxl para exportación de datos

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
