
export const RequestDataEventType = 'requestData';

export interface RequestDataEvent {
  type: typeof RequestDataEventType,
  data: {
    accountId: string,
  },
};

export type SocketClientEvent = RequestDataEvent;

export const DataEventType = 'data';
export const ChangeEventType = 'change';

export interface DataEvent {
  type: typeof DataEventType,
  data: Object,
};
export interface ChangeEvent {
  type: typeof ChangeEventType,
};

export type SocketServerEvent = DataEvent | ChangeEvent;
