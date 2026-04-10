# Ludo Real-Time Multiplayer

Un juego de Ludo (Parchis) multijugador en tiempo real desarrollado con React, Firebase y Tailwind CSS.

## 🚀 Despliegue en GitHub Pages

Para que el juego funcione en GitHub Pages, he configurado un **GitHub Action** automático. Sigue estos pasos:

1. **Sube el código** a tu repositorio de GitHub.
2. Ve a la pestaña **Settings** (Configuración) de tu repositorio.
3. En el menú de la izquierda, haz clic en **Pages**.
4. En la sección **Build and deployment** > **Source**, asegúrate de seleccionar **GitHub Actions**.
5. El archivo `.github/workflows/deploy.yml` que he creado se encargará de compilar y desplegar el juego automáticamente cada vez que hagas un `push` a la rama `main`.

### ¿Por qué salía la página en blanco?
Vite genera una aplicación que necesita ser "compilada" (build). GitHub Pages por defecto intenta servir los archivos fuente (`.tsx`), los cuales el navegador no entiende. Con el Action configurado, GitHub compilará el proyecto y servirá la carpeta `dist` resultante.

## 🚀 Tecnologías Utilizadas

- **React 19**: Biblioteca principal para la interfaz de usuario.
- **Firebase Firestore**: Base de datos NoSQL en tiempo real para sincronizar el estado del juego entre los 4 jugadores.
- **Firebase Auth**: Autenticación anónima para identificar a los jugadores de forma única.
- **Tailwind CSS 4**: Estilizado moderno y responsivo del tablero y componentes.
- **Framer Motion**: Animaciones fluidas para el movimiento de las fichas y el dado.
- **Lucide React**: Iconografía del sistema.
- **Canvas Confetti**: Efectos visuales para la celebración del ganador.

## 🛠️ Explicación del Código

### Estructura de Datos (`src/types.ts`)
El estado del juego se centraliza en un objeto `GameState` que contiene:
- `players`: Lista de hasta 4 jugadores con su UID, nombre y color asignado.
- `pieces`: Un mapa donde la clave es `playerIndex_pieceIndex` y el valor es la posición (de -1 a 57).
- `turn`: Índice del jugador que debe mover.
- `diceRolled`: Estado booleano para controlar el flujo del turno.

### Lógica del Juego (`src/App.tsx`)
- **Sincronización**: Se utiliza `onSnapshot` de Firestore para que cualquier cambio realizado por un jugador se refleje instantáneamente en las pantallas de los demás.
- **Movimiento**: La función `movePiece` calcula la nueva posición, gestiona las capturas (enviar fichas enemigas a la base) y verifica si el jugador ha ganado.
- **Seguridad**: Las reglas de Firestore (`firestore.rules`) validan que solo el jugador cuyo turno es activo pueda modificar el estado de las piezas.

### Componentes Visuales
- **LudoBoard**: Renderiza un tablero de 15x15 celdas. Utiliza coordenadas predefinidas en `constants.ts` para mapear las posiciones lógicas a la rejilla visual.
- **Dice**: Un componente interactivo que simula el lanzamiento de un dado con animaciones.

## 🎮 Cómo se Juega

1. **Ingreso**: Los primeros 4 usuarios en entrar a la web pueden unirse a la partida.
2. **Lobby**: Haz clic en "Unirse a la Partida". Cuando haya al menos 2 jugadores, se puede "Comenzar Juego".
3. **Turnos**:
   - Lanza el dado haciendo clic en él.
   - Si sacas un **6**, puedes sacar una ficha de la base o mover una que ya esté en el tablero.
   - Si sacas cualquier otro número, solo puedes mover fichas que ya estén fuera.
4. **Capturas**: Si tu ficha cae en la misma casilla que una ficha de otro jugador, la ficha del oponente regresa a su base (a menos que sea una zona segura de inicio).
5. **Meta**: Debes llevar tus 4 fichas a la posición final (57). El primero en lograrlo gana.

## 📈 Alcances y Limitaciones

### Alcances
- Juego funcional 100% en tiempo real.
- Soporte para 2 a 4 jugadores simultáneos.
- Lógica de colisiones y capturas implementada.
- Interfaz responsiva que se adapta a dispositivos móviles y tablets.

### Limitaciones
- **Sesión Única**: Actualmente el juego está configurado para una única instancia global (`ludo-main`).
- **Reconexión**: Si un jugador cierra la pestaña, su lugar queda ocupado pero no hay un sistema de "bots" que tome su lugar automáticamente.
- **Chat**: No incluye sistema de chat integrado (potencial mejora).

## 💡 Potencialidad de la Aplicación

Esta base de código puede evolucionar hacia:
1. **Múltiples Salas**: Implementar un sistema de creación de salas privadas con códigos de invitación.
2. **Personalización**: Permitir a los usuarios elegir avatares o nombres personalizados vinculados a cuentas de Google.
3. **Estadísticas**: Guardar el historial de victorias y derrotas de los jugadores.
4. **IA**: Añadir jugadores controlados por la computadora para partidas en solitario.
5. **Monetización**: Integración de skins para las fichas o el tablero.
