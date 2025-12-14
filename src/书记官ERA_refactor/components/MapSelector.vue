<template>
  <div class="map-selector-wrapper">
    <div class="map-controls">
      <div class="selected-point-preview">
        <span v-if="selectedCity || selectedRegion">
          已选择：{{ selectedCity ? `${selectedRegion?.name}, ${selectedCity.name}` : selectedRegion?.name }}
        </span>
      </div>
      <div v-if="showHelperCheckbox" class="helper-controls">
        <span v-if="lastClickedOriginalCoords">
          坐标: { x: {{ lastClickedOriginalCoords.x }}, y: {{ lastClickedOriginalCoords.y }} }
        </span>
        <label>
          <input
            type="checkbox"
            :checked="coordinateHelperMode"
            @change="$emit('update:coordinateHelperMode', ($event.target as HTMLInputElement).checked)"
          />
          坐标拾取模式
        </label>
      </div>
    </div>
    <div ref="canvasContainer" class="canvas-container">
      <canvas ref="mapCanvas" @click="handleCanvasClick"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

type Point = { x: number; y: number };

interface City {
  name: string;
  x: number;
  y: number;
}

interface Region {
  name: string;
  points: Point[];
  color: string;
  cities: City[];
}

const props = defineProps({
  coordinateHelperMode: {
    type: Boolean,
    default: false,
  },
  showHelperCheckbox: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['point-selected', 'coordinates-clicked', 'update:coordinateHelperMode']);

const mapCanvas = ref<HTMLCanvasElement | null>(null);
const canvasContainer = ref<HTMLDivElement | null>(null);
const selectedRegion = ref<Region | null>(null);
const selectedCity = ref<City | null>(null);
const lastClickedPoint = ref<Point | null>(null); // For helper mode
const lastClickedOriginalCoords = ref<Point | null>(null);
const cityClickRadius = 8;

const mapImage = new Image();
const isImageLoaded = ref(false);
const scaleX = ref(1);
const scaleY = ref(1);

const regions: Region[] = [
  {
    name: '科雷斯帝国',
    points: [
      { x: 181, y: 22 },
      { x: 194, y: 64 },
      { x: 116, y: 146 },
      { x: 96, y: 172 },
      { x: 122, y: 231 },
      { x: 97, y: 239 },
      { x: 99, y: 259 },
      { x: 122, y: 270 },
      { x: 139, y: 260 },
      { x: 151, y: 288 },
      { x: 321, y: 287 },
      { x: 328, y: 226 },
      { x: 302, y: 187 },
      { x: 338, y: 148 },
      { x: 318, y: 117 },
      { x: 260, y: 101 },
      { x: 267, y: 88 },
      { x: 234, y: 46 },
    ],
    color: 'rgba(60, 179, 113, 0.2)',
    cities: [
      { name: '迈林代尔', x: 209, y: 169 },
      { name: '米克斯塔', x: 202, y: 184 },
      { name: '巴拉德雷', x: 242, y: 195 },
    ],
  },
];

const isPointInPolygon = (point: Point, polygon: Point[]): boolean => {
  let isInside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x,
      yi = polygon[i].y;
    const xj = polygon[j].x,
      yj = polygon[j].y;
    const intersect = yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersect) isInside = !isInside;
  }
  return isInside;
};

