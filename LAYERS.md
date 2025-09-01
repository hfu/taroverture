# Overture Maps ベクトルタイルレイヤー分析

このドキュメントは、taroverture プロジェクトで使用するOverture Mapsベクトルタイルのレイヤー構成を記載しています。

## タイルソース一覧

| タイルソース | 名前 | ズーム範囲 | URL |
|-------------|------|-----------|-----|
| addresses | Overture addresses | 0-14 | https://tunnel.optgeo.org/martin/addresses |
| base | Overture base | 0-13 | https://tunnel.optgeo.org/martin/base |
| buildings | Overture buildings | 0-14 | https://tunnel.optgeo.org/martin/buildings |
| divisions | data/divisions.pmtiles | 0-12 | https://tunnel.optgeo.org/martin/divisions |
| places | data/places.pmtiles | 0-15 | https://tunnel.optgeo.org/martin/places |
| transportation | Overture transportation | 0-14 | https://tunnel.optgeo.org/martin/transportation |

## レイヤー詳細

### 1. addresses（住所）

**ズーム範囲**: 0-14（タイルソース全体）

| レイヤーID | ジオメトリタイプ | ズーム範囲 | 主要属性 |
|-----------|----------------|----------|---------|
| address | Point | 14-14 | id, number, street, postal_city, postcode, country |

### 2. base（基盤地図）

**ズーム範囲**: 0-13（タイルソース全体）

| レイヤーID | ジオメトリタイプ | ズーム範囲 | 主要属性 |
|-----------|----------------|----------|---------|
| bathymetry | Polygon | 0-13 | depth, cartography |
| infrastructure | Line/Polygon | 13-13 | class, subtype, height, surface |
| land | Polygon | 0-13 | class, subtype, elevation, surface |
| land_cover | Polygon | 0-13 | subtype, cartography |
| land_use | Polygon | 6-13 | class, subtype, elevation, surface |
| water | Polygon | 0-13 | class, subtype, is_intermittent, is_salt |

### 3. buildings（建築物）

**ズーム範囲**: 0-14（タイルソース全体）

| レイヤーID | ジオメトリタイプ | ズーム範囲 | 主要属性 |
|-----------|----------------|----------|---------|
| building | Polygon | 5-14 | class, subtype, height, num_floors, facade_material, roof_shape |
| building_part | Polygon | 8-14 | building_id, height, num_floors, facade_material, roof_shape |

### 4. divisions（行政区域）

**ズーム範囲**: 0-12（タイルソース全体）

| レイヤーID | ジオメトリタイプ | ズーム範囲 | 主要属性 |
|-----------|----------------|----------|---------|
| division | Point | 0-12 | country, subtype, local_type, population, parent_division_id |
| division_area | Polygon | 0-12 | division_id, class, subtype, country |
| division_boundary | LineString | 0-12 | division_ids, class, subtype |

### 5. places（地点・施設）

**ズーム範囲**: 0-15（タイルソース全体）

| レイヤーID | ジオメトリタイプ | ズーム範囲 | 主要属性 |
|-----------|----------------|----------|---------|
| place | Point | 0-15 | categories, brand, confidence, addresses, phones, websites |

### 6. transportation（交通）

**ズーム範囲**: 0-14（タイルソース全体）

| レイヤーID | ジオメトリタイプ | ズーム範囲 | 主要属性 |
|-----------|----------------|----------|---------|
| connector | Point | 13-14 | id |
| segment | LineString | 4-14 | class, subclass, subtype, road_surface, speed_limits, destinations |

## レイヤー表示優先度（z-index）

地図スタイルにおける表示順序（下から上へ）：

1. **基盤レイヤー（面）**
   - bathymetry（水深）
   - land（陸地）
   - land_cover（土地被覆）
   - water（水域）
   - land_use（土地利用）

2. **行政区域（面・線）**
   - division_area（行政区域面）
   - division_boundary（行政区域境界）

3. **交通レイヤー（線・点）**
   - segment（道路セグメント）
   - connector（道路接続点）

4. **建築物レイヤー（面）**
   - building（建築物）
   - building_part（建築物部分）
   - infrastructure（インフラ）

5. **地点・施設レイヤー（点）**
   - place（地点・施設）
   - division（行政区域中心点）
   - address（住所）

## ジオメトリタイプ別分類

### 面（Polygon）
- bathymetry, land, land_cover, water, land_use
- division_area
- building, building_part

### 線（LineString）
- division_boundary
- segment

### 点（Point）
- address
- infrastructure（一部）
- division
- place
- connector

## 注意事項

- 一部のレイヤーは特定のズームレベルでのみ表示される
- 建築物は交通レイヤーより上位に表示し、点レイヤーの直下に配置する
- 各レイヤーには豊富な属性情報が含まれており、クリックイベントで表示可能
