import type { StyleSpecification, LayerSpecification } from 'maplibre-gl';

// タイルソース定義
const TILE_SOURCES = {
  addresses: 'https://tunnel.optgeo.org/martin/addresses',
  base: 'https://tunnel.optgeo.org/martin/base',
  buildings: 'https://tunnel.optgeo.org/martin/buildings',
  divisions: 'https://tunnel.optgeo.org/martin/divisions',
  places: 'https://tunnel.optgeo.org/martin/places',
  transportation: 'https://tunnel.optgeo.org/martin/transportation',
};

// 基本色パレット
const COLORS = {
  water: '#4285F4',
  land: '#F5F5F5',
  landCover: {
    forest: '#228B22',
    grass: '#9ACD32',
    sand: '#F4A460',
    rock: '#A0522D',
  },
  landUse: {
    residential: '#E6E6FA',
    commercial: '#FFB6C1',
    industrial: '#D3D3D3',
    recreation: '#98FB98',
  },
  building: '#D3D3D3',
  road: {
    highway: '#FF6B35',
    trunk: '#FF8C42',
    primary: '#FFA62B',
    secondary: '#FFD23F',
    tertiary: '#FFFFFF',
    residential: '#FFFFFF',
  },
  division: '#FF69B4',
  place: '#8A2BE2',
  address: '#DC143C',
};

// 基盤レイヤー（面）
function createBasePolygonLayers(): LayerSpecification[] {
  return [
    // 海洋・水深
    {
      id: 'bathymetry',
      type: 'fill',
      source: 'base',
      'source-layer': 'bathymetry',
      paint: {
        'fill-color': COLORS.water,
        'fill-opacity': 0.8,
      },
    },
    // 陸地（面）
    {
      id: 'land-fill',
      type: 'fill',
      source: 'base',
      'source-layer': 'land',
      filter: ['==', ['geometry-type'], 'Polygon'],
      paint: {
        'fill-color': COLORS.land,
      },
    },
    // 陸地（線）- 海岸線など
    {
      id: 'land-line',
      type: 'line',
      source: 'base',
      'source-layer': 'land',
      filter: ['==', ['geometry-type'], 'LineString'],
      paint: {
        'line-color': '#999999',
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 0.5,
          10, 1,
          15, 2,
        ],
        'line-opacity': 0.6,
      },
    },
    // 土地被覆
    {
      id: 'land-cover',
      type: 'fill',
      source: 'base',
      'source-layer': 'land_cover',
      paint: {
        'fill-color': [
          'case',
          ['==', ['get', 'subtype'], 'forest'], COLORS.landCover.forest,
          ['==', ['get', 'subtype'], 'grass'], COLORS.landCover.grass,
          ['==', ['get', 'subtype'], 'sand'], COLORS.landCover.sand,
          ['==', ['get', 'subtype'], 'rock'], COLORS.landCover.rock,
          COLORS.landCover.grass, // デフォルト
        ],
        'fill-opacity': 0.6,
      },
    },
    // 水域（面）
    {
      id: 'water-fill',
      type: 'fill',
      source: 'base',
      'source-layer': 'water',
      filter: ['==', ['geometry-type'], 'Polygon'],
      paint: {
        'fill-color': COLORS.water,
        'fill-opacity': 0.8,
      },
    },
    // 水域（線）- 河川など
    {
      id: 'water-line',
      type: 'line',
      source: 'base',
      'source-layer': 'water',
      filter: ['==', ['geometry-type'], 'LineString'],
      paint: {
        'line-color': COLORS.water,
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 1,
          10, 3,
          15, 6,
        ],
        'line-opacity': 0.8,
      },
    },
    // 土地利用（面）
    {
      id: 'land-use-fill',
      type: 'fill',
      source: 'base',
      'source-layer': 'land_use',
      minzoom: 6,
      filter: ['==', ['geometry-type'], 'Polygon'],
      paint: {
        'fill-color': [
          'case',
          ['==', ['get', 'subtype'], 'residential'], COLORS.landUse.residential,
          ['==', ['get', 'subtype'], 'commercial'], COLORS.landUse.commercial,
          ['==', ['get', 'subtype'], 'industrial'], COLORS.landUse.industrial,
          ['==', ['get', 'subtype'], 'recreation'], COLORS.landUse.recreation,
          COLORS.landUse.residential, // デフォルト
        ],
        'fill-opacity': 0.4,
      },
    },
    // 土地利用（線）- 境界など
    {
      id: 'land-use-line',
      type: 'line',
      source: 'base',
      'source-layer': 'land_use',
      minzoom: 6,
      filter: ['==', ['geometry-type'], 'LineString'],
      paint: {
        'line-color': '#666666',
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          6, 0.5,
          12, 1,
          16, 2,
        ],
        'line-opacity': 0.5,
      },
    },
  ];
}

