export interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  condition: string;
  conditionCode: number;
  windSpeed: number;
  city: string;
  country: string;
  lat: number;
  lon: number;
  simulated: boolean;
}

export interface AirQualityData {
  aqi: number;
  aqiLabel: string;
  aqiColor: string;
  pm2_5: number;
  pm10: number;
  no2: number;
  o3: number;
  simulated: boolean;
}

export interface TelemetryBundle {
  weather: WeatherData;
  airQuality: AirQualityData;
  simulated: boolean;
}

const AQI_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Good', color: '#10b981' },
  2: { label: 'Fair', color: '#84cc16' },
  3: { label: 'Moderate', color: '#f59e0b' },
  4: { label: 'Poor', color: '#f97316' },
  5: { label: 'Very Poor', color: '#ef4444' },
};

const MOCK_DATA: Record<string, TelemetryBundle> = {
  Lagos: {
    weather: {
      temp: 28,
      feelsLike: 32,
      humidity: 78,
      condition: 'Partly Cloudy',
      conditionCode: 802,
      windSpeed: 4.2,
      city: 'Lagos',
      country: 'NG',
      lat: 6.5244,
      lon: 3.3792,
      simulated: true,
    },
    airQuality: {
      aqi: 4,
      aqiLabel: 'Poor',
      aqiColor: '#f97316',
      pm2_5: 42.3,
      pm10: 68.1,
      no2: 38.5,
      o3: 82.4,
      simulated: true,
    },
    simulated: true,
  },
  Abuja: {
    weather: {
      temp: 31,
      feelsLike: 34,
      humidity: 55,
      condition: 'Clear Sky',
      conditionCode: 800,
      windSpeed: 3.1,
      city: 'Abuja',
      country: 'NG',
      lat: 9.0765,
      lon: 7.3986,
      simulated: true,
    },
    airQuality: {
      aqi: 3,
      aqiLabel: 'Moderate',
      aqiColor: '#f59e0b',
      pm2_5: 28.7,
      pm10: 44.2,
      no2: 22.1,
      o3: 65.3,
      simulated: true,
    },
    simulated: true,
  },
  London: {
    weather: {
      temp: 14,
      feelsLike: 12,
      humidity: 72,
      condition: 'Overcast',
      conditionCode: 804,
      windSpeed: 6.8,
      city: 'London',
      country: 'GB',
      lat: 51.5074,
      lon: -0.1278,
      simulated: true,
    },
    airQuality: {
      aqi: 2,
      aqiLabel: 'Fair',
      aqiColor: '#84cc16',
      pm2_5: 12.4,
      pm10: 18.9,
      no2: 28.6,
      o3: 55.2,
      simulated: true,
    },
    simulated: true,
  },
  'New York': {
    weather: {
      temp: 18,
      feelsLike: 17,
      humidity: 60,
      condition: 'Sunny',
      conditionCode: 800,
      windSpeed: 5.5,
      city: 'New York',
      country: 'US',
      lat: 40.7128,
      lon: -74.006,
      simulated: true,
    },
    airQuality: {
      aqi: 2,
      aqiLabel: 'Fair',
      aqiColor: '#84cc16',
      pm2_5: 10.2,
      pm10: 16.4,
      no2: 24.8,
      o3: 48.7,
      simulated: true,
    },
    simulated: true,
  },
};

const DEFAULT_MOCK: TelemetryBundle = {
  weather: {
    temp: 26,
    feelsLike: 28,
    humidity: 65,
    condition: 'Clear',
    conditionCode: 800,
    windSpeed: 3.5,
    city: 'Lagos',
    country: 'NG',
    lat: 6.5244,
    lon: 3.3792,
    simulated: true,
  },
  airQuality: {
    aqi: 3,
    aqiLabel: 'Moderate',
    aqiColor: '#f59e0b',
    pm2_5: 25.0,
    pm10: 40.0,
    no2: 20.0,
    o3: 60.0,
    simulated: true,
  },
  simulated: true,
};

const getMockForCity = (city: string): TelemetryBundle => {
  const key = Object.keys(MOCK_DATA).find(
    (k) => k.toLowerCase() === city.toLowerCase()
  );
  return key ? MOCK_DATA[key] : { ...DEFAULT_MOCK, weather: { ...DEFAULT_MOCK.weather, city } };
};

export const fetchTelemetry = async (city: string): Promise<TelemetryBundle> => {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY as string | undefined;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_key_here') {
    return getMockForCity(city);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`,
      { signal: controller.signal }
    );

    if (!weatherRes.ok) {
      clearTimeout(timeout);
      return getMockForCity(city);
    }

    const weatherJson = await weatherRes.json();
    const { lat, lon } = weatherJson.coord;

    const aqRes = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`,
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    if (!aqRes.ok) {
      return getMockForCity(city);
    }

    const aqJson = await aqRes.json();
    const aqiIndex: number = aqJson.list[0].main.aqi;
    const components = aqJson.list[0].components;
    const aqiMeta = AQI_LABELS[aqiIndex] ?? { label: 'Unknown', color: '#94a3b8' };

    const weather: WeatherData = {
      temp: Math.round(weatherJson.main.temp),
      feelsLike: Math.round(weatherJson.main.feels_like),
      humidity: weatherJson.main.humidity,
      condition: weatherJson.weather[0].description
        .split(' ')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
      conditionCode: weatherJson.weather[0].id,
      windSpeed: weatherJson.wind.speed,
      city: weatherJson.name,
      country: weatherJson.sys.country,
      lat,
      lon,
      simulated: false,
    };

    const airQuality: AirQualityData = {
      aqi: aqiIndex,
      aqiLabel: aqiMeta.label,
      aqiColor: aqiMeta.color,
      pm2_5: parseFloat(components.pm2_5.toFixed(1)),
      pm10: parseFloat(components.pm10.toFixed(1)),
      no2: parseFloat(components.no2.toFixed(1)),
      o3: parseFloat(components.o3.toFixed(1)),
      simulated: false,
    };

    return { weather, airQuality, simulated: false };
  } catch {
    return getMockForCity(city);
  }
};
