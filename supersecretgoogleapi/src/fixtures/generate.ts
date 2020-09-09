import knex from 'knex';
import faker from 'faker';

import config from '../config';

console.log(config);

const pg = knex({
  client: 'pg',
  connection: config.databaseUrl,
  searchPath: ['knex', 'public'],
});

const generate = async () => {
  const entititesCount = 10;


  const postalAddress = {
    regionCode: faker.address.countryCode(),
    postalCode: faker.address.zipCode(),
    addressLines: [
      faker.address.streetAddress(),
      faker.address.streetName(),
    ]
  };
  console.log(postalAddress);
  const query = await pg('PostalAddress').insert(postalAddress).returning('*').finally();
  console.log(query);
};

generate();