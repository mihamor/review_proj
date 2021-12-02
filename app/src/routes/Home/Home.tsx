import React from 'react';
import { RouteComponentProps} from 'react-router-dom'
import { Form, Input, Button } from 'antd';
import "antd/dist/antd.css";

import './Home.css';


const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};


const Home: React.FC<RouteComponentProps> = ({
  history,
}) => {
  const onFinish = (values: { accountId: string }) => {
    localStorage.setItem('accountId', values.accountId);
    history.push('/dashboard');
    console.log('Success:', values.accountId);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className="Home">
      <Form
        {...layout}
        name="basic"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          label="Your app id"
          name="accountId"
          rules={[{
            required: true,
            message: 'Please input your app id.',
          }]}
        >
          <Input />
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Button
            type="primary"
            htmlType="submit"
          >
            Analyze
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default Home;