const drawMap = () => {
  const canvas = mapCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { width, height } = canvas;
  const dpr = window.devicePixelRatio || 1;
  const displayWidth = width / dpr;
  const displayHeight = height / dpr;

  ctx.clearRect(0, 0, width, height);

  if (isImageLoaded.value) {
    ctx.drawImage(mapImage, 0, 0, displayWidth, displayHeight);
  } else {
    ctx.fillStyle = '#EAE7DC';
    ctx.fillRect(0, 0, displayWidth, displayHeight);
  }

  // In helper mode, don't draw regions/cities, just the clicked point
  if (props.coordinateHelperMode) {
    if (lastClickedPoint.value) {
      ctx.fillStyle = 'cyan';
      ctx.beginPath();
      ctx.arc(lastClickedPoint.value.x, lastClickedPoint.value.y, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = 'black';
      ctx.stroke();
    }
    return;
  }

  regions.forEach(region => {
    ctx.fillStyle = region.color;
    ctx.beginPath();
    ctx.moveTo(region.points[0].x * scaleX.value, region.points[0].y * scaleY.value);
    for (let i = 1; i < region.points.length; i++) {
      ctx.lineTo(region.points[i].x * scaleX.value, region.points[i].y * scaleY.value);
    }
    ctx.closePath();
    ctx.fill();
  });

  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  regions.forEach(region => {
    region.cities.forEach(city => {
      const cityX = city.x * scaleX.value;
      const cityY = city.y * scaleY.value;
      ctx.beginPath();
      ctx.arc(cityX, cityY, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.stroke();
      ctx.fillStyle = 'black';
      ctx.fillText(city.name, cityX, cityY + 15);
    });
  });

  if (selectedRegion.value) {
    ctx.strokeStyle = 'pink';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(selectedRegion.value.points[0].x * scaleX.value, selectedRegion.value.points[0].y * scaleY.value);
    for (let i = 1; i < selectedRegion.value.points.length; i++) {
      ctx.lineTo(selectedRegion.value.points[i].x * scaleX.value, selectedRegion.value.points[i].y * scaleY.value);
    }
    ctx.closePath();
    ctx.stroke();
  }

  if (selectedCity.value) {
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(selectedCity.value.x * scaleX.value, selectedCity.value.y * scaleY.value, cityClickRadius, 0, 2 * Math.PI);
    ctx.stroke();
  }
};

const handleCanvasClick = (event: MouseEvent) => {
  const canvas = mapCanvas.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const clickPoint = { x: event.clientX - rect.left, y: event.clientY - rect.top };

  if (props.coordinateHelperMode) {
    const originalX = Math.round(clickPoint.x / scaleX.value);
    const originalY = Math.round(clickPoint.y / scaleY.value);

    const coords = { x: originalX, y: originalY };
    console.log(`Coordinates: { x: ${coords.x}, y: ${coords.y} }`);
    emit('coordinates-clicked', coords);
    lastClickedOriginalCoords.value = coords;
    lastClickedPoint.value = clickPoint;
    drawMap();
    return;
  }

  let foundCity: City | null = null;
  let foundRegionForCity: Region | null = null;

  for (const region of regions) {
    for (const city of region.cities) {
      const cityX = city.x * scaleX.value;
      const cityY = city.y * scaleY.value;
      const distance = Math.sqrt((clickPoint.x - cityX) ** 2 + (clickPoint.y - cityY) ** 2);
      if (distance < cityClickRadius) {
        foundCity = city;
        foundRegionForCity = region;
        break;
      }
    }
    if (foundCity) break;
  }

  if (foundCity && foundRegionForCity) {
    selectedCity.value = foundCity;
    selectedRegion.value = foundRegionForCity;
    emit('point-selected', `${foundRegionForCity.name}, ${foundCity.name}`);
  } else {
    const scaledRegions = regions.map(region => ({
      ...region,
      points: region.points.map(p => ({ x: p.x * scaleX.value, y: p.y * scaleY.value })),
    }));
    const clickedRegionData = scaledRegions.find(region => isPointInPolygon(clickPoint, region.points));
    selectedCity.value = null;
    if (clickedRegionData) {
      selectedRegion.value = regions.find(r => r.name === clickedRegionData.name) || null;
      emit('point-selected', clickedRegionData.name);
    } else {
      selectedRegion.value = null;
      emit('point-selected', '');
    }
  }

  drawMap();
};

const resizeCanvas = () => {
  const canvas = mapCanvas.value;
  const container = canvasContainer.value;
  if (!canvas || !container) return;

  const rect = container.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.scale(dpr, dpr);

  // Base dimensions for coordinate mapping
  const baseWidth = 500;
  const baseHeight = 300;
  scaleX.value = rect.width / baseWidth;
  scaleY.value = rect.height / baseHeight;

  drawMap();
};

let resizeObserver: ResizeObserver;

onMounted(() => {
  mapImage.crossOrigin = 'Anonymous';
  mapImage.onload = () => {
    isImageLoaded.value = true;
    drawMap();
  };
  mapImage.src =
    'https://raw.githubusercontent.com/neko-kyuu/the-tale-of-Ofoces/refs/heads/static-resources/public/static/vault/29A958DA-EF44-4C67-923E-1B4ECB5E6A90_1_105_c.jpeg';

  const container = canvasContainer.value;
  if (container) {
    resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);
  }
  resizeCanvas();
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>

<style scoped>
.map-selector-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.map-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 24px; /* Prevent layout shift */
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}
.selected-point-preview {
  text-align: left;
  font-weight: bold;
  padding: 0 0.5rem;
  flex-grow: 1;
}
.helper-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}
.helper-controls label {
  display: flex;
  align-items: center;
  gap: 4px;
}
.canvas-container {
  min-width: 450px;
  width: 100%;
  position: relative;
  aspect-ratio: 500 / 300; /* Maintain aspect ratio of original design */
}
canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 1px solid #ccc;
  cursor: pointer;
}
</style>
