import React, {
  useEffect,
  useState,
  useMemo,
} from 'react';
import { RouteComponentProps, Redirect} from 'react-router-dom'
import { Table } from 'antd';

import "antd/dist/antd.css";

import { registerSocketConnection } from '../../socket/connection';
import { calculateWeekDynamics } from '../../calculate';
import { Location, Review, Reviewer, ReviewReply } from '../../types';
import './Dashboard.css';

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

  const weekDynamic = useMemo(() => (
    calculateWeekDynamics(locations)
  ), [locations]);

  return (
    accountId ? (
      <div className="Dashboard">
        <Table
          className='LocationTable'
          columns={locationColumns}
          dataSource={locations.map((location) => ({
            ...weekDynamic[location.id],
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
      </div>
    ) : <Redirect to='/' />
  );
}

export default Dashboard;
