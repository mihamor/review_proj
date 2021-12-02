import websocket from 'websocket';

import {
  RequestDataEvent,
  SocketServerEvent,
  DataEventType,
  Location,
} from '../types';

const WebSocketClient = websocket.w3cwebsocket;

export const registerSocketConnection = (
  accountId: string,
  onDataEvent: (data: Location[]) => void,
) => {
  const client = new WebSocketClient('ws://localhost:3030/', 'echo-protocol');
  client.onerror = (error) => {
    console.log('Connection Error', error);
  };
  client.onopen = () => {
    console.log('WebSocket Client Connected')

    const fetchInitialData = () => {
      if (client.readyState === client.OPEN) {
        const requestDataEvent: RequestDataEvent = {
          type: 'requestData',
          data: { accountId },
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
    if (typeof e.data !== 'string') return;

    const event: SocketServerEvent = JSON.parse(e.data);
    switch (event.type) {
      case DataEventType:
        const locations = event.data;
        onDataEvent(locations);
        break;
      default:
        break;
    }
  };
  return client;
};