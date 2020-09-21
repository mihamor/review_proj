import React, {
  useEffect,
  useState,
  useCallback,
} from 'react';
import { RouteComponentProps, Redirect} from 'react-router-dom'
import websocket from 'websocket';
import "antd/dist/antd.css";

import { registerSocketConnection } from '../../socket/connection';
import { Location } from '../../types';
import './Dashboard.css';

const WebSocketClient = websocket.w3cwebsocket;
const client = new WebSocketClient('ws://localhost:3030/', 'echo-protocol');

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
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
          console.log(location);
          const today = new Date();
          const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
          const lastWeekReviews = location.reviews.filter(
            (review) => new Date(review.createTime) >= lastWeek
          );
          const lastWeekAvg = lastWeekReviews.length ? lastWeekReviews.reduce(
            (sum, review) => (sum + Number(review.starRating)),
            0
          ) / lastWeekReviews.length : 0; 
          const preLastWeekReviews = location.reviews.filter(
            (review) => new Date(review.createTime) < lastWeek
          );
          const preLastWeekAvg = preLastWeekReviews.length ? preLastWeekReviews.reduce(
            (sum, review) => (sum + Number(review.starRating)),
            0
          ) / preLastWeekReviews.length : 0;
          return {
            lastWeekReviews,
            lastWeekAvg,
            diff: lastWeekReviews.length ? lastWeekAvg - preLastWeekAvg : 0,
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
