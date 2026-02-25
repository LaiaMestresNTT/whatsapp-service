FROM node:18-slim

# Instalamos chromium y certificados actualizados
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

# Copiamos solo lo necesario para instalar
COPY package*.json ./
RUN npm install

# Copiamos el resto
COPY src ./src

CMD ["node", "src/index.js"]