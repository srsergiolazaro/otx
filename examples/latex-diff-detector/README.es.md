# 📄 Detector de Cambios Semánticos en LaTeX

Este ejemplo demuestra cómo OTX puede utilizarse como una herramienta de **Diff Estructural y Semántico** para documentos grandes (artículos científicos, contratos legales).

Las herramientas de `diff` tradicionales comparan líneas de texto. Si mueves un párrafo de la Sección 1 a la Sección 3, el `diff` mostrará una eliminación y una inserción. **OTX entiende que simplemente se ha movido.**

## Cómo funciona

1.  **Parsing**: Segmenta el archivo `.tex` en bloques lógicos (Secciones, Párrafos, Ecuaciones).
2.  **Embedding Estructural**: Cada bloque se convierte en una coordenada 3D: `[Hash_Contenido, Tipo_Bloque, Posición]`.
3.  **Transporte Óptimo**: OTX encuentra el mapeo más eficiente (mínimo esfuerzo) para transformar la "Nube de Bloques" de la Versión 1 en la Versión 2.
4.  **Detección de Cambios**:
    *   **Match de alto costo**: El bloque ha sido editado.
    *   **Match con distancia**: El bloque ha sido movido.
    *   **Masa no emparejada**: Se ha añadido o borrado contenido.

## Ejecutar

```bash
bun examples/latex-diff-detector/index.js
```

## Escenario de Ejemplo

- `v1.tex`: Estructura original del artículo.
- `v2.tex`: Un párrafo de la "Introducción" se mueve a "Metodología", y se añade una variable $\alpha$ a una ecuación.

OTX detectará la distancia de "Movimiento" y el costo de "Edición" de la ecuación, proporcionando una métrica de distancia global para la evolución del documento.
