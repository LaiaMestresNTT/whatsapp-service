FROM node:18

# Instalamos chromium y certificados actualizados
RUN apt-get update && apt-get install -y \
    chromium \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libnss3 \
    lsb-release \
    xdg-utils \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

# Copiamos solo lo necesario para instalar
COPY package*.json ./
RUN npm install

# Copiamos el resto
COPY src ./src

CMD ["node", "src/index.js"]