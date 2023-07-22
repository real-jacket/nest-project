import React from 'react';
import { Button, Form, Input, message } from 'antd';
import axios from 'axios';

const login = async (values: { email: string; code: string }) => {
  try {
    const res = await axios.post('http://localhost:3001/user/login', {
      email: values.email,
      code: values.code,
    });

    if (res.data === 'succuss') {
      message.success('登录成功');
    } else {
      message.error(res.data.message);
    }
  } catch (error: any) {
    console.log('error: ', error);
    message.error(error.message);
  }
};

const onFinishFailed = (errorInfo: any) => {};

const App: React.FC = () => {
  const [form] = Form.useForm();

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

  return (
    <div style={{ width: '500px', margin: '100px auto' }}>
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
    </div>
  );
};

export default App;
