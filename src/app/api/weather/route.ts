// Current weather in Bangalore for the nav, from Open-Meteo (free, no key).
// Cached and refreshed at most every 15 minutes, so visitors never hit the API
// directly.

export const revalidate = 900;

const SOURCE =
  'https://api.open-meteo.com/v1/forecast?latitude=12.9716&longitude=77.5946&current=temperature_2m,weather_code,is_day&timezone=Asia%2FKolkata';

export type Weather = { temp: number; code: number; isDay: boolean };

export async function GET() {
  try {
    const res = await fetch(SOURCE, { next: { revalidate: 900 } });
    if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
    const { current } = await res.json();
    const weather: Weather = {
      temp: Math.round(current.temperature_2m),
      code: current.weather_code,
      isDay: current.is_day === 1,
    };
    return Response.json(weather);
  } catch (error) {
    console.error('weather', error instanceof Error ? error.message : error);
    return Response.json({ error: 'unavailable' }, { status: 503 });
  }
}
