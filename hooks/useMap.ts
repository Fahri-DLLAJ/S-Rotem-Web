"use client";
import { useState } from "react";

export function useMap() {
  const [center, setCenter] = useState<[number, number]>([-6.2088, 106.8456]);
  const [zoom, setZoom] = useState(12);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return { center, setCenter, zoom, setZoom, selectedId, setSelectedId };
}
