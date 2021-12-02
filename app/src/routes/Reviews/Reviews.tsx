import React, {
  useEffect,
  useState,
  useMemo,
} from 'react';
import { RouteComponentProps, Redirect} from 'react-router-dom'
import * as allCurves from '@visx/curve';
import { Group } from '@visx/group';
import { LinePath } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { scaleLinear } from '@visx/scale';
import { Table } from 'antd';

import "antd/dist/antd.css";

import { calculateWeekDynamics, calculateOverallAverageByWeeks } from '../../calculate';
import { registerSocketConnection } from '../../socket/connection';
import { Location } from '../../types';
import './Reviews.css';


const locationDynamicsColumns = [
  // {
  //   title: 'Name',
  //   dataIndex: 'locationName',
  //   key: 'name',
  //   render: (text: string) => <a>{text}</a>,
  // },
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
          {`${isPositive ? '+' : ''}${lastWeekDynamics.diff}`}
        </span>
      );
    }
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
          {`${isPositive ? '+' : ''}${diff}`}
        </span>
      );
    }
  },
];



const Dashboard: React.FC<RouteComponentProps> = ({
  history,
}) => {
  const [locations, setLocations] = useState<Location[]>([]);
  //const accountId = localStorage.getItem('accountId');
  const accountId = '1';

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

  const overallAverage = useMemo(() => (
    calculateOverallAverageByWeeks(locations)
    .map((rating, week) => ({ rating, week }))
  ), [locations]);

  useEffect(() => {
    console.log(weekDynamic);
    console.log(overallAverage);
  }, [weekDynamic, overallAverage]);

  const yScale = scaleLinear<number>({
    domain: [0, 6],
    range: [300, 0],
  });
  const xScale = scaleLinear<number>({
    domain: [0, Array.from(overallAverage.keys())[overallAverage.length - 1]],
    range: [0, 500],
  });

  const getX = (d: { week: number }) => d.week;
  const getY = (d: { rating: number }) => d.rating;

  return (
    accountId ? (
      <div className="Reviews">
        <svg className="Graph" height={400}>
          <Group top={50} left={70}>
            {overallAverage.map((d, j) => (
              <circle
                key={j}
                r={3}
                cx={xScale((getX(d)))}
                cy={yScale((getY(d)))}
                stroke="rgba(33,33,33,0.5)"
              />
            ))}
            <LinePath
              curve={allCurves.curveLinear}
              data={overallAverage}
              x={d => xScale((getX(d)))}
              y={d => yScale((getY(d)))}
              stroke="#333"
              strokeWidth={2}
              strokeOpacity={0.6}
            />
            <AxisLeft
              hideAxisLine
              hideTicks
              label="Average rating by all reviews"
              scale={yScale}
              stroke="#333"
              tickStroke="#333"
              tickLabelProps={() => ({
                fill: '#333',
                fontSize: 11,
                textAnchor: 'end',
                dy: '0.33em',
              })}
            />
            <AxisBottom
              label="Weeks"
              scale={xScale}
              stroke="#333"
              tickStroke="#333"
              tickLabelProps={() => ({
                fill: "#333",
                fontSize: 11,
                textAnchor: 'middle',
              })}
            />
          </Group>
        </svg>
        <Table
          rowKey={(review) => review.id}
          className='LocationTable'
          columns={locationDynamicsColumns}
          dataSource={locations.map((location) => ({
            ...weekDynamic[location.id],
            ...location,
          }))}
          expandable={{
            expandedRowRender: (location) => (
              <Table
              rowKey={(dynamics) => dynamics.id}
                columns={reviewsDynamicsColumns}
                dataSource={location.ratingDynamics.reviewsWeekToAverageDiff} 
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
