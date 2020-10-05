import { Location, Review } from "../types";
import moment from "moment";

const reviewsGroupByDateComponent = (reviews: Review[], token: string) => {
  const reviewsWeekNumbers = reviews.reduce<{ [key: string]: Review[]}>((acc, review) => {
    const group = moment(review.createTime).utc().format(token);
    return {
      ...acc,
      [group]: [
        ...(acc[group] || []),
        review,
      ]
    };
  }, {});
  return reviewsWeekNumbers;
};

const reviewsGetWeekToAverageDiff = (weeklyGroupedReviews: { [key: string]: Review[]}) => {
  const weekNumbers = Object.keys(weeklyGroupedReviews);
  if(!weekNumbers.length) return [];
  const lastRecordedWeek = Number(weekNumbers[weekNumbers.length - 1]);
  const firstRecordedWeek = Number(weekNumbers[0]);
  const totalWeeks = lastRecordedWeek - firstRecordedWeek + 1;
  return [...Array(totalWeeks).fill(0)].reduce<{ avg: number, diff: number }[]>((prevArray, _, index) => {
    const thisWeekReviews = weeklyGroupedReviews[firstRecordedWeek + index];
    const prevAvg = index ? prevArray[index - 1].avg : 0;
    if(!thisWeekReviews) {
      return index ? [
        ...prevArray,
        {
          avg: prevAvg,
          diff: 0,
        },
      ]: prevArray;
    }

    const avg = thisWeekReviews.reduce(
      (sum, review) => (sum + Number(review.starRating)),
      0
    ) / thisWeekReviews.length;
    return [
      ...prevArray,
      {
        avg,
        diff: avg - prevAvg,
      },
    ]
  }, []);
};

const reviewsGetWeekAverageGrouped = (weeklyGroupedReviews: { [key: string]: Review[]}) => {
  return Object.keys(weeklyGroupedReviews).reduce<{ [key: string]: number }>((acc, key, index) => {
    const thisWeekReviews = weeklyGroupedReviews[key];
    if(!thisWeekReviews) return acc;
    const avg = thisWeekReviews.reduce(
      (sum, review) => (sum + Number(review.starRating)),
      0
    ) / thisWeekReviews.length;
    return {
      ...acc,
      [key]: avg,
    };
  }, {});
};

export type LocationsData = {
  [key: number] : {
    avgRating: number,
    ratingDynamics: {
      reviewsGroupedByWeeks: {
        [key: string]: Review[];
      },
      reviewsWeekAverageGrouped: {
        [key: string]: number,
      },
      reviewsWeekToAverageDiff: {
        avg: number;
        diff: number;
      }[],
    },
  },
};

export const calculateWeekDynamics = (locations: Location[]): LocationsData => {
  if(!locations) return {};
  const locationsData = locations.reduce<LocationsData>((acc, location) => ({
    ...acc,
    [location.id]: {
      avgRating: (() => {
        if(!location.reviews.length) return 0;
        const totalRating = location.reviews.reduce(
          (sum, review) => (sum + Number(review.starRating)),
          0
        );
        return totalRating / location.reviews.length;
      })(),
      ratingDynamics: (() => {
        const reviewsGroupedByWeeks = reviewsGroupByDateComponent(location.reviews, 'W');
        const reviewsWeekToAverageDiff = reviewsGetWeekToAverageDiff(reviewsGroupedByWeeks);
        const reviewsWeekAverageGrouped = reviewsGetWeekAverageGrouped(reviewsGroupedByWeeks);
        return {
          reviewsGroupedByWeeks,
          reviewsWeekToAverageDiff,
          reviewsWeekAverageGrouped,
        };
      })(),
    },
  }), {});
  return locationsData;
};

const replaceInvalidWeekDataWithPrevious = (averages: number[]) => (
  averages.reduce<number[]>((acc, value, index) => {
    if (value === -1) {
      return index ? [
        ...acc,
        acc[index - 1],
      ] : [ ...acc, 0];
    }
    return [
      ...acc,
      value,
    ];
  }, [])
);

export const calculateOverallAverageByWeeks = (locations: Location[]) => {
  const locationsData = calculateWeekDynamics(locations);
  const locationDataKeysWithReviews = Object.keys(locationsData).filter((key) => (
    locationsData[Number(key)].ratingDynamics.reviewsWeekToAverageDiff.length
  ));
  const minLocationWeek = locationDataKeysWithReviews.reduce((min, key) => {
    const locationData = locationsData[Number(key)];
    const firstWeekOfReviews = Number(Object.keys(locationData.ratingDynamics.reviewsGroupedByWeeks)[0]);
    return min === -1  || firstWeekOfReviews < min ? firstWeekOfReviews : min;
  }, -1);
  const maxLocationWeek = locationDataKeysWithReviews.reduce((max, key) => {
    const locationData = locationsData[Number(key)];
    const weekKeys = Object.keys(locationData.ratingDynamics.reviewsGroupedByWeeks);
    const firstWeekOfReviews = Number(weekKeys[weekKeys.length - 1]);
    return max === -1  || firstWeekOfReviews > max ? firstWeekOfReviews : max;
  }, -1);
  const totalWeeks = maxLocationWeek - minLocationWeek;
  const weeksAverage = [...Array(totalWeeks).fill(0)].map((_, index) => {
    const weekKey = minLocationWeek + index;
    const { sum, numberOfAverage } = locationDataKeysWithReviews.reduce((data, key) => {
      const weekAverage = locationsData[Number(key)].ratingDynamics.reviewsWeekAverageGrouped[weekKey];
      return {
        sum: data.sum + (weekAverage | 0),
        numberOfAverage: weekAverage ? data.numberOfAverage + 1 : data.numberOfAverage,
      };
    }, { sum: 0, numberOfAverage: 0 });
    return numberOfAverage ? sum / numberOfAverage : -1;
  });

  return replaceInvalidWeekDataWithPrevious(weeksAverage);
}