// 行政区域レイヤー
function createDivisionLayers(): LayerSpecification[] {
  return [
    // 行政区域面
    {
      id: 'division-area',
      type: 'fill',
      source: 'divisions',
      'source-layer': 'division_area',
      paint: {
        'fill-color': COLORS.division,
        'fill-opacity': 0.1,
      },
    },
    // 行政区域境界
    {
      id: 'division-boundary',
      type: 'line',
      source: 'divisions',
      'source-layer': 'division_boundary',
      paint: {
        'line-color': COLORS.division,
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 0.5,
          10, 2,
        ],
        'line-opacity': 0.8,
      },
    },
  ];
}

// 交通レイヤー
function createTransportationLayers(): LayerSpecification[] {
  return [
    // 道路セグメント
    {
      id: 'road-segment',
      type: 'line',
      source: 'transportation',
      'source-layer': 'segment',
      minzoom: 4,
      paint: {
        'line-color': [
          'case',
          ['==', ['get', 'class'], 'highway'], COLORS.road.highway,
          ['==', ['get', 'class'], 'trunk'], COLORS.road.trunk,
          ['==', ['get', 'class'], 'primary'], COLORS.road.primary,
          ['==', ['get', 'class'], 'secondary'], COLORS.road.secondary,
          ['==', ['get', 'class'], 'tertiary'], COLORS.road.tertiary,
          COLORS.road.residential, // デフォルト
        ],
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          4, [
            'case',
            ['==', ['get', 'class'], 'highway'], 2,
            ['==', ['get', 'class'], 'trunk'], 1.5,
            ['==', ['get', 'class'], 'primary'], 1,
            0.5,
          ],
          14, [
            'case',
            ['==', ['get', 'class'], 'highway'], 8,
            ['==', ['get', 'class'], 'trunk'], 6,
            ['==', ['get', 'class'], 'primary'], 4,
            ['==', ['get', 'class'], 'secondary'], 3,
            2,
          ],
        ],
      },
    },
    // 道路接続点
    {
      id: 'road-connector',
      type: 'circle',
      source: 'transportation',
      'source-layer': 'connector',
      minzoom: 13,
      paint: {
        'circle-color': '#333333',
        'circle-radius': 2,
        'circle-opacity': 0.6,
      },
    },
  ];
}

// 建築物レイヤー
function createBuildingLayers(): LayerSpecification[] {
  return [
    // インフラ（面）
    {
      id: 'infrastructure-fill',
      type: 'fill',
      source: 'base',
      'source-layer': 'infrastructure',
      minzoom: 13,
      filter: ['==', ['geometry-type'], 'Polygon'],
      paint: {
        'fill-color': '#8B4513',
        'fill-opacity': 0.8,
      },
    },
    // インフラ（線）
    {
      id: 'infrastructure-line',
      type: 'line',
      source: 'base',
      'source-layer': 'infrastructure',
      minzoom: 13,
      filter: ['==', ['geometry-type'], 'LineString'],
      paint: {
        'line-color': '#8B4513',
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          13, 1,
          16, 3,
        ],
        'line-opacity': 0.8,
      },
    },
    // 建築物
    {
      id: 'building',
      type: 'fill',
      source: 'buildings',
      'source-layer': 'building',
      minzoom: 5,
      paint: {
        'fill-color': COLORS.building,
        'fill-opacity': 0.8,
        'fill-outline-color': '#999999',
      },
    },
    // 建築物部分
    {
      id: 'building-part',
      type: 'fill',
      source: 'buildings',
      'source-layer': 'building_part',
      minzoom: 8,
      paint: {
        'fill-color': COLORS.building,
        'fill-opacity': 0.9,
        'fill-outline-color': '#777777',
      },
    },
  ];
}

// 地点・施設レイヤー（点）
function createPointLayers(): LayerSpecification[] {
  return [
    // 地点・施設
    {
      id: 'place',
      type: 'circle',
      source: 'places',
      'source-layer': 'place',
      paint: {
        'circle-color': COLORS.place,
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 1,
          15, 3,
        ],
        'circle-opacity': 0.8,
        'circle-stroke-color': '#FFFFFF',
        'circle-stroke-width': 1,
      },
    },
    // 行政区域中心点
    {
      id: 'division-center',
      type: 'circle',
      source: 'divisions',
      'source-layer': 'division',
      paint: {
        'circle-color': COLORS.division,
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 1,
          12, 4,
        ],
        'circle-opacity': 0.7,
      },
    },
    // 住所
    {
      id: 'address',
      type: 'circle',
      source: 'addresses',
      'source-layer': 'address',
      minzoom: 14,
      paint: {
        'circle-color': COLORS.address,
        'circle-radius': 3,
        'circle-opacity': 0.6,
      },
    },
  ];
}

// 完全なスタイル仕様を生成
export function generateMapStyle(): StyleSpecification {
  return {
    version: 8,
    name: 'Taroverture Style',
    metadata: {
      'mapbox:autocomposite': false,
      'mapbox:type': 'template',
    },
    sources: Object.fromEntries(
      Object.entries(TILE_SOURCES).map(([key, url]) => [
        key,
        {
          type: 'vector',
          url: url,
        },
      ])
    ),
    layers: [
      ...createBasePolygonLayers(),
      ...createDivisionLayers(),
      ...createTransportationLayers(),
      ...createBuildingLayers(),
      ...createPointLayers(),
    ],
  };
}
