# Architecture Decisions

## ADR-001 — localStorage síncrono
**Status:** Accepted

- **Context:** La aplicación requiere guardar su estado de forma persistente entre recargas utilizando el API nativo `localStorage` del navegador. Las APIs que ofrece `localStorage` son estrictamente síncronas.
- **Decision:** Las funciones del servicio `gameStorage` mantienen una firma síncrona.
- **Why:** Para evitar sobrearquitectura prematura al no introducir Promesas artificiales, estados `isLoading`, o gestiones de error asíncrono donde no existen. Si eventualmente se reemplaza por un backend, se hará un refactor asíncrono en ese momento.
- **Alternatives considered:** Convertir artificialmente las lecturas y escrituras de `localStorage` a `Promise<T>` para emular un comportamiento API. Descartado por complejidad inmediata innecesaria.
- **Consequences:** Los hooks que interactúan con almacenamiento son simples y síncronos, pero será mandatorio modificarlos si la capa de almacenamiento cambia de naturaleza (ej. fetch/API real).

## ADR-002 — No global state manager
**Status:** Accepted

- **Context:** React permite propagar el estado usando props drilling, Context API, o dependencias externas complejas (Zustand, Redux).
- **Decision:** No utilizar estado global (Redux, Zustand, Jotai, Context).
- **Why:** La SPA consta casi unívocamente de dos zonas: un Sidebar (lista de juegos) y un Panel central (juego activo). Utilizar una librería de estado global para sincronizar dos componentes directos agrega un overhead mental sin beneficios reales comprobables para la escala presente.
- **Alternatives considered:** Redux (excesivamente verboso para el dominio), Zustand (ligero pero agrega capa de abstracción extra), React Context (podría generar re-renders innecesarios o requerir memorización estricta).
- **Consequences:** Las sincronizaciones se hacen vía `callback` (ej. propagando eventos como `onGameUpdate` a nivel de componente `App.tsx` para sincronizar `useGames` con mutaciones de `useActiveGame`).

## ADR-003 — GamesIndex separado de Game
**Status:** Accepted

- **Context:** Hay que almacenar una colección de partidas, donde cada partida puede tener arrays que crecerían de largo, y una vista "Home/Sidebar" necesita pintar metadata liviano (nombre, fecha).
- **Decision:** Mantener los resúmenes (`GamesIndex`) almacenados separadamente de los detalles completos (`bingo:game:{id}`).
- **Why:** Permite renderizar y cargar instantáneamente la lista de partidas del Sidebar sin tener que leer, cargar ni iterar en memoria todas las bolillas sacadas de todos los juegos persistidos (lo cual sería O(n) sobre un JSON muy pesado en un futuro).
- **Alternatives considered:** Guardar un único gran JSON local con toda la estructura de todas las partidas.
- **Consequences:** Se requiere que toda mutación a una partida, como nombrar o cambiar su fecha al jugar, impacte obligatoriamente primero al archivo del detalle de la partida y, como operación extra, actualice su entrada homóloga dentro del índice general.

## ADR-004 — No React Router
**Status:** Accepted

- **Context:** SPA típica a menudo utiliza navegación por URL para abrir paneles.
- **Decision:** No instalar `react-router-dom`.
- **Why:** La UI es un Dashboard que no se beneficia del historial de navegación o enrutamiento directo. Las partidas se conmutan por estado local `activeId`.
- **Alternatives considered:** Rutas como `/game/:id`. Descartado.
- **Consequences:** Imposibilidad de mandar un "link profundo" directo a un bingo específico mediante copy-paste de URL, pero UX ininterrumpida y ágil para el operador local.

## ADR-005 — Pure validation functions
**Status:** Accepted

