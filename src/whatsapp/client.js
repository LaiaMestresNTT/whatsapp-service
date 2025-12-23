const { Client, RemoteAuth } = require('../../lib/whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');


async function initializeClient() {
  try {
    await mongoose.connect('mongodb://mongo:27017/auth_session');
    console.log('☑️ Conectado a MongoDB');

    const store = new MongoStore({ mongoose });

    const client = new Client({
      authStrategy: new RemoteAuth({
        clientId: 'whatsapp-service',
        store: store,
        backupSyncIntervalMs: 300000
      }),
      puppeteer: {
        headless: true,
        executablePath: '/usr/bin/chromium',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            //'--single-process',
            //'--no-zygote',
            '--ignore-certificate-errors',
            '--ignore-ssl-errors',
            '--proxy-server="direct://"',
            '--proxy-bypass-list=*'],
        ignoreHTTPSErrors: true,
        timeout: 60000
      },
      /*webVersion: '2.2410.1',
      webVersionCache: {
         type: 'remote',
         remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/wa-version.json'
       }*/

    });

    client.on('browser_log', (msg) => {
        console.log('🌐 [Navegador]:', msg);
    });

    // Este log es vital: te dirá si la página de WhatsApp carga o da error
    client.on('disconnected', (reason) => {
        console.log('❌ El navegador se desconectó por:', reason);
    });


    client.on('qr', qr => {
      console.log('📲 Escanea este QR para vincular tu dispositivo:');
      qrcode.generate(qr, { small: true });
    });


    client.once('authenticated', () => console.log('☑️ Autenticación exitosa.'));
    client.once('ready', () => console.log('☑️ WhatsApp conectado'));
    client.on('disconnected', reason => console.warn('⚠️ Cliente desconectado:', reason));



    await client.initialize();
    return client;
  } catch (err) {
    console.error('❌ Error inicializando cliente:', err);
    return null;
  }
}



function waitForReady(client, { timeoutMs = 120000 } = {}) {
  return new Promise((resolve, reject) => {
    const onReady = () => {
      clearTimeout(timer);
      console.log('✅ WhatsApp está listo, continuando con el arranque...');
      resolve();
    };

    const timer = setTimeout(() => {
      client.removeListener('ready', onReady);
      reject(new Error(`Timeout esperando 'ready' después de ${timeoutMs}ms`));
    }, timeoutMs);

    client.once('ready', onReady);
  });
}



module.exports = { initClient: initializeClient, waitForReady };

