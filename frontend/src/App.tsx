import { Routes, Route, Navigate } from 'react-router-dom';
import ListPage from './pages/List';
import FormPage from './pages/Form';
import Home from './pages/Home';
import ImmersiveTour from './pages/ImmersiveTour';
import EcosystemProtection from './pages/EcosystemProtection';
import SmartItinerary from './pages/SmartItinerary';
import CreationStudio from './pages/CreationStudio';
import DataInsights from './pages/DataInsights';
import HuiCommunity from './pages/HuiCommunity';
import ImageGeneration from './pages/ImageGeneration';
import EcoSystem from './pages/EcoSystem';

const App = () => (
  <Routes>
    {/* 首页 */}
    <Route path="/" element={<Home />} />
    
    {/* 徽脉智语·沉浸漫游 */}
    <Route path="/immersive" element={<Navigate to="/immersive/voice" />} />
    <Route path="/immersive/*" element={<ImmersiveTour />} />
    
    {/* 众守青灵·生态共生 */}
    <Route path="/ecosystem" element={<Navigate to="/ecosystem/data" />} />
    <Route path="/ecosystem/*" element={<EcoSystem />} />
    
    {/* 智策游程·随心所"驭" */}
    <Route path="/itinerary" element={<Navigate to="/itinerary/planner" />} />
    <Route path="/itinerary/*" element={<SmartItinerary />} />
    
    {/* 徽韵创想·云端共鸣 */}
    <Route path="/creation" element={<Navigate to="/creation/workshop" />} />
    <Route path="/creation/workshop" element={<CreationStudio />} />
    <Route path="/creation/ar" element={<CreationStudio />} />
    <Route path="/creation/image" element={<ImageGeneration />} />
    
    {/* 徽友圈 */}
    <Route path="/community" element={<HuiCommunity />} />
    <Route path="/community/*" element={<HuiCommunity />} />
    
    {/* 数据慧脑·运营智擎 */}
    <Route path="/insights/*" element={<DataInsights />} />
    
    {/* 原有景点管理功能 */}
    <Route path="/attractions" element={<ListPage />} />
    <Route path="/create" element={<FormPage />} />
    <Route path="/edit/:id" element={<FormPage />} />
    
    {/* 404路由处理 */}
    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
);

export default App; 