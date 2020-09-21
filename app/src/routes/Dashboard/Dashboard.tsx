import React, { useEffect } from 'react';
import { RouteComponentProps, Redirect} from 'react-router-dom'
import websocket from 'websocket';
import "antd/dist/antd.css";

import { registerSocketConnection } from './socket/socketConnection';
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
  const accountId = localStorage.getItem('accountId');
  useEffect(() => {
    if(accountId) {
      registerSocketConnection(accountId);
    };
  }, []);
  return (
    accountId ? (
      <div className="Dashboard">
      </div>
    )
    : <Redirect to='/' />
  );
}

export default Dashboard;
