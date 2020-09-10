import knex from 'knex';

import config from './config';

console.log(config);


const pgReviews = knex({
  client: 'pg',
  connection: config.databaseUrl,
  searchPath: ['knex', 'public'],
});

const pgGoogleApi = knex({
  client: 'pg',
  connection: config.fakeApiDatabaseUrl,
  searchPath: ['knex', 'public'],
});

console.log('kavo');
const generate = async () => {
  const addresses = await pgGoogleApi('PostalAddress').select('*');
  const postalAddressResults = await pgReviews('PostalAddress').insert(addresses).returning('*');
  console.log(postalAddressResults);

  const locationKeys = await pgGoogleApi('LocationKey').select('*');
  const locationKeysResults = await pgReviews('LocationKey').insert(locationKeys).returning('*');
  console.log(locationKeysResults);

  const bussinesHours = await pgGoogleApi('BusinessHours').select('*');
  const bussinesHoursResults = await pgReviews('BusinessHours').insert(bussinesHours).returning('*');
  console.log(bussinesHoursResults)

  const timePeriods = await pgGoogleApi('TimePeriods').select('*');
  const timePeriodsResults = await pgReviews('TimePeriods').insert(timePeriods).returning('*');
  console.log(timePeriodsResults);

  const locations = await pgGoogleApi('Locations').select('*');
  const locationsResults = await pgReviews('Locations').insert(locations).returning('*');
  console.log(locationsResults);

  const accounts = await pgGoogleApi('Accounts').select('*');
  const accountsResults = await pgReviews('Accounts').insert(accounts).returning('*');
  console.log(accountsResults);


  const locationAccounts = await pgGoogleApi('Accounts_Locations').select('*');
  const locationAccountsResults = await pgReviews('Accounts_Locations').insert(locationAccounts).returning('*');
  console.log(locationAccountsResults);

  pgReviews.destroy();
  pgGoogleApi.destroy();
  console.log('Finished importing data');
};


generate();