- **Context:** Validar que los números existan entre 1-90 y no se repitan es la regla de oro del dominio de Bingo.
- **Decision:** Utilizar exclusivas funciones puras tipadas (Typescript nativo).
- **Why:** Alta velocidad, tamaño de bundle nulo (cero dependencias extra), simplicidad conceptual y testabilidad ultra sencilla (sin mocking de contextos o librerías).
- **Alternatives considered:** Zod o Yup. Descartadas al considerarse exceso para la magnitud del modelo de datos de entrada.
- **Consequences:** La capa de `gameValidations.ts` puede aislarse y portarse directamente a un Backend NodeJS futuro sin depender de frameworks web si la validación se duplica.

## ADR-006 — Storage independiente de React
**Status:** Accepted

- **Context:** La persistencia `gameStorage` debe conectarse a React (ej: hooks `useGames`).
- **Decision:** Ningún archivo de la capa `services` debe usar `react` (ni hooks, ni Context, ni component types).
- **Why:** Separación de preocupaciones estricta. El storage representa una caja negra de I/O que opera crudo sobre el Web API. Facilita testing agnóstico.
- **Alternatives considered:** Usar librerías de persistencia de hooks prefabricados como `useLocalStorage`.
- **Consequences:** Los custom hooks de react intermedios (`useGames`, `useActiveGame`) son 100% responsables de hacer puente entre las escrituras sincrónicas del I/O (storage) y los re-renders reactivos (estado UI).

## ADR-007 — Game completion como estado derivado
**Status:** Accepted

- **Context:** En algún momento hay que detectar si el bingo llegó a su límite (90 números).
- **Decision:** Extraer del UI el "límite mágico de 90" (antes hardcodeado en `GameBoard`) y moverlo al modelo (en forma de `isGameComplete(game)` y `MAX_NUMBERS = 90` dentro de `gameValidations.ts`).
- **Why:** La lógica visual de React ("deshabilitar el botón de ingreso") no debe conocer cuál es la regla que finiquita un tablero de bingo; el componente visual solo debe consumir si la partida en efecto ha terminado o no. 
- **Alternatives considered:** Guardar un estado persistido explícito en el Storage (`isComplete: boolean`). Desestimado porque `calledNumbers.length >= 90` es inmutablemente vinculante e inferible permanentemente sin añadir duplicidad de estado (State Derivation).
- **Consequences:** Facilita cambiar a Bingo de 75 bolas en el futuro modificando un solo parámetro aislado del dominio sin afectar o tocar la estructura visual.

## ADR-008 — Estrategia de sincronización entre hooks
**Status:** Accepted

- **Context:** `useActiveGame` actualiza un juego y el índice global. Sin embargo, `useGames` no lo sabía por carecer de estado global en común, y presentaba información atrasada (stale) en la lista de Sidebar de la App.
- **Decision:** Inyección explícita del callback (Delegate approach). `useGames` provee un despachador puro (`refreshGames`) que `App` recoge y propaga hacia abajo como prop (`onGameUpdate`) a `GameBoard` y por tanto, a `useActiveGame`, quien lo llama como Side-Effect cada vez que guarda satisfactoriamente mutaciones en el storage.
- **Why:** Resuelve la sincronización UI de listas forzando un recálculo desde el I/O sin agregar dependencias externas o contextos complejos, adhiriéndose al ADR-002 y respetando el flujo unidireccional de React clásico.
- **Alternatives considered:** Estado global. EventBus. MutationObserver sobre localStorage. `window.dispatchEvent(new Event(...))`.
- **Consequences:** Las variables pasadas como props de callback evitan el refactor global, pero imponen un estricto `props drilling` para cruzar datos desde la rama principal del árbol DOM (donde vive `useGames`) hasta la rama hija que interactúa (donde muta `useActiveGame`). Para esta SPA de 2 niveles esto es arquitectónicamente aceptable.

## ADR-011 — Application Theme
**Status:** Accepted

