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
        backupSyncIntervalMs: 300000
      }),

      /*authStrategy: new LocalAuth({
          dataPath: '/app/.wwebjs_auth' // Esta ruta debe coincidir con el destino del volumen en el compose
      }),*/

      // CARGAMOS UNA VERSIÓN MÁS ANTIGUA DE WHATSAPP PARA PODER USAR LAS FUNCIONES ANTIGUAS
      /*webVersionCache: {
          type: 'remote',
          remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
      },*/

      //webVersionCache: { type: 'remote', remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html' },

      /*webVersionCache: {
          type: 'local',
          path: './.wwebjs_cache'
      },*/

      puppeteer: {
        headless: "new",
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
            '--proxy-server="direct://"',
            '--proxy-bypass-list=*'],
        ignoreHTTPSErrors: true,
        timeout: 60000
      }

    });

    client.on('browser_log', (msg) => {
        console.log('🌐 [Navegador]:', msg);
    });

    console.log('📦 Configuración de versión web:', client.options.webVersionCache);

    client.on('qr', qr => {
      console.log('📲 Escanea este QR para vincular tu dispositivo:');
      qrcode.generate(qr, { small: true });
    });


    // Este log es vital: te dirá si la página de WhatsApp carga o da error
    client.on('disconnected', (reason) => {
        console.log('❌ El navegador se desconectó por:', reason);
    });


    client.once('authenticated', () => console.log('☑️ Autenticación exitosa.'));
    client.once('ready', () => console.log('☑️ WhatsApp conectado'));
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

