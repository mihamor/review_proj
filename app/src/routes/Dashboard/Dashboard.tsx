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
  Spin,
} from 'antd';

import GoogleMapReact from 'google-map-react';

import fetchJsonP from 'fetch-jsonp';

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
    title: 'Author',
    dataIndex: 'author',
    key: 'author',
    render: (author: { name: { label: string; }; }) => <a href={author.uri.label}>{author.name.label}</a>,
  },
  {
    title: 'Title',
    dataIndex: 'title',
    key: 'title',
    render: (title: { label: string; }) => <span>{title.label}</span>,
  },
  {
    title: 'Content',
    dataIndex: 'content',
    key: 'content',
    render: (content: { label: string; }) => <span>{content.label}</span>,
  },

  {
    title: 'Rating',
    dataIndex: 'im:rating',
    key: 'rating',
    render: (rating: { label: string; }) => <Rate allowHalf defaultValue={Number(rating.label)} />
  },
  // {
  //   title: 'Website',
  //   dataIndex: 'websiteUrl',
  //   key: 'websiteUrl',
  //   render: (text: string) => <a href={text}>{text}</a>,
  // },
  // {
  //   title: 'Total reviews',
  //   dataIndex: 'reviews',
  //   key: 'total_reviews',
  //   render: (reviews: Review[]) => <a>{reviews.length}</a>
  // },
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

function mode(arr: any[]){
  return arr.sort((a,b) =>
        arr.filter(v => v===a).length
      - arr.filter(v => v===b).length
  ).pop();
}


