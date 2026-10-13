import * as THREE from 'three';
import { TrashModelType } from '../../types/game';

/**
 * Creates high-fidelity realistic 3D meshes for City Basura waste items.
 */
export function createRealisticTrashMesh(modelType: TrashModelType): THREE.Group {
  const group = new THREE.Group();

  switch (modelType) {
    case 'crushed_plastic_bottle': {
      // Body (translucent ribbed bottle with crushed dent)
      const bottleMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.75,
        roughness: 0.15,
        transmission: 0.6,
        thickness: 0.4,
      });

      const bodyGeo = new THREE.CylinderGeometry(0.18, 0.2, 0.65, 12);
      // Add a crumpled dent to vertices
      const pos = bodyGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        if (y > -0.1 && y < 0.2) {
          pos.setX(i, pos.getX(i) * 0.75);
          pos.setZ(i, pos.getZ(i) * 0.85);
        }
      }
      bodyGeo.computeVertexNormals();

      const body = new THREE.Mesh(bodyGeo, bottleMat);
      body.castShadow = true;
      group.add(body);

      // Label wrap (white paper brand strip)
      const labelMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 });
      const label = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.22, 12), labelMat);
      label.position.y = 0.02;
      group.add(label);

      // Bottle neck and blue screw cap
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.16, 0.15, 10), bottleMat);
      neck.position.y = 0.38;
      group.add(neck);

      const capMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.4 });
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.08, 10), capMat);
      cap.position.y = 0.47;
      group.add(cap);

      group.rotation.z = Math.PI / 2.2;
      break;
    }

    case 'soda_can': {
      // Aluminum body with red branding
      const canMat = new THREE.MeshStandardMaterial({
        color: 0xdc2626,
        metalness: 0.85,
        roughness: 0.25,
      });
      const bodyGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.48, 14);
      // Slight crumple dent
      const pos = bodyGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        if (Math.abs(y) < 0.15 && pos.getX(i) > 0) {
          pos.setX(i, pos.getX(i) * 0.7);
        }
      }
      bodyGeo.computeVertexNormals();
      const body = new THREE.Mesh(bodyGeo, canMat);
      body.castShadow = true;
      group.add(body);

      // Silver top rim and pull tab
      const silverMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 });
      const topRim = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.2, 0.04, 14), silverMat);
      topRim.position.y = 0.25;
      group.add(topRim);

      const tab = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.01, 0.1), silverMat);
      tab.position.set(0.04, 0.27, 0);
      tab.rotation.y = 0.2;
      group.add(tab);

      group.rotation.x = Math.PI / 2;
      break;
    }

    case 'juice_box': {
      // Tetra Pak carton
      const boxMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.6 });
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.44, 0.2), boxMat);
      box.castShadow = true;
      group.add(box);

      // Straw hole & diagonal plastic straw
      const strawMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
      const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 8), strawMat);
      straw.position.set(0.06, 0.25, 0.04);
      straw.rotation.z = -0.3;
      group.add(straw);

      group.rotation.y = 0.4;
      break;
    }

    case 'snack_wrapper': {
      // Foil shiny wrinkled pouch
      const foilMat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        metalness: 0.85,
        roughness: 0.35,
      });
      const foilGeo = new THREE.BoxGeometry(0.36, 0.06, 0.28);
      const pouch = new THREE.Mesh(foilGeo, foilMat);
      pouch.castShadow = true;
      group.add(pouch);
      break;
    }

    case 'banana_peel': {
      // Organic yellow banana peel with brown tips
      const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 });
      const brownMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });

      // Central stem
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.12, 6), brownMat);
      stem.position.y = 0.12;
      group.add(stem);

      // 3 drooping peel petals
      for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3;
        const petalGeo = new THREE.CylinderGeometry(0.02, 0.08, 0.38, 5);
        const petal = new THREE.Mesh(petalGeo, yellowMat);
        petal.position.set(Math.cos(angle) * 0.16, 0.02, Math.sin(angle) * 0.16);
        petal.rotation.z = Math.cos(angle) * 0.9;
        petal.rotation.x = -Math.sin(angle) * 0.9;
        petal.castShadow = true;
        group.add(petal);

        // Brown tip on peel end
        const tip = new THREE.Mesh(new THREE.SphereGeometry(0.03, 5, 5), brownMat);
        tip.position.set(Math.cos(angle) * 0.32, 0.01, Math.sin(angle) * 0.32);
        group.add(tip);
      }
      break;
    }

    case 'coffee_cup': {
      // White cup with brown heat sleeve & white sipping lid
      const cupMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.13, 0.42, 14), cupMat);
      cup.castShadow = true;
      group.add(cup);

      // Kraft brown insulating sleeve
      const sleeveMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.9 });
      const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.145, 0.22, 14), sleeveMat);
      sleeve.position.y = 0.02;
      group.add(sleeve);

      // White plastic lid
      const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.18, 0.05, 14), cupMat);
      lid.position.y = 0.22;
      group.add(lid);

      group.rotation.z = Math.PI / 2.3;
      break;
    }

    case 'pizza_box': {
      // Corrugated cardboard pizza box with grease stain
      const cardMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 });
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.1, 0.72), cardMat);
      box.castShadow = true;
      group.add(box);

      // Grease spot
      const greaseMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.3 });
      const grease = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.01, 10), greaseMat);
      grease.position.y = 0.055;
      group.add(grease);
      break;
    }

    case 'glass_bottle': {
      // Emerald green glass bottle
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x15803d,
        transparent: true,
        opacity: 0.8,
        roughness: 0.1,
        transmission: 0.75,
        thickness: 0.6,
      });

      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.5, 14), glassMat);
      body.castShadow = true;
      group.add(body);

      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.14, 0.32, 12), glassMat);
      neck.position.y = 0.38;
      group.add(neck);

      const crownCap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.07, 0.04, 10),
        new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8 })
      );
      crownCap.position.y = 0.55;
      group.add(crownCap);

      group.rotation.x = Math.PI / 2;
      break;
    }

    case 'wet_newspaper': {
      // Rolled crumpled newsprint bundle
      const paperMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.95 });
      const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.55, 10), paperMat);
      roll.castShadow = true;
      group.add(roll);

      // Dark printed text lines simulation
      const lineMat = new THREE.MeshBasicMaterial({ color: 0x475569 });
      for (let i = 0; i < 3; i++) {
        const line = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.02, 10), lineMat);
        line.position.y = -0.15 + i * 0.15;
        group.add(line);
      }
      group.rotation.z = Math.PI / 2.1;
      break;
    }

    case 'rusty_tin_can': {
      // Rusty opened food tin can
      const rustMat = new THREE.MeshStandardMaterial({
        color: 0x9a3412,
        roughness: 0.85,
        metalness: 0.4,
      });
      const can = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.38, 12), rustMat);
      can.castShadow = true;
      group.add(can);

      // Peeled circular lid sticking up
      const lidMat = new THREE.MeshStandardMaterial({ color: 0x78350f, metalness: 0.6 });
      const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 10), lidMat);
      lid.position.set(0.08, 0.22, 0);
      lid.rotation.z = 0.7;
      group.add(lid);
      break;
    }

    case 'toxic_barrel': {
      // Industrial chemical drum with yellow hazard rings & glowing green slime
      const drumMat = new THREE.MeshStandardMaterial({
        color: 0xca8a04,
        roughness: 0.5,
        metalness: 0.6,
      });
      const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.9, 14), drumMat);
      drum.castShadow = true;
      group.add(drum);

      // Black hazard warning stripes
      const stripeMat = new THREE.MeshBasicMaterial({ color: 0x18181b });
      const stripe1 = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.39, 0.08, 14), stripeMat);
      stripe1.position.y = 0.22;
      const stripe2 = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.39, 0.08, 14), stripeMat);
      stripe2.position.y = -0.22;
      group.add(stripe1, stripe2);

      // Leaking radioactive green acid slime
      const slimeMat = new THREE.MeshBasicMaterial({ color: 0x4ade80 });
      const slimePuddle = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.52, 0.03, 10), slimeMat);
      slimePuddle.position.y = -0.45;
      group.add(slimePuddle);

      // Toxic vapor point light
      const toxicLight = new THREE.PointLight(0x22c55e, 1.2, 2.5);
      toxicLight.position.set(0, 0.5, 0);
      group.add(toxicLight);
      break;
    }

    case 'alkaline_battery': {
      // Black and gold alkaline battery with corrosion
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.6 });
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.42, 12), bodyMat);
      body.castShadow = true;
      group.add(body);

      // Gold top section
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.2 });
      const goldCap = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.14, 12), goldMat);
      goldCap.position.y = 0.14;
      group.add(goldCap);

      // Positive terminal nub
      const nub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.06, 8),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 })
      );
      nub.position.y = 0.23;
      group.add(nub);

      // White crusty acid corrosion crystals
      const acidMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.9 });
      const crust = new THREE.Mesh(new THREE.DodecahedronGeometry(0.08), acidMat);
      crust.position.set(0.08, -0.18, 0.05);
      group.add(crust);

      group.rotation.z = Math.PI / 2.2;
      break;
    }

    case 'fluorescent_tube': {
      // Long broken glass fluorescent tube with end caps
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xf8fafc,
        transparent: true,
        opacity: 0.7,
        roughness: 0.2,
      });

      const tube1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.45, 10), glassMat);
      tube1.position.x = -0.25;
      tube1.rotation.z = Math.PI / 2;
      tube1.castShadow = true;

      const tube2 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 10), glassMat);
      tube2.position.x = 0.25;
      tube2.rotation.z = Math.PI / 2 + 0.15;
      tube2.castShadow = true;
      group.add(tube1, tube2);

      // Aluminum end caps with dual pins
      const capMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
      const cap1 = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.06, 8), capMat);
      cap1.position.x = -0.48;
      cap1.rotation.z = Math.PI / 2;
      const cap2 = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.06, 8), capMat);
      cap2.position.x = 0.45;
      cap2.rotation.z = Math.PI / 2;
      group.add(cap1, cap2);
      break;
    }

    case 'radioactive_core': {
      // Mutant pulsating dark-matter core of Mr.Basura
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x9333ea,
        roughness: 0.2,
        metalness: 0.7,
      });
      const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35, 1), coreMat);
      core.castShadow = true;
      group.add(core);

      // Embedded toxic slime crystals
      const crystalMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const crystal = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 4), crystalMat);
        crystal.position.set(Math.cos(angle) * 0.32, 0.1, Math.sin(angle) * 0.32);
        crystal.rotation.z = Math.cos(angle) * 0.8;
        crystal.rotation.x = -Math.sin(angle) * 0.8;
        group.add(crystal);
      }

      // Purple/Green aura point light
      const glow = new THREE.PointLight(0xa855f7, 1.8, 3.5);
      glow.position.y = 0.3;
      group.add(glow);
      break;
    }

    case 'garbage_bag':
    default: {
      // Heavy wrinkled black trash bag with tied top
      const bagMat = new THREE.MeshStandardMaterial({
        color: 0x18181b,
        roughness: 0.6,
        metalness: 0.2,
      });
      const bag = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5, 1), bagMat);
      bag.scale.set(1.1, 0.85, 1.05);
      bag.castShadow = true;
      group.add(bag);

      // Tied neck & bunny ears knot
      const knot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), bagMat);
      knot.position.y = 0.45;
      group.add(knot);

      const ear1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.08), bagMat);
      ear1.position.set(0.06, 0.55, 0);
      ear1.rotation.z = -0.3;
      const ear2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.08), bagMat);
      ear2.position.set(-0.06, 0.55, 0);
      ear2.rotation.z = 0.3;
      group.add(ear1, ear2);
      break;
    }
  }

  return group;
}
