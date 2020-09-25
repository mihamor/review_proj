import express from "express";
import knex from 'knex';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { attachPaginate } from "knex-paginate";

import config from './config';

attachPaginate();
const app = express();
const pg = knex({
  client: 'pg',
  connection: config.databaseUrl,
  searchPath: ['knex', 'public'],
});

const limiter = rateLimit({
  windowMs: 1000, // 1 seconds
  max: 10 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use(morgan('combined'));


app.get('/', (req, res) => {
  res.json({
    msg: 'Hello from fake google api!',
  });
});

app.get('/locations', async (req, res) => {
  const page = Number(req.query.page) || 1;
  const accountId = req.headers['account-id'];

  if(!accountId) {
    return res.status(400).json({
      error: 'No account id provided',
    });
  }

  const perPage = 5;
  const normalizedLocations = await pg('Accounts_Locations').where({
    accountId: accountId,
  }).join('Locations', 'Accounts_Locations.locationId', '=', 'Locations.id')
  .join('PostalAddress', 'Locations.address', '=', 'PostalAddress.id')
  .join('LocationKey', 'Locations.locationKey', '=', 'LocationKey.id')
  .select('Locations.id as id', 'Locations.createdAt as createdAt',
    'Locations.languageCode as languageCode', 'regionCode', 'sublocality',
    'PostalAddress.createdAt as addressCreatedAt', 'PostalAddress.postalCode as postalCode',
    'locality', 'addressLines', 'recipients', 'organization',
    'PostalAddress.languageCode as addressLanguageCode', 'name',
    'PostalAddress.id as adressId', 'sortingCode', 'administrativeArea',
    'storeCode', 'locationName', 'primaryPhone', 'additionalPhones', 'primaryCategory',
    'address', 'additionalCategories', 'websiteUrl', 'regularHours',
    'specialHours', 'serviceArea', 'locationKey', 'labels', 'adWordsLocationExtensions',
    'latlng', 'openInfo', 'locationState', 'attributes', 'metadata',
    'profile', 'relationshipData', 'LocationKey.id as locationKeyId',
    'LocationKey.createdAt as locationKeyCreatedAt', 'plusPageId', 'placeId',
    'LocationKey.postalCode as locationKeyPostalCode', 'explicitNoPlaceId', 'requestId')
  .orderBy('createdAt', 'desc')
  .paginate({
    perPage,
    currentPage: page,
    isLengthAware: true,
  });
  const normalizedTimePeriods = await pg('TimePeriods').select('*');

  const locations = normalizedLocations.data.map((normalizedLocation) => ({
    id: normalizedLocation.id,
    createdAt: normalizedLocation.createdAt,
    languageCode: normalizedLocation.languageCode,
    name: normalizedLocation.name,
    storeCode: normalizedLocation.storeCode,
    locationName: normalizedLocation.locationName,
    primaryPhone: normalizedLocation.primaryPhone,
    additionalPhones: normalizedLocation.additionalPhones,
    address: {
      id: normalizedLocation.adressId,
      createdAt: normalizedLocation.addressCreatedAt,
      regionCode: normalizedLocation.regionCode,
      languageCode: normalizedLocation.addressLanguageCode,
      postalCode: normalizedLocation.postalCode,
      sortingCode: normalizedLocation.sortingCode,
      administrativeArea: normalizedLocation.administrativeArea,
      locality: normalizedLocation.locality,
      sublocality: normalizedLocation.sublocality,
      addressLines: normalizedLocation.addressLines,
      recipients: normalizedLocation.recipients,
      organization: normalizedLocation.organization,
    },
    primaryCategory: normalizedLocation.primaryCategory,
    additionalCategories: normalizedLocation.additionalCategories,
    websiteUrl: normalizedLocation.websiteUrl,
    regularHours: {
      id: normalizedLocation.regularHours,
      createdAt: normalizedLocation.createdAt,
      periods: normalizedTimePeriods.filter(
        (timePeriod) => timePeriod.bussinesHoursId === normalizedLocation.regularHours
      ),
    },
    specialHours: normalizedLocation.specialHours,
    serviceArea: normalizedLocation.serviceArea,
    locationKey: {
      id: normalizedLocation.locationKeyId,
      createdAt: normalizedLocation.locationKeyCreatedAt,
      plusPageId: normalizedLocation.plusPageId,
      placeId: normalizedLocation.placeId,
      postalCode: normalizedLocation.locationKeyPostalCode,
      explicitNoPlaceId: normalizedLocation.explicitNoPlaceId,
      requestId: normalizedLocation.requestId,
    },
    labels: normalizedLocation.labels,
    adWordsLocationExtensions: normalizedLocation.adWordsLocationExtensions,
    latlng: normalizedLocation.latlng,
    openInfo: normalizedLocation.openInfo,
    locationState: normalizedLocation.locationState,
    attributes: normalizedLocation.attributes,
    metadata: normalizedLocation.metadata,
    profile: normalizedLocation.profile,
    relationshipData: normalizedLocation.relationshipData,
  }));
  const uniqueLocationIds = Array.from(new Set(locations.map((item) => item.id)));

  const { lastPage } = normalizedLocations.pagination;
  return res.json({
    ...(
      normalizedLocations.data.length === perPage && lastPage !== page  ?
      { nextPage: `/locations?page=${page + 1}` } :
      {}
    ),
    results: uniqueLocationIds.map((id) => (
      locations.filter((location) => location.id === id)[0]
    )),
  });
});

app.get('/reviews', async (req, res) => {
  const page = Number(req.query.page) || 1;
  const locationId = req.query.locationId;

  if(!locationId) {
    return res.status(400).json({
      error: 'No location id provided',
    });
  }

  const perPage = 5;
  const reviewsNormalized = await pg('Reviews').where({
    locationId,
  })
  .join('Reviewers', 'Reviews.reviewer', '=', 'Reviewers.id')
  .join('ReviewReplies', 'Reviews.reviewReply', '=', 'ReviewReplies.id')
  .select('Reviews.id as id', 'locationId', 'reviewer', 'starRating',
    'Reviews.comment as comment', 'createTime',
    'Reviews.updateTime as updateTime', 'reviewReply',
    'profilePhotoUrl', 'displayName',
    'isAnonymous', 'ReviewReplies.comment as replyComment',
    'ReviewReplies.updateTime as replyUpdateTime')
  .orderBy('createTime', 'desc')
  .paginate({
    perPage,
    currentPage: page,
    isLengthAware: true,
  });

  const reviews = reviewsNormalized.data.map((reviewNormalized) => ({
    id: reviewNormalized.id,
    locationId: reviewNormalized.locationId,
    reviewer: {
      id: reviewNormalized.reviewer,
      displayName: reviewNormalized.displayName,
      profilePhotoUrl: reviewNormalized.profilePhotoUrl,
      isAnonymous: reviewNormalized.isAnonymous,
    },
    starRating: reviewNormalized.starRating,
    comment: reviewNormalized.comment,
    createTime: reviewNormalized.createTime,
    updateTime: reviewNormalized.updateTime,
    reviewReply: {
      id: reviewNormalized.reviewReply,
      comment: reviewNormalized.replyComment,
      updateTime: reviewNormalized.replyUpdateTime,
    },
  }));

  const { lastPage } = reviewsNormalized.pagination;
  return res.json({
    ...(
      reviews.length === perPage && lastPage !== page ?
      { nextPage: `/reviews?page=${page + 1}&locationId=${locationId}` } :
      {}
    ),
    results: reviews,
  });
});

app.listen(config.servicePort, () => {
  console.log(`Google api listening at http://localhost:${config.servicePort}`)
});