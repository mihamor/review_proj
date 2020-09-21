import React, { useEffect, useState } from 'react';
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
