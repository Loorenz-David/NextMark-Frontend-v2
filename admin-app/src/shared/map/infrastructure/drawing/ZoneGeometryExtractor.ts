import type { GeoJSONPolygon } from "@/features/zone/types";

const CIRCLE_SEGMENTS = 64;
const EARTH_RADIUS_METERS = 6378137;

type Point = { lat: number; lng: number }

const resolvePoint = (value: unknown): Point | null => {
  if (typeof value !== 'object' || value === null || !('lat' in value) || !('lng' in value)) return null
  const lat = typeof value.lat === 'function' ? value.lat() : value.lat
  const lng = typeof value.lng === 'function' ? value.lng() : value.lng
  return typeof lat === 'number' && typeof lng === 'number' ? { lat, lng } : null
}

const getMember = (value: unknown, key: string): unknown =>
  typeof value === 'object' && value !== null && key in value ? value[key as keyof typeof value] : undefined

const callMember = (value: unknown, key: string): unknown => {
  const member = getMember(value, key)
  return typeof member === 'function' ? member.call(value) : undefined
}

export class ZoneGeometryExtractor {
  static fromCircle(circle: { getCenter?: () => unknown; getRadius?: () => number }): GeoJSONPolygon {
    const center = resolvePoint(circle.getCenter?.());
    const radius = circle.getRadius?.();

    if (!center || typeof radius !== 'number' || !Number.isFinite(radius) || radius <= 0) {
      return {
        type: "Polygon",
        coordinates: [[]],
      };
    }

    const dLat = (radius / EARTH_RADIUS_METERS) * (180 / Math.PI);
    const dLng = dLat / Math.cos((center.lat * Math.PI) / 180);

    const ring: Array<[number, number]> = [];
    for (let i = 0; i < CIRCLE_SEGMENTS; i += 1) {
      const angle = (i / CIRCLE_SEGMENTS) * 2 * Math.PI;
      const lat = center.lat + dLat * Math.sin(angle);
      const lng = center.lng + dLng * Math.cos(angle);
      ring.push([lng, lat]);
    }

    if (ring.length > 0) {
      ring.push(ring[0]);
    }

    return {
      type: "Polygon",
      coordinates: [ring],
    };
  }

  static fromRectangle(rectangle: { getBounds?: () => unknown }): GeoJSONPolygon {
    const bounds = rectangle.getBounds?.();
    const sw = resolvePoint(callMember(bounds, 'getSouthWest'));
    const ne = resolvePoint(callMember(bounds, 'getNorthEast'));

    if (!sw || !ne) {
      return {
        type: "Polygon",
        coordinates: [[]],
      };
    }

    const ring: Array<[number, number]> = [
      [sw.lng, sw.lat],
      [sw.lng, ne.lat],
      [ne.lng, ne.lat],
      [ne.lng, sw.lat],
      [sw.lng, sw.lat],
    ];

    return {
      type: "Polygon",
      coordinates: [ring],
    };
  }

  static fromPolygon(polygon: { getPath?: () => unknown }): GeoJSONPolygon {
    const path = polygon.getPath?.();
    const points = callMember(path, 'getArray');
    const ring: Array<[number, number]> = [];

    if (Array.isArray(points)) {
      points.forEach((value) => {
        const point = resolvePoint(value)
        if (point) ring.push([point.lng, point.lat])
      });
    }

    if (ring.length > 0) {
      ring.push(ring[0]);
    }

    return {
      type: "Polygon",
      coordinates: [ring],
    };
  }
}
