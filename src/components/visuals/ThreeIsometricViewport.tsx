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

type SceneMeshes = {
  tiles: THREE.Mesh[][];
  player: THREE.Group | null;
  companion: THREE.Group | null;
  particles: THREE.Points | null;
  hover: THREE.Mesh | null;
  poiMarkers: THREE.Group[];
  enemyMarkers: THREE.Group[];
};

const makeMaterial = (color: number, roughness = 0.86, metalness = 0) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

const addMesh = (
  parent: THREE.Object3D,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  position: THREE.Vector3,
  castShadow = true,
) => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
};

const seeded = (x: number, y: number, salt = 0) => {
  const value = Math.sin(x * 127.1 + y * 311.7 + salt * 74.7) * 43758.5453;
  return value - Math.floor(value);
};

const gridToWorld = (x: number, y: number, width: number, height: number) =>
  new THREE.Vector3(x - width / 2 + 0.5, 0, y - height / 2 + 0.5);

function buildSurvivor(character: Character) {
  const group = new THREE.Group();
  const armor = ITEM_DATABASE.find((item) => item.id === character.equippedArmorId);
  const weapon = ITEM_DATABASE.find((item) => item.id === character.equippedWeaponId);
  let coatColor = 0x554638;
  let coatMetalness = 0.05;
  if (armor?.id === 'metal_armor') {
    coatColor = 0x778078;
    coatMetalness = 0.58;
  } else if (armor?.id === 'combat_armor') {
    coatColor = 0x303a35;
    coatMetalness = 0.24;
  }

  const coat = makeMaterial(coatColor, 0.82, coatMetalness);
  const clothDark = makeMaterial(0x292a25, 0.94);
  const skin = makeMaterial(character.gender === 'female' ? 0xc99773 : 0xb98460, 0.78);
  const hair = makeMaterial(character.gender === 'female' ? 0x3a2920 : 0x33291f, 0.9);
  const leather = makeMaterial(0x3b3025, 0.92);
  const metal = makeMaterial(0x454945, 0.42, 0.72);
  const strap = makeMaterial(0x272a25, 0.85);

  // Legs, boots and torso use overlapping low-poly forms for a readable silhouette.
  addMesh(group, new THREE.CapsuleGeometry(0.105, 0.34, 3, 6), clothDark, new THREE.Vector3(-0.13, 0.28, 0));
  addMesh(group, new THREE.CapsuleGeometry(0.105, 0.34, 3, 6), clothDark, new THREE.Vector3(0.13, 0.28, 0));
  addMesh(group, new THREE.BoxGeometry(0.19, 0.09, 0.29), leather, new THREE.Vector3(-0.13, 0.055, 0.045));
  addMesh(group, new THREE.BoxGeometry(0.19, 0.09, 0.29), leather, new THREE.Vector3(0.13, 0.055, 0.045));
  addMesh(group, new THREE.CapsuleGeometry(0.22, 0.3, 4, 8), coat, new THREE.Vector3(0, 0.78, 0));
  addMesh(group, new THREE.BoxGeometry(0.39, 0.055, 0.28), leather, new THREE.Vector3(0, 0.61, 0));
  addMesh(group, new THREE.CylinderGeometry(0.035, 0.035, 0.4, 6), metal, new THREE.Vector3(0, 0.62, 0.17));

  // Arms angle slightly forward, leaving space for a visible weapon.
  const leftArm = addMesh(group, new THREE.CapsuleGeometry(0.075, 0.29, 3, 6), coat, new THREE.Vector3(-0.28, 0.75, 0.09));
  leftArm.rotation.z = -0.24;
  const rightArm = addMesh(group, new THREE.CapsuleGeometry(0.075, 0.29, 3, 6), coat, new THREE.Vector3(0.28, 0.75, 0.09));
  rightArm.rotation.z = 0.24;
  addMesh(group, new THREE.SphereGeometry(0.075, 8, 6), skin, new THREE.Vector3(-0.32, 0.58, 0.16));
  addMesh(group, new THREE.SphereGeometry(0.075, 8, 6), skin, new THREE.Vector3(0.32, 0.58, 0.16));

  addMesh(group, new THREE.SphereGeometry(0.16, 12, 10), skin, new THREE.Vector3(0, 1.13, 0.015));
  addMesh(group, new THREE.SphereGeometry(0.164, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.47), hair, new THREE.Vector3(0, 1.17, -0.015));
  // Scarf, shoulder strap and compact field backpack add layered detail.
  addMesh(group, new THREE.TorusGeometry(0.12, 0.035, 5, 12), leather, new THREE.Vector3(0, 0.98, 0.015));
  addMesh(group, new THREE.BoxGeometry(0.25, 0.35, 0.14), strap, new THREE.Vector3(0, 0.78, -0.19));
  addMesh(group, new THREE.BoxGeometry(0.12, 0.2, 0.16), leather, new THREE.Vector3(-0.17, 0.75, -0.2));
  addMesh(group, new THREE.BoxGeometry(0.11, 0.18, 0.16), leather, new THREE.Vector3(0.17, 0.75, -0.2));

  // A helmet-like headpiece is intentionally separate and visually understated.
  addMesh(group, new THREE.SphereGeometry(0.17, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), metal, new THREE.Vector3(0, 1.22, 0));
  if (weapon) {
    const weaponGroup = new THREE.Group();
    addMesh(weaponGroup, new THREE.BoxGeometry(0.075, 0.075, 0.58), metal, new THREE.Vector3(0, 0, 0.25));
    addMesh(weaponGroup, new THREE.BoxGeometry(0.095, 0.15, 0.13), leather, new THREE.Vector3(0, -0.075, 0.04));
    addMesh(weaponGroup, new THREE.BoxGeometry(0.045, 0.06, 0.17), clothDark, new THREE.Vector3(0, 0.015, 0.05));
    weaponGroup.position.set(0.27, 0.63, 0.19);
    weaponGroup.rotation.x = -0.1;
    group.add(weaponGroup);
  }
  group.traverse((object) => {
    if (object instanceof THREE.Mesh) object.castShadow = true;
  });
  group.scale.setScalar(0.92);
  return group;
}

