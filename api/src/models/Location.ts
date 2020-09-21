import knex from 'knex';

import config from '../config';


const pg = knex({
  client: 'pg',
  connection: config.databaseUrl,
  searchPath: ['knex', 'public'],
});
export default class Location {
  static async getList(accountId: number) {
    const locations = await pg('Accounts_Locations').where({
      accountId: accountId,
    }).join('Locations', 'Accounts_Locations.locationId', '=', 'Locations.id')
    .select('id', 'createdAt', 'languageCode',
      'storeCode', 'locationName', 'primaryPhone', 'additionalPhones',
      'address', 'additionalCategories', 'websiteUrl', 'regularHours',
      'specialHours', 'serviceArea', 'locationKey', 'labels', 'adWordsLocationExtensions',
      'latlng', 'openInfo', 'locationState', 'attributes', 'metadata',
      'profile', 'relationshipData');
    return locations;
  }
}