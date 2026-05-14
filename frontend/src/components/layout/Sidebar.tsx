import React, { useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  AudioOutlined,
  CommentOutlined,
  EnvironmentOutlined,
  SafetyOutlined,
  RocketOutlined,
  ScheduleOutlined,
  CompassOutlined,
  BookOutlined,
  EditOutlined,
  PictureOutlined,
  TeamOutlined,
  BarChartOutlined,
  LineChartOutlined,
  UserOutlined,
  GlobalOutlined,
  BankOutlined,
  CameraOutlined,
  HistoryOutlined,
  CloudOutlined,
  AppstoreOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState<string>(location.pathname);
  
  // 当路由变化时更新选中的菜单项
  useEffect(() => {
    const path = location.pathname;
    setSelectedKey(path);
    
    // 如果是子路由，也要展开父菜单
    const parentPath = '/' + path.split('/')[1];
    if (parentPath !== path) {
      setOpenKeys([parentPath]);
    }
  }, [location.pathname]);
  
  // 记录打开的子菜单
  const [openKeys, setOpenKeys] = useState<string[]>(findOpenKeys());
  
  // 查找当前路径对应的打开的子菜单
  function findOpenKeys() {
    const pathParts = location.pathname.split('/');
    if (pathParts.length > 1) {
      return [`/${pathParts[1]}`];
    }
    return [];
  }
  
  // 菜单项配置
  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/immersive',
      icon: <GlobalOutlined />,
      label: '徽脉智语·沉浸漫游',
      children: [
        {
          key: '/immersive/voice',
          icon: <AudioOutlined />,
          label: 'AI语音导览',
        },
        {
          key: '/immersive/ar',
          icon: <CameraOutlined />,
          label: 'AR文化重现',
        },
        {
          key: '/immersive/character',
          icon: <CommentOutlined />,
          label: '虚拟角色互动',
        },
      ],
    },
    {
      key: '/ecosystem',
      icon: <SafetyOutlined />,
      label: '众守青灵·生态共生',
      children: [
        {
          key: '/ecosystem/data',
          icon: <CloudOutlined />,
          label: '环境数据可视化',
        },
        {
          key: '/ecosystem/protection',
          icon: <EnvironmentOutlined />,
          label: '生态保护行动',
        },
      ],
    },
    {
      key: '/itinerary',
      icon: <CompassOutlined />,
      label: '智策游程·随心所"驭"',
      children: [
        {
          key: '/itinerary/planner',
          icon: <ScheduleOutlined />,
          label: 'AI智能行程规划',
        },
        {
          key: '/itinerary/match',
          icon: <RocketOutlined />,
          label: '一键寻"徽"',
        },
      ],
    },
    {
      key: '/creation',
      icon: <BookOutlined />,
      label: '徽韵创想·云端共鸣',
      children: [
        {
          key: '/creation/workshop',
          icon: <EditOutlined />,
          label: 'AI文创工坊',
        },
        {
          key: '/creation/image',
          icon: <PictureOutlined />,
          label: 'AI图像生成',
        },
      ],
    },
    {
      key: '/community',
      icon: <TeamOutlined />,
      label: '徽友圈',
    },
    {
      key: '/insights',
      icon: <BarChartOutlined />,
      label: '数据慧脑·运营智擎',
      children: [
        {
          key: '/insights/visitor',
          icon: <UserOutlined />,
          label: '游客行为洞察',
        },
        {
          key: '/insights/operation',
          icon: <LineChartOutlined />,
          label: '运营决策优化',
        },
      ],
    },
    {
      key: '/attractions',
      icon: <BankOutlined />,
      label: '景点管理',
    },
  ];

  // 处理菜单点击
  const handleMenuClick = (e: { key: string }) => {
    setSelectedKey(e.key);
    navigate(e.key);
  };
  
  // 处理子菜单展开/收起
  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  return (
    <Sider 
      collapsible 
      collapsed={collapsed} 
      onCollapse={(value) => setCollapsed(value)}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
      }}
    >
      <div style={{ 
        height: 32, 
        margin: 16, 
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 6,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff',
        fontWeight: 'bold',
        overflow: 'hidden'
      }}>
        {collapsed ? '青湾' : '青龙湾生态系统'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        openKeys={!collapsed ? openKeys : []}
        onOpenChange={handleOpenChange}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </Sider>
  );
};

export default Sidebar; 