function buildCompanion(petId: string) {
  const group = new THREE.Group();
  const furColor = petId === 'cat' ? 0x5a554c : petId === 'boar' ? 0x514034 : petId === 'crow' ? 0x202522 : petId === 'ferret' ? 0x876846 : 0x684a32;
  const fur = makeMaterial(furColor, 0.94);
  const dark = makeMaterial(0x252722, 0.82);
  const collar = makeMaterial(0x873c2c, 0.6, 0.1);

  if (petId === 'none' || !petId) return group;
  if (petId === 'crow') {
    addMesh(group, new THREE.SphereGeometry(0.19, 9, 7), fur, new THREE.Vector3(0, 0.42, 0));
    addMesh(group, new THREE.ConeGeometry(0.07, 0.2, 5), makeMaterial(0x9d7440, 0.75), new THREE.Vector3(0, 0.4, 0.2));
    const wingL = addMesh(group, new THREE.ConeGeometry(0.12, 0.34, 5), dark, new THREE.Vector3(-0.16, 0.43, -0.02));
    const wingR = addMesh(group, new THREE.ConeGeometry(0.12, 0.34, 5), dark, new THREE.Vector3(0.16, 0.43, -0.02));
    wingL.rotation.z = -Math.PI / 2.5;
    wingR.rotation.z = Math.PI / 2.5;
    addMesh(group, new THREE.ConeGeometry(0.09, 0.28, 5), dark, new THREE.Vector3(0, 0.23, -0.18)).rotation.x = Math.PI;
  } else if (petId === 'cat' || petId === 'ferret') {
    const length = petId === 'cat' ? 0.55 : 0.62;
    addMesh(group, new THREE.SphereGeometry(0.23, 10, 7), fur, new THREE.Vector3(0, 0.25, 0));
    addMesh(group, new THREE.SphereGeometry(0.15, 10, 7), fur, new THREE.Vector3(0.22, 0.32, 0.1));
    addMesh(group, new THREE.ConeGeometry(0.055, 0.14, 5), fur, new THREE.Vector3(0.15, 0.46, 0.1));
    addMesh(group, new THREE.ConeGeometry(0.055, 0.14, 5), fur, new THREE.Vector3(0.29, 0.46, 0.1));
    const tail = addMesh(group, new THREE.CylinderGeometry(0.035, 0.065, length, 6), fur, new THREE.Vector3(-0.29, 0.32, -0.04));
    tail.rotation.z = -Math.PI / 2.8;
  } else {
    const isBoar = petId === 'boar';
    addMesh(group, new THREE.SphereGeometry(isBoar ? 0.3 : 0.24, 10, 7), fur, new THREE.Vector3(0, 0.27, 0));
    addMesh(group, new THREE.SphereGeometry(isBoar ? 0.2 : 0.16, 10, 7), fur, new THREE.Vector3(0.23, 0.32, 0.1));
    for (const x of [-0.16, 0.16]) {
      addMesh(group, new THREE.CylinderGeometry(0.045, 0.055, isBoar ? 0.18 : 0.22, 6), dark, new THREE.Vector3(x, 0.12, 0));
    }
    if (isBoar) {
      addMesh(group, new THREE.ConeGeometry(0.07, 0.18, 5), makeMaterial(0xd4c3a0, 0.8), new THREE.Vector3(0.27, 0.28, 0.2));
    } else {
      addMesh(group, new THREE.SphereGeometry(0.055, 8, 6), collar, new THREE.Vector3(0.02, 0.34, 0.12));
      addMesh(group, new THREE.ConeGeometry(0.06, 0.2, 5), fur, new THREE.Vector3(0.15, 0.47, 0.06));
      addMesh(group, new THREE.ConeGeometry(0.06, 0.2, 5), fur, new THREE.Vector3(0.3, 0.47, 0.06));
    }
  }
  group.scale.setScalar(0.78);
  return group;
}

