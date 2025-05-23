# AthCyl - Plataforma de Gestión Deportiva

![AthCyl Logo](frontend/assets/icon.png)

Aplicación móvil para la gestión de actividades deportivas, diseñada para atletas y clubes deportivos de Castilla y León. Permite el registro de entrenamientos, seguimiento de rutas, generación de informes y análisis de rendimiento.

## 📱 Características Principales

- **Registro de Actividades**
  - Registro detallado de entrenamientos y competiciones
  - Categorización por tipo de deporte
  - Subida de archivos GPX/TCX

- **Seguimiento en Tiempo Real**
  - Mapa interactivo con seguimiento GPS
  - Métricas en tiempo real (distancia, velocidad, ritmo)
  - Historial de rutas guardadas

- **Análisis de Rendimiento**
  - Gráficos de progreso
  - Estadísticas detalladas por actividad
  - Comparativas de rendimiento

- **Comunidad**
  - Perfiles de atletas
  - Compartición de rutas
  - Eventos y retos deportivos

## 🛠️ Stack Tecnológico

### Frontend (Mobile)
- **Framework**: React Native con Expo
- **Navegación**: React Navigation 6.x
- **UI/UX**: React Native Paper
- **Mapas**: React Native Maps
- **Estado**: Redux Toolkit
- **Peticiones HTTP**: Axios
- **Almacenamiento Local**: AsyncStorage

### Backend (API REST)
- **Framework**: Django 4.x + Django REST Framework
- **Base de Datos**: PostgreSQL 14+
- **Autenticación**: JWT (JSON Web Tokens)
- **Procesamiento**: 
  - GPX/TCX parsing
  - Generación de informes PDF/Excel
  - Procesamiento de datos deportivos

## 🚀 Guía de Instalación Completa

### 📋 Requisitos Previos

1. **Sistema Operativo**: Windows 10/11, macOS 10.15+, o Linux
2. **Node.js**: v16 o superior
3. **Python**: 3.8 o superior
4. **PostgreSQL**: 14 o superior
5. **Git**: Última versión estable
6. **Opcional**:
   - Android Studio (para emulador Android)
   - Xcode (para emulador iOS)
   - Expo Go (para probar en dispositivo físico)

### 🔧 Configuración del Entorno

#### 1. Clonar el Repositorio
```bash
git clone https://github.com/JuanmaOrdPer/AthCyl.git
cd AthCyl
```

#### 2. Configuración del Backend

1. **Configuración del Entorno Virtual**
   ```bash
   # Linux/macOS
   python -m venv venv
   source venv/bin/activate

   # Windows
   python -m venv venv
   .\venv\Scripts\activate
   ```

2. **Instalar Dependencias**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Configurar Variables de Entorno**
   Crea un archivo `.env` en la carpeta `backend` con:
   ```env
   DEBUG=True
   SECRET_KEY=genera_una_clave_segura_aqui
   DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/athcyl
   ALLOWED_HOSTS=localhost,127.0.0.1,tu-ip-local
   CORS_ALLOWED_ORIGINS=http://localhost:19006,http://192.168.1.100:19006
   ```

4. **Configurar Base de Datos**
   ```bash
   # Crear base de datos PostgreSQL
   createdb athcyl

   # Aplicar migraciones
   python manage.py migrate
   
   # Crear superusuario
   python manage.py createsuperuser
   ```

5. **Iniciar Servidor de Desarrollo**
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```
   El panel de administración estará disponible en: http://localhost:8000/admin/

#### 3. Configuración del Frontend

1. **Instalar Dependencias**
   ```bash
   cd ../frontend
   npm install
   # o
   yarn install
   ```

2. **Configurar Variables de Entorno**
   Edita `app.config.js` para configurar la URL de la API:
   ```javascript
   export default {
     // ...
     extra: {
       apiUrl: 'http://TU_IP_LOCAL:8000',  // Ej: 'http://192.168.1.100:8000'
       useBasicAuth: true
     }
   };
   ```

3. **Iniciar la Aplicación**
   ```bash
   # Iniciar servidor de desarrollo
   npx expo start
   ```

## 🏃 Ejecutando la Aplicación

### Opción 1: Dispositivo Físico (Recomendado)
1. Instala la app Expo Go en tu móvil
2. Escanea el código QR que aparece en la terminal
3. La aplicación se cargará automáticamente

### Opción 2: Emulador Android
1. Asegúrate de tener Android Studio instalado
2. Inicia Android Studio y abre el AVD Manager
3. Crea o inicia un dispositivo virtual
4. Ejecuta: `npx expo start --android`

### Opción 3: Emulador iOS (solo macOS)
1. Necesitas Xcode instalado
2. Ejecuta: `npx expo start --ios`

### Opción 4: Navegador Web
```bash
npx expo start --web
```

## 🔄 Comandos Útiles

### Backend
```bash
# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Ejecutar tests
python manage.py test
```

### Frontend
```bash
# Limpiar caché de npm
npm start -- --reset-cache

# Ejecutar tests
npm test

# Ver cobertura de tests
npm run test:coverage
```

## 🛠️ Solución de Problemas Comunes

### Problema: No se puede conectar a la API
- Verifica que el servidor backend esté en ejecución
- Comprueba que la IP en `app.config.js` sea accesible desde tu red local
- Asegúrate de que el puerto 8000 no esté bloqueado por el firewall

### Problema: Errores de Base de Datos
- Verifica que PostgreSQL esté en ejecución
- Comprueba las credenciales en el archivo `.env`
- Ejecuta `python manage.py migrate` para aplicar migraciones pendientes

### Problema: La aplicación no se actualiza
- Detén el servidor de Expo
- Ejecuta `npm start -- --reset-cache`
- Vuelve a iniciar la aplicación

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

## 🤝 Cómo Contribuir

1. Haz un Fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

Para soporte o consultas, por favor abre un issue en el repositorio o contacta al equipo de desarrollo.