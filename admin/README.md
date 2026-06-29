# Dashboard — Admin microservicio

Panel de administración del mapa de emergencias. Monorepo Turborepo con npm workspaces.

## Requisitos

- Node >=24
- npm >=10

## Arrancar

```bash
# Instalar dependencias
npm install

# Modo desarrollo (todos los paquetes)
npm run dev

# Ejecutar tests
npm run test

# Lint
npm run lint
```

## Estructura

```
dashboard/
├── apps/       # Aplicaciones (ej. admin web)
└── packages/   # Paquetes compartidos (ej. ui, utils)
```