- **Context:** La aplicación se utilizará principalmente proyectada y puede funcionar durante el día con iluminación ambiental alta. El Dark Theme por defecto es elegante pero puede perder legibilidad en proyección.
- **Decision:** La aplicación soportará Light y Dark Theme. Dark será el default. La preferencia se persistirá independientemente de las partidas, utilizando una key independiente (`bingo:theme`) en localStorage.
- **Why:** La legibilidad del tablero proyectado es un requisito funcional de la aplicación.
- **Alternatives considered:** 
  - Solo Dark Theme: Descartado por baja legibilidad proyectada diurna.
  - Detectar automáticamente `prefers-color-scheme`: Descartado porque el usuario/operador debe tener control total de la visualización independientemente de cómo tenga configurada la laptop (ej: si la laptop está en dark pero el proyector necesita light).
  - Cambiar automáticamente según horario: Descartado por complejidad e inflexibilidad.
  - Introducir una librería de theming (Styled Components/Theme UI): Descartado por sobrearquitectura; `CSS Variables` nativas con la directiva `@theme` de Tailwind v4 resuelven el problema con coste cero.
- **Consequences:** El sistema visual debe mantener ambos temas consistentes. Los componentes utilizan semánticas abstractas (`bg-theme-bg`) en lugar de colores duros, delegando la responsabilidad visual al `.dark` y `:root`.

## ADR-012 — Manual Correction of Called Numbers
**Status:** Accepted

### Context
Durante una partida real puede ocurrir un error humano al ingresar manualmente una bolilla. Como el bolillero es físico, la aplicación no puede verificar automáticamente si el operador ingresó correctamente el número.

### Decision
Permitir eliminar números ya llamados mediante:
Número llamado → click → ConfirmDialog → confirmación → removeNumber(number)

### Safety
Nunca eliminar directamente con un click. Nunca permitir eliminar números que no hayan sido llamados.

### Why
Reduce el impacto de errores humanos sin introducir un flujo complejo de edición.

### Domain behavior
La operación modifica únicamente `calledNumbers` y conserva:
- game id
- game name
- metadata restante
- activeId

### Alternatives rejected
- **Botón global "Borrar número"**: Descartado por separar la intención de la representación visual del error.
- **Editar números existentes**: Descartado por complejidad y potencial de introducir colisiones lógicas.
- **Permitir borrar con un solo click**: Descartado por alto riesgo de eliminaciones accidentales.
- **Agregar una pantalla de edición**: Descartado por interrumpir el flujo rápido del juego y constituir sobrearquitectura.

## ADR-013 — Persistencia Síncrona, Hardening y Recuperación (Etapa 11)
**Status:** Accepted

### Context
Durante la Etapa 11 de endurecimiento de la aplicación, fue necesario hacer robusto el sistema de almacenamiento local ante escenarios como límite de cuota (QuotaExceededError) y archivos JSON corruptos generados externamente, sin alterar la arquitectura fundamental.

### Decision
- **Persistencia Síncrona:** `localStorage` se mantiene estríctamente síncrono. No se introducirán Promises, IndexedDB ni wrappers async (`localforage`).
- **Estado Global:** No se utilizará Redux, Zustand ni React Context como estado global.
- **Aislamiento:** Los React Hooks (`useGames`, `useActiveGame`) jamás deben acceder directamente a `localStorage`. La responsabilidad de leer, escribir, validar esquemas y recuperar datos corruptos recae exclusiva e íntegramente sobre `gameStorage.ts`.
- **Fallbacks:** Las mutaciones que fallen en ser guardadas deben abortar el ciclo de render para evitar mostrar en pantalla un "falso positivo" de que el dato fue persistido, revirtiendo al estado inmediato anterior y notificando por interfaz al usuario (`alert()` local en esta etapa).

### Why
La SPA debe poder recuperarse y desechar un estado local corrupto o huérfano sin que la app colapse o quede bloqueada para siempre ("Cargando partida..."). Mantener la sincronía evita refactorizaciones masivas que introducen asincronía en cascada a todos los Hooks y Componentes.

### Future Improvement
A futuro, reemplazar el `alert()` nativo por un sistema centralizado de Toast Notifications acoplado al Layout principal para mejorar la UX de los errores de Storage.
