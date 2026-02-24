import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function getCssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name);
  return (v && v.trim()) || fallback;
}

function usePrefersReducedMotion() {
  const ref = useRef(false);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const update = () => {
      ref.current = Boolean(mq.matches);
    };
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);
  return ref;
}

export default function ThreeHeroCanvas({ progress }) {
  const hostRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const primary = new THREE.Color(getCssVar('--clr-primary', '#22d3a0'));
    const accent = new THREE.Color(getCssVar('--clr-accent', '#6366f1'));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setClearAlpha(0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    host.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const wireGeo = new THREE.IcosahedronGeometry(2.35, 2);
    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(wireGeo),
      new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.28 }),
    );
    group.add(wire);

    const pointsCount = 1100;
    const positions = new Float32Array(pointsCount * 3);
    for (let i = 0; i < pointsCount; i += 1) {
      const r = 2.9 * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const u = Math.random() * 2 - 1;
      const s = Math.sqrt(1 - u * u);
      positions[i * 3 + 0] = r * s * Math.cos(theta);
      positions[i * 3 + 1] = r * u;
      positions[i * 3 + 2] = r * s * Math.sin(theta);
    }
    const ptsGeo = new THREE.BufferGeometry();
    ptsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const ptsMat = new THREE.PointsMaterial({
      color: primary,
      size: 0.018,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const points = new THREE.Points(ptsGeo, ptsMat);
    group.add(points);

    const aLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(aLight);
    const dLight = new THREE.DirectionalLight(0xffffff, 0.7);
    dLight.position.set(3, 2, 4);
    scene.add(dLight);

    let raf = 0;
    let start = performance.now();

    const setSize = () => {
      const { width, height } = host.getBoundingClientRect();
      const w = Math.max(1, Math.floor(width));
      const h = Math.max(1, Math.floor(height));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    setSize();

    const ro = new ResizeObserver(() => setSize());
    ro.observe(host);

    const readProgress = () => {
      if (!progress) return 0;
      if (typeof progress === 'number') return progress;
      if (typeof progress.get === 'function') return progress.get();
      return 0;
    };

    const renderOnce = () => {
      renderer.render(scene, camera);
    };

    const tick = (now) => {
      const t = (now - start) / 1000;
      const p = Math.min(1, Math.max(0, readProgress()));

      group.rotation.y = t * 0.22 + p * 1.35;
      group.rotation.x = t * 0.14 + p * 0.55;
      group.position.y = -p * 0.6;

      camera.position.z = 8.5 + p * 2.2;
      camera.position.x = Math.sin(t * 0.18) * 0.15;
      camera.position.y = Math.cos(t * 0.16) * 0.12;
      camera.lookAt(0, 0, 0);

      ptsMat.opacity = 0.48 + p * 0.1;
      wire.material.opacity = 0.26 + p * 0.06;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };

    if (prefersReducedMotion.current) {
      renderOnce();
    } else {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();

      wireGeo.dispose();
      ptsGeo.dispose();
      ptsMat.dispose();
      wire.material.dispose();

      renderer.dispose();
      renderer.domElement?.remove();
      host.innerHTML = '';
    };
  }, [progress, prefersReducedMotion]);

  return <div ref={hostRef} className="landing-heroCanvas" aria-hidden="true" />;
}

