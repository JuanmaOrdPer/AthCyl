# AthCyl - Aplicación de Seguimiento Deportivo

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

## 🐳 Instalación con Docker

AthCyl puede ser desplegado fácilmente usando Docker y Docker Compose, lo que simplifica la configuración del entorno de desarrollo y producción.

### Requisitos previos

- [Docker](https://docs.docker.com/get-docker/) (versión 20.10.0 o superior)
- [Docker Compose](https://docs.docker.com/compose/install/) (normalmente incluido con Docker Desktop)

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/athcyl.git
   cd athcyl
   ```

2. **Configurar variables de entorno**
   ```bash
   # Copiar archivos de ejemplo
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
   
   Edita los archivos `.env` según sea necesario, especialmente:
   - `backend/.env`: Configuración de la base de datos y claves secretas
   - `frontend/.env`: URL de la API y otras configuraciones del frontend

3. **Construir y ejecutar los contenedores**
   ```bash
   docker-compose up --build
   ```
   
   La primera vez que ejecutes este comando, Docker descargará las imágenes base y construirá los contenedores, lo que puede tomar varios minutos.

4. **Inicializar la base de datos** (en una nueva terminal)
   ```bash
   # Aplicar migraciones
   docker-compose exec backend python manage.py migrate
   
   # Crear un superusuario (sigue las instrucciones)
   docker-compose exec backend python manage.py createsuperuser
   ```

5. **Acceder a la aplicación**
   - **Frontend**: http://localhost:3000
   - **Backend (API)**: http://localhost:8000/api/
   - **Admin de Django**: http://localhost:8000/admin/

### Comandos útiles

- **Detener los contenedores**:
  ```bash
  docker-compose down
  ```

- **Ver logs en tiempo real**:
  ```bash
  docker-compose logs -f
  ```

- **Ejecutar comandos en el contenedor del backend**:
  ```bash
  docker-compose exec backend python manage.py <comando>
  ```

- **Reconstruir un servicio específico**:
  ```bash
  docker-compose up --build <nombre-servicio>
  # Ejemplo: docker-compose up --build backend
  ```

### Configuración de producción

Para entornos de producción, se recomienda:

1. Configurar un proxy inverso como Nginx o Traefik
2. Usar volúmenes para la persistencia de datos
3. Configurar HTTPS con certificados SSL válidos
4. Ajustar las configuraciones de seguridad en los archivos `.env`

### Solución de problemas

- **Problemas de permisos**: Si encuentras problemas con los permisos de archivos generados por Docker, puedes solucionarlos con:
  ```bash
  sudo chown -R $USER:$USER .
  ```

- **Limpiar recursos no utilizados**:
  ```bash
  docker system prune
  ```

- **Reiniciar un contenedor específico**:
  ```bash
  docker-compose restart <nombre-servicio>
  ```

### Notas adicionales

- Los datos de la base de datos se almacenan en un volumen de Docker llamado `postgres_data`
- Los archivos estáticos y multimedia se sirven desde volúmenes nombrados
- Los logs de los contenedores se pueden ver con `docker-compose logs`

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
