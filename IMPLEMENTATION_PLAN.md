# Plan de Implementación: El Cazador de Influencia Falsa

## Arquitectura del Sistema

### 1. Frontend (Dashboard de Agencia)
**Tecnología:** React (Vite) + Tailwind CSS (Diseño Premium/Dark Mode)
- **Vista Principal:** Input para URL del perfil (Instagram/TikTok/YouTube).
- **Panel de Resultados:**
    - Velocímetro de "Reality Score" (0-100%).
    - Gráficos de detección de anomalías (Crecimiento de seguidores, Patrones de Likes).
    - **Certificado de Autenticidad:** Generación de PDF/Imagen exportable.
- **Estado de Auditoría:** Consola en tiempo real mostrando acciones del bot ("Analizando seguidores...", "Ejecutando sonda en posts antiguos...").

### 2. Backend (API & Control)
**Tecnología:** Node.js + Express
- **API Endpoints:**
    - `POST /audit/start`: Inicia un nuevo trabajo de auditoría.
    - `GET /audit/:id`: Obtiene estado y resultados parciales.
- **Cola de Tareas:** Manejo de sesiones de navegador concurrentes (o en cola).

### 3. Motor de Auditoría (The Hunter Core)
**Tecnología:** Playwright + `puppeteer-extra-plugin-stealth`
- **Módulo de Sigilo (Stealth Mode):**
    - Rotación de User-Agents.
    - Simulación de comportamiento humano (Mouse movements, Random Pauses).
    - **Geolocalización:** Configuración de Proxy (preparado para IPs residenciales).
- **Módulo de Análisis (Forensics):**
    - **Validación Multifactorial:**
        - Cálculo de `Suspicion Rate` (Fórmula de Tasa de Sospecha).
        - Detección de "Pods" (Comentarios repetitivos/genéricos).
    - **Sonda Activa (Probe):**
        - Navegación a posts > 6 meses.
        - Verificación de "Quién da like" (Muestreo de perfiles de likers).

## Fases de Desarrollo

1.  **Setup del Proyecto:** Estructura Monorepo (Client + Server).
2.  **Desarrollo del Bot Core:** Scripts de Playwright para navegar y extraer data sin ser detectado.
3.  **Lógica de Análisis:** Implementación del algoritmo "Reality Score".
4.  **Frontend UI:** Interfaz visual impactante para la agencia.

## Próximos Pasos
Confirmar el inicio del desarrollo para ejecutar el andamiaje del proyecto (Scaffolding).
