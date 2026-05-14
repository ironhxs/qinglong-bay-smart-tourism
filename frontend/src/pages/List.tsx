import { Button } from 'antd';
import { PlusOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AttractionTable from '../components/AttractionTable';

const ListPage = () => {
  const navigate = useNavigate();
  return (
    <>
      <div style={{ margin: '16px 0', display: 'flex', justifyContent: 'space-between' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/create')}>
          新增景点
        </Button>
        <Button icon={<HomeOutlined />} onClick={() => navigate('/')}>
          返回首页
        </Button>
      </div>
      <AttractionTable />
    </>
  );
};

export default ListPage; 