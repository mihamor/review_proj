export type NormalizedReview = {
  id: number,
  locationId: number,
  reviewer: number,
  starRating: string,
  comment: string,
  createTime: string,
  reviewReply: number,
  updateTime: string,
};

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

export type TimePeriod = {
  id: number,
  createdAt: string,
  bussinesHoursId: string,
  openDay: string,
  openTime: string,
  closeDay: string,
  closeTime: string,
};

export type BusinessHours = {
  id: number,
  createdAt: string,
  periods: TimePeriod[],
};

export type PostalAddress = {
  id: number,
  createdAt: string,
  regionCode: string,
  languageCode: string | null,
  postalCode: string | null,
  sortingCode: string | null,
  administrativeArea: string | null,
  locality: string | null,
  sublocality: string | null,
  addressLines: string[],
  recipients: string[] | null,
  organization: string[] | null,
};

export type LocationKey = {
  id: number,
  createdAt: string,
  plusPageId: string,
  placeId: string,
  postalCode: string,
  explicitNoPlaceId: string,
  requestId: string,
};

export type Location = {
  id: number,
  createdAt: string,
  languageCode: string,
  name: string,
  storeCode: string,
  locationName: string,
  primaryPhone: string,
  additionalPhones: string[],
  address: PostalAddress,
  primaryCategory: string,
  additionalCategories: string,
  websiteUrl: string,
  regularHours: BusinessHours,
  specialHours: string | null,
  serviceArea: string | null,
  locationKey: LocationKey,
  labels: string[],
  adWordsLocationExtensions: string | null,
  latlng: string | null,
  openInfo: string | null,
  locationState: string | null,
  attributes: string | null,
  metadata: string | null,
  profile: string | null,
  relationshipData: string | null,
};

export type GoogleReviewResponse = {
  nextPage?: string,
  results: Review [],
};

export type GoogleLocationsResponse = {
  nextPage?: string,
  results: Location [],
};
