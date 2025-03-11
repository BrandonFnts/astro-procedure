Reporte: Plataforma de Gestión de Bases de Datos

Descripción General

La plataforma de gestión de bases de datos es una aplicación web desarrollada en Vue.js con integración en Astro. Su propósito principal es proporcionar una interfaz para visualizar, administrar y crear bases de datos mediante un procedimiento almacenado en un servidor MySQL.

Funcionalidades Principales

1. Visualización de Bases de Datos

Se obtiene la lista de bases de datos disponibles a través de una API (/api/getDatabases).

Los datos son mostrados en una tabla con paginación para mejorar la navegación.

Cada entrada muestra:

Nombre de la base de datos.

Tamaño en kilobytes (KB).

Observaciones adicionales (si las hay).

2. Creación de Nuevas Bases de Datos

Se incluye un botón Agregar que abre un modal para ingresar los detalles de una nueva base de datos.

El modal permite la entrada de información relevante.

Al cerrar el modal, la lista de bases de datos se actualiza automáticamente.

3. Paginación

Se implementa una paginación para mejorar la experiencia de usuario al navegar por la lista de bases de datos.

Se permite avanzar y retroceder entre páginas mediante botones.

Se muestra el número de página actual y el total de páginas disponibles.

Tecnologías Utilizadas

Frontend: Vue.js + Astro

Backend: API que interactúa con un procedimiento almacenado en MySQL

UI Framework: Tailwind CSS para el diseño responsivo