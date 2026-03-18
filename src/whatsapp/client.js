const { Client, LocalAuth, RemoteAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
//const fs = require('fs');
//const path = require('path');

async function initializeClient() {
  try {
    // LIMPIEZA ARCHIVOS DE SESIÓN
    /*const sessionPath = '/app/.wwebjs_auth/session/Default/SingletonLock';
    if (fs.existsSync(sessionPath)) {
        try {
            fs.unlinkSync(sessionPath);
            console.log('🧹 Archivo SingletonLock eliminado para evitar errores de sesión.');
        } catch (e) {
            console.warn('⚠️ No se pudo eliminar SingletonLock:', e.message);
        }
    }*/

    await mongoose.connect('mongodb://mongo:27017/auth_session?replicaSet=rs0&serverSelectionTimeoutMS=5000&connectTimeoutMS=10000');
    console.log('☑️ Conectado a MongoDB');

    const store = new MongoStore({ mongoose });

    const client = new Client({
      authStrategy: new RemoteAuth({
        clientId: 'whatsapp-service',
        store: store,
        backupSyncIntervalMs: 600000
      }),

      /*authStrategy: new LocalAuth({
          dataPath: '/app/.wwebjs_auth' // Esta ruta debe coincidir con el destino del volumen en el compose
      }),*/

      puppeteer: {
        headless: true,
        executablePath: '/usr/bin/chromium',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--ignore-certificate-errors',
            '--ignore-ssl-errors',
            '--disable-extensions',
            '--proxy-server="direct://"',
            '--proxy-bypass-list=*',
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'],
        ignoreHTTPSErrors: true,
        authTimeoutMs: 120000,
        qrMaxRetries: 10,
      },

    });

    client.on('loading_screen', (percent, message) => {
        console.log('⏳ CARGANDO WHATSAPP:', percent, '% -', message);
    });

    client.on('remote_session_saved', () => {
        console.log('✅ Sesión guardada en MongoDB (RemoteAuth)');
    });

    client.on('qr', qr => {
      console.log('📲 Escanea este QR para vincular tu dispositivo:');
      qrcode.generate(qr, { small: true });
    });

    client.on('authenticated', async () => { console.log('☑️ Autenticación exitosa'); });

    client.once('ready', () => console.log('☑️ WhatsApp conectado'));

    // Este log es vital: te dirá si la página de WhatsApp carga o da error
    client.on('disconnected', reason => console.warn('⚠️ Cliente desconectado:', reason));

    await client.initialize();
    return client;

  } catch (err) {
    console.error('❌ Error inicializando cliente:', err);
    throw err;

  }
}

function waitForReady(client, { timeoutMs = 120000 } = {}) {
  return new Promise((resolve, reject) => {
      if (client.info && client.info.wid) return resolve(); // Si ya está listo

      const timer = setTimeout(() => {
        reject(new Error(`Timeout esperando 'ready' después de ${timeoutMs}ms`));
      }, timeoutMs);

      client.once('ready', () => {
        clearTimeout(timer);
        resolve();
      });
    });
}

module.exports = { initClient: initializeClient, waitForReady };

