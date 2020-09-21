
export type ReviewReply = {
  id: number,
  comment: string,
  updateTime: string,
};

export type Reviewer = {
  id: number,
  profilePhotoUrl: string,
  displayName: string,
  isAnonymous: boolean,
};

export type Review = {
  id: number,
  locationId: number,
  reviewer: Reviewer,
  starRating: string,
  comment: string,
  createTime: string,
  reviewReply: ReviewReply,
  updateTime: string,
};

export type Location = {
  id: number,
  createdAt: string,
  name: string,
  languageCode: string,
  storeCode: string,
  locationName: string,
  primaryPhone: string,
  additionalPhones: string[],
  address: number,
  primaryCategory: string,
  additionalCategories?: string | null,
  websiteUrl?: string | null
  regularHours: number,
  specialHours: string,
  serviceArea: string | null,
  locationKey: number,
  labels: string[],
  adWordsLocationExtensions: string | null,
  latlng: string | null,
  openInfo: string | null,
  locationState: string | null,
  attributes: string | null,
  metadata:string | null,
  profile: string | null,
  relationshipData: string | null,
  reviews: Review[],
};


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
  data: Location[],
};
export interface ChangeEvent {
  type: typeof ChangeEventType,
};

export type SocketServerEvent = DataEvent | ChangeEvent;
