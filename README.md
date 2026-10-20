<div align="center">

<img src="./docs/portfolio-banner.svg" alt="GracianB · Tres universos conectados" width="100%">

# GracianB · Atlas personal

**Una misma curiosidad. Tres universos.**

[Explorar el atlas ↗](https://gracianb.github.io/GracianB/) · [Professional Deck ↗](https://gracianb.github.io/professional-deck/) · [Yoga Instructor ↗](https://gracianb.github.io/yoga-instructor/) · [Systems Lab ↗](https://gracianb.github.io/systems-lab/)

</div>

## Una puerta de entrada, tres destinos

Este es el **hub público personal**, no un CV universal ni una copia de los otros portfolios. El sitio es estático, bilingüe (ES/EN), adaptable a móvil y publicado en GitHub Pages, sin servidor de aplicación ni credenciales de visitantes.

| Universo | Qué encontrarás | Acceso |
| --- | --- | --- |
| **Professional Deck** | Trayectoria, Customer Success, operaciones, datos, automatización y casos verificables | [Explorar ↗](https://gracianb.github.io/professional-deck/) |
| **Yoga Instructor** | Enseñanza, modalidades de clases, experiencia, respiración opcional y contacto | [Explorar ↗](https://gracianb.github.io/yoga-instructor/) |
| **Systems Lab** | Software, IA aplicada, juegos, arte generativo y demos con su estado real | [Explorar ↗](https://gracianb.github.io/systems-lab/) |

[<img src="./docs/three-worlds.svg" alt="Professional, Yoga y Systems Lab: los tres universos" width="100%">](https://gracianb.github.io/GracianB/#universes)

## Experiencia actual · Atlas V4 (20 de octubre de 2026)

- Una portada con **tres universos interactivos** y una identidad visual común.
- **Seis capítulos personales**: Murcia, Gran Canaria, Madrid, Lisboa, Bérgamo y Varsovia. Al seleccionar uno se actualizan su contexto y el aprendizaje asociado. Son capítulos narrativos, **no** rutas de viaje ni empleadores deducidos por posición.
- Acceso rápido con **Ctrl/Cmd + K**, búsqueda, selección por teclado, Escape y restauración de foco.
- Temas claro/oscuro y ES/EN, con reducción de movimiento y navegación adaptable.
- Acceso directo a los documentos de candidatura, sin descargar ni duplicar datos ajenos.

**Versión del código:** [Atlas V4, commit `8a83e00`](https://github.com/GracianB/GracianB/commit/8a83e00a4253e405dc41664e4a6605191045f9b7). La denominación «V1 Official» pertenece a una etapa anterior y no describe la interfaz actual.

## Documentos y candidaturas

La **fuente canónica** de los PDF públicos es este repositorio. El [centro de candidaturas ↗](https://gracianb.github.io/GracianB/apply.html) organiza los documentos en tres ámbitos: profesional, yoga y tripulación de cabina. Hay **12 PDF publicados**: un CV y una carta de presentación en ES/EN por cada ámbito.

| Ámbito | CV ES | CV EN | Carta ES | Carta EN |
| --- | --- | --- | --- | --- |
| Profesional | [PDF](./Gracian_Baena_CV_2026_ES.pdf) | [PDF](./Gracian_Baena_CV_2026_EN.pdf) | [PDF](./Gracian_Baena_Carta_Presentacion_ES.pdf) | [PDF](./Gracian_Baena_Cover_Letter_EN.pdf) |
| Yoga | [PDF](./Gracian_Baena_CV_Yoga_ES.pdf) | [PDF](./Gracian_Baena_CV_Yoga_EN.pdf) | [PDF](./Gracian_Baena_Carta_Yoga_ES.pdf) | [PDF](./Gracian_Baena_Cover_Letter_Yoga_EN.pdf) |
| Cabin Crew | [PDF](./Gracian_Baena_CV_TCP_ES.pdf) | [PDF](./Gracian_Baena_CV_TCP_EN.pdf) | [PDF](./Gracian_Baena_Carta_TCP_ES.pdf) | [PDF](./Gracian_Baena_Cover_Letter_TCP_EN.pdf) |

**Regla de coherencia:** las páginas y los repositorios especializados deben enlazar estos archivos canónicos, no presentar copias antiguas como documentación vigente. Las credenciales de aviación no se describen como vigentes cuando son históricas.

## Estructura del repositorio

| Ruta | Responsabilidad |
| --- | --- |
| `index.html`, `main.js`, `i18n.js` | Hub, exploración, selección de capítulos y traducción |
| `styles.css`, `constellation-v3.css`, `city-atlas-v2.css` y estilos de acabado | Identidad visual y adaptación responsive |
| `apply.html`, `apply.js`, `apply.css` | Centro de candidaturas y documentos |
| `cabin-*.html/css/js` | Material público de la vía de aviación |
| `docs/` | Recursos vectoriales y documentación |
| `scripts/` | Contratos de enlaces, PDF, navegación, rendimiento y pruebas |
| `.github/workflows/` | Validación, despliegue y comprobaciones de producción |

No requiere un backend. Para servirlo desde la raíz del repositorio local, utiliza por ejemplo `python -m http.server 8000` y abre `http://localhost:8000/`.

## Calidad y publicación

[Quality de Atlas V4: aprobada ↗](https://github.com/GracianB/GracianB/actions/runs/39332361451) · [Pages de Atlas V4: aprobado ↗](https://github.com/GracianB/GracianB/actions/runs/39332361359)

Las comprobaciones incluyen contratos estáticos, rutas, documentos PDF, comportamiento en navegador y publicación. Un workflow correcto valida el cambio correspondiente; **no demuestra por sí solo** que toda variación visual futura haya sido revisada manualmente.

## Privacidad y alcance

No subir identificaciones, direcciones privadas, teléfonos personales, información de clientes, contraseñas, tokens ni documentos internos. Los PDF presentes aquí son **documentos deliberadamente públicos**. Consulta [SECURITY.md](SECURITY.md).

Los portfolios enlazados mantienen sus repositorios, ciclos de publicación y límites de acceso propios. Los trabajos privados de Aigoritmo y Cutter Studio no deben exponerse a través de esta web.

**Atlas V4 · Documentación actualizada el 20 de octubre de 2026.**
