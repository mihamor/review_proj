import React, { useState, useEffect } from "react";
import { Menu } from "antd";
import {
  CalendarOutlined,
  HomeOutlined,
  GoogleOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { RouteComponentProps, withRouter } from "react-router-dom";
import GoogleLogin, {
  GoogleLoginResponse,
  GoogleLoginResponseOffline,
} from 'react-google-login';

type UserData = {
  id: string, 
  email: string,
  name: string,
};

const Header: React.FC<RouteComponentProps>  = ({
  history,
}) => {
  const accountId = localStorage.getItem('accountId');
  const [activeRoute, setActiveRoute] = useState<string>('/dashboard');
  const [userData, setUserData] = useState<UserData | null>(null);
  console.log(userData);

  useEffect(() => {
    history.push(activeRoute);
  }, [activeRoute]);

  const responseGoogle = async (googleReponse: GoogleLoginResponse | GoogleLoginResponseOffline) => {
    const loginRepsponse = googleReponse as GoogleLoginResponse;
    const { tokenObj } = loginRepsponse;
    if(tokenObj) {
      try {
        console.log(loginRepsponse);
        const response = await fetch(`http://localhost:3030/login_google`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tokenObj }),
          credentials: 'include',
        });
        const userData = await response.json();
        console.log(response);
        setUserData(userData);
      } catch(err) {
        console.log(err);
      }
      const response = await fetch(`http://localhost:3030/check_session`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      const session = await response.json();
      console.log('session', session);
    }
  }; 
  
  const unwatchAccount = async () => {
    try {
      const response = await fetch(`http://localhost:3030/unwatch-account`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ accountId }),
      });
      const unwatchedData = await response.json();
      console.log(unwatchedData);
      localStorage.removeItem('accountId');
      history.push('/login');
    } catch (error) {
      console.log(error);
    }  
  }

  return (
    <Menu
      onClick={(e) => {
        const key = e.key.toString();
        if(key === '/google_login'
        || key === '/change_account') return;
        setActiveRoute(key);
      }}
      selectedKeys={[activeRoute]}
      mode="horizontal"
    >
      <Menu.Item key="/dashboard" icon={<HomeOutlined />}>
        Dashboard
      </Menu.Item>
      <Menu.Item key="/reviews" icon={<CalendarOutlined />}>
        Reviews
      </Menu.Item>
      {/* {!userData ? (
        <Menu.Item key="/google_login" icon={<GoogleOutlined />}>
          <GoogleLogin
            render={renderProps => (
              <button
                className="TextButton"
                onClick={renderProps.onClick}
                disabled={renderProps.disabled}
              >
                Login with Google
              </button>
            )}
            clientId="931895884681-9m9sasgvccgl5jnk2dq77o9uu6b7rkak.apps.googleusercontent.com"
            buttonText="Login"
            onSuccess={responseGoogle}
            onFailure={responseGoogle}
            cookiePolicy={'single_host_origin'}
          />
        </Menu.Item>
        ) : (
          <Menu.Item
            key="/google_login"
            icon={<GoogleOutlined />}
          >
            <button
              className="TextButton"
              onClick={() => setUserData(null)}
            >
              Logout
            </button>
          </Menu.Item>
        )} */}
        { accountId ? (
          <Menu.Item
            key="/change_account"
            icon={<UserSwitchOutlined />}
          >
            <button
              className="TextButton"
              onClick={unwatchAccount}
            >
              Change application
            </button>
          </Menu.Item>
        ) : null}
    </Menu>
  );
};

export default withRouter(Header);

