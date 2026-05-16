## Despliegue en Vercel

Para desplegar esta aplicación en Vercel, sigue estos pasos:

1. Conecta tu repositorio de GitHub a Vercel.
2. En la configuración del proyecto, añade las siguientes variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`: Tu URL de proyecto de Supabase.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Tu clave anónima de Supabase.
3. Vercel detectará automáticamente Next.js y realizará el despliegue.

### Soporte PWA
La aplicación incluye un `manifest.json`. Para una experiencia óptima en dispositivos móviles, los usuarios pueden "Añadir a la pantalla de inicio" desde su navegador móvil.

## Desarrollo Local

Primero, instala las dependencias:

```bash
npm install
```

Luego, inicia el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.
