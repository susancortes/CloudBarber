# CloudBarber

CloudBarber es una aplicación web de administración para una barbería. Permite consultar el panel, gestionar barberos y su portafolio, y administrar servicios y paquetes con sus precios y ofertas.

## Módulos

- **Panel:** resumen de la administración.
- **Citas:** vista de citas de demostración. Actualmente sus datos se mantienen en el estado de la aplicación y no se guardan en MySQL.
- **Barberos:** administración de barberos y publicaciones de cortes.
- **Servicios:** creación, edición, activación, eliminación y ofertas de servicios.
- **Paquetes:** creación, edición, activación, eliminación y ofertas de paquetes.

Los servicios, paquetes y barberos se comunican con la API de Express y MySQL. La base de datos de cada integrante es local; clonar el repositorio no copia los registros existentes.

## Requisitos

- Git.
- Node.js 22 LTS (versión 22.12 o posterior) y npm.
- MySQL 8 o posterior. MySQL Workbench es opcional, pero facilita ejecutar el esquema.

## Instalación

Abre una terminal en la carpeta raíz del proyecto y ejecuta:

```bash
npm ci
cd backend
npm ci
cd ..
```

Hay dos archivos `package-lock.json`: uno para el frontend y otro para el backend. Por eso se instalan las dependencias en ambas carpetas.

## Configuración de la base de datos

1. Inicia el servidor de MySQL.
2. Revisa o crea el archivo `backend/.env` con la configuración de tu instalación:

   ```env
   PORT=4000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_contraseña_de_mysql
   DB_NAME=cloudbarber_db
   DB_PORT=3307
   ```

   Cambia `DB_USER`, `DB_PASSWORD` y `DB_PORT` según tu instalación. Por ejemplo, MySQL suele usar el puerto `3306`; el proyecto usa `3307` como valor predeterminado. Mantén `PORT=4000`, ya que el frontend se conecta a la API en ese puerto.

3. En MySQL Workbench, abre `backend/database/schema.sql` y ejecuta el script completo. Este crea `cloudbarber_db`, las tablas y los estados iniciales de las citas. **Ejecútalo una sola vez al preparar una base nueva.** No borra los datos existentes, pero volver a ejecutarlo puede duplicar los estados iniciales.
4. El esquema solo crea la estructura y los estados iniciales; no contiene los registros de servicios, paquetes ni barberos de otros integrantes. Cada persona debe agregar sus propios datos o importar un respaldo autorizado si necesita compartirlos.

Usa las credenciales de tu instalación local y no escribas contraseñas reales en este README ni en otros archivos de documentación.

## Iniciar la aplicación

Se necesitan dos terminales, ambas abiertas en la carpeta raíz del proyecto.

**Terminal 1 — API:**

```bash
cd backend
npm run dev
```

La API debe indicar que está escuchando en `http://localhost:4000`. Puedes comprobarla abriendo esa dirección en el navegador.

**Terminal 2 — frontend:**

```bash
npm run dev
```

Abre la dirección que muestre Vite, normalmente `http://localhost:5173`.

Deja ambas terminales abiertas mientras uses la aplicación. Si cambias la configuración de MySQL, reinicia la API.

## Comandos útiles

Ejecuta estos comandos desde la raíz del proyecto:

```bash
npm run build
npm run lint
```

Para iniciar solo el backend sin recarga automática, ejecuta `npm start` desde `backend`.

## Solución de problemas

- **La API no conecta con MySQL:** confirma que MySQL esté iniciado y revisa `DB_HOST`, `DB_USER`, `DB_PASSWORD` y `DB_PORT` en `backend/.env`.
- **Error `Unknown database 'cloudbarber_db'`:** ejecuta `backend/database/schema.sql` en MySQL Workbench.
- **El catálogo aparece vacío:** es normal en una base nueva; el esquema no incluye datos de ejemplo para servicios, paquetes o barberos.
- **El frontend no se conecta a la API:** confirma que el backend esté ejecutándose en el puerto `4000`.
- **El puerto ya está ocupado:** cierra el otro proceso que lo usa antes de iniciar la aplicación.
