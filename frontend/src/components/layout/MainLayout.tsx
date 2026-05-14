import React, { useState } from 'react';
import { Layout, Typography, theme } from 'antd';
import Sidebar from './Sidebar';

const { Header, Content } = Layout;
const { Title } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title = '青龙湾生态智能系统' }) => {
  const { token } = theme.useToken();
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: token.colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
        }}>
          <Title level={4} style={{ margin: 0 }}>{title}</Title>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: token.colorBgContainer, borderRadius: '4px' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 