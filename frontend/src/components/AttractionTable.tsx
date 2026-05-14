import { Table, Space, Button, Popconfirm, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAttractions, deleteAttraction, Attraction } from '../services/api';

const AttractionTable = () => {
  const [data, setData] = useState<Attraction[]>([]);
  const navigate = useNavigate();

  const load = () => getAttractions().then(setData);

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number) => {
    await deleteAttraction(id);
    message.success('删除成功');
    load();
  };

  return (
    <Table rowKey="id" dataSource={data} pagination={{ pageSize: 10 }}>
      <Table.Column<Attraction> title="ID" dataIndex="id" width={60} />
      <Table.Column<Attraction> title="名称" dataIndex="name" />
      <Table.Column<Attraction> title="描述" dataIndex="description" />
      <Table.Column<Attraction>
        title="操作"
        render={(_, record) => (
          <Space>
            <Button type="link" onClick={() => navigate(`/edit/${record.id}`)}>
              编辑
            </Button>
            <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id!)}>
              <Button type="link" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        )}
      />
    </Table>
  );
};

export default AttractionTable; 