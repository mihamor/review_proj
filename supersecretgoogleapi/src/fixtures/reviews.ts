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
  const reviewsCount = Number(args[0]) || 1;


  const locationsResults = await pg('Locations').select('id').returning('*');
  console.log(locationsResults);

  const reviewReplies = count(reviewsCount).map(() => ({
    comment: faker.lorem.sentences(),
  }));
  const reviewRepliesResults = await pg('ReviewReplies').insert(reviewReplies).returning('*');
  console.log(reviewRepliesResults);

  const reviewers = count(reviewsCount).map(() => ({
    profilePhotoUrl: faker.internet.url(),
    displayName: faker.name.findName(),
    isAnonymous: faker.random.boolean(),
  }));
  const reviewersResults = await pg('Reviewers').insert(reviewers).returning('*');
  console.log(reviewersResults);

  const reviews = count(reviewsCount).map((_, index) => ({
    locationId: locationsResults[faker.random.number(locationsResults.length - 1)].id,
    reviewer: reviewersResults[index].id,
    reviewReply: reviewRepliesResults[index].id,
    starRating: faker.random.number(5).toString(),
    comment: faker.lorem.sentences(),
  }));

  const reviewsResults = await pg('Reviews').insert(reviews).returning('*');
  console.log(reviewsResults);

  pg.destroy();
  console.log('Finished generating data');
};


generate();