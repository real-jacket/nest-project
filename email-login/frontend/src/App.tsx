import React, { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import axios, { AxiosError } from 'axios';

let token: string;

axios.interceptors.request.use(
  function (config) {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error: AxiosError<any>) {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  function (config) {
    return config;
  },
  function (error: AxiosError<any>) {
    message.error(error.response?.data.message);
    return Promise.reject(error);
  }
);

const onFinishFailed = (errorInfo: any) => {};

const App: React.FC = () => {
  const [form] = Form.useForm();

  const [isLogin, setIsLogin] = useState(false);

  const login = async (values: { email: string; code: string }) => {
    try {
      const res = await axios.post('http://localhost:3001/user/login', {
        email: values.email,
        code: values.code,
      });

      if (res.data.access_token) {
        console.log('res.data: ', res.data);
        message.success('登录成功');
        token = res.data.access_token;
        setIsLogin(true);
      } else {
        message.error(res.data.message);
      }
    } catch (error: any) {
      // console.log('error: ', error);
      // message.error(error.message);
    }
  };

  const sendEmailCode = async () => {
    try {
      await form.validateFields(['email']);
      const email = form.getFieldValue('email');
      const res = await axios.get('http://localhost:3001/email/code', {
        params: {
          address: email,
        },
      });

      message.info(res.data);
    } catch (error) {
      message.info('发送失败');
    }
  };

  const testAaa = () => {
    axios
      .post('http://localhost:3001/aaa')
      .then(() => {
        message.success('aaa 接口测试成功');
      })
      .catch(() => {
        console.error('接口测试失败～');
      });
  };

  return (
    <div style={{ width: '500px', margin: '100px auto' }}>
      {!isLogin ? (
        <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={login}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          form={form}
        >
          <Form.Item
            label="邮箱"
            name="email"
            rules={[{ required: true, message: '请输入邮箱地址' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="验证码"
            name="code"
            rules={[{ required: true, message: '请输入验证码' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="default" onClick={sendEmailCode}>
              发送验证码
            </Button>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              登录
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <div>
          <p>成功登录</p>
          <Button onClick={testAaa}>测试接口</Button>
        </div>
      )}
    </div>
  );
};

export default App;
