import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { generateMapStyle } from './styles/mapStyle';

// 東京駅の座標
const TOKYO_STATION = {
  lng: 139.7671,
  lat: 35.6812,
  zoom: 12,
};

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
      const properties = feature.properties || {};
      
      // プロパティを整理して表示
      const displayProperties = Object.entries(properties)
        .filter(([, value]) => value !== null && value !== undefined && value !== '')
        .slice(0, 10) // 最大10個のプロパティを表示
        .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
        .join('<br>');

      const popupContent = `
        <div style="max-width: 300px;">
          <h4 style="margin: 0 0 10px 0; color: #333;">
            ${feature.layer.id} (${feature.geometry?.type || 'Unknown'})
          </h4>
          <div style="font-size: 12px; line-height: 1.4;">
            ${displayProperties || '属性情報なし'}
          </div>
          <div style="margin-top: 10px; font-size: 11px; color: #666;">
            座標: ${e.lngLat.lng.toFixed(4)}, ${e.lngLat.lat.toFixed(4)}
          </div>
        </div>
      `;

      new maplibregl.Popup({
        closeButton: true,
        closeOnClick: true,
        maxWidth: '400px',
      })
        .setLngLat(e.lngLat)
        .setHTML(popupContent)
        .addTo(map);
    } else {
      // 地物がない場所をクリックした場合は座標のみ表示
      const popupContent = `
        <div style="font-size: 12px;">
          <strong>座標:</strong><br>
          経度: ${e.lngLat.lng.toFixed(6)}<br>
          緯度: ${e.lngLat.lat.toFixed(6)}<br>
          ズーム: ${map.getZoom().toFixed(1)}
        </div>
      `;

      new maplibregl.Popup({
        closeButton: true,
        closeOnClick: true,
      })
        .setLngLat(e.lngLat)
        .setHTML(popupContent)
        .addTo(map);
    }
  });

  // マウスカーソルの変更
  map.on('mouseenter', 'place', () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', 'place', () => {
    map.getCanvas().style.cursor = '';
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