const possibleTopics = ['Common', 'Bugs', 'Propositions'];
const possibleSentiments = ['Negative', 'Neutral', 'Positive'];
const Dashboard: React.FC<RouteComponentProps> = ({
  history,
}) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const appId = localStorage.getItem('accountId');
  //1053012308
  const accountId  = '1';
  const [loadingReviews, setLoadingReviews] = useState<boolean>(true);
  const [loadingApp, setLoadingApp] = useState<boolean>(true);

  const [appReviews, setAppReviews] = useState([]);
  const [app, setApp] = useState();


  useEffect(() => {
    if(accountId) {
      registerSocketConnection(
        accountId,
        (data) => setLocations(data),
      );
    };
  }, []);

  useEffect(() => {

    const fetchReviews = () => fetch(`https://itunes.apple.com/us/rss/customerreviews/id=${appId}/sortBy=mostRecent/json`)
      .then((res) => res.json())
      .then((res) => setAppReviews(res.feed.entry))
      .then(() => setLoadingReviews(false));

    const fetchApp = () => fetchJsonP(`https://itunes.apple.com/lookup?id=${appId}`)
      .then((res) => res.json())
      .then((res) => setApp(res.results[0]))
      .then(() => setLoadingApp(false));

    fetchApp();
    fetchReviews();

  }, []);

  console.log(app);
  console.log

  const {
    locationsWithWeekDynamic,
    reviewsDynamics,
    overallAverage,
    nps,
    popularSentiment,
    popularTopic,
  } = useMemo(() => {
    if (!locations || !locations.length) return { nps: 0 };
    const weekDynamic = calculateWeekDynamics(locations);
    const locationsWithWeekDynamic = locations.map((location) => ({
      ...weekDynamic[location.id],
      ...location,
    }));
    const reviewsFlat = locations.reduce<Review[]>((acc, loc) => [...acc, ...loc.reviews], []);
    const reviewsWithTopicsAndSentiment = reviewsFlat.map((review) => ({
      ...review,
      sentiment: possibleSentiments[Math.floor(Math.random() * possibleSentiments.length)],
      topic: possibleTopics[Math.floor(Math.random() * possibleTopics.length)],
    }));

    const popularSentiment = mode(reviewsWithTopicsAndSentiment.map(({ sentiment }) => sentiment));
    const popularTopic = mode(reviewsWithTopicsAndSentiment.map(({ topic }) => topic));
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
        nps,
        reviewsWithTopicsAndSentiment,
        popularSentiment,
        popularTopic,
      };
  }, [locations]);
  

  const defaultCenter = {
    lat: 59.95,
    lng: 30.33
  };

  console.log(app);
  console.log(appReviews);

  return (
    appId ? (
      <div>
        <div className="StatsContainer">
          <Space className="RatingStats" direction="horizontal">
          {!loadingReviews && !loadingApp && (<Space
              align="center"
              className="StatsSection"
              direction="vertical"
            >
              <Title level={4}>{app?.trackName}</Title>
              <Title level={5} type="secondary">{(app?.description as string).slice(0, 35) + '...'}</Title>
              {overallAverage ? (
                  <>
                    <Rate allowHalf defaultValue={app?.averageUserRating} />
                    <Text type="secondary">{`${(app?.averageUserRating).toFixed(2)}/5`}</Text>
                  </>
                ) : <Text type="secondary">No data about average</Text>}
            </Space>)}
          </Space>
          <Space className="RatingStats" direction="horizontal">
          {!overallAverage?.byWeeks.length || loadingReviews || loadingApp ? (
            <Space direction="vertical">
              <Text>Reviews fetch can take up to 5 minutes...</Text>
              <Spin />
            </Space>
            ) : (
            <>
              <Space
                align="center"
                className="StatsSection"
                direction="vertical"
              >
                <Title level={4}>Last week rating</Title>
                {overallAverage ? (
                  <>
                    <Rate allowHalf defaultValue={overallAverage.allTime} />
                    <Text type="secondary">{`${overallAverage.allTime.toFixed(2)}/5`}</Text>
                    <Text type="secondary">
                      {`Last 30 days: ${
                        overallAverage.byWeeks.length ? 
                        `${overallAverage.byWeeks[overallAverage.byWeeks.length - 1].toFixed(2)}/5`
                        : 'No data'
                      }`}
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
                    <Title level={5} type="secondary">{`Total: ${app.userRatingCount}`}</Title>
                    <Text type="secondary">
                      {`Last 30 days: ${reviewsDynamics.total}`}
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
              <Divider style={{ height: '70px' }} type="vertical" />
              <Space
                align="center"
                className="StatsSection"
                direction="vertical"
              >
                <Title level={4}>Sentiment</Title>
                {reviewsDynamics ? (
                  <>
                    <Title level={5} type={(() => {
                      switch(popularSentiment) {
                        case 'Negative':
                          return 'danger';
                        case 'Neutral':
                          return 'warning';
                        case 'Positive':
                          return 'success';
                        default:
                          return 'secondary';
                      }
                    })()}>{popularSentiment}</Title>
                    <Text type="secondary">
                      {`In previous mounth app had:`}
                    </Text>
                    <Text type="danger">
                      Negative
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
                <Title level={4}>Popular topic</Title>
                {reviewsDynamics ? (
                  <>
                    <Title level={5} type="secondary">{popularTopic}</Title>
                    <Text type="secondary">
                      {`In previous mounth app had:`}
                    </Text>
                    <Text type="secondary">
                      Common
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
                <Title level={4}>Popular words</Title>
                {reviewsDynamics ? (
                  <>
                    <Title level={5} type="secondary">crashes, addverts, loading</Title>
                    <Text type="secondary">
                      {`In previous mounth app had:`}
                    </Text>
                    <Text type="secondary">
                      crashes, version, connection
                    </Text>
                  </>
                ) : <Text type="secondary">No data</Text>}
              </Space>
            </>)}
          </Space>
        </div>
        <div className="LocationData">
          {/* <div className="LocationMap">
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
          </div> */}
          <div className="LocationTable">
            <Table
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ y: 400 }}
              columns={locationColumns}
              dataSource={appReviews}
              // expandable={{
              //   expandedRowRender: (location) => (
              //     <Table
              //       rowKey="id"
              //       size="small" 
              //       columns={reviewsColumns}
              //       dataSource={location.reviews} 
              //     />
              //   ),
              //   rowExpandable: (location) => (!!location.reviews.length),
              // }}      
          />
          </div>
        </div>
      </div>
    ) : <Redirect to='/' />
  );
}

export default Dashboard;
