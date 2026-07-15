# Gunakan Node.js versi ringan
FROM node:20-alpine

# Tentukan working directory
WORKDIR /app

# Salin package.json dan install dependensi
COPY package.json ./
RUN npm install --only=production

# Salin seluruh kode backend
COPY . .

# Ekspos port server
EXPOSE 3000

# Jalankan backend
CMD ["node", "server.js"]
