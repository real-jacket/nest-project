import React, { useState } from 'react';
import './App.css';
import { Upload, UploadProps, message, Form, Input, Button } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Dragger } = Upload;

function App() {
  const [form] = Form.useForm();
  const [filePath, setFilePath] = useState('');
  const [fileName, setFileName] = useState('');

  const compress = async (values: any) => {
    const res = await axios.get('http://localhost:3005/compress', {
      params: {
        color: values.color || 256,
        level: values.level || 9,
        path: filePath,
      },
      responseType: 'arraybuffer',
    });

    const blog = new Blob([res.data], { type: 'image/png' });
    const url = URL.createObjectURL(blog);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();

    message.success('压缩成功');
  };

  const props: UploadProps = {
    name: 'file',
    action: 'http://localhost:3005/upload',
    maxCount: 1,
    onChange(info) {
      const { status } = info.file;

      if (status === 'done') {
        message.success(`${info.file.name} 文件上传成功`);

        setFileName(info.file.name);
        setFilePath(info.file.response);
      } else if (status === 'error') {
        message.error(`${info.file.name} 文件上传失败`);
      }
    },
  };
  return (
    <div className="App">
      <Form
        style={{ width: 500, margin: '50px auto' }}
        form={form}
        onFinish={compress}
      >
        <Form.Item label="颜色数量" name={'color'}>
          <Input />
        </Form.Item>
        <Form.Item label="压缩级别" name="level">
          <Input />
        </Form.Item>
        <Form.Item>
          <Dragger {...props}>
            <div>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到这个区域来上传</p>
            </div>
          </Dragger>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            压缩
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default App;
