"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Petit objet 3D décoratif de l'accueil (icosaèdre low-poly émeraude).
 *
 * Chargé uniquement côté client et en lazy (voir `HeroVisual`) : la scène
 * n'alourdit ni le bundle initial ni les autres écrans. Si WebGL est
 * indisponible, on abandonne silencieusement (le fallback reste affiché).
 */
export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearAlpha(0);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0.2, 5);

    const geometry = new THREE.IcosahedronGeometry(1.35, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.35,
      roughness: 0.35,
      flatShading: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Légère surcouche filaire pour l'effet "tech".
    const wireframe = new THREE.LineSegments(
      new THREE.WireframeGeometry(geometry),
      new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.15,
      }),
    );
    mesh.add(wireframe);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(4, 5, 6);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x6ee7b7, 1.4);
    rimLight.position.set(-5, -3, -4);
    scene.add(rimLight);

    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(container);

    const clock = new THREE.Clock();
    let frameId = 0;

    const renderFrame = () => {
      const elapsed = clock.getElapsedTime();
      if (!prefersReducedMotion) {
        mesh.rotation.y = elapsed * 0.35;
        mesh.rotation.x = Math.sin(elapsed * 0.4) * 0.25;
        mesh.position.y = Math.sin(elapsed * 0.8) * 0.12;
      }
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(renderFrame);
    };
    renderFrame();

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      geometry.dispose();
      material.dispose();
      wireframe.geometry.dispose();
      (wireframe.material as THREE.Material).dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" aria-hidden="true" />;
}
