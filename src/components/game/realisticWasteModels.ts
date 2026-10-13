import * as THREE from 'three';
import { TrashItem } from '../../types/game';

/**
 * Procedural 3D Realistic Waste Model Generator for Three.js
 * Generates detailed multi-part composite meshes representing authentic real-world trash items.
 */
export function createRealisticWasteMesh(item: TrashItem): THREE.Group {
  const group = new THREE.Group();
  group.name = `trash_${item.id}_${item.modelType}`;

  switch (item.modelType) {
    // ------------------------------------------------------------------------
    // NIVEL 1: RESIDUOS ESCOLARES Y DOMÉSTICOS
    // ------------------------------------------------------------------------
    case 'crushed_pet_bottle': {
      // Clear plastic bottle with blue cap and red label
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x67e8f9,
        transparent: true,
        opacity: 0.65,
        roughness: 0.15,
        metalness: 0.1,
      });
      const bottleBody = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.20, 0.55, 12), bodyMat);
      bottleBody.position.y = 0.28;
      bottleBody.scale.set(1.1, 0.7, 0.9); // Crushed look

      // Tapered neck
      const neck = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.14, 12), bodyMat);
      neck.position.y = 0.58;

      // Blue cap
      const capMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.4 });
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.08, 10), capMat);
      cap.position.y = 0.66;

      // Red product label band
      const labelMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.6 });
      const label = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.205, 0.20, 12), labelMat);
      label.position.y = 0.28;

      group.add(bottleBody, neck, cap, label);
      // Lie horizontally on the street with slight tilt
      group.rotation.z = Math.PI / 2.2;
      group.rotation.x = 0.3;
      break;
    }

    case 'crushed_soda_can': {
      // Red aluminum soda can with silver rims, dented and pull-tab
      const canMat = new THREE.MeshStandardMaterial({
        color: 0xdc2626,
        metalness: 0.85,
        roughness: 0.25,
      });
      const silverMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.9,
        roughness: 0.2,
      });

      const canBody = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.45, 16), canMat);
      canBody.position.y = 0.24;
      canBody.scale.set(1.15, 0.85, 0.95); // Dented

      // Top silver rim & lid
      const topRim = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.04, 16), silverMat);
      topRim.position.y = 0.43;

      // Pull-tab
      const tab = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.12), silverMat);
      tab.position.set(0.04, 0.45, 0.04);
      tab.rotation.y = 0.4;

      group.add(canBody, topRim, tab);
      group.rotation.z = Math.PI / 2.1;
      group.rotation.y = 0.6;
      break;
    }

    case 'juice_tetra_pack': {
      // TetraPak brick with red bendy drinking straw
      const packMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.5,
      });
      const packBody = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.48, 0.22), packMat);
      packBody.position.y = 0.24;

      // Top fold angled edge
      const topFoldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
      const topFold = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.08, 0.08), topFoldMat);
      topFold.position.set(0, 0.46, 0);

      // Red plastic straw
      const strawMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
      const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 8), strawMat);
      straw.position.set(0.08, 0.52, 0.04);
      straw.rotation.z = -0.35;

      group.add(packBody, topFold, straw);
      group.rotation.y = 0.4;
      break;
    }

    case 'snack_chips_bag': {
      // Puffy metallic foil snack bag
      const foilMat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        metalness: 0.8,
        roughness: 0.3,
      });
      const bagBody = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.30), foilMat);
      bagBody.position.y = 0.06;

      // Sealed crimped ends
      const sealMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.9, roughness: 0.4 });
      const sealTop = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.04, 0.06), sealMat);
      sealTop.position.set(0, 0.06, 0.16);
      const sealBottom = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.04, 0.06), sealMat);
      sealBottom.position.set(0, 0.06, -0.16);

      group.add(bagBody, sealTop, sealBottom);
      group.rotation.y = 0.8;
      break;
    }

    case 'crinkled_plastic_cup': {
      // Crushed translucent white cup
      const cupMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.75,
        roughness: 0.3,
      });
      const cup = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.38, 12), cupMat);
      cup.position.y = 0.18;
      cup.scale.set(1.2, 0.6, 0.9); // Crushed
      group.add(cup);
      group.rotation.z = Math.PI / 2.3;
      break;
    }

    // ------------------------------------------------------------------------
    // NIVEL 2: EL PARQUE CENTRAL (PICNIC Y ORGÁNICOS)
    // ------------------------------------------------------------------------
    case 'banana_peel_organic': {
      // 3 peel segments splaying outward with brown tips
      const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.7 });
      const brownMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });

      // Center stem
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.14, 8), brownMat);
      stem.position.y = 0.12;

      // 3 curved peel ribbons
      for (let i = 0; i < 3; i++) {
        const peel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.40), yellowMat);
        peel.rotation.y = (Math.PI * 2 * i) / 3;
        peel.position.set(Math.sin((Math.PI * 2 * i) / 3) * 0.16, 0.04, Math.cos((Math.PI * 2 * i) / 3) * 0.16);

        const tip = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.04, 0.10), brownMat);
        tip.position.set(Math.sin((Math.PI * 2 * i) / 3) * 0.32, 0.04, Math.cos((Math.PI * 2 * i) / 3) * 0.32);
        group.add(peel, tip);
      }
      group.add(stem);
      break;
    }

    case 'bitten_apple_core': {
      // Apple core with red cap/base, bitten flesh, and dark stem
      const redMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.4 });
      const fleshMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.8 });
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });

      const top = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), redMat);
      top.position.y = 0.28;
      top.scale.set(1, 0.5, 1);

      const bottom = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), redMat);
      bottom.position.y = 0.08;
      bottom.scale.set(1, 0.5, 1);

      const core = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.24, 8), fleshMat);
      core.position.y = 0.18;

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.16, 6), woodMat);
      stem.position.y = 0.38;
      stem.rotation.z = 0.2;

      group.add(top, bottom, core, stem);
      break;
    }

    case 'greasy_pizza_box': {
      // Flat cardboard box with grease stain
      const cardMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 });
      const greaseMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.3 });

      const box = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.09, 0.70), cardMat);
      box.position.y = 0.05;

      const greaseSpot = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.02, 10), greaseMat);
      greaseSpot.position.set(0.05, 0.10, 0.05);

      group.add(box, greaseSpot);
      group.rotation.y = 0.35;
      break;
    }

    case 'paper_coffee_cup': {
      // Craft coffee cup with heat sleeve and white plastic lid
      const cupMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 });
      const sleeveMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
      const lidMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });

      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.13, 0.42, 12), cupMat);
      cup.position.y = 0.21;

      const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.16, 0.16, 12), sleeveMat);
      sleeve.position.y = 0.20;

      const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.05, 12), lidMat);
      lid.position.y = 0.44;

      group.add(cup, sleeve, lid);
      break;
    }

    case 'plastic_sandwich_wrap': {
      // Translucent crumpled wrap
      const wrapMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        transparent: true,
        opacity: 0.55,
        roughness: 0.2,
      });
      const wrap = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 1), wrapMat);
      wrap.position.y = 0.12;
      wrap.scale.set(1.4, 0.5, 1.2);
      group.add(wrap);
      break;
    }

    // ------------------------------------------------------------------------
    // NIVEL 3: LA GRAN AVENIDA (VIDRIO URBANO Y TRÁFICO)
    // ------------------------------------------------------------------------
    case 'green_glass_beer_bottle': {
      // Translucent shiny emerald green bottle
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x15803d,
        transparent: true,
        opacity: 0.70,
        roughness: 0.08,
        metalness: 0.15,
      });
      const capMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.8, roughness: 0.2 });

      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.48, 14), glassMat);
      body.position.y = 0.24;

      const shoulder = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.18, 14), glassMat);
      shoulder.position.y = 0.52;

      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.26, 12), glassMat);
      neck.position.y = 0.72;

      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.04, 10), capMat);
      crown.position.y = 0.86;

      group.add(body, shoulder, neck, crown);
      group.rotation.z = Math.PI / 2.1;
      group.rotation.x = 0.4;
      break;
    }

    case 'amber_glass_preserve_jar': {
      // Amber jar with metal lid
      const amberMat = new THREE.MeshStandardMaterial({
        color: 0xb45309,
        transparent: true,
        opacity: 0.75,
        roughness: 0.12,
      });
      const lidMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });

      const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.40, 14), amberMat);
      jar.position.y = 0.20;

      const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.06, 14), lidMat);
      lid.position.y = 0.42;

      group.add(jar, lid);
      break;
    }

    case 'wet_rolled_newspaper': {
      // Rolled gray newspaper with twine band
      const newsMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9 });
      const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.65, 12), newsMat);
      roll.position.y = 0.14;
      roll.rotation.z = Math.PI / 2;

      // Dark headline text marks
      const inkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.145, 0.12, 12), inkMat);
      band.position.y = 0.14;
      band.rotation.z = Math.PI / 2;

      group.add(roll, band);
      group.rotation.y = 0.6;
      break;
    }

    case 'rusty_canned_tin': {
      // Corrugated rusty tin with peeled-back lid
      const rustMat = new THREE.MeshStandardMaterial({
        color: 0x78350f,
        roughness: 0.85,
        metalness: 0.4,
      });
      const can = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.38, 14), rustMat);
      can.position.y = 0.19;

      // Peeled lid
      const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.02, 14), rustMat);
      lid.position.set(0.12, 0.42, 0);
      lid.rotation.z = 0.8;

      group.add(can, lid);
      break;
    }

    case 'used_car_tire': {
      // Rubber tire torus
      const rubberMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.95,
        metalness: 0.05,
      });
      const tire = new THREE.Mesh(new THREE.TorusGeometry(0.40, 0.16, 12, 24), rubberMat);
      tire.rotation.x = Math.PI / 2;
      tire.position.y = 0.16;

      group.add(tire);
      break;
    }

    case 'dented_aerosol_spray': {
      // Tall silver aerosol can with blue nozzle
      const canMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.8, roughness: 0.2 });
      const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.4 });

      const can = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.55, 14), canMat);
      can.position.y = 0.28;

      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.08, 10), nozzleMat);
      nozzle.position.y = 0.58;

      group.add(can, nozzle);
      group.rotation.z = Math.PI / 2.2;
      break;
    }

    // ------------------------------------------------------------------------
    // NIVEL 4: LA PLANTA TÓXICA (DESECHOS QUÍMICOS E INDUSTRIALES)
    // ------------------------------------------------------------------------
    case 'toxic_chemical_drum': {
      // Industrial yellow drum with black hazard stripes & neon green slime puddle
      const drumMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4, metalness: 0.3 });
      const stripeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
      const slimeMat = new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        emissive: 0x15803d,
        emissiveIntensity: 0.5,
        roughness: 0.2,
      });

      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.85, 16), drumMat);
      barrel.position.y = 0.44;

      // 2 black hazard stripes
      const stripe1 = new THREE.Mesh(new THREE.CylinderGeometry(0.385, 0.385, 0.12, 16), stripeMat);
      stripe1.position.y = 0.32;
      const stripe2 = new THREE.Mesh(new THREE.CylinderGeometry(0.385, 0.385, 0.12, 16), stripeMat);
      stripe2.position.y = 0.60;

      // Slime puddle underneath
      const puddle = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.02, 14), slimeMat);
      puddle.position.y = 0.01;

      group.add(barrel, stripe1, stripe2, puddle);
      break;
    }

    case 'leaking_car_battery': {
      // Heavy black casing with red & blue terminals and acid puddle
      const caseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
      const redTerminal = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.7, roughness: 0.3 });
      const blueTerminal = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.7, roughness: 0.3 });
      const acidMat = new THREE.MeshStandardMaterial({
        color: 0x84cc16,
        emissive: 0x4d7c0f,
        emissiveIntensity: 0.4,
        roughness: 0.2,
      });

      const battery = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.34, 0.32), caseMat);
      battery.position.y = 0.18;

      const posPost = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.09, 8), redTerminal);
      posPost.position.set(-0.16, 0.38, 0.06);

      const negPost = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.09, 8), blueTerminal);
      negPost.position.set(0.16, 0.38, 0.06);

      const acidPuddle = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.02, 12), acidMat);
      acidPuddle.position.set(0.10, 0.01, 0.12);

      group.add(battery, posPost, negPost, acidPuddle);
      break;
    }

    case 'broken_mercury_fluorescent': {
      // Long frosted tube with metal bi-pin end caps and glowing emission
      const tubeMat = new THREE.MeshStandardMaterial({
        color: 0xa7f3d0,
        emissive: 0x10b981,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.85,
        roughness: 0.2,
      });
      const endMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });

      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.30, 12), tubeMat);
      tube.rotation.z = Math.PI / 2;
      tube.position.y = 0.08;

      const endL = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.08, 12), endMat);
      endL.rotation.z = Math.PI / 2;
      endL.position.set(-0.66, 0.08, 0);

      const endR = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.08, 12), endMat);
      endR.rotation.z = Math.PI / 2;
      endR.position.set(0.66, 0.08, 0);

      group.add(tube, endL, endR);
      group.rotation.y = 0.7;
      break;
    }

    case 'motor_oil_jug': {
      // Black motor oil container with handle
      const jugMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 });
      const capMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 });
      const spillMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.1, metalness: 0.5 });

      const body = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.52, 0.24), jugMat);
      body.position.y = 0.26;

      const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.12, 10), capMat);
      spout.position.set(-0.10, 0.55, 0);

      const spill = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.015, 12), spillMat);
      spill.position.set(0.15, 0.01, 0.10);

      group.add(body, spout, spill);
      break;
    }

    case 'chemical_glass_flask': {
      // Erlenmeyer flask with glowing toxic bubbling green fluid
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        transparent: true,
        opacity: 0.6,
        roughness: 0.1,
      });
      const acidMat = new THREE.MeshStandardMaterial({
        color: 0x4ade80,
        emissive: 0x16a34a,
        emissiveIntensity: 0.7,
        roughness: 0.2,
      });

      const flask = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.45, 14), glassMat);
      flask.position.y = 0.22;

      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.18, 12), glassMat);
      neck.position.y = 0.48;

      const fluid = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.24, 14), acidMat);
      fluid.position.y = 0.12;

      group.add(flask, neck, fluid);
      break;
    }

    case 'burnt_pcb_ewaste': {
      // Green electronic circuit board with chips and capacitors
      const pcbMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.6 });
      const chipMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });

      const board = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.03, 0.38), pcbMat);
      board.position.y = 0.02;

      const mainCpu = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.16), chipMat);
      mainCpu.position.set(-0.08, 0.05, -0.05);

      const ramChip = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.07), chipMat);
      ramChip.position.set(0.08, 0.04, 0.10);

      const heatSink = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.12), goldMat);
      heatSink.position.set(0.12, 0.06, -0.08);

      group.add(board, mainCpu, ramChip, heatSink);
      group.rotation.y = 0.5;
      break;
    }

    // ------------------------------------------------------------------------
    // NIVEL 5: BATALLA FINAL EN EL EPICENTRO (NÚCLEOS Y PURIFICACIÓN)
    // ------------------------------------------------------------------------
    case 'pulsing_toxic_core': {
      // Pulsating mutagen crystal core
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        emissive: 0x15803d,
        emissiveIntensity: 0.9,
        roughness: 0.2,
      });
      const rockMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 });

      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), coreMat);
      crystal.position.y = 0.35;

      const baseRock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.36, 0), rockMat);
      baseRock.position.y = 0.16;
      baseRock.scale.set(1.2, 0.5, 1.2);

      group.add(crystal, baseRock);
      break;
    }

    case 'radioactive_fuel_cell': {
      // Heavy metal lead canister with neon green glowing slits
      const leadMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.4 });
      const glowMat = new THREE.MeshStandardMaterial({
        color: 0x84cc16,
        emissive: 0x65a30d,
        emissiveIntensity: 0.8,
      });

      const canister = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.60, 16), leadMat);
      canister.position.y = 0.30;

      const windowSlot = new THREE.Mesh(new THREE.CylinderGeometry(0.225, 0.225, 0.15, 16), glowMat);
      windowSlot.position.y = 0.30;

      group.add(canister, windowSlot);
      break;
    }

    case 'mutated_sludge_bag': {
      // Living sludge sack with toxic green veins
      const bagMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.6,
      });
      const veinMat = new THREE.MeshStandardMaterial({
        color: 0x4ade80,
        emissive: 0x22c55e,
        emissiveIntensity: 0.6,
      });

      const blob = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38, 1), bagMat);
      blob.position.y = 0.28;
      blob.scale.set(1.1, 0.8, 1.2);

      const vein = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.05, 8, 16), veinMat);
      vein.position.y = 0.30;
      vein.rotation.x = Math.PI / 3;

      group.add(blob, vein);
      break;
    }

    case 'clean_air_canister': {
      // High-tech white & cyan oxygen canister (Power-up)
      const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
      const cyanMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x0891b2,
        emissiveIntensity: 0.8,
        roughness: 0.2,
      });

      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.52, 14), whiteMat);
      body.position.y = 0.28;

      const ledRing = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.185, 0.08, 14), cyanMat);
      ledRing.position.y = 0.32;

      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.14, 12), cyanMat);
      cap.position.y = 0.58;

      group.add(body, ledRing, cap);
      break;
    }

    case 'crystal_purifier_capsule': {
      // Floating glowing emerald/cyan crystal
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.9,
        transparent: true,
        opacity: 0.85,
        roughness: 0.1,
      });
      const prism = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), crystalMat);
      prism.position.y = 0.35;
      group.add(prism);
      break;
    }

    default: {
      // Fallback neat box
      const defaultMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.3, 0.3),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8 })
      );
      defaultMesh.position.y = 0.15;
      group.add(defaultMesh);
      break;
    }
  }

  // Position on street
  group.position.set(item.x, item.y, item.z);
  return group;
}