function addTree(scene: THREE.Scene, x: number, z: number, variant: number, materials: THREE.Material[]) {
  const [bark, foliage, foliageLight] = materials;
  const tree = new THREE.Group();
  addMesh(tree, new THREE.CylinderGeometry(0.09, 0.14, 1.1, 7), bark, new THREE.Vector3(0, 0.55, 0));
  if (variant % 2 === 0) {
    addMesh(tree, new THREE.ConeGeometry(0.62, 1.35, 7), foliage, new THREE.Vector3(0, 1.38, 0));
    addMesh(tree, new THREE.ConeGeometry(0.45, 1.05, 7), foliageLight, new THREE.Vector3(0, 1.92, 0));
  } else {
    addMesh(tree, new THREE.IcosahedronGeometry(0.62, 1), foliage, new THREE.Vector3(0, 1.45, 0));
    addMesh(tree, new THREE.IcosahedronGeometry(0.4, 1), foliageLight, new THREE.Vector3(0.2, 1.88, 0.04));
  }
  tree.position.set(x, 0, z);
  tree.rotation.y = seeded(Math.round(x * 10), Math.round(z * 10)) * Math.PI;
  scene.add(tree);
}

function addRuinDetails(scene: THREE.Scene, x: number, z: number, seed: number, materials: THREE.Material[]) {
  const [concrete, brick, rebar] = materials;
  const rubbleCount = 2 + Math.floor(seeded(x * 13, z * 17, seed) * 4);
  for (let i = 0; i < rubbleCount; i++) {
    const piece = addMesh(
      scene,
      new THREE.DodecahedronGeometry(0.12 + seeded(i, seed, 2) * 0.18, 0),
      i % 2 ? brick : concrete,
      new THREE.Vector3(x + (seeded(i, seed, 3) - 0.5) * 0.7, 0.14, z + (seeded(i, seed, 4) - 0.5) * 0.7),
    );
    piece.rotation.set(seeded(i, seed, 5), seeded(i, seed, 6), seeded(i, seed, 7));
  }
  if (seeded(seed, x, 8) > 0.48) {
    const rod = addMesh(scene, new THREE.CylinderGeometry(0.018, 0.018, 0.72, 5), rebar, new THREE.Vector3(x + 0.18, 0.32, z - 0.12));
    rod.rotation.z = 0.55 + seeded(seed, z, 9) * 0.4;
  }
}

export const ThreeIsometricViewport: React.FC<ThreeIsometricViewportProps> = ({
  terrain,
  gridWidth,
  gridHeight,
  playerPos,
  playerFacing,
  companionPos,
  selectedPetId,
  pois,
  enemies,
  revealedTiles,
  hoveredTile,
  onTileClick,
  onTileHover,
  character,
  flashlightOn,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const reqIdRef = useRef<number>(0);
  const meshesRef = useRef<SceneMeshes>({
    tiles: [],
    player: null,
    companion: null,
    particles: null,
    hover: null,
    poiMarkers: [],
    enemyMarkers: [],
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101511);
    scene.fog = new THREE.FogExp2(0x101511, 0.022);

    const aspect = width / height;
    const viewSize = Math.max(gridWidth, gridHeight) * 0.88;
    const camera = new THREE.OrthographicCamera(-viewSize * aspect / 2, viewSize * aspect / 2, viewSize / 2, -viewSize / 2, 0.1, 200);
    camera.position.set(18, 22, 18);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xc8d3c3, 0x27241e, 1.35));
    const sun = new THREE.DirectionalLight(0xffe6c5, 2.1);
    sun.position.set(12, 20, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1536, 1536);
    sun.shadow.camera.left = -gridWidth;
    sun.shadow.camera.right = gridWidth;
    sun.shadow.camera.top = gridHeight;
    sun.shadow.camera.bottom = -gridHeight;
    sun.shadow.bias = -0.00025;
    scene.add(sun);

    const ground = addMesh(
      scene,
      new THREE.PlaneGeometry(gridWidth + 2, gridHeight + 2),
      makeMaterial(0x34382e, 0.98),
      new THREE.Vector3(0, -0.17, 0),
      false,
    );
    ground.rotation.x = -Math.PI / 2;

    const groundMat = makeMaterial(0x4a4b3c);
    const pathMat = makeMaterial(0x5a5143);
    const grassMat = makeMaterial(0x34442d);
    const forestMat = makeMaterial(0x233322);
    const concreteMat = makeMaterial(0x66675e, 0.95);
    const metalMat = makeMaterial(0x665044, 0.62, 0.48);
    const waterMat = makeMaterial(0x24434a, 0.3, 0.25);
    const radiationMat = new THREE.MeshStandardMaterial({ color: 0x665a2a, roughness: 0.62, emissive: 0x423400, emissiveIntensity: 0.42 });
    const tileMaterials = [groundMat, pathMat, grassMat, forestMat, concreteMat, metalMat, waterMat, radiationMat];
    const bark = makeMaterial(0x44382b);
    const foliage = makeMaterial(0x263b29);
    const foliageLight = makeMaterial(0x3b5032);
    const brick = makeMaterial(0x655044);
    const rebar = makeMaterial(0x56483e, 0.55, 0.7);
    const wood = makeMaterial(0x5a4532);
    const woodLight = makeMaterial(0x755a3d);
    const allTiles: THREE.Mesh[][] = [];

    for (let y = 0; y < gridHeight; y++) {
      allTiles[y] = [];
      for (let x = 0; x < gridWidth; x++) {
        const type = terrain[y]?.[x] || 'ground';
        const pos = gridToWorld(x, y, gridWidth, gridHeight);
        let material = groundMat;
        let tileHeight = 0.12;
        if (type === 'path' || type === 'asphalt' || type === 'metal_floor') material = pathMat;
        if (type === 'grass') material = grassMat;
        if (type === 'forest') material = forestMat;
        if (type === 'wall' || type === 'concrete' || type === 'bunker_gate') material = concreteMat;
        if (type === 'fence') material = metalMat;
        if (type === 'water') material = waterMat;
        if (type === 'radiation') material = radiationMat;
        if (type === 'debris') material = brick;
        if (type === 'wall' || type === 'bunker_gate') tileHeight = type === 'bunker_gate' ? 2.4 : 1.45;

        const tile = addMesh(
          scene,
          new THREE.BoxGeometry(0.98, tileHeight, 0.98),
          material,
          new THREE.Vector3(pos.x, type === 'wall' || type === 'bunker_gate' ? tileHeight / 2 - 0.03 : -0.08, pos.z),
        ) as THREE.Mesh;
        tile.userData = { gridX: x, gridY: y };
        allTiles[y][x] = tile;

        if (type === 'forest') {
          addTree(scene, pos.x + (seeded(x, y) - 0.5) * 0.24, pos.z + (seeded(y, x, 2) - 0.5) * 0.24, Math.floor(seeded(x, y, 3) * 4), [bark, foliage, foliageLight]);
          if (seeded(x, y, 5) > 0.35) {
            addMesh(scene, new THREE.IcosahedronGeometry(0.18, 0), grassMat, new THREE.Vector3(pos.x + 0.28, 0.04, pos.z + 0.22));
          }
        } else if (type === 'grass') {
          for (let tuft = 0; tuft < 3; tuft++) {
            const blade = addMesh(
              scene,
              new THREE.ConeGeometry(0.035, 0.18 + seeded(x, y, tuft) * 0.12, 4),
              tuft % 2 ? foliage : foliageLight,
              new THREE.Vector3(pos.x + (seeded(x, y, tuft + 8) - 0.5) * 0.62, 0.08, pos.z + (seeded(y, x, tuft + 9) - 0.5) * 0.62),
              false,
            );
            blade.rotation.z = (seeded(x, y, tuft + 10) - 0.5) * 0.45;
          }
        } else if (type === 'wall' || type === 'debris' || type === 'bunker_gate') {
          addRuinDetails(scene, pos.x, pos.z, x * 31 + y * 17, [concreteMat, brick, rebar]);
          if (type === 'wall' && seeded(x, y, 12) > 0.55) {
            const beam = addMesh(scene, new THREE.BoxGeometry(0.16, 0.12, 1.12), wood, new THREE.Vector3(pos.x, 0.7, pos.z));
            beam.rotation.z = (seeded(x, y, 13) - 0.5) * 0.3;
          }
        } else if (type === 'fence') {
          for (const offset of [-0.35, 0.35]) {
            addMesh(scene, new THREE.BoxGeometry(0.09, 0.72, 0.09), wood, new THREE.Vector3(pos.x + offset, 0.29, pos.z));
          }
          addMesh(scene, new THREE.BoxGeometry(0.96, 0.07, 0.07), woodLight, new THREE.Vector3(pos.x, 0.48, pos.z));
          addMesh(scene, new THREE.BoxGeometry(0.96, 0.07, 0.07), wood, new THREE.Vector3(pos.x, 0.23, pos.z));
        } else if (type === 'radiation') {
          const ring = addMesh(scene, new THREE.TorusGeometry(0.27, 0.025, 5, 18), radiationMat, new THREE.Vector3(pos.x, 0.04, pos.z), false);
          ring.rotation.x = -Math.PI / 2;
        } else if (type === 'water') {
          const ripple = addMesh(scene, new THREE.TorusGeometry(0.22, 0.012, 4, 18), makeMaterial(0x6a8b88, 0.3), new THREE.Vector3(pos.x, -0.005, pos.z), false);
          ripple.rotation.x = -Math.PI / 2;
        } else if (type === 'path' && seeded(x, y, 14) > 0.62) {
          addMesh(scene, new THREE.DodecahedronGeometry(0.055, 0), wood, new THREE.Vector3(pos.x + 0.2, 0.015, pos.z - 0.18), false);
        }
      }
    }
    meshesRef.current.tiles = allTiles;

    // A subtle broken-roof village silhouette at the edges makes open sectors feel less like a board.
    const hutPositions = terrain.flatMap((row, y) => row.map((type, x) => ({ type, x, y }))).filter(({ type }) => type === 'wall').slice(0, 5);
    hutPositions.forEach(({ x, y }, index) => {
      const pos = gridToWorld(x, y, gridWidth, gridHeight);
      if (seeded(x, y, 18) < 0.3) return;
      const hut = new THREE.Group();
      addMesh(hut, new THREE.BoxGeometry(0.78, 0.72, 0.72), wood, new THREE.Vector3(0, 0.38, 0));
      addMesh(hut, new THREE.BoxGeometry(0.88, 0.09, 0.82), woodLight, new THREE.Vector3(0, 0.78, 0));
      addMesh(hut, new THREE.BoxGeometry(0.18, 0.4, 0.06), makeMaterial(0x211e19), new THREE.Vector3(0.18, 0.25, 0.37));
      const roof = addMesh(hut, new THREE.ConeGeometry(0.62, 0.38, 4), makeMaterial(0x393b34), new THREE.Vector3(0, 1.0, 0));
      roof.rotation.y = Math.PI / 4;
      hut.position.set(pos.x + (index % 2 ? 0.04 : -0.04), 0, pos.z);
      scene.add(hut);
    });

    // Distinct, small markers for POIs and enemies; gameplay still owns all interactions.
    const poiMarkers: THREE.Group[] = [];
    pois.forEach((poi) => {
      const marker = new THREE.Group();
      const markerMat = makeMaterial(poi.completed ? 0x66705c : 0xd6a65a, 0.55, 0.15);
      addMesh(marker, new THREE.CylinderGeometry(0.025, 0.025, 0.48, 6), markerMat, new THREE.Vector3(0, 0.25, 0));
      addMesh(marker, new THREE.OctahedronGeometry(0.14, 0), markerMat, new THREE.Vector3(0, 0.56, 0));
      const p = gridToWorld(poi.x, poi.y, gridWidth, gridHeight);
      marker.position.set(p.x, 0, p.z);
      marker.userData = { poiId: poi.id };
      scene.add(marker);
      poiMarkers.push(marker);
    });
    meshesRef.current.poiMarkers = poiMarkers;

    const enemyMarkers: THREE.Group[] = [];
    enemies.forEach((enemy) => {
      const marker = new THREE.Group();
      const enemyMat = makeMaterial(enemy.alerted ? 0xe34b3b : 0x9b493e, 0.55, 0.1);
      addMesh(marker, new THREE.ConeGeometry(0.18, 0.42, 5), enemyMat, new THREE.Vector3(0, 0.25, 0));
      const p = gridToWorld(enemy.x, enemy.y, gridWidth, gridHeight);
      marker.position.set(p.x, 0, p.z);
      scene.add(marker);
      enemyMarkers.push(marker);
    });
    meshesRef.current.enemyMarkers = enemyMarkers;

    const player = buildSurvivor(character);
    scene.add(player);
    meshesRef.current.player = player;
    const companion = buildCompanion(selectedPetId);
    scene.add(companion);
    meshesRef.current.companion = companion;

    const hover = addMesh(
      scene,
      new THREE.BoxGeometry(1.01, 0.035, 1.01),
      new THREE.MeshBasicMaterial({ color: 0xd8b16a, transparent: true, opacity: 0.32, depthWrite: false }),
      new THREE.Vector3(0, 0.025, 0),
      false,
    );
    hover.visible = false;
    meshesRef.current.hover = hover;

    const particleCount = 120;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * gridWidth;
      particlePositions[i * 3 + 1] = 0.25 + Math.random() * 4;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * gridHeight;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color: 0xc6a77b, size: 0.035, transparent: true, opacity: 0.38 }));
    scene.add(particles);
    meshesRef.current.particles = particles;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const getTileAtPointer = () => {
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(allTiles.flat(), false);
      if (!hits.length) return null;
      const data = hits[0].object.userData as { gridX?: number; gridY?: number };
      if (data.gridX === undefined || data.gridY === undefined) return null;
      return { x: data.gridX, y: data.gridY };
    };
    const handlePointerMove = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      const tile = getTileAtPointer();
      onTileHover(tile?.x ?? null, tile?.y ?? null);
    };
    const handleClick = () => {
      const tile = getTileAtPointer();
      if (tile) onTileClick(tile.x, tile.y);
    };
    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('click', handleClick);

    const clock = new THREE.Clock();
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.elapsedTime;
      if (meshesRef.current.particles) {
        const positions = meshesRef.current.particles.geometry.attributes.position as THREE.BufferAttribute;
        const array = positions.array as Float32Array;
        for (let i = 1; i < array.length; i += 3) {
          array[i] -= delta * 0.12;
          if (array[i] < 0.15) array[i] = 3.8 + Math.random() * 0.7;
        }
        positions.needsUpdate = true;
      }
      if (meshesRef.current.player) {
        meshesRef.current.player.position.y = Math.sin(time * 2.3) * 0.012;
        const facingAngles: Record<SpriteDirection, number> = {
          south: 0, north: Math.PI, east: Math.PI / 2, west: -Math.PI / 2,
          se: Math.PI / 4, sw: -Math.PI / 4, ne: (3 * Math.PI) / 4, nw: (-3 * Math.PI) / 4,
        };
        meshesRef.current.player.rotation.y = facingAngles[playerFacing] ?? 0;
      }
      if (meshesRef.current.companion) meshesRef.current.companion.rotation.y = Math.sin(time * 0.7) * 0.08;
      if (meshesRef.current.hover) {
        meshesRef.current.hover.visible = Boolean(hoveredTile);
        if (hoveredTile) {
          const p = gridToWorld(hoveredTile.x, hoveredTile.y, gridWidth, gridHeight);
          meshesRef.current.hover.position.set(p.x, 0.02, p.z);
        }
      }
      if (meshesRef.current.player && cameraRef.current) {
        const target = meshesRef.current.player.position;
        cameraRef.current.position.x = THREE.MathUtils.lerp(cameraRef.current.position.x, target.x + 14, delta * 2.4);
        cameraRef.current.position.z = THREE.MathUtils.lerp(cameraRef.current.position.z, target.z + 14, delta * 2.4);
        cameraRef.current.lookAt(target.x, 0, target.z);
      }
      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver(() => {
      if (!container.clientWidth || !container.clientHeight) return;
      const nextAspect = container.clientWidth / container.clientHeight;
      const nextViewSize = Math.max(gridWidth, gridHeight) * 0.88;
      camera.left = -nextViewSize * nextAspect / 2;
      camera.right = nextViewSize * nextAspect / 2;
      camera.top = nextViewSize / 2;
      camera.bottom = -nextViewSize / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(reqIdRef.current);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('click', handleClick);
      resizeObserver.disconnect();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
      rendererRef.current = null;
      cameraRef.current = null;
      meshesRef.current = { tiles: [], player: null, companion: null, particles: null, hover: null, poiMarkers: [], enemyMarkers: [] };
    };
  }, [terrain, gridWidth, gridHeight, character, selectedPetId, pois, enemies, flashlightOn, onTileClick, onTileHover]);

  useEffect(() => {
    const player = meshesRef.current.player;
    const companion = meshesRef.current.companion;
    if (player) {
      const p = gridToWorld(playerPos.x, playerPos.y, gridWidth, gridHeight);
      player.position.set(p.x, 0, p.z);
    }
    if (companion) {
      const p = gridToWorld(companionPos.x, companionPos.y, gridWidth, gridHeight);
      companion.position.set(p.x, 0, p.z);
      companion.visible = selectedPetId !== 'none' && Boolean(selectedPetId);
    }
  }, [playerPos, companionPos, gridWidth, gridHeight, selectedPetId]);

  useEffect(() => {
    meshesRef.current.tiles.forEach((row, y) => row.forEach((tile, x) => {
      const isRevealed = revealedTiles[y]?.[x] ?? true;
      const material = tile.material as THREE.MeshStandardMaterial;
      material.transparent = !isRevealed;
      material.opacity = isRevealed ? 1 : 0.18;
    }));
    meshesRef.current.poiMarkers.forEach((marker) => {
      const data = marker.userData as { poiId?: string };
      const poi = pois.find((item) => item.id === data.poiId);
      marker.visible = Boolean(poi && (revealedTiles[poi.y]?.[poi.x] ?? true));
    });
  }, [revealedTiles, pois]);

  return (
    <div className="relative w-full h-[520px] md:h-[620px] rounded-2xl overflow-hidden border border-stone-600/70 bg-neutral-950 shadow-[0_0_36px_rgba(70,80,62,0.24)]">
      <div ref={containerRef} className="w-full h-full cursor-crosshair" />
      <div className="absolute top-3 left-3 px-3 py-1.5 rounded-md bg-neutral-950/85 border border-stone-500/60 text-[10px] text-stone-200 font-mono flex items-center gap-2 backdrop-blur pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500/90" />
        <span className="font-semibold tracking-wider">ПОЛЕВОЙ СЕКТОР · 3D ПРОСМОТР</span>
      </div>
      <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-neutral-950/75 border border-stone-700/70 text-[10px] text-stone-300 font-mono pointer-events-none">
        {gridWidth} × {gridHeight} · ИЗОМЕТРИЧЕСКАЯ КАМЕРА
      </div>
    </div>
  );
};
