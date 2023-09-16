const crypto = require('crypto');

function hashKey(key) {
  const sha1 = crypto.createHash('sha1');
  sha1.update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11');
  return sha1.digest('base64');
}

function handleKey(maskBytes, data) {
  const payload = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) {
    payload[i] = maskBytes[i % 4] ^ data[i];
  }

  return payload;
}

function encodeMessage(opcode, payload) {
  let bufferData = Buffer.alloc(payload.length + 2 + 0);

  let byte1 = parseInt('10000000', 2) | opcode;
  let byte2 = payload.length;

  bufferData.writeUInt8(byte1, 0);
  bufferData.writeUInt8(byte2, 1);

  payload.copy(bufferData, 2);

  return bufferData;
}

module.exports = {
  hashKey,
  handleKey,
  encodeMessage,
};
