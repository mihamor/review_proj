import React, {
  useEffect,
  useState,
  useMemo,
} from 'react';
import { RouteComponentProps, Redirect} from 'react-router-dom'
import { CalendarOutlined, HomeOutlined } from '@ant-design/icons';

import { Table, Menu } from 'antd';

import "antd/dist/antd.css";

import { registerSocketConnection } from '../../socket/connection';
import { Location, Review, Reviewer, ReviewReply } from '../../types';
import './Dashboard.css';
import { calculateLocationsData } from './calculatedData';

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

const locationDynamicsColumns = [
  {
    title: 'Name',
    dataIndex: 'locationName',
    key: 'name',
    render: (text: string) => <a>{text}</a>,
  },
  {
    title: 'Average rating',
    dataIndex: 'avgRating',
    key: 'avgRating',
  },
  {
    title: 'Last week diff',
    dataIndex: 'ratingDynamics',
    key: 'ratingDynamics',
    render: ({ reviewsWeekToAverageDiff }: {
      reviewsWeekToAverageDiff: {
        diff: number;
      }[],
    }) => {
      const lastWeekDynamics = reviewsWeekToAverageDiff[reviewsWeekToAverageDiff.length - 1];
      if(!lastWeekDynamics) return 'No data';
      const isPositive = lastWeekDynamics.diff >= 0;
      return (
        <span className={isPositive ? 'PositiveDiff' : 'NegativeDiff'}>
          {`${isPositive ? '+' : '-'}${lastWeekDynamics.diff}`}
        </span>
      );
    }
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


const reviewsDynamicsColumns = [
  {
    title: 'Week average',
    dataIndex: 'avg',
    key: 'avg',
  },
  {
    title: 'Week difference',
    dataIndex: 'diff',
    key: 'diff',
    render: (diff: number) => {
      const isPositive = diff >= 0;
      return (
        <span className={isPositive ? 'PositiveDiff' : 'NegativeDiff'}>
          {`${isPositive ? '+' : '-'}${diff}`}
        </span>
      );
    }
  },
];


const Dashboard: React.FC<RouteComponentProps> = ({
  history,
}) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const accountId = localStorage.getItem('accountId');
  const [activeTable, setActiveTable] = useState<string>('locations');
  useEffect(() => {
    if(accountId) {
      registerSocketConnection(
        accountId,
        (data) => setLocations(data),
      );
    };
  }, []);

  const calculatedLocationsData = useMemo(() => (
    calculateLocationsData(locations)
  ), [locations]);


  useEffect(() => {
    console.log(calculatedLocationsData);
  }, [calculatedLocationsData]);


  return (
    accountId ? (
      <div className="Dashboard">
        <Menu
          onClick={(e) => setActiveTable(e.key.toString())}
          selectedKeys={[activeTable]}
          mode="horizontal"
        >
          <Menu.Item key="locations" icon={<HomeOutlined />}>
            Locations
          </Menu.Item>
          <Menu.Item key="reviewsByWeek" icon={<CalendarOutlined />}>
            Week Dynamics
          </Menu.Item>
        </Menu>
        { activeTable === 'locations' ? (
          <Table
            className='LocationTable'
            columns={locationColumns}
            dataSource={locations.map((location) => ({
              ...calculatedLocationsData[location.id],
              ...location,
            }))}
            expandable={{
              expandedRowRender: (location) => (
                <Table
                  columns={reviewsColumns}
                  dataSource={location.reviews} 
                />
              ),
              rowExpandable: (location) => (!!location.reviews.length),
            }}      
          />
        ): (
          <Table
            className='LocationTable'
            columns={locationDynamicsColumns}
            dataSource={locations.map((location) => ({
              ...calculatedLocationsData[location.id],
              ...location,
            }))}
            expandable={{
              expandedRowRender: (location) => (
                <Table
                  columns={reviewsDynamicsColumns}
                  dataSource={location.ratingDynamics.reviewsWeekToAverageDiff} 
                />
              ),
              rowExpandable: (location) => (!!location.reviews.length),
            }}      
          />
        )}
      </div>
    ) : <Redirect to='/' />
  );
}

export default Dashboard;
