import React, {
  useEffect,
  useState,
  useCallback,
} from 'react';
import { RouteComponentProps, Redirect} from 'react-router-dom'
import moment from 'moment';
import "antd/dist/antd.css";

import { registerSocketConnection } from '../../socket/connection';
import { Location, Review } from '../../types';
import './Dashboard.css';

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
    console.log(avg, prevAvg);
    return [
      ...prevArray,
      {
        avg,
        diff: avg - prevAvg,
      },
    ]
  }, []);
};

const Dashboard: React.FC<RouteComponentProps> = ({
  history,
}) => {
  const [locations, setLocations] = useState<Location[]>();
  const accountId = localStorage.getItem('accountId');
  useEffect(() => {
    if(accountId) {
      registerSocketConnection(
        accountId,
        (data) => setLocations(data),
      );
    };
  }, []);

  const getCalculatedLocationsData = useCallback(() => {
    if(!locations) return {};
    console.log(locations);
    const locationsData = locations.reduce((acc, location) => ({
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
          return {
            reviewsGroupedByWeeks,
            reviewsWeekToAverageDiff,
          };
        })(),
      },
    }), {});
    return locationsData;
  }, [locations]);


  useEffect(() => {
    console.log(getCalculatedLocationsData());
  }, [getCalculatedLocationsData]);


  return (
    accountId ? (
      <div className="Dashboard">
        {locations?.toString()}
      </div>
    )
    : <Redirect to='/' />
  );
}

export default Dashboard;
