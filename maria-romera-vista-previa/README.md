# María Romera · Vista editorial pública V20

**Abrir directamente:**
https://gracianb.github.io/GracianB/maria-romera-vista-previa/

## Alcance y confidencialidad
Esta web es una **vista editorial de cortesía, no un sitio oficialmente aprobado por María Romera**. El repositorio `GracianB/maria-romera` permanece privado. La versión pública no incluye sus PDF privados ni los datos nuevos pendientes de su aprobación. No confundir `noindex` con acceso privado: cualquiera puede abrir el enlace.

## Qué aporta V20
Es una evolución única desde la V11, sin afirmar que V12–V19 hayan sido versiones publicadas por separado.

- **Procurement Decision Lab** con tres retos: sourcing de proveedor, incremento imprevisto de demanda y comercio triangular.
- Tres alternativas ficticias por reto y ponderaciones ajustables para coste, plazo y fiabilidad documental.
- Recomendación dinámica, clasificación, trazabilidad de criterios y tres comprobaciones previas a la aprobación.
- Interacción bilingüe español/inglés que se sincroniza con el selector actual de la web.
- Accesibilidad: regiones vivas, controles de rango etiquetados, navegación por teclado, móvil y movimiento reducido.
- Diseño editorial propio en marfil/cobre o petróleo/champagne, no clonado del portfolio de Aga.
- Pruebas estáticas que evitan filtrar documentos privados y E2E Chromium en 320/390/768/1440 píxeles con capturas ES/EN.

### Restricciones del simulador
Las ofertas, puntuaciones y resultados **son inventados y únicamente ilustrativos**. No corresponden a proveedores, contratos, clientes, ahorros ni decisiones que María haya tomado. Este es un ejemplo para comprender criterios generales de procurement, no un sistema de compras listo para producción.

### Verificación
`node scripts/check-maria-public-v20.mjs`
`node scripts/maria-public-v20-e2e.mjs` (Playwright)
En GitHub Actions se ejecutan conjuntamente con el QA del resto del hub. Publicar solo con CI verde.

### Antes de difundir como portfolio oficial
María debe revisar las fechas y funciones de su trayectoria, los cursos y títulos, los idiomas, la propuesta editorial de la portada y el consentimiento para publicación. Ver el fichero privado `docs/FACT_CHECK.md`, sin copiarlo ni sus CV al proyecto público.


## V21 · Transparent Procurement Brief (24 October 2026)

- The existing bilingual fictional procurement comparator now shows **why** an offer ranks first: component ratings, selected weights, weighted contributions and the score margin over the runner-up. Close results are described as a *technical tie*, not a decisive winner.
- A text-only fictional procurement brief and scenario link can be copied from the browser without downloads or a backend.
- The URL includes only the example scenario and three bounded weights (`scenario`, `wc`, `ws`, `wr`) plus `lang`. Browser reload and direct opening recover the settings; the ES/EN switch retains the values.
- No scoring numbers represent actual suppliers, savings, customer contracts, personal work, or a procurement platform ready for decisions.
- Browser QA checks criterion explanations, copy behaviour, permalinks and restoration in ES/EN × mobile/tablet/desktop.
- No private CVs or altered employment/qualification claims have been published. María's consent gate remains in force.
