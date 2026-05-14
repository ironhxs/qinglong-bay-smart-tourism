import React, { useEffect, useRef } from 'react';
import { culturalScenes } from '../services/ar';

interface ARSceneViewerProps {
  sceneId: string;
}

const ARSceneViewer: React.FC<ARSceneViewerProps> = ({ sceneId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // 初始化容器
    if (containerRef.current) {
      console.log(`AR场景查看器初始化: ${sceneId}`);
    }
  }, [sceneId]);
  
  // 找到当前场景信息
  const sceneInfo = culturalScenes.find(scene => scene.id === sceneId);
  
  return (
    <div className="ar-scene-viewer">
      <div
        ref={containerRef}
        style={{ 
          width: '100%', 
          height: '400px', 
          position: 'relative',
          backgroundImage: `url(/images/${sceneId}.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div 
          style={{ 
            position: 'absolute', 
            bottom: '16px', 
            left: '16px',
            right: '16px',
            padding: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '8px'
          }}
        >
          <h3 style={{ margin: '0 0 8px 0' }}>{sceneInfo?.name || '未知场景'}</h3>
          <p style={{ margin: '0' }}>{sceneInfo?.description || '暂无描述'}</p>
        </div>
      </div>
    </div>
  );
};

export default ARSceneViewer; 