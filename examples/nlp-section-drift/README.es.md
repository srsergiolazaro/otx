# 🔄 NLP: Detector de Drift por Secciones

> Identifica cambios semánticos entre versiones de documentos usando Transporte Óptimo.

## El Problema

Las herramientas de 'diff' estándar muestran cambios línea por línea. Sin embargo, si mueves un párrafo o reescribes una oración con sinónimos, un diff muestra todo como cambiado. El **OTX Drift Detector** mide el cambio semántico: entiende si el *contenido* sigue siendo el mismo, incluso si las palabras cambiaron ligeramente.

## ¿Por qué OTX para Versiones?

1. **Conciencia Semántica**: Reconoce que "coche" y "automóvil" son cercanos.
2. **Invariante al Desplazamiento**: Mover una oración dentro de una sección no aumenta la distancia.
3. **Mapa de Calor**: Permite identificar exactamente qué parte de un documento largo necesita revisión.

## Archivos en este Ejemplo

- `doc_v1.md`: Documento original (SRS).
- `doc_v2.md`: Nueva versión con secciones reescritas y un nuevo bloque de "Seguridad".
- `index.js`: El motor de comparación.

## Ejecutar

```bash
bun examples/nlp-section-drift/index.js
```

## Uso como Librería

```javascript
import { runDriftAnalysis } from './examples/nlp-section-drift';

runDriftAnalysis('ruta/a/v1.md', 'ruta/a/v2.md');
```

## Significado de los Estados

| Estado | Significado |
|--------|-------------|
| ✅ STABLE | Cambio semántico mínimo o nulo. |
| 📝 MODIFIED | Algunos cambios, pero mayormente el mismo contenido. |
| 🚨 REWRITTEN | Cambios significativos en el mensaje central. |
| 🆕 NEW | La sección solo existe en la nueva versión. |
| 🗑️ DELETED | La sección fue eliminada en la nueva versión. |
