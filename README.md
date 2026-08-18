# Screener de Acciones EE. UU.

Dashboard que escanea un universo de ~200 acciones large/mid-cap de EE. UU. y muestra dos paneles:

- **Infravaloradas con crecimiento**: acciones con mayor potencial de alza según el precio objetivo medio de analistas, PEG bajo (P/E ajustado por crecimiento) y fuerte crecimiento estimado de beneficios/ingresos.
- **Sobrevaloradas**: acciones que cotizan por encima (o cerca) de su objetivo de analistas, con PEG y P/E elevados.

## Datos

Los datos fundamentales y estimaciones de analistas se obtienen en tiempo real (con el retraso habitual del mercado) desde Yahoo Finance, sin necesidad de API key, vía [`yahoo-finance2`](https://github.com/gadicc/yahoo-finance2).

El universo de tickers escaneado está en `src/lib/universe.ts`. La API (`src/app/api/screener/route.ts`) cachea el resultado en memoria 15 minutos; el botón "Actualizar" fuerza un refetch.

## Metodología de scoring

Ver `src/lib/scoring.ts` para el detalle. En resumen, cada acción se normaliza contra el resto del universo escaneado (no es una valoración absoluta tipo DCF):

- **Score de valor** = 35% potencial de alza vs. objetivo de analistas + 25% PEG bajo + 20% crecimiento estimado de BPA + 15% crecimiento de ingresos + 5% ROE.
- **Score de sobrevaloración** = 40% downside vs. objetivo + 30% PEG alto + 15% P/E forward alto + 15% P/E trailing alto.

Esto **no constituye asesoramiento financiero**.

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

```bash
npm run lint      # ESLint
npx tsc --noEmit  # chequeo de tipos
npm run build     # build de producción
```
