# Imagen de desarrollo: React 19 / Vite 6.
FROM node:22-bookworm-slim
WORKDIR /app

# Instalar versiones reproducibles a partir de package-lock.json.
# .npmrc incluye legacy-peer-deps=true, necesario para React 19 y react-helmet-async.
COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund

COPY . .
EXPOSE 5173

# --host permite acceder a Vite desde fuera del contenedor.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173", "--strictPort"]
