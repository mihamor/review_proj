export type Review = {
  id: number,
  locationId: number,
  reviewer: number
  starRating: string,
  comment: string,
  createTime: string,
  reviewReply: string,
  updateTime: string,
};

export type GoogleReviewResponse = {
  nextPage?: string,
  results: Review [],
}