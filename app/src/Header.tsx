import React, { useState, useEffect } from "react";
import { Menu } from "antd";
import { CalendarOutlined, HomeOutlined } from '@ant-design/icons';
import { RouteComponentProps, withRouter } from "react-router-dom";


const Header: React.FC<RouteComponentProps>  = ({
  history,
}) => {
  const [activeRoute, setActiveRoute] = useState<string>('/dashboard');

  useEffect(() => {
    history.push(activeRoute);
  }, [activeRoute]);

  return (
    <Menu
      onClick={(e) => setActiveRoute(e.key.toString())}
      selectedKeys={[activeRoute]}
      mode="horizontal"
    >
      <Menu.Item key="/dashboard" icon={<HomeOutlined />}>
        Dashboard
      </Menu.Item>
      <Menu.Item key="/reviews" icon={<CalendarOutlined />}>
        Reviews
      </Menu.Item>
    </Menu>
  );
};

export default withRouter(Header);

