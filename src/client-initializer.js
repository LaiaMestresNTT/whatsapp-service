const { Client, RemoteAuth } = require('../lib/whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');


async function initializeClient() {
  try {
    await mongoose.connect('mongodb://mongo:27017/auth_session');
    console.log('✅ Conectado a MongoDB');

    const store = new MongoStore({ mongoose });

    const client = new Client({
      authStrategy: new RemoteAuth({
        clientId: 'whatsapp-service',
        store: store,
        backupSyncIntervalMs: 300000
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        timeout: 60000
      },
      webVersion: '2.2410.1',
      webVersionCache: {
         type: 'remote',
         remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/wa-version.json'
       }

    });

    client.on('qr', qr => {
      console.log('📲 Escanea este QR para vincular tu dispositivo:');
      qrcode.generate(qr, { small: true });
    });

    client.on('authenticated', () => console.log('✅ Autenticación exitosa.'));
    client.on('auth_failure', msg => console.error('❌ Fallo de autenticación:', msg));
    client.on('ready', () => console.log('✅ WhatsApp conectado'));
    client.on('disconnected', reason => console.warn('⚠️ Cliente desconectado. Motivo:', reason));


    await client.initialize();
    return client;
  } catch (err) {
    console.error('❌ Error inicializando cliente:', err);
  }
}

module.exports = initializeClient;

