/**
 * AR场景服务
 * 使用Three.js实现简单的AR场景
 * 注意：实际使用时需要安装Three.js: npm install three
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ARButton } from 'three/examples/jsm/webxr/ARButton';

// 文化场景信息接口
export interface CulturalSceneInfo {
  id: string;
  name: string;
  description: string;
  modelPath: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  hotspots: HotspotInfo[];
  thumbnail: string;
}

// 热点信息接口
export interface HotspotInfo {
  id: string;
  title: string;
  description: string;
  position: { x: number; y: number; z: number };
  icon?: string;
  audioGuide?: string;
}

// 青龙湾特色场景列表
export const culturalScenes: CulturalSceneInfo[] = [
  {
    id: 'huizhou-architecture',
    name: '徽派建筑群',
    description: '典型的徽派建筑群，展示马头墙、雕花窗等特色元素',
    modelPath: '/models/huizhou-building.glb',
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    hotspots: [
      {
        id: 'matoubi',
        title: '马头墙',
        description: '徽派建筑的标志性特征，不仅美观，还有防火作用',
        position: { x: 0.5, y: 1.5, z: 0.5 },
        audioGuide: '/audio/matoubi-intro.mp3'
      },
      {
        id: 'woodcarving',
        title: '木雕艺术',
        description: '精美的木雕装饰，体现徽州工匠的高超技艺',
        position: { x: -0.5, y: 1.2, z: 0.3 },
        audioGuide: '/audio/woodcarving-intro.mp3'
      }
    ],
    thumbnail: '/images/huizhou-building.jpg'
  },
  {
    id: 'ancient-bridge',
    name: '青龙古桥',
    description: '青龙湾标志性的石拱桥，历史悠久，工艺精湛',
    modelPath: '/models/ancient-bridge.glb',
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    hotspots: [
      {
        id: 'bridge-structure',
        title: '桥身结构',
        description: '采用无梁石拱结构，展示古代建筑智慧',
        position: { x: 0, y: 0.5, z: 0 },
        audioGuide: '/audio/bridge-intro.mp3'
      },
      {
        id: 'bridge-carving',
        title: '桥栏石雕',
        description: '桥栏杆上的精美石雕，记录历史故事和民间传说',
        position: { x: 0.5, y: 0.8, z: 0.2 },
        audioGuide: '/audio/stone-carving-intro.mp3'
      }
    ],
    thumbnail: '/images/ancient-bridge-new.jpg'
  },
  {
    id: 'traditional-pavilion',
    name: '湖心亭',
    description: '青龙湾湖心亭，融合徽派建筑风格，是观景和休憩的理想场所',
    modelPath: '/models/traditional-pavilion.glb',
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    hotspots: [
      {
        id: 'pavilion-roof',
        title: '亭顶结构',
        description: '采用传统的重檐歇山顶，体现徽派建筑特色',
        position: { x: 0, y: 1.5, z: 0 },
        audioGuide: '/audio/pavilion-intro.mp3'
      }
    ],
    thumbnail: '/images/pavilion-new.jpg'
  },
  {
    id: 'cultural-artifacts',
    name: '徽州文物展',
    description: '展示徽墨、歙砚等徽州特色文化遗产',
    modelPath: '/models/cultural-artifact.glb',
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    hotspots: [
      {
        id: 'huimo',
        title: '徽墨',
        description: '徽州四大名产之一，以精良的工艺和上乘的材料闻名',
        position: { x: 0.3, y: 0.5, z: 0.3 },
        audioGuide: '/audio/huimo-intro.mp3'
      },
      {
        id: 'sheyan',
        title: '歙砚',
        description: '中国四大名砚之一，以质地细腻、色泽温润著称',
        position: { x: -0.3, y: 0.5, z: 0.3 },
        audioGuide: '/audio/sheyan-intro.mp3'
      }
    ],
    thumbnail: '/images/cultural-exhibition.jpg'
  },
  {
    id: 'ecological-landscape',
    name: '青龙湾生态景观',
    description: '青龙湾特有的自然风光，展示"山环水抱"的独特地貌',
    modelPath: '/models/ecological-landscape.glb',
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    hotspots: [
      {
        id: 'water-system',
        title: '水系景观',
        description: '青龙湾独特的水系景观，水质清澈，生态环境优良',
        position: { x: 0, y: 0.2, z: 0 },
        audioGuide: '/audio/water-system-intro.mp3'
      },
      {
        id: 'mountain-view',
        title: '山景观赏',
        description: '环绕青龙湾的山脉，四季景色各异，尤以秋季最为壮观',
        position: { x: 1, y: 0.5, z: 1 },
        audioGuide: '/audio/mountain-view-intro.mp3'
      }
    ],
    thumbnail: '/images/qinglong-landscape-new.jpg'
  }
];

// AR场景类
export class ARScene {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private loader: GLTFLoader;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private hotspotMarkers: THREE.Object3D[] = [];
  private currentScene: CulturalSceneInfo | null = null;
  private onHotspotClick: ((hotspot: HotspotInfo) => void) | null = null;
  
  constructor(container: HTMLElement) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.loader = new GLTFLoader();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    this.initScene();
  }
  
  // 初始化AR场景
  private initScene(): void {
    // 检查WebGL支持
    if (!this.checkWebGLSupport()) {
      this.showWebGLError();
      return;
    }
    
    // 设置渲染器
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);
    
    // 设置相机位置
    this.camera.position.set(0, 1.5, 3);
    this.camera.lookAt(0, 0, 0);
    
    // 设置轨道控制器
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.screenSpacePanning = false;
    this.controls.maxPolarAngle = Math.PI / 2;
    
    // 添加环境光和定向光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
    
    // 添加事件监听器
    window.addEventListener('resize', this.onWindowResize.bind(this));
    this.container.addEventListener('click', this.onMouseClick.bind(this));
    
    // 启动渲染循环
    this.animate();
  }
  
  // 检查WebGL支持
  private checkWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }
  
  // 显示WebGL错误
  private showWebGLError(): void {
    const errorMessage = document.createElement('div');
    errorMessage.style.color = 'red';
    errorMessage.style.textAlign = 'center';
    errorMessage.style.marginTop = '20px';
    errorMessage.innerHTML = '您的浏览器不支持WebGL，无法显示3D内容。<br>请使用最新版的Chrome、Firefox或Edge浏览器。';
    this.container.appendChild(errorMessage);
  }
  
  // 窗口大小调整处理
  private onWindowResize(): void {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }
  
  // 鼠标点击处理
  private onMouseClick(event: MouseEvent): void {
    // 计算鼠标在归一化设备坐标中的位置
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / this.container.clientWidth) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / this.container.clientHeight) * 2 + 1;
    
    // 发射射线
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // 检测与热点标记的交叉
    const intersects = this.raycaster.intersectObjects(this.hotspotMarkers, true);
    
    if (intersects.length > 0) {
      // 找到点击的热点
      const clickedMarker = intersects[0].object;
      const hotspotId = clickedMarker.userData.hotspotId;
      
      if (hotspotId && this.currentScene) {
        // 查找对应的热点信息
        const hotspot = this.currentScene.hotspots.find(h => h.id === hotspotId);
        
        if (hotspot && this.onHotspotClick) {
          this.onHotspotClick(hotspot);
        }
      }
    }
  }
  
  // 渲染循环
  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));
    
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
  
  // 加载文化场景
  public loadCulturalScene(sceneId: string): Promise<void> {
    // 查找场景信息
    const sceneInfo = culturalScenes.find(scene => scene.id === sceneId);
    
    if (!sceneInfo) {
      return Promise.reject(new Error(`未找到ID为${sceneId}的场景`));
    }
    
    this.currentScene = sceneInfo;
    
    // 清除当前场景中的内容
    while (this.scene.children.length > 0) {
      const object = this.scene.children[0];
      this.scene.remove(object);
    }
    
    // 重新添加灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
    
    // 清除热点标记数组
    this.hotspotMarkers = [];
    
    // 加载3D模型
    return new Promise((resolve, reject) => {
      this.loader.load(
        sceneInfo.modelPath,
        (gltf) => {
          // 设置模型位置、旋转和缩放
          const model = gltf.scene;
          model.position.set(
            sceneInfo.position.x,
            sceneInfo.position.y,
            sceneInfo.position.z
          );
          model.rotation.set(
            sceneInfo.rotation.x,
            sceneInfo.rotation.y,
            sceneInfo.rotation.z
          );
          model.scale.set(
            sceneInfo.scale.x,
            sceneInfo.scale.y,
            sceneInfo.scale.z
          );
          
          // 添加模型到场景
          this.scene.add(model);
          
          // 添加热点标记
          this.addHotspotMarkers(sceneInfo.hotspots);
          
          resolve();
        },
        undefined,
        (error) => {
          console.error('加载模型时出错:', error);
          
          // 如果模型加载失败，创建默认几何体
          this.createDefaultModel(sceneInfo);
          
          // 仍然添加热点标记，确保功能可用
          this.addHotspotMarkers(sceneInfo.hotspots);
          
          // 即使模型加载失败，也视为成功（使用默认几何体替代）
          resolve();
        }
      );
    });
  }
  
  // 创建默认模型（当实际模型加载失败时使用）
  private createDefaultModel(sceneInfo: CulturalSceneInfo): void {
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;
    
    // 根据场景ID选择不同的默认几何体
    switch (sceneInfo.id) {
      case 'huizhou-architecture':
        // 创建简化的建筑模型
        const building = new THREE.Group();
        
        // 主体结构
        const mainGeometry = new THREE.BoxGeometry(2, 1, 1.5);
        const mainMaterial = new THREE.MeshPhongMaterial({ color: 0xf5f5f5 });
        const mainMesh = new THREE.Mesh(mainGeometry, mainMaterial);
        mainMesh.position.y = 0.5;
        building.add(mainMesh);
        
        // 屋顶
        const roofGeometry = new THREE.ConeGeometry(1.5, 0.8, 4);
        const roofMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        const roofMesh = new THREE.Mesh(roofGeometry, roofMaterial);
        roofMesh.position.y = 1.4;
        roofMesh.rotation.y = Math.PI / 4;
        building.add(roofMesh);
        
        this.scene.add(building);
        return;
        
      case 'ancient-bridge':
        // 创建简化的桥模型
        const bridge = new THREE.Group();
        
        // 桥拱
        const archGeometry = new THREE.TorusGeometry(1, 0.2, 16, 32, Math.PI);
        const archMaterial = new THREE.MeshPhongMaterial({ color: 0x999999 });
        const archMesh = new THREE.Mesh(archGeometry, archMaterial);
        archMesh.rotation.x = Math.PI / 2;
        archMesh.position.y = 0.2;
        bridge.add(archMesh);
        
        // 桥面
        const deckGeometry = new THREE.BoxGeometry(3, 0.1, 0.8);
        const deckMaterial = new THREE.MeshPhongMaterial({ color: 0x777777 });
        const deckMesh = new THREE.Mesh(deckGeometry, deckMaterial);
        deckMesh.position.y = 1;
        bridge.add(deckMesh);
        
        this.scene.add(bridge);
        return;
        
      case 'traditional-pavilion':
        // 创建简化的亭子模型
        const pavilion = new THREE.Group();
        
        // 柱子
        const createColumn = (x: number, z: number) => {
          const columnGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
          const columnMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
          const column = new THREE.Mesh(columnGeometry, columnMaterial);
          column.position.set(x, 0.5, z);
          return column;
        };
        
        pavilion.add(createColumn(0.5, 0.5));
        pavilion.add(createColumn(-0.5, 0.5));
        pavilion.add(createColumn(0.5, -0.5));
        pavilion.add(createColumn(-0.5, -0.5));
        
        // 屋顶
        const roofGeometry2 = new THREE.ConeGeometry(1, 0.5, 4);
        const roofMaterial2 = new THREE.MeshPhongMaterial({ color: 0x333333 });
        const roof = new THREE.Mesh(roofGeometry2, roofMaterial2);
        roof.position.y = 1.25;
        roof.rotation.y = Math.PI / 4;
        pavilion.add(roof);
        
        this.scene.add(pavilion);
        return;
        
      case 'cultural-artifacts':
        // 创建简化的文物展示模型
        const artifacts = new THREE.Group();
        
        // 展示台
        const tableGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.8);
        const tableMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
        const table = new THREE.Mesh(tableGeometry, tableMaterial);
        table.position.y = 0.5;
        artifacts.add(table);
        
        // 墨块
        const inkGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.1);
        const inkMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
        const ink = new THREE.Mesh(inkGeometry, inkMaterial);
        ink.position.set(0.3, 0.6, 0);
        artifacts.add(ink);
        
        // 砚台
        const inkstoneGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 16);
        const inkstoneMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
        const inkstone = new THREE.Mesh(inkstoneGeometry, inkstoneMaterial);
        inkstone.position.set(-0.3, 0.58, 0);
        inkstone.rotation.x = Math.PI / 2;
        artifacts.add(inkstone);
        
        this.scene.add(artifacts);
        return;
        
      case 'ecological-landscape':
        // 创建简化的生态景观模型
        const landscape = new THREE.Group();
        
        // 地形
        const terrainGeometry = new THREE.PlaneGeometry(3, 3, 20, 20);
        const terrainMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x7CFC00,
          side: THREE.DoubleSide,
          wireframe: false
        });
        
        // 添加一些随机高度变化
        const vertices = terrainGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
          if (i % 3 === 1) { // y坐标
            vertices[i] = Math.random() * 0.3;
          }
        }
        
        const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
        terrain.rotation.x = -Math.PI / 2;
        landscape.add(terrain);
        
        // 水面
        const waterGeometry = new THREE.PlaneGeometry(1, 1);
        const waterMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x4169E1,
          transparent: true,
          opacity: 0.7,
          side: THREE.DoubleSide
        });
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2;
        water.position.y = 0.05;
        landscape.add(water);
        
        this.scene.add(landscape);
        return;
        
      default:
        // 默认创建一个立方体
        geometry = new THREE.BoxGeometry(1, 1, 1);
        material = new THREE.MeshPhongMaterial({ color: 0xcccccc });
        break;
    }
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      sceneInfo.position.x,
      sceneInfo.position.y + 0.5, // 稍微抬高一点，使其位于地面上
      sceneInfo.position.z
    );
    
    this.scene.add(mesh);
  }
  
  // 添加热点标记
  private addHotspotMarkers(hotspots: HotspotInfo[]): void {
    hotspots.forEach(hotspot => {
      // 创建热点标记（使用球体表示）
      const geometry = new THREE.SphereGeometry(0.05, 16, 16);
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const marker = new THREE.Mesh(geometry, material);
      
      // 设置位置
      marker.position.set(
        hotspot.position.x,
        hotspot.position.y,
        hotspot.position.z
      );
      
      // 存储热点ID
      marker.userData.hotspotId = hotspot.id;
      
      // 添加到场景和热点标记数组
      this.scene.add(marker);
      this.hotspotMarkers.push(marker);
      
      // 添加脉动动画效果
      this.addPulseEffect(marker);
    });
  }
  
  // 添加脉动效果
  private addPulseEffect(marker: THREE.Object3D): void {
    // 创建一个稍大的透明球体
    const geometry = new THREE.SphereGeometry(0.08, 16, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.3
    });
    const pulse = new THREE.Mesh(geometry, material);
    
    // 将脉动效果添加为标记的子对象
    marker.add(pulse);
    
    // 创建动画
    let scale = 1;
    let growing = true;
    
    const animate = () => {
      if (growing) {
        scale += 0.01;
        if (scale >= 1.5) growing = false;
      } else {
        scale -= 0.01;
        if (scale <= 1) growing = true;
      }
      
      pulse.scale.set(scale, scale, scale);
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  // 设置热点点击回调
  public setHotspotClickCallback(callback: (hotspot: HotspotInfo) => void): void {
    this.onHotspotClick = callback;
  }
  
  // 销毁AR场景
  public dispose(): void {
    // 移除事件监听器
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    this.container.removeEventListener('click', this.onMouseClick.bind(this));
    
    // 移除渲染器
    if (this.renderer && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
    
    // 释放资源
    this.scene.clear();
    this.renderer.dispose();
  }
}

// 获取可用的文化场景列表
export const getAvailableCulturalScenes = (): Array<{id: string; name: string; description: string}> => {
  return culturalScenes.map(scene => ({
    id: scene.id,
    name: scene.name,
    description: scene.description
  }));
};

// 初始化AR场景
export const initARScene = (containerId: string, sceneId: string): void => {
  // 这里只是一个示例，实际项目中需要使用Three.js或其他WebGL库
  console.log(`初始化AR场景 ${sceneId} 在容器 ${containerId}`);
  
  // 模拟AR场景初始化
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`容器 ${containerId} 不存在`);
    return;
  }
  
  // 检查是否支持WebGL
  if (!isWebGLSupported()) {
    container.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <h3>您的浏览器不支持WebGL</h3>
        <p>AR场景需要WebGL支持，请使用支持WebGL的现代浏览器。</p>
        <img src="/images/${sceneId}.jpg" alt="AR场景预览" style="max-width: 100%; border-radius: 8px; margin-top: 16px;" />
      </div>
    `;
    return;
  }
  
  try {
    // 创建一个简单的Three.js场景
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // 添加AR内容
    switch (sceneId) {
      case 'huizhou-architecture':
        addHuizhouArchitectureScene(scene);
        break;
      case 'ecological-landscape':
        addEcologicalLandscapeScene(scene);
        break;
      case 'ancient-bridge':
        addAncientBridgeScene(scene);
        break;
      case 'traditional-pavilion':
        addTraditionalPavilionScene(scene);
        break;
      case 'cultural-artifacts':
        addCulturalArtifactsScene(scene);
        break;
      default:
        addDefaultScene(scene);
    }
    
    // 设置摄像机位置
    camera.position.z = 5;
    
    // 添加基本光照
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);
    
    // 渲染循环
    const animate = () => {
      requestAnimationFrame(animate);
      
      // 旋转场景中的物体
      scene.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
          child.rotation.x += 0.01;
          child.rotation.y += 0.01;
        }
      });
      
      renderer.render(scene, camera);
    };
    
    animate();
  } catch (error) {
    console.error('初始化AR场景失败:', error);
    container.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <h3>AR场景加载失败</h3>
        <p>初始化AR场景时出现错误，请刷新页面重试。</p>
        <img src="/images/${sceneId}.jpg" alt="AR场景预览" style="max-width: 100%; border-radius: 8px; margin-top: 16px;" />
      </div>
    `;
  }
};

// 以下是各个场景的初始化函数（模拟）
// 实际项目中应该加载3D模型、贴图等

// 添加徽州建筑场景
function addHuizhouArchitectureScene(scene: any) {
  // 模拟：这里应该加载徽州建筑3D模型
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
}

// 添加生态景观场景
function addEcologicalLandscapeScene(scene: any) {
  // 模拟：这里应该加载生态景观3D模型
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshLambertMaterial({ color: 0x0000ff });
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);
}

// 添加古桥场景
function addAncientBridgeScene(scene: any) {
  // 模拟：这里应该加载古桥3D模型
  const geometry = new THREE.CylinderGeometry(1, 1, 2, 32);
  const material = new THREE.MeshLambertMaterial({ color: 0xff0000 });
  const cylinder = new THREE.Mesh(geometry, material);
  scene.add(cylinder);
}

// 添加传统亭台场景
function addTraditionalPavilionScene(scene: any) {
  // 模拟：这里应该加载亭台3D模型
  const geometry = new THREE.ConeGeometry(1, 2, 32);
  const material = new THREE.MeshLambertMaterial({ color: 0xffff00 });
  const cone = new THREE.Mesh(geometry, material);
  scene.add(cone);
}

// 添加文物展示场景
function addCulturalArtifactsScene(scene: any) {
  // 模拟：这里应该加载文物3D模型
  const geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
  const material = new THREE.MeshLambertMaterial({ color: 0xff00ff });
  const torus = new THREE.Mesh(geometry, material);
  scene.add(torus);
}

// 添加默认场景
function addDefaultScene(scene: any) {
  // 模拟：默认场景
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshLambertMaterial({ color: 0xcccccc });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
}

// 检查是否支持WebGL
const isWebGLSupported = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
};

// 检查设备是否支持AR
export const isARSupported = (): boolean => {
  // 检查WebXR支持
  const nav = navigator as any;
  if (typeof nav.xr !== 'undefined') {
    return true;
  }
  
  // 检查WebRTC支持（用于摄像头访问）
  if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
    return true;
  }
  
  return false;
};

// 请求摄像头权限
export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    // 成功获取后立即停止使用摄像头
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('无法获取摄像头权限:', error);
    return false;
  }
};

// 创建AR场景实例
export const createARScene = (container: HTMLElement): ARScene => {
  return new ARScene(container);
};

// 加载文化场景
export const loadCulturalScene = async (
  arScene: ARScene,
  sceneId: string
): Promise<CulturalSceneInfo | null> => {
  const scene = culturalScenes.find(s => s.id === sceneId);
  if (!scene) {
    console.error(`Scene ${sceneId} not found`);
    return null;
  }
  
  try {
    // 加载模型
    await arScene.loadCulturalScene(scene.id).catch(err => {
      console.warn(`Failed to load model for scene ${sceneId}:`, err);
      // 即使模型加载失败，我们也继续处理，因为loadModel方法现在会创建默认模型
    });
    
    return scene;
  } catch (error) {
    console.error(`Error loading cultural scene ${sceneId}:`, error);
    return null;
  }
};

// 获取AR兼容性
export const checkARCompatibility = async (): Promise<boolean> => {
  if ('xr' in navigator) {
    try {
      const isSupported = await navigator.xr?.isSessionSupported('immersive-ar');
      return isSupported || false;
    } catch (error) {
      console.error('Error checking AR compatibility:', error);
      return false;
    }
  }
  return false;
};

// 导出默认函数
export default {
  createARScene,
  loadCulturalScene,
  checkARCompatibility,
  culturalScenes,
  getAvailableCulturalScenes
}; 