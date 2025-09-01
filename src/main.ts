import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { generateMapStyle } from './styles/mapStyle';

// 東京駅の座標
const TOKYO_STATION = {
  lng: 139.7671,
  lat: 35.6812,
  zoom: 12,
};

// JSON を美しく表示するためのヘルパー関数
function formatJsonValue(key: string, value: any): string {
  if (value === null) {
    return `<span class="json-key">"${key}"</span>: <span class="json-null">null</span>`;
  }
  
  const valueType = typeof value;
  let formattedValue: string;
  
  switch (valueType) {
    case 'string':
      formattedValue = `<span class="json-string">"${value}"</span>`;
      break;
    case 'number':
      formattedValue = `<span class="json-number">${value}</span>`;
      break;
    case 'boolean':
      formattedValue = `<span class="json-boolean">${value}</span>`;
      break;
    case 'object':
      if (Array.isArray(value)) {
        formattedValue = `<span class="json-string">[${value.join(', ')}]</span>`;
      } else {
        formattedValue = `<span class="json-string">${JSON.stringify(value)}</span>`;
      }
      break;
    default:
      formattedValue = `<span class="json-string">"${value}"</span>`;
  }
  
  return `<span class="json-key">"${key}"</span>: ${formattedValue}`;
}

// 右側パネルを更新する関数
function updatePropertiesPanel(feature: any, coordinates: { lng: number, lat: number, zoom: number }): void {
  const panel = document.getElementById('propertiesPanel');
  const title = document.getElementById('featureTitle');
  const content = document.getElementById('propertiesContent');
  
  if (!panel || !title || !content) return;

  // タイトルを設定
  title.textContent = `${feature.layer.id} (${feature.geometry?.type || 'Unknown'})`;

  // 座標情報
  const coordinatesHtml = `
    <div class="coordinates-info">
      <strong>📍 座標情報</strong><br>
      経度: ${coordinates.lng.toFixed(6)}<br>
      緯度: ${coordinates.lat.toFixed(6)}<br>
      ズーム: ${coordinates.zoom.toFixed(1)}
    </div>
  `;

  // プロパティを整理
  const properties = feature.properties || {};
  const filteredProperties = Object.entries(properties)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .sort(([a], [b]) => a.localeCompare(b));

  // JSON形式で美しく表示
  let propertiesHtml = '';
  if (filteredProperties.length > 0) {
    propertiesHtml = `
      <div class="json-viewer">
        <strong>🏷️ 属性情報</strong><br>
        {<div class="json-object">
          ${filteredProperties.map(([key, value]) => formatJsonValue(key, value)).join(',<br>')}
        </div>}
      </div>
    `;
  } else {
    propertiesHtml = '<div class="json-viewer"><strong>🏷️ 属性情報</strong><br>属性なし</div>';
  }

  content.innerHTML = coordinatesHtml + propertiesHtml;
  panel.style.display = 'block';
}

// パネルを閉じる関数
function closePropertiesPanel(): void {
  const panel = document.getElementById('propertiesPanel');
  if (panel) {
    panel.style.display = 'none';
  }
}

// 地図の初期化
function initializeMap(): maplibregl.Map {
  const map = new maplibregl.Map({
    container: 'map',
    style: generateMapStyle(),
    center: [TOKYO_STATION.lng, TOKYO_STATION.lat],
    zoom: TOKYO_STATION.zoom,
    maxZoom: 18,
    minZoom: 2,
    hash: true, // URLにマップの状態を保存
  });

  // ナビゲーションコントロールを追加
  map.addControl(new maplibregl.NavigationControl(), 'top-right');

  // スケールコントロールを追加
  map.addControl(new maplibregl.ScaleControl(), 'bottom-left');

  // GlobeControlを追加
  map.addControl(new maplibregl.GlobeControl(), 'top-right');

  // Geolocationコントロールを追加
  map.addControl(new maplibregl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true,
    showAccuracyCircle: true
  }), 'top-right');

  return map;
}

// クリックイベントハンドラー
function setupClickHandler(map: maplibregl.Map): void {
  map.on('click', (e) => {
    const features = map.queryRenderedFeatures(e.point);
    
    if (features.length > 0) {
      const feature = features[0];
      
      // 右側パネルを更新
      updatePropertiesPanel(feature, {
        lng: e.lngLat.lng,
        lat: e.lngLat.lat,
        zoom: map.getZoom()
      });
    } else {
      // 地物がない場合は座標のみ表示
      updatePropertiesPanel(
        {
          layer: { id: '座標情報' },
          geometry: { type: 'Point' },
          properties: {}
        },
        {
          lng: e.lngLat.lng,
          lat: e.lngLat.lat,
          zoom: map.getZoom()
        }
      );
    }
  });

  // マウスカーソルの変更
  const interactiveLayers = [
    'place', 'building', 'building-part', 
    'infrastructure-fill', 'infrastructure-line',
    'water-fill', 'water-line',
    'land-fill', 'land-line',
    'land-use-fill', 'land-use-line'
  ];
  
  interactiveLayers.forEach(layerId => {
    map.on('mouseenter', layerId, () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', layerId, () => {
      map.getCanvas().style.cursor = '';
    });
  });
}

// エラーハンドリング
function setupErrorHandling(map: maplibregl.Map): void {
  map.on('error', (e) => {
    console.error('MapLibre GL JS エラー:', e.error);
  });

  map.on('sourcedataloading', (e) => {
    if (e.isSourceLoaded === false) {
      console.log(`タイルソース読み込み中: ${e.sourceId}`);
    }
  });

  map.on('sourcedata', (e) => {
    if (e.isSourceLoaded) {
      console.log(`タイルソース読み込み完了: ${e.sourceId}`);
    }
  });
}

// アプリケーションの起動
function startApp(): void {
  console.log('Taroverture アプリケーションを開始します...');
  
  try {
    const map = initializeMap();
    
    map.on('load', () => {
      console.log('地図の読み込みが完了しました');
      setupClickHandler(map);
      setupErrorHandling(map);
    });

    // 閉じるボタンのイベントリスナーを設定
    const closeButton = document.getElementById('closeButton');
    if (closeButton) {
      closeButton.addEventListener('click', closePropertiesPanel);
    }

    console.log('地図の初期化完了');
  } catch (error) {
    console.error('アプリケーション初期化エラー:', error);
  }
}

// DOMの読み込み完了後にアプリケーションを開始
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
