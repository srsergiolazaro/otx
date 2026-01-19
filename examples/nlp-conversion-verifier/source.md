# Proyecto Alpha: Sistema de Guía Autónoma

Este documento describe los principios del Sistema Alpha para la navegación en entornos dinámicos.

## Introducción

El sistema utiliza sensores de profundidad y algoritmos de **transporte óptimo** para alinear las nubes de puntos capturadas en tiempo real.

## Metodología

Para lograr la precisión necesaria, implementamos:
*   Filtros de Kalman para predicción.
*   OTX-Max para el matching de alta densidad.
*   Sistemas de respaldo inercial.

## Resultados

Los resultados muestran una reducción del 40% en el error de localización comparado con métodos tradicionales.

## Conclusión

El uso de OTX permite una navegación más fluida y robusta.
