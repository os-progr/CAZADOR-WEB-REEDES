# Sistema de Monetización: Suscripción Semestral (Yape)

## Modelo de Negocio
**Tipo:** Acceso SaaS (Software as a Service)
**Ciclo:** Pagos semestrales (Cada 6 meses).
**Pasarela:** Transferencia directa vía **Yape**.

## Flujo de Usuario (UX)

1.  **Landing Page (Pública):**
    *   Explica la propuesta de valor ("Detecta fraude").
    *   Muestra un demo limitado o bloqueado.
2.  **Intento de Auditoría:**
    *   Usuario ingresa URL -> Clic en "Auditar".
    *   **Bloqueo:** Si no tiene suscripción activa, aparece el *Paywall*.
3.  **Pantalla de Pago (Yape Wall):**
    *   Muestra Código QR de Yape.
    *   Instrucciones: "Yapea S/ 15.00 al número...".
    *   Botón de confirmación (WhatsApp/Subir Comprobante).
4.  **Acceso Garantizado:**
    *   Una vez verificado, el usuario tiene acceso ilimitado por 6 meses.

## Implementación Técnica (MVP)

### Frontend
- **Componente `Paywall.jsx`:** Overlay con blur que bloquea los resultados.
- **Componente `YapeCheckout.jsx`:** Diseño idéntico a la app Yape (Morado/QR).
- **Lógica de Estado:** `isSubscribed` (Persistido en LocalStorage para demo).

### Backend
- (Futuro) Base de datos de usuarios con `subscription_end_date`.
- (Futuro) Webhook de validación de pagos.
