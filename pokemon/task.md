# Trabajo Práctico: Batalla de Equipos Pokémon usando PokéAPI

## Recursos

API RESTful: **PokéAPI**

API pública para obtener datos de Pokémon mediante peticiones HTTP GET sin autenticación.

Endpoint principal: https://pokeapi.co/api/v2/pokemon/

## Consigna General

Utilizando HTML y JavaScript, desarrollar una aplicación web que cumpla con los siguientes requisitos:

### Requisitos funcionales principales

1. Equipos Pokémon

- Al cargar la página, seleccionar aleatoriamente dos equipos: Equipo A y Equipo B.
- Cada equipo debe estar compuesto por 3 Pokémon obtenidos desde la PokéAPI.
- Mostrar en pantalla la imagen oficial (sprite) de cada Pokémon, agrupados por equipo.

2. Datos numéricos para la batalla

- Para cada Pokémon, obtener los valores numéricos de ataque y defensa (enteros).
- Calcular la suma total de ataque y defensa para cada equipo.

3. Botón "Iniciar Batalla"

- Al presionar el botón, realizar el enfrentamiento:
  - Comparar el ataque total del Equipo A contra la defensa total del Equipo B.
  - Comparar el ataque total del Equipo B contra la defensa total del Equipo A.
- El equipo ganador es el que tenga la mayor diferencia (ataque propio menos defensa rival).
- Mostrar un mensaje claro con:
  - Equipo ganador.
  - Valores totales de ataque y defensa de ambos equipos.
  - Diferencias calculadas.

4. Interactividad y presentación

- La selección aleatoria de Pokémon se realiza automáticamente al cargar la página.
- Las imágenes y datos se actualizan dinámicamente en el DOM.
- El mensaje de resultado es visible y claramente identificable.

### Requisitos técnicos

- Utilizar fetch para consumir la PokéAPI y obtener datos.
- Manipular el DOM para mostrar imágenes, datos y resultados.
- Utilizar funciones y arrays para organizar lógica de selección, cálculo y comparación.
- Código organizado y comentado para facilitar lectura y mantenimiento.

### Requerimientos adicionales: Tirada de Dados


1. Tirada de Dados por Equipo

- Deben agregarse dos botones visibles, uno debajo de cada equipo:
  - "Tirar Dados Equipo A"
  - "Tirar Dados Equipo B"
- Cada botón simula el lanzamiento de dos dados (valores aleatorios entre 1 y 6) y muestra la suma de ambos dados para esa tirada.
- Cada equipo debe realizar exactamente 3 tiradas de dados, sin importar el orden en que se realicen (no es necesario alternar turnos).
- Mostrar en pantalla los valores de cada una de las 3 tiradas para cada equipo.

2. Control de Tiradas y Botones

- Mientras un equipo tenga tiradas disponibles, su botón "Tirar Dados" estará habilitado.
- Una vez que un equipo haya realizado sus 3 tiradas, se debe deshabilitar su botón correspondiente (visualmente inactivo).
- El botón principal "Iniciar Batalla" estará inicialmente deshabilitado y solo se habilitará cuando ambos equipos hayan completado sus 3 tiradas de dados.

3. Desempate por Dados

- En caso de empate en la batalla (según las reglas originales de ataque vs. defensa), se desempatará utilizando el valor más alto obtenido en cualquiera de las 3 tiradas de dados de cada equipo.
- El equipo con la tirada más alta será declarado ganador.
- Mostrar junto con el resultado final:
  - El valor más alto obtenido en las tiradas de dados de cada equipo.
  - En cuál de las 3 tiradas se obtuvo dicho valor.

4. Visualización de Resultados Ampliada

- El resultado final debe indicar:
  - Equipo ganador (por batalla o por desempate con dados).
  - Valores totales de ataque y defensa de ambos equipos.
  - Diferencias calculadas en la batalla.
  - Valor más alto de tirada de dados y número de tirada para cada equipo.
