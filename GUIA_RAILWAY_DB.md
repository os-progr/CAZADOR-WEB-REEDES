# Guía de Conexión Manual: Railway PostgreSQL

Si la aplicación en Railway no detecta automáticamente la base de datos (y ves el aviso de "SQLite" en los logs), sigue estos pasos:

### Paso 1: Obtener la URL de Conexión
1.  En tu Dashboard de Railway, ve al servicio **PostgreSQL** que acabas de crear.
2.  Ve a la pestaña **Connect**.
3.  Copia el valor donde dice **Postgres Connection URL** (Debe empezar con `postgresql://...`).

### Paso 2: Configurar la App
1.  Vuelve al Dashboard y entra en tu servicio de aplicación (El que tiene el código de GitHub).
2.  Ve a la pestaña **Variables**.
3.  Haz clic en **New Variable**.
    *   **VARIABLE_NAME:** `DATABASE_URL`
    *   **VALUE:** *(Pega la URL que copiaste en el paso 1)*
4.  Haz clic en **Add**.

### Paso 3: Reiniciar
Railway detectará el cambio y reiniciará la aplicación automáticamente. 
Ahora debería decir en los logs: `🔌 Connected to PostgreSQL (Railway)`.
