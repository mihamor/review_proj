import knex from 'knex';
import faker from 'faker';

import config from '../config';

console.log(config);

const count = (n: number) => [...Array(n)];

const accountIds = [1, 2, 3];

const pg = knex({
  client: 'pg',
  connection: config.databaseUrl,
  searchPath: ['knex', 'public'],
});

const generate = async () => {
  const args = process.argv.slice(2)
  const locationsCount = Number(args[0]) || 1;

  const addresses = count(locationsCount).map(() => ({
    regionCode: faker.address.countryCode(),
    postalCode: faker.address.zipCode(),
    addressLines: [
      faker.address.streetAddress(),
      faker.address.streetName(),
    ],
  }));

  const locationKeys = count(locationsCount).map(() => ({
    plusPageId: faker.random.uuid(),
    placeId: faker.random.uuid(),
    postalCode: faker.address.zipCode(),
    explicitNoPlaceId: faker.random.uuid(),
    requestId: faker.random.uuid(),
  }));

  const regularHoursPromises = count(locationsCount).map(() => pg('BusinessHours').insert({}).returning('*'));

  console.log(addresses);
  const postalAddressResults = await pg('PostalAddress').insert(addresses).returning('*');
  console.log(postalAddressResults);
  const locationKeysResults = await pg('LocationKey').insert(locationKeys).returning('*');
  console.log(locationKeysResults);
  const regularHoursResults = await Promise.all(regularHoursPromises);

  console.log(regularHoursResults);
  const timePeriods = regularHoursResults.map((hours) => ({
    bussinesHoursId: hours.id,
    openDay: faker.date.weekday(),
    openTime: faker.date.past(),
    closeDay: faker.date.weekday(),
    closeTime: faker.date.past(),
  }));

  const timePeriodsResults = await pg('TimePeriods').insert(timePeriods).returning('*');

  console.log(timePeriodsResults);

  const locations = count(locationsCount).map((_, index) => ({
    name: `accounts/${accountIds[faker.random.number(accountIds.length - 1)]}/locations`,
    languageCode: faker.random.locale(),
    storeCode: faker.random.alphaNumeric(),
    locationName: faker.company.companyName(),
    primaryPhone: faker.phone.phoneNumber(),
    additionalPhones: [ faker.phone.phoneNumber() ],
    address: postalAddressResults[index].id,
    primaryCategory: faker.commerce.product(),
    websiteUrl: faker.internet.url(),
    regularHours: regularHoursResults[index].id,
    locationKey: locationKeysResults[index].id,
    latlng: `${faker.address.latitude()} ${faker.address.longitude()}`,
    labels: [],
  }));

  const locationsResults = await pg('Locations').insert(locations).returning('*');
  console.log(locationsResults);

  const locationAccounts = count(locationsCount * faker.random.number(3)).map((_, index) => ({
    accountId: accountIds[faker.random.number(accountIds.length - 1)],
    locationId: locationsResults[index % locationsCount].id,
  }));

  const locationAccountsResults = await pg('Accounts_Locations').insert(locationAccounts).returning('*');
  console.log(locationAccountsResults);

  pg.destroy();
  console.log('Finished generating data');
};


generate();