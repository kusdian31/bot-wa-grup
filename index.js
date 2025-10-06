import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import qrcode from 'qrcode-terminal'

const startBot = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    browser: ['BotGrupWA', 'Chrome', '1.0.0']
  })

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update
    if (qr) qrcode.generate(qr, { small: true })
    if (connection === 'open') console.log('✅ RELAWAN.RT07.Bot sudah tersambung!')
    else if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode
      console.log('⚠️ Terputus... mencoba sambung ulang.', reason)
      if (reason !== DisconnectReason.loggedOut) startBot()
    }
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const from = msg.key.remoteJid
    const sender = msg.pushName || 'Pengguna'
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''

    console.log(`[${from}] ${sender}: ${text}`)

    if (text.toLowerCase() === '/menu') {
      await sock.sendMessage(from, {
        text:
          `👋 Hai ${sender}!\n` +
          `Aku bot grup WhatsApp.\n\n` +
          `📜 Menu Perintah:\n` +
          `• /menu - Lihat semua perintah\n` +
          `• /status - Cek status bot\n` +
          `• /help - Bantuan\n` +
          `• halo - Sapa bot\n`
      })
    }

    else if (text.toLowerCase() === '/status') {
      await sock.sendMessage(from, { text: '📊 Status: RELAWAN.RT07.Bot aktif dan siap melayani ✅' })
    }

    else if (text.toLowerCase() === '/help') {
      await sock.sendMessage(from, { text: '💡 Kirim /menu untuk melihat daftar perintah.' })
    }

    else if (text.toLowerCase().includes('halo')) {
      await sock.sendMessage(from, { text: `Assalamualaikum, ${sender}! 👋` })
    }
  })
}

startBot()
