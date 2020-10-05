import React, {
  useEffect,
  useState,
  useMemo,
} from 'react';
import { RouteComponentProps, Redirect} from 'react-router-dom'
import {
  Table,
  Rate,
  Progress,
  Typography,
  Space,
  Divider,
} from 'antd';

import GoogleMapReact from 'google-map-react';

import "antd/dist/antd.css";

import { registerSocketConnection } from '../../socket/connection';
import {
  calculateWeekDynamics,
  calculateOverallAverageByWeeks,
} from '../../calculate';
import { Location, Review, Reviewer, ReviewReply } from '../../types';
import MapMarker from './MapMarker';
import './Dashboard.css';
import config from '../../config';

const { Text, Title } = Typography;

const locationColumns = [
  {
    title: 'Name',
    dataIndex: 'locationName',
    key: 'name',
    render: (text: string) => <a>{text}</a>,
  },
  {
    title: 'Phone number',
    dataIndex: 'primaryPhone',
    key: 'phone',
  },
  {
    title: 'Website',
    dataIndex: 'websiteUrl',
    key: 'websiteUrl',
    render: (text: string) => <a href={text}>{text}</a>,
  },
  {
    title: 'Total reviews',
    dataIndex: 'reviews',
    key: 'total_reviews',
    render: (reviews: Review[]) => <a>{reviews.length}</a>
  },
];

const reviewsColumns = [
  {
    title: 'Review id',
    dataIndex: 'id',
    key: 'id',
    render: (id: number) => id.toString(),
  },
  {
    title: 'Star rating',
    dataIndex: 'starRating',
    key: 'starRating',
  },
  {
    title: 'Reviewer',
    dataIndex: 'reviewer',
    key: 'reviewer',
    render: (reviewer: Reviewer) => reviewer.displayName,
  },
  {
    title: 'Review reply',
    dataIndex: 'reviewReply',
    key: 'reviewReply',
    render: (reviewReply: ReviewReply) => reviewReply.comment,
  },
  {
    title: 'Comment',
    dataIndex: 'comment',
    key: 'comment',
  },
];

const Dashboard: React.FC<RouteComponentProps> = ({
  history,
}) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const accountId = localStorage.getItem('accountId');

  useEffect(() => {
    if(accountId) {
      registerSocketConnection(
        accountId,
        (data) => setLocations(data),
      );
    };
  }, []);

  const {
    locationsWithWeekDynamic,
    reviewsDynamics,
    overallAverage,
    nps,
  } = useMemo(() => {
    if (!locations || !locations.length) return { nps: 0 };
    const weekDynamic = calculateWeekDynamics(locations);
    const locationsWithWeekDynamic = locations.map((location) => ({
      ...weekDynamic[location.id],
      ...location,
    }));
    const reviewsDynamics = locationsWithWeekDynamic.reduce<{ total: number, lastWeek: number }>(
      (acc , location) => {
        const { reviewsGroupedByWeeks } = location.ratingDynamics;
        const total = acc.total + location.reviews.length;
        const weekKeys = Object.keys((reviewsGroupedByWeeks));
        const lastWeekKey = weekKeys[weekKeys.length - 1];
        const lastWeek = acc.lastWeek + lastWeekKey ? reviewsGroupedByWeeks[lastWeekKey].length : 0;
        return { total, lastWeek };
      }, { total: 0, lastWeek: 0 });
      const byWeeks = calculateOverallAverageByWeeks(locations);
      const allTime = byWeeks.reduce<number>((acc, rating) => (
        acc + (rating / byWeeks.length)
      ), 0);
      const overallAverage = { byWeeks, allTime };

      const { positiveReviews, negativeReviews } = locations.reduce<{
        positiveReviews: number,
        negativeReviews: number,
      }>((acc, location) => {
        const negativeLocationReviews = location.reviews.filter((review) => (
          Number(review.starRating) <= 3
        ));
        const positiveLocationReviews = location.reviews.filter((review) => (
          Number(review.starRating) >= 5
        ));
        return {
          positiveReviews: positiveLocationReviews.length + acc.positiveReviews,
          negativeReviews: negativeLocationReviews.length + acc.negativeReviews,
        }
      }, { positiveReviews: 0, negativeReviews: 0 });
      
      const nps = (positiveReviews - negativeReviews) /  reviewsDynamics.total * 100;

      return {
        locationsWithWeekDynamic,
        reviewsDynamics,
        overallAverage,
        nps
      };
  }, [locations]);
  

  const defaultCenter = {
    lat: 59.95,
    lng: 30.33
  };

  return (
    accountId ? (
      <div>
        <div className="StatsContainer">
          <Space className="RatingStats" direction="horizontal">
            <Space
              align="center"
              className="StatsSection"
              direction="vertical"
            >
              <Title level={4}>Overall rating</Title>
              {overallAverage ? (
                <>
                  <Rate allowHalf defaultValue={overallAverage.allTime} />
                  <Text type="secondary">{`${overallAverage.allTime.toFixed(2)}/5`}</Text>
                  <Text type="secondary">
                    {`Last 30 days: ${overallAverage.byWeeks[overallAverage.byWeeks.length - 1].toFixed(2)}/5`}
                  </Text>
                </>
              ) : <Text type="secondary">No data</Text>}
            </Space>
            <Divider style={{ height: '70px' }} type="vertical" />
            <Space
              align="center"
              className="StatsSection"
              direction="vertical"
            >
              <Title level={4}>Reviews</Title>
              {reviewsDynamics ? (
                <>
                  <Title level={5} type="secondary">{`Total: ${reviewsDynamics.total}`}</Title>
                  <Text type="secondary">
                    {`Last 30 days: ${reviewsDynamics.lastWeek}`}
                  </Text>
                </>
              ) : <Text type="secondary">No data</Text>}
            </Space>
            <Divider style={{ height: '70px' }} type="vertical" />
            <Space
              align="center"
              className="StatsSection"
              direction="vertical"
            >
              <Title level={4}>NPS</Title>
              {reviewsDynamics ? (
                <>
                  <Progress
                    width={80}
                    type="circle"
                    status={nps <= 0 ? 'exception' : 'normal'}
                    percent={Math.abs(nps)}
                    format={() => `${Math.floor(nps)}`}
                  />
                </>
              ) : <Text type="secondary">No data</Text>}
            </Space>
          </Space>
        </div>
        <div className="LocationData">
          <div className="LocationMap">
            <GoogleMapReact
              defaultCenter={defaultCenter}
              defaultZoom={1}
              bootstrapURLKeys={{ key: config.googleApiKey }}
            >
              {locations.map((location)=> {
                const latlng = location.latlng.split(' ');
                return (
                  <MapMarker
                    key={location.id}
                    lat={Number(latlng[0])}
                    lng={Number(latlng[1])}
                    text={location.locationName}
                  />
                );
              })}
            </GoogleMapReact>
          </div>
          <div className="LocationTable">
            <Table
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ y: 400 }}
              columns={locationColumns}
              dataSource={locationsWithWeekDynamic}
              expandable={{
                expandedRowRender: (location) => (
                  <Table
                    rowKey="id"
                    size="small" 
                    columns={reviewsColumns}
                    dataSource={location.reviews} 
                  />
                ),
                rowExpandable: (location) => (!!location.reviews.length),
              }}      
          />
          </div>
        </div>
      </div>
    ) : <Redirect to='/' />
  );
}

export default Dashboard;
