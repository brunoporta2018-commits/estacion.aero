# Estación Meteorológica – UTN San Francisco

Página en **Vue 3 + axios** (con Vite) que muestra los datos de
`https://meteorologia.sanfrancisco.utn.edu.ar/apiv2.php` y se actualiza sola cada **7 minutos**.

## Registros y unidades

| Registro | Unidades (botón en cada tarjeta) |
|---|---|
| Temperatura, humedad, presión | °C, %, hPa (con máx/mín del día) |
| Capa de nubes (base, calculada) | metros / pies |
| Espesor de la capa (estimado) | metros / pies |
| Viento constante | m/s / km/h / mph |
| Ráfaga de viento | m/s / km/h / mph |

## Uso

Requiere Node.js 18 o superior.

```bash
npm install
npm run dev       # desarrollo: http://localhost:5173
npm run build     # genera la carpeta dist/ lista para subir al hosting
npm run preview   # prueba local del build
```

Para publicar, subí el **contenido de `dist/`** a tu hosting (usa rutas relativas, funciona en cualquier carpeta).

## Notas importantes

- **Capa de nubes y espesor (calculados):** la API **no devuelve** estos datos, así que se calculan en
  `src/utils/cloud.js`:
  - **Base de la capa** = 125 × (T − Td) metros (fórmula de Espy), con T = temperatura y Td = punto de
    rocío (el que informa la API; si faltara, se calcula con la fórmula de Magnus). Es una buena
    aproximación del nivel de condensación.
  - **Espesor:** es solo una **estimación** a partir de la humedad: 0 m con humedad ≤ 60 % y crece
    linealmente hasta 1500 m con 100 %. Con datos de superficie no se puede medir el espesor real (haría
    falta un ceilómetro o un sondeo); ajustá `RH_MIN` y `THICKNESS_MAX_M` en `cloud.js` si querés
    calibrarlo.
  - Si la API incorpora campos `capa_nubes`/`altura_nubes`/`base_nubes` o `espesor_capa`/`espesor_nubes`,
    tienen prioridad sobre el cálculo.
- **Ráfaga:** la API solo informa la velocidad máxima del día (`velocidad_viento_max`), por eso la
  tarjeta indica "Máxima del día" con su hora.
- **CORS:** en desarrollo se usa un proxy de Vite (`vite.config.js`). En producción el navegador consulta
  la API directamente; si el servidor de la UTN no permite CORS, habilitá el encabezado
  `Access-Control-Allow-Origin` en `apiv2.php` o servirla desde el mismo dominio / detrás de un proxy.
  También podés definir otra URL con la variable `VITE_API_URL` (archivo `.env`).

## Estructura

```
src/
  api.js                    # cliente axios
  App.vue                   # lógica, refresco cada 7 min
  components/WeatherCard.vue
  utils/parse.js            # "18,1 °C" -> 18.1
  utils/units.js            # conversiones m/s·km/h·mph y m·ft
  utils/cloud.js            # cálculo de base y espesor de la capa de nubes
  style.css
```
