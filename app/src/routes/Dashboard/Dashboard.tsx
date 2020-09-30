import React, {
  useEffect,
  useState,
  useMemo,
} from 'react';
import { RouteComponentProps, Redirect} from 'react-router-dom'
import { Table } from 'antd';
import GoogleMapReact from 'google-map-react';

import "antd/dist/antd.css";

import { registerSocketConnection } from '../../socket/connection';
import { calculateWeekDynamics } from '../../calculate';
import { Location, Review, Reviewer, ReviewReply } from '../../types';
import './Dashboard.css';
import config from '../../config';

type MarkerProps = {
  text: string,
  lat: number,
  lng: number,
};

const Marker: React.FC<MarkerProps> = ({ text }) => {
  const [hovering, setHovering] = useState<boolean>(false);

  return (
    <>
      {hovering ? <div className="Hint">{text}</div> : null}
      <div
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className="Marker"
      />
    </>
  );
};

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

  const locationsWithWeekDynamic = useMemo(() => {
    const weekDynamic = calculateWeekDynamics(locations);
    return locations.map((location) => ({
      ...weekDynamic[location.id],
      ...location,
    }));
  }, [locations]);
  

  const defaultCenter = {
    lat: 59.95,
    lng: 30.33
  };

  return (
    accountId ? (
      <div className="Dashboard">
        <div className="LocationMap">
          <GoogleMapReact
            defaultCenter={defaultCenter}
            defaultZoom={1}
            bootstrapURLKeys={{ key: config.googleApiKey }}
          >
            {locations.map((location)=> {
              const latlng = location.latlng.split(' ');
              return (
                <Marker
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
    ) : <Redirect to='/' />
  );
}

export default Dashboard;
