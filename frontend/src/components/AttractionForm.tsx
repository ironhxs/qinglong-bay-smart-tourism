import { Form, Input, Button, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  createAttraction,
  updateAttraction,
  getAttraction,
  Attraction,
} from '../services/api';

const AttractionForm = () => {
  const [form] = Form.useForm<Attraction>();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      getAttraction(id).then((data) => form.setFieldsValue(data));
    }
  }, [id]);

  const onFinish = async (values: Attraction) => {
    setLoading(true);
    try {
      if (isEdit && id) {
        await updateAttraction(id, values);
        message.success('更新成功');
      } else {
        await createAttraction(values);
        message.success('创建成功');
      }
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 600 }}>
      <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}> 
        <Input />
      </Form.Item>
      <Form.Item name="description" label="描述">
        <Input.TextArea rows={3} />
      </Form.Item>
      <Form.Item name="latitude" label="纬度">
        <Input type="number" />
      </Form.Item>
      <Form.Item name="longitude" label="经度">
        <Input type="number" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          保存
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AttractionForm; 