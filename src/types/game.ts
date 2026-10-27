export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  color: string;
  badge: string;
  specialAbility: string;
  speed: number;
}

export type TrashModelType =
  // Nivel 1: El Barrio Inicial (Domésticos y escolares)
  | 'crushed_pet_bottle'       // Botella PET aplastada con tapa azul y etiqueta roja
  | 'crushed_plastic_bottle'   // Alias legacy
  | 'crushed_soda_can'         // Lata de aluminio abollada con anilla metálica
  | 'soda_can'                 // Alias legacy
  | 'juice_tetra_pack'         // TetraPak de jugo con pajita roja
  | 'juice_box'                // Alias legacy
  | 'snack_chips_bag'          // Bolsa de patatas fritas arrugada metalizada
  | 'snack_wrapper'            // Alias legacy
  | 'crinkled_plastic_cup'     // Vaso desechable de plástico arrugado

  // Nivel 2: El Parque Central (Picnic y orgánicos)
  | 'banana_peel_organic'      // Cáscara de plátano con puntas marrones
  | 'banana_peel'              // Alias legacy
  | 'bitten_apple_core'        // Manzana mordida con corazón y pepitas
  | 'greasy_pizza_box'         // Caja de pizza de cartón grasienta
  | 'pizza_box'                // Alias legacy
  | 'paper_coffee_cup'         // Vaso de café para llevar con tapa
  | 'coffee_cup'               // Alias legacy
  | 'plastic_sandwich_wrap'    // Envoltorio plástico de sándwich

  // Nivel 3: La Gran Avenida (Tráfico y vidrio urbano)
  | 'green_glass_beer_bottle'  // Botella de vidrio verde translúcida
  | 'glass_bottle'             // Alias legacy
  | 'amber_glass_preserve_jar' // Frasco de vidrio ámbar con tapa metálica
  | 'wet_rolled_newspaper'     // Periódico urbano enrollado y mojado
  | 'wet_newspaper'            // Alias legacy
  | 'rusty_canned_tin'         // Lata de conserva oxidada con borde dentado
  | 'rusty_tin_can'            // Alias legacy
  | 'used_car_tire'            // Neumático de coche desgastado
  | 'dented_aerosol_spray'     // Lata de aerosol/desodorante abollada
  | 'garbage_bag'              // Alias legacy

  // Nivel 4: La Planta Tóxica (Peligrosos e industriales)
  | 'toxic_chemical_drum'      // Barril amarillo de desechos químicos con calavera
  | 'toxic_barrel'             // Alias legacy
  | 'leaking_car_battery'      // Batería de ácido sulfatada con bornes rojo/azul
  | 'alkaline_battery'         // Alias legacy
  | 'broken_mercury_fluorescent' // Tubo fluorescente con vapor verde
  | 'fluorescent_tube'         // Alias legacy
  | 'motor_oil_jug'            // Bidón de aceite automotriz negro con fuga
  | 'chemical_glass_flask'     // Matraz químico con líquido burbujeante
  | 'burnt_pcb_ewaste'         // Placa de circuito electrónico quemada (e-waste)

  // Nivel 5: Batalla Final en el Epicentro (Mutados y Radiactivos)
  | 'pulsing_toxic_core'       // Núcleo de fango químico radiactivo
  | 'radioactive_core'         // Alias legacy
  | 'radioactive_fuel_cell'    // Celda de combustible nuclear sellada
  | 'mutated_sludge_bag'       // Saco de basura mutado por Mr.Basura
  | 'clean_air_canister'       // Filtro de oxígeno puro (¡Power-up de aire fresco!)
  | 'crystal_purifier_capsule';// Cápsula catalizadora para disparar rayo purificador

export interface TrashItem {
  id: string;
  type: 'bottle' | 'can' | 'paper' | 'organic' | 'bag' | 'toxic' | 'glass' | 'powerup';
  modelType: TrashModelType;
  name: string;
  categoryName?: string;
  ecoFact: string;
  points: number;
  recyclable: boolean;
  binType: 'green' | 'blue' | 'yellow' | 'hazard' | 'instant';
  x: number;
  y: number;
  z: number;
  scale?: number;
  rotation?: [number, number, number];
  collected?: boolean;
  districtId?: 'residencial' | 'comercial' | 'industrial' | 'parque';
}

export interface LevelConfig {
  number: number;
  name: string;
  subtitle: string;
  difficulty: '1 - Fácil' | '2 - Medio' | '3 - Difícil' | '4 - Extremo' | '5 - Nivel Dios';
  difficultyLabel: string;
  stars: number;
  objective: string;
  targetTrash: number;
  timeLimit: number;
  smogRate: number; // Consumo de oxígeno por segundo por basura no recogida
  bgTheme: string;
  fogColor: number;
  fogBaseDensity: number;
  trashSpawnZRange: [number, number];
  bossMode?: boolean;
  description: string;
  missionContext: string;
  missionDistrictId: NonNullable<TrashItem['districtId']>;
  allowedModelTypes: TrashModelType[];
  hazardSpeedMultiplier?: number;
}

export interface UserProfile {
  nickname: string;
  selectedCharacterId: string;
  avatarSkin: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  ecoCoins: number;
  totalTrashCollected: number;
  totalRecycledKg: number;
  cityCleanlinessScore: number;
  activeTitle: string;
  unlockedTitles: string[];
}

export interface ShopItem {
  id: string;
  name: string;
  category: 'tool' | 'skin' | 'boost';
  description: string;
  price: number;
  iconName: string;
  purchased: boolean;
  equipped?: boolean;
}

export interface GameSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  isMuted: boolean;
  graphicsQuality: 'alta' | 'media' | 'baja';
  fov: number;
  mouseSensitivity: number;
  invertY: boolean;
  crtFilter: boolean;
  showFps: boolean;
  language: 'es' | 'en';
}

export interface MultiplayerLobby {
  id: string;
  name: string;
  location: string;
  currentPlayers: number;
  maxPlayers: number;
  status: 'Abierta' | 'En partida' | 'Llena';
  ping: number;
}
