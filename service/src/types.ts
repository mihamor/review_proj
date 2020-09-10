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

export type GoogleReviewResponse = {
  nextPage?: string,
  results: Review [],
};

