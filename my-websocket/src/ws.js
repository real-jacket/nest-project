const { EventEmitter } = require('events');
const { hashKey, handleKey, encodeMessage } = require('./utils');
const http = require('http');

const OPCODES = {
  CONTINUE: 0,
  TEXT: 1,
  BINARY: 2,
  CLOSE: 8,
  PING: 9,
  PONG: 10,
};

class MyWebsocket extends EventEmitter {
  constructor(options) {
    super(options);

    const server = http.createServer();

    server.listen(options.port || 8080);

    server.on('upgrade', (req, socket) => {
      this.socket = socket;
      socket.keepAlive = true;

      const resHeaders = [
        'http/1.1 101 Switching Protocols',
        'upgrade: websocket',
        'connection: upgrade',
        'sec-websocket-accept: ' + hashKey(req.headers['sec-websocket-key']),
        '',
        '',
      ].join('\r\n');

      socket.write(resHeaders);
      socket.on('data', (data) => {
        // 接收客户端发送的数据
        this.processData(data);
        // console.log(data.toString())
      });

      socket.on('close', (error) => {
        this.emit('close');
      });
    });
  }

  handleRealData(opcode, realDataBuffer) {
    switch (opcode) {
      case OPCODES.TEXT:
        this.emit('data', realDataBuffer.toString('utf8'));
        break;
      case OPCODES.BINARY:
        this.emit('data', realDataBuffer);
        break;
      default:
        this.emit('close');
        break;
    }
  }

  processData(bufferData) {
    const byte1 = bufferData.readUInt8(0);
    let opcode = byte1 & 0x0f;

    const byte2 = bufferData.readUInt8(1);
    const str2 = byte2.toString(2);
    const MASK = str2[0];

    let cureByteIndex = 2;

    let payloadLength = parseInt(str2.substr(1), 2);

    if (payloadLength === 126) {
      payloadLength = bufferData.readUInt16BE(2);
      cureByteIndex += 2;
    } else if (payloadLength === 127) {
      payloadLength = bufferData.readUInt64BE(2);
      cureByteIndex += 8;
    }
    let resData = null;

    if (MASK) {
      const maskKey = bufferData.slice(cureByteIndex, cureByteIndex + 4);
      cureByteIndex += 4;
      const payloadData = bufferData.slice(
        cureByteIndex,
        cureByteIndex + payloadLength
      );
      resData = handleKey(maskKey, payloadData);
    } else {
      resData = bufferData.slice(cureByteIndex, cureByteIndex + payloadLength);
    }

    this.handleRealData(opcode, resData);
  }

  send(data) {
    let opcode;
    let buffer;

    if (Buffer.isBuffer(data)) {
      opcode = OPCODES.BINARY;
      buffer = data;
    } else if (typeof data === 'string') {
      opcode = OPCODES.TEXT;
      buffer = Buffer.from(data, 'utf8');
    } else {
      console.error('暂不支持发送的数据类型');
    }
    this.doSend(opcode, buffer);
  }
  doSend(opcode, bufferDatafer) {
    this.socket.write(encodeMessage(opcode, bufferDatafer));
  }
}

module.exports = MyWebsocket;
