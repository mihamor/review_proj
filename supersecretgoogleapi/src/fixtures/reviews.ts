import knex from 'knex';
import faker from 'faker';
import gaussian from 'gaussian';


import config from '../config';

console.log(config);

const count = (n: number) => [...Array(n)];

const accountIds = [1, 2, 3];

function generateGaussian(mean: number ,std: number){
  const _2PI = Math.PI * 2;
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(_2PI * u2);
  return z0 * std + mean;
}

const pg = knex({
  client: 'pg',
  connection: config.databaseUrl,
  searchPath: ['knex', 'public'],
});

const randomDate = (start: Date, end: Date) => (
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
);


const generate = async () => {
  const args = process.argv.slice(2)
  const reviewsCount = Number(args[0]) || 1;
  const dateFrom = new Date(args[1]) || new Date('2019-12-17T03:24:00');
  const dateTo = new Date(args[2]) || new Date('2020-12-17T03:24:00');


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

  let locationMeans: { [id:number]: number } = {};
  const reviews = count(reviewsCount).map((_, index) => {
    const locationId = locationsResults[faker.random.number(locationsResults.length - 1)].id;
    if(!locationMeans[locationId]) {
      const mean = faker.random.number({ min: 1, max: 5 });
      locationMeans[locationId] = mean;
    }

    const locationMean = locationMeans[locationId];
    return {
      locationId,
      reviewer: reviewersResults[index].id,
      reviewReply: reviewRepliesResults[index].id,
      starRating: Math.floor(generateGaussian(locationMean, 0.5)).toString(),
      comment: faker.lorem.sentences(),
      createTime: randomDate(dateFrom, dateTo),
    };
  });

  const reviewsResults = await pg('Reviews').insert(reviews).returning('*');
  console.log(reviewsResults);

  pg.destroy();
  console.log('Finished generating data');
};


generate();