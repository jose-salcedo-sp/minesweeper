Buscaminas Multijugador (Minesweeper)
¡Compite en tiempo real para descubrir quién es el mejor!

Tabla de Contenidos
  - Acerca del Proyecto
  - Tecnologías Utilizadas
  - Cómo Jugar
  - Contribuidores

Acerca del Proyecto
Este proyecto es una versión multijugador del clásico Buscaminas (Minesweeper), desarrollado para la materia de Cómputo Distribuido con el profesor Juan Carlos López Pimentel.

Modo de Juego: Dos jugadores se conectan a una sala y compiten para descubrir las casillas sin minas.
Ganador: El primero que completa el tablero (o sobrevive si el oponente explota una mina).
Servidor en C: Maneja la comunicación y el control de partidas en tiempo real.
Cliente Web: Construido con TypeScript, Vite, HTML, CSS y TSX.

Tecnologías Utilizadas
  Lenguaje C
  - Implementación del servidor.

  TypeScript
  - Lógica del cliente y tipado estricto.

  Vite
  - Herramienta de construcción y servidor de desarrollo para la aplicación web.

  HTML / CSS / TSX
  - Front-end interactivo y moderno.

Cómo Jugar
  Objetivo
    Descubrir todas las casillas seguras sin detonar ninguna mina.

  Multijugador
    Crea o únete a una room para competir contra otro jugador.
    Gana quien complete el tablero primero o si tu rival explota una mina.

  Acciones Básicas
    Click Izquierdo: Descubre la celda.
    Click Derecho: Marca la celda como posible mina.

  Estrategia
    Observa los números para deducir dónde se encuentran las minas.
    Asegúrate de marcar correctamente para evitar confusiones.

Profesor
  - Dr. Juan Carlos López Pimentel

Contribuidores / Alumnos
  - David Contreras Tiscareño
  - Héctor Emiliano Flores Castellanos
  - José Salcedo Uribe

▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
