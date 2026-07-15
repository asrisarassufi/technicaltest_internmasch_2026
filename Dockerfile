# Tahap 1: Build React menggunakan Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Salin package.json dan package-lock.json
COPY package.json package-lock.json ./

# Install dependensi
RUN npm install

# Salin seluruh kode frontend
COPY . .

# Terima argumen build untuk API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build aplikasi React + Vite
RUN npm run build

# Tahap 2: Sajikan static files dengan Nginx
FROM nginx:alpine

# Salin hasil build dari builder ke direktori Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Salin konfigurasi default nginx jika ada, jika tidak nginx akan memakai default port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
