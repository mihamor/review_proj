import websocket from 'websocket';

import { RequestDataEvent } from './socketTypes';

const WebSocketClient = websocket.w3cwebsocket;

export const registerSocketConnection = (accountId: string) => {
  const client = new WebSocketClient('ws://localhost:3030/', 'echo-protocol');
  client.onerror = () => {
    console.log('Connection Error');
  };
  client.onopen = () => {
    console.log('WebSocket Client Connected');

    const fetchInitialData = () => {
      if (client.readyState === client.OPEN) {
        const requestDataEvent: RequestDataEvent = {
          type: 'requestData',
          data: { accountId }
        };
        client.send(JSON.stringify(requestDataEvent));
      }
    }
    fetchInitialData();
  };
      
  client.onclose = () => {
    console.log('echo-protocol Client Closed');
  };
    
  client.onmessage = (e) => {
    if (typeof e.data === 'string') {
      
      console.log("Received: '" + e.data + "'");
    }
  };
  return client;
};