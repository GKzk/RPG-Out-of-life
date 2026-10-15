import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SectorTileType } from '../../data/sectors/types';
import { MapPOI, PatrolEnemy, GridPosition } from '../../data/villageMapData';
import { Character } from '../../types/game';
import { ITEM_DATABASE } from '../../data/items';
import { SpriteDirection } from './CharacterSprite';

interface ThreeIsometricViewportProps {
  terrain: SectorTileType[][];
  gridWidth: number;
  gridHeight: number;
  playerPos: GridPosition;
  playerFacing: SpriteDirection;
  companionPos: GridPosition;
  selectedPetId: string;
  pois: MapPOI[];
  enemies: PatrolEnemy[];
  revealedTiles: boolean[][];
  hoveredTile: GridPosition | null;
  onTileClick: (x: number, y: number) => void;
  onTileHover: (x: number | null, y: number | null) => void;
  character: Character;
  flashlightOn: boolean;
}

export const ThreeIsometricViewport: React.FC<ThreeIsometricViewportProps> = ({
  terrain,
  gridWidth,
  gridHeight,
  playerPos,
  companionPos,
  revealedTiles,
  hoveredTile,
  onTileClick,
  onTileHover,
  character,
  flashlightOn,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const reqIdRef = useRef<number>(0);

  const meshesRef = useRef<{
    tiles: THREE.Mesh[][];
    player: THREE.Group | null;
    companion: THREE.Group | null;
    particles: THREE.Points | null;
  }>({
    tiles: [],
    player: null,
    companion: null,
    particles: null,
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 550;

    // 1. Scene setup with post-apo atmosphere fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c0b);
    scene.fog = new THREE.FogExp2(0x0a0c0b, 0.035);
    sceneRef.current = scene;

    // 2. Isometric Orthographic Camera (ATOM RPG / Fallout style)
    const aspect = width / height;
    const d = 14;
    const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 0.1, 1000);
    camera.position.set(22, 28, 22);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. WebGL Renderer with ACESFilmic Tone Mapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    containerRef.current.replaceChildren(renderer.domElement);

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xd4af37, 0.35);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffedd0, 1.4);
    sunLight.position.set(20, 35, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const flashlight = new THREE.SpotLight(0xffeedd, flashlightOn ? 3.5 : 0.8, 18, Math.PI / 4, 0.5, 1);
    flashlight.position.set(0, 8, 0);
    flashlight.castShadow = true;
    scene.add(flashlight);

    // 5. Radioactive Dust & Ash Particles
    const particleCount = 300;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 30;
      particlePositions[i + 1] = Math.random() * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 30;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffaa44,
      size: 0.08,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    meshesRef.current.particles = particles;

    // 6. Build Detailed PBR Terrain & Destroyed Buildings with Rebar
    const tileSize = 1;
    const tiles: THREE.Mesh[][] = [];

    const groundMat = new THREE.MeshStandardMaterial({ color: 0x2e332c, roughness: 0.9, metalness: 0.1 });
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x545852, roughness: 0.8, metalness: 0.2 });
    const rustyMetalMat = new THREE.MeshStandardMaterial({ color: 0x6e473b, roughness: 0.6, metalness: 0.8 });
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x2c3b28, roughness: 0.9 });
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x16363b, roughness: 0.3, metalness: 0.5 });
    const radMat = new THREE.MeshStandardMaterial({ color: 0x473b1a, roughness: 0.7, emissive: 0x222200, emissiveIntensity: 0.3 });

    const tileGeo = new THREE.BoxGeometry(tileSize, 0.25, tileSize);
    const wallGeo = new THREE.BoxGeometry(tileSize, 1.8, tileSize);
    const rebarGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.2, 6);

    for (let y = 0; y < gridHeight; y++) {
      tiles[y] = [];
      for (let x = 0; x < gridWidth; x++) {
        const tType = terrain[y]?.[x] || 'ground';
        let mat = groundMat;
        let isWall = false;

        if (tType === 'wall') {
          mat = concreteMat;
          isWall = true;
        } else if (['asphalt', 'concrete', 'metal_floor'].includes(tType)) {
          mat = concreteMat;
        } else if (['grass', 'forest'].includes(tType)) {
          mat = grassMat;
        } else if (tType === 'water') {
          mat = waterMat;
        } else if (tType === 'radiation') {
          mat = radMat;
        } else if (tType === 'fence') {
          mat = rustyMetalMat;
        }

        const mesh = new THREE.Mesh(isWall ? wallGeo : tileGeo, mat);
        const posX = (x - gridWidth / 2) * tileSize;
        const posZ = (y - gridHeight / 2) * tileSize;
        const posY = isWall ? 0.9 : 0;

        mesh.position.set(posX, posY, posZ);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        mesh.userData = { gridX: x, gridY: y };
        scene.add(mesh);

        if (isWall && Math.random() > 0.4) {
          const rebar = new THREE.Mesh(rebarGeo, rustyMetalMat);
          rebar.position.set(posX + (Math.random() - 0.5) * 0.4, posY + 0.9, posZ + (Math.random() - 0.5) * 0.4);
          rebar.rotation.z = (Math.random() - 0.5) * 0.4;
          rebar.castShadow = true;
          scene.add(rebar);
        }

        tiles[y][x] = mesh;
      }
    }
    meshesRef.current.tiles = tiles;

    // 7. Dynamic 3D Survivor Model Customization based on Equipped Armor & Weapon
    const playerGroup = new THREE.Group();
    const equippedArmor = ITEM_DATABASE.find((i) => i.id === character.equippedArmorId);
    const equippedWeapon = ITEM_DATABASE.find((i) => i.id === character.equippedWeaponId);

    // Armor color / material customization
    let armorColor = 0x594635; // default survivor jacket
    let metalness = 0.1;
    if (equippedArmor?.id === 'metal_armor') {
      armorColor = 0x8a9a86; // heavy steel plates
      metalness = 0.7;
    } else if (equippedArmor?.id === 'combat_armor') {
      armorColor = 0x313831; // tactical kevlar
      metalness = 0.4;
    }

    const armorMat = new THREE.MeshStandardMaterial({ color: armorColor, roughness: 0.7, metalness });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.7 });
    const gearMat = new THREE.MeshStandardMaterial({ color: 0x1f2421, roughness: 0.5, metalness: 0.6 });

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.7, 8), armorMat);
    torso.position.y = 0.55;
    torso.castShadow = true;
    playerGroup.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), skinMat);
    head.position.y = 1.1;
    head.castShadow = true;
    playerGroup.add(head);

    // Helmet / Gas Mask Customization
    const headGear = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), gearMat);
    headGear.position.set(0, 1.08, 0.12);
    headGear.castShadow = true;
    playerGroup.add(headGear);

    // Weapon in hand visualization (Rifle vs Knife)
    if (equippedWeapon) {
      const weaponMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.4, metalness: 0.8 });
      const weaponMesh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.8), weaponMat);
      weaponMesh.position.set(0.3, 0.55, 0.2);
      weaponMesh.castShadow = true;
      playerGroup.add(weaponMesh);
    }

    scene.add(playerGroup);
    meshesRef.current.player = playerGroup;

    // 8. Build 3D Companion Model (Hound)
    const companionGroup = new THREE.Group();
    const dogMat = new THREE.MeshStandardMaterial({ color: 0x5c4430, roughness: 0.85 });
    const collarMat = new THREE.MeshStandardMaterial({ color: 0xa13a25, roughness: 0.5 });

    const dogBody = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.3, 0.35), dogMat);
    dogBody.position.y = 0.22;
    dogBody.castShadow = true;
    companionGroup.add(dogBody);

    const dogHead = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.26, 0.28), dogMat);
    dogHead.position.set(0.32, 0.38, 0);
    dogHead.castShadow = true;
    companionGroup.add(dogHead);

    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.03, 8, 16), collarMat);
    collar.position.set(0.22, 0.32, 0);
    collar.rotation.y = Math.PI / 2;
    companionGroup.add(collar);

    scene.add(companionGroup);
    meshesRef.current.companion = companionGroup;

    // 9. Raycasting & Mouse Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const flatTiles: THREE.Object3D[] = [];
      tiles.forEach((row) => row.forEach((t) => flatTiles.push(t)));

      const intersects = raycaster.intersectObjects(flatTiles);
      if (intersects.length > 0) {
        const userData = intersects[0].object.userData;
        if (userData && userData.gridX !== undefined) {
          onTileHover(userData.gridX, userData.gridY);
        }
      } else {
        onTileHover(null, null);
      }
    };

    const handleClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const flatTiles: THREE.Object3D[] = [];
      tiles.forEach((row) => row.forEach((t) => flatTiles.push(t)));

      const intersects = raycaster.intersectObjects(flatTiles);
      if (intersects.length > 0) {
        const userData = intersects[0].object.userData;
        if (userData && userData.gridX !== undefined) {
          onTileClick(userData.gridX, userData.gridY);
        }
      }
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('pointermove', handlePointerMove);
    domElem.addEventListener('click', handleClick);

    // 10. Animation Loop
    const clock = new THREE.Clock();
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (meshesRef.current.particles) {
        const posAttr = meshesRef.current.particles.geometry.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        for (let i = 1; i < arr.length; i += 3) {
          arr[i] -= delta * 0.3;
          if (arr[i] < 0) arr[i] = 8;
        }
        posAttr.needsUpdate = true;
      }

      if (cameraRef.current && meshesRef.current.player) {
        const targetX = meshesRef.current.player.position.x;
        const targetZ = meshesRef.current.player.position.z;
        cameraRef.current.position.x = THREE.MathUtils.lerp(cameraRef.current.position.x, targetX + 16, delta * 3);
        cameraRef.current.position.z = THREE.MathUtils.lerp(cameraRef.current.position.z, targetZ + 16, delta * 3);
        cameraRef.current.lookAt(targetX, 0, targetZ);
        flashlight.position.set(targetX, 6, targetZ);
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      const aspectW = w / h;
      cameraRef.current.left = -d * aspectW;
      cameraRef.current.right = d * aspectW;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqIdRef.current);
      domElem.removeEventListener('pointermove', handlePointerMove);
      domElem.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [gridWidth, gridHeight, character.equippedArmorId, character.equippedWeaponId]);

  useEffect(() => {
    const tileSize = 1;
    if (meshesRef.current.player) {
      const px = (playerPos.x - gridWidth / 2) * tileSize;
      const pz = (playerPos.y - gridHeight / 2) * tileSize;
      meshesRef.current.player.position.set(px, 0, pz);
    }
    if (meshesRef.current.companion) {
      const cx = (companionPos.x - gridWidth / 2) * tileSize;
      const cz = (companionPos.y - gridHeight / 2) * tileSize;
      meshesRef.current.companion.position.set(cx, 0, cz);
    }
  }, [playerPos, companionPos, gridWidth, gridHeight]);

  return (
    <div className="relative w-full h-[520px] md:h-[620px] rounded-2xl overflow-hidden border-2 border-amber-600/70 bg-neutral-950 shadow-[0_0_40px_rgba(217,119,6,0.3)]">
      <div ref={containerRef} className="w-full h-full cursor-crosshair" />

      {/* Cinematic Post-Apo HUD Tag */}
      <div className="absolute top-3 left-3 px-3.5 py-1.5 rounded-lg bg-neutral-950/90 border border-amber-500/60 text-[11px] text-amber-300 font-mono flex items-center gap-2 backdrop-blur-md pointer-events-none shadow-lg">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
        <span className="font-bold tracking-wider">ATOM RPG 3D ENGINE · КАСТОМИЗАЦИЯ БРОНИ И ОРУЖИЯ</span>
      </div>
    </div>
  );
};
