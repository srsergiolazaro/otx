# 📝 NLP: Verificador de Conversión de Documentos

> Verificar que las conversiones Markdown → LaTeX preservan el contenido semántico usando Transporte Óptimo.

## El Problema

Al convertir documentos entre formatos (MD → TeX, TeX → HTML, etc.), el contenido puede perderse, corromperse o traducirse mal. Las herramientas de diff tradicionales solo detectan diferencias exactas de texto, perdiendo problemas semánticos.

```
    source.md                    converted.tex
    ┌─────────────┐              ┌─────────────┐
    │ # Título    │   Convertir  │ \section{}  │
    │ Contenido.. │  ───────────►│ Contenido.. │
    │ ## Sección  │              │ \subsection │
    └─────────────┘              └─────────────┘
           │                            │
           └─────────── OTX ────────────┘
                        │
              Score de Similitud Semántica
                        │
              ✅ > 90%: Aprobado
              ⚠️ 70-90%: Advertencia
              ❌ < 70%: Fallo
```

## ¿Por qué Transporte Óptimo?

| Desafío | Solución con OTX |
|---------|------------------|
| Sintaxis diferente (# vs \section) | Compara **contenido**, no markup |
| Cambios en orden de palabras | Maneja **cambios de distribución** |
| Pérdida parcial de contenido | Detecta **secciones faltantes** |
| Mezcla de idiomas | Funciona con **cualquier token** |

## Ejecutar

```bash
bun examples/nlp-conversion-verifier/index.js
```

## Casos de Prueba

| Escenario | Similitud Esperada |
|-----------|-------------------|
| Conversión perfecta | > 95% ✅ |
| Sección faltante | 70-85% ⚠️ |
| Corrompido/traducido | < 50% ❌ |
| Contenido agregado no autorizado | 60-80% ⚠️ |

## Integración

## Uso como Librería

```javascript
import { verifyConversion } from './examples/nlp-conversion-verifier';

const result = verifyConversion(markdownText, latexText);
console.log(`Similitud: ${result.similarity}%`);
```

if (result.similarity < 90) {
    console.warn('¡La conversión puede haber perdido contenido!');
}
```

## Aplicaciones

- 📄 **qtex**: Verificar conversiones md→tex
- 📚 **Documentación**: Asegurar que README coincide con docs
- ⚖️ **Legal**: Migraciones de formato de contratos
- 🌐 **i18n**: Completitud de traducciones
