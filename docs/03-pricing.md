# Pricing

## Personales (estructura clara, pública)

| Plan | Precio (propuesta) | Incluye |
|---|---|---|
| **Flare Mensual** | USD 19 /mes | Todo Movement + Meditaciones + Charlas + Workbooks de membresía. Cancela cuando quieras. |
| **Flare Anual** | USD 190 /año (2 meses gratis) | Todo lo del mensual + acceso anticipado a cursos + 15% en eventos. |
| **Prueba gratis** | 7 días | Acceso completo; pide tarjeta, no cobra hasta el día 8. |

Añadidos de pago individual: cursos premium, workbooks premium, entradas a eventos.

> Los montos son placeholders para diseñar la página; los definitivos los definen Ian y
> las fundadoras. Referencias: fitbyyou.com (pricing por país/moneda, sin permanencia,
> cancelación 48 h antes de renovar) y bybala.com.mx (trial + código promocional de 15%).
> Sugerencia: precios en USD con opción GTQ/MXN según país.

## Empresariales (flexibles, se cotizan)

| Paquete | Modelo | Ejemplo |
|---|---|---|
| **Team** | N asientos de membresía a precio por asiento decreciente | 10 a 50 colaboradores |
| **Experiencia** | Evento único presencial u online | Pilates + meditación + journaling en la oficina |
| **Programa anual de bienestar** | Retainer mensual: contenido + sesiones en vivo + charlas | Empresas grandes |

Todo lo corporativo entra por el formulario "Cotiza una experiencia" (`/corporativo`) y
se gestiona como lead; el pricing se arma a medida.

## Cobro
Todo se cobra con **Recurrente** (checkout + suscripciones recurrentes, GTQ/USD). Cada plan
guarda su `recurrente_product_id`; el webhook de Recurrente activa/cancela la membresía.
