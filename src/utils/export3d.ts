import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';

export async function exportToGLTF(object: THREE.Object3D, filename = 'rapid_emergency_shelter.gltf') {
  const exporter = new GLTFExporter();
  exporter.parse(
    object,
    (gltf) => {
      const output = JSON.stringify(gltf, null, 2);
      const blob = new Blob([output], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    },
    (error) => {
      console.error('An error occurred while exporting GLTF:', error);
    },
    { binary: false, embedImages: true }
  );
}

export function exportToOBJ(object: THREE.Object3D, filename = 'rapid_emergency_shelter.obj') {
  const exporter = new OBJExporter();
  const result = exporter.parse(object);
  const blob = new Blob([result], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function captureScreenshot(renderer: THREE.WebGLRenderer, filename = 'emergency_shelter_render.png') {
  const dataURL = renderer.domElement.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;
  link.click();
}
