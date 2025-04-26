const  Message  = require('../models/Message');
const User = require('../models/User');
const { randomBytes } = require('crypto');

async function encryptMessage(plainText, key) {
  const { ChaCha20Poly1305 } = await import('@stablelib/chacha20poly1305');
  const nonce = randomBytes(12); // 96 bits (recomendado)
  const chacha = new ChaCha20Poly1305(key);
  const ciphertext = chacha.seal(nonce, Buffer.from(plainText));
  return {
    nonce: nonce.toString('hex'),
    encrypted: Buffer.from(ciphertext).toString('hex')
  };
}

async function decryptMessage(encryptedMessageHex, nonceHex, key) {
  const { ChaCha20Poly1305 } = await import('@stablelib/chacha20poly1305');
  const chacha = new ChaCha20Poly1305(key);
  const decrypted = chacha.open(
    Buffer.from(nonceHex, 'hex'),
    Buffer.from(encryptedMessageHex, 'hex')
  );
  return decrypted ? Buffer.from(decrypted).toString() : null;
}

exports.sendMessage = async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;

    const receiverUser = await User.findOne({ username: receiver });
    if (!receiverUser) {
      return res.status(404).json({ message: 'Usuario receptor no encontrado' });
    }

    const key = Buffer.from('12345678901234567890123456789012'); // 32 bytes
    const { encrypted, nonce } = await encryptMessage(message, key);

    const newMessage = new Message({
      sender,
      receiver,
      content: encrypted,
      nonce
    });

    await newMessage.save();

    res.status(200).json({ message: 'Mensaje enviado exitosamente', newMessage });
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { username } = req.query;
    const userMessages = await Message.find({ receiver: username });

    const key = Buffer.from('12345678901234567890123456789012'); // 32 bytes

    const decryptedMessages = await Promise.all(
      userMessages.map(async msg => ({
        ...msg.toObject(),
        content: await decryptMessage(msg.content, msg.nonce, key)
      }))
    );

    res.status(200).json(decryptedMessages);
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};