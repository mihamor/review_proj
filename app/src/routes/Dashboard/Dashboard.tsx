import React, {
  useEffect,
  useState,
  useMemo,
} from 'react';
import { RouteComponentProps, Redirect} from 'react-router-dom'
import { MessageOutlined, StarOutlined } from '@ant-design/icons';
import { List, Space } from 'antd';
import { letterFrequency } from '@visx/mock-data';
import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { scaleLinear, scaleBand } from '@visx/scale';

import "antd/dist/antd.css";

import { registerSocketConnection } from '../../socket/connection';
import { Location } from '../../types';
import './Dashboard.css';
import { calculateLocationsData } from './calculatedData';

const IconText = ({ icon, text }: { icon: React.FC, text: string}) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

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

  const calculatedLocationsData = useMemo(() => (
    calculateLocationsData(locations)
  ), [locations]);


  useEffect(() => {
    console.log(calculatedLocationsData);
  }, [calculatedLocationsData]);


  return (
    accountId ? (
      <div className="Dashboard">
        <List
          className="LocationList"
          itemLayout="vertical"
          size="large"
          pagination={{
            onChange: page => {
              console.log(page);
            },
            pageSize: 3,
          }}
          dataSource={locations}
          footer={
            <div>
              <b>ant design</b> footer part
            </div>
          }
          renderItem={(item) => (
            <List.Item
              key={item.id}
              actions={[
                <IconText
                  icon={StarOutlined} text={calculatedLocationsData[item.id].avgRating.toString()}
                  key="list-vertical-star-o"
                />,
                <IconText icon={MessageOutlined} text={item.reviews.length.toString()} key="list-vertical-message" />,
              ]}
            >
              <List.Item.Meta
                title={<a>{item.locationName}</a>}
                description={`Phone number: ${item.primaryPhone}`}
              />
              {`Reviews in total: ${item.reviews.length}`}
              {}
            </List.Item>
          )}
        />,
      </div>
    )
    : <Redirect to='/' />
  );
}

export default Dashboard;
