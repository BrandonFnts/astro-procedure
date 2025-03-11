# Plataforma de Gestión de Bases de Datos

## Descripción General
Esta plataforma permite la visualización y administración de bases de datos a través de una interfaz web intuitiva. Está diseñada para facilitar la gestión de bases de datos almacenadas en un servidor, proporcionando funcionalidades como la visualización de bases de datos existentes y la creación de nuevas bases de datos.

## Funcionalidades Principales
### 1. **Listado de Bases de Datos**
   - Se obtiene una lista de bases de datos existentes mediante una consulta a la API.
   - Se muestran detalles como:
     - **Nombre de la base de datos**
     - **Tamaño en KB**
     - **Observaciones adicionales** (si existen)

### 2. **Paginación**
   - La tabla de bases de datos incluye una funcionalidad de paginación para mejorar la experiencia de usuario.
   - Controles de navegación:
     - **Botón "Anterior"**: Retrocede a la página previa.
     - **Botón "Siguiente"**: Avanza a la página siguiente.
     - **Indicador de página actual**.

### 3. **Creación de Nuevas Bases de Datos**
   - Un botón "Agregar" abre un **modal** que permite la creación de una nueva base de datos.
   - Al cerrar el modal, la lista de bases de datos se actualiza automáticamente.

## Tecnologías Utilizadas
- **Vue.js**: Framework principal para la interfaz de usuario.
- **Tailwind CSS**: Para el diseño y estilos responsivos.
- **API Fetch**: Comunicación con el backend para obtener y gestionar las bases de datos.

## Estructura del Código
- **Componente `DatabaseList.vue`**:
  - Contiene la tabla de bases de datos con paginación.
  - Controla la apertura y cierre del modal.
  - Realiza la consulta a la API para obtener la información.
- **Componente `DatabaseModal.vue`**:
  - Formulario para agregar una nueva base de datos.