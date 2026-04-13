import type { MapInstanceManager } from './core/MapInstanceManager'
import type { MarkerLayerManager } from './markers/MarkerLayerManager'
import type { MarkerMultiSelectionManager } from './markers/MarkerMultiSelectionManager'

let clusteringModulePromise: Promise<typeof import('./markers/ClusterLayerManager')> | null = null
let drawingModulePromise: Promise<{
  DrawingManagerService: typeof import('./drawing/DrawingManagerService').DrawingManagerService
  ShapeSelectionService: typeof import('./drawing/ShapeSelectionService').ShapeSelectionService
}> | null = null

export function loadClusteringModule() {
  if (!clusteringModulePromise) {
    clusteringModulePromise = import('./markers/ClusterLayerManager')
  }

  return clusteringModulePromise
}

export function loadDrawingModule() {
  if (!drawingModulePromise) {
    drawingModulePromise = Promise.all([
      import('./drawing/DrawingManagerService'),
      import('./drawing/ShapeSelectionService'),
    ]).then(([drawingModule, selectionModule]) => ({
      DrawingManagerService: drawingModule.DrawingManagerService,
      ShapeSelectionService: selectionModule.ShapeSelectionService,
    }))
  }

  return drawingModulePromise
}

export function preloadMapExtras() {
  return Promise.all([loadClusteringModule(), loadDrawingModule()])
}

export async function createClusterLayerManager(
  markerLayerManager: MarkerLayerManager,
  onLayerRecomputed: (layerId: string) => void,
) {
  const { ClusterLayerManager } = await loadClusteringModule()
  return new ClusterLayerManager(markerLayerManager, onLayerRecomputed)
}

export async function createDrawingServices(
  mapInstanceManager: MapInstanceManager,
  markerLayerManager: MarkerLayerManager,
  markerMultiSelectionManager: MarkerMultiSelectionManager,
) {
  const { DrawingManagerService, ShapeSelectionService } = await loadDrawingModule()
  const shapeSelectionService = new ShapeSelectionService(
    markerLayerManager,
    markerMultiSelectionManager,
  )
  const drawingManagerService = new DrawingManagerService(
    mapInstanceManager,
    shapeSelectionService,
    markerMultiSelectionManager,
  )

  return {
    shapeSelectionService,
    drawingManagerService,
  }
}
