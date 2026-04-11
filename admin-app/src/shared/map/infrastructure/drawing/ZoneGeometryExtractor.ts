import type { GeoJSONPolygon } from "@/features/zone/types";

const CIRCLE_SEGMENTS = 64;
const EARTH_RADIUS_METERS = 6378137;

export class ZoneGeometryExtractor {
  static fromCircle(circle: any): GeoJSONPolygon {
    const center = circle.getCenter();
    const radius = circle.getRadius();

    if (!center || !Number.isFinite(radius) || radius <= 0) {
      return {
        type: "Polygon",
        coordinates: [[]],
      };
    }

    const dLat = (radius / EARTH_RADIUS_METERS) * (180 / Math.PI);
    const dLng = dLat / Math.cos((center.lat() * Math.PI) / 180);

    const ring: Array<[number, number]> = [];
    for (let i = 0; i < CIRCLE_SEGMENTS; i += 1) {
      const angle = (i / CIRCLE_SEGMENTS) * 2 * Math.PI;
      const lat = center.lat() + dLat * Math.sin(angle);
      const lng = center.lng() + dLng * Math.cos(angle);
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

  static fromRectangle(rectangle: any): GeoJSONPolygon {
    const bounds = rectangle.getBounds();
    const sw = bounds?.getSouthWest();
    const ne = bounds?.getNorthEast();

    if (!sw || !ne) {
      return {
        type: "Polygon",
        coordinates: [[]],
      };
    }

    const ring: Array<[number, number]> = [
      [sw.lng(), sw.lat()],
      [sw.lng(), ne.lat()],
      [ne.lng(), ne.lat()],
      [ne.lng(), sw.lat()],
      [sw.lng(), sw.lat()],
    ];

    return {
      type: "Polygon",
      coordinates: [ring],
    };
  }

  static fromPolygon(polygon: any): GeoJSONPolygon {
    const path = polygon.getPath();
    const ring: Array<[number, number]> = [];

    path.forEach((point: any) => {
      ring.push([point.lng(), point.lat()]);
    });

    if (ring.length > 0) {
      ring.push(ring[0]);
    }

    return {
      type: "Polygon",
      coordinates: [ring],
    };
  }
}
