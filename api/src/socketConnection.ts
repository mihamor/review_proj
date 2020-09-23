import websocket from 'websocket';
import { Server } from 'http';

import Review from './models/Review';
import Location from './models/Location';
import {
  SocketClientEvent,
  RequestDataEventType,
  DataEvent,
  DataEventType,
} from './types';
import { requestServiceAccountWatch } from './helpers';

const WebSocketServer = websocket.server;


const getLocationsWithReviews = async (accountId: number) => {
  const locations = await Location.getList(accountId);
  const promisesReviews = locations.map(async (location) => {
    const reviews = await Review.getList(location.id);
    return reviews;
  });
  const reviews = await Promise.all(promisesReviews);
  const locationsWithReviews = locations.map((location, index) => ({
    ...location,
    reviews: reviews[index],
  }));
  return locationsWithReviews;
};

const switchOnEventTypes = async (data: string, connection: websocket.connection) => {
  const event: SocketClientEvent = JSON.parse(data);
  switch (event.type) {
    case RequestDataEventType:
      const { accountId } = event.data;
      const response = await requestServiceAccountWatch(accountId);
      const responseJson = await response.json();
      console.log(responseJson);
      const locations = await getLocationsWithReviews(Number(accountId));
      const dataEvent: DataEvent = {
        type: DataEventType,
        data: locations,
      };
      connection.send(JSON.stringify(dataEvent));
      break;
    default:
      break;
  }
};

export const registerSocket = (server: Server) => {

  const ws = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
  });

  const originIsAllowed = (origin: string) => {
    // put logic here to detect whether the specified origin is allowed.
    return true;
  }

  ws.on('request', (request) => {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    const connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', (message) => {
        if (message.type === 'utf8' && message.utf8Data) {
          console.log('Received Message: ' + message.utf8Data);
          switchOnEventTypes(message.utf8Data, connection);
        }
    });
    connection.on('close', (reasonCode, description) => {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
  });
};
