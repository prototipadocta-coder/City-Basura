import * as THREE from 'three';

export interface FingerJoints {
  mcp: THREE.Group; // Knuckle pivot
  pip: THREE.Group; // Middle joint pivot
  dip: THREE.Group; // Tip joint pivot
  tipMesh: THREE.Mesh;
}

export interface ThumbJoints {
  cmc: THREE.Group; // Base thenar pivot
  mcp: THREE.Group; // Middle thumb joint
  dip: THREE.Group; // Tip thumb joint
  tipMesh: THREE.Mesh;
}

export interface PlayerHandRig {
  armRoot: THREE.Group;
  forearmGroup: THREE.Group;
  sleeveMesh: THREE.Mesh;
  gloveGauntlet: THREE.Mesh;
  palmGroup: THREE.Group;
  fingers: {
    index: FingerJoints;
    middle: FingerJoints;
    ring: FingerJoints;
    pinky: FingerJoints;
  };
  thumb: ThumbJoints;
  grabT: number;
  isGrabbing: boolean;
  heldObjectGroup: THREE.Group;
}

/**
 * Generates an ultra-crisp procedural canvas texture for realistic sanitation/nitrile gloves.
 * Includes non-slip micro-grip diamond textures for the palm & fingertips,
 * plus flex crease lines around knuckles and wrist.
 */
function createGloveTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base bright sanitation yellow
  ctx.fillStyle = '#facc15';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle latex micro-noise
  for (let y = 0; y < 512; y += 4) {
    for (let x = 0; x < 512; x += 4) {
      if ((x + y) % 8 === 0) {
        ctx.fillStyle = 'rgba(234, 179, 8, 0.22)';
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }

  // Non-slip diamond grip pattern on palm section
  ctx.strokeStyle = 'rgba(202, 138, 4, 0.4)';
  ctx.lineWidth = 1.5;
  const step = 16;
  for (let x = -512; x < 1024; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 512, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, 512);
    ctx.lineTo(x + 512, 0);
    ctx.stroke();
  }

  // Knuckle & flex fold horizontal lines
  ctx.fillStyle = 'rgba(161, 98, 7, 0.35)';
  for (let f = 120; f <= 380; f += 45) {
    ctx.fillRect(30, f, 450, 4);
    ctx.fillRect(45, f + 7, 420, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates an anatomically realistic 3D human hand model wearing a professional
 * heavy-duty protective eco-sanitation rubber glove (guante de caucho/nitrilo de alta resistencia).
 *
 * Features:
 * - Natural anatomical forearm with cloth sleeve and rolled fabric cuff hem
 * - Characteristic thick rolled bead cuff rim of the rubber glove
 * - Sculpted palm with thenar eminence (fleshy thumb base), hypothenar eminence and knuckle arches
 * - 5 fully articulated realistic digits (Thumb + Index, Middle, Ring, Pinky)
 * - 3 hierarchical phalanx joints per finger (MCP, PIP, DIP) that curl naturally during grab
 * - Realistic grip texture and rubber material shaders
 */
export function createPlayerHandModel(
  characterColorHex: string = '#FF8A3D',
  quality: 'alta' | 'media' | 'baja' = 'alta'
): PlayerHandRig {
  const armRoot = new THREE.Group();
  armRoot.name = 'realistic_player_arm_root';

  const isHigh = quality === 'alta';
  const gloveTex = createGloveTexture();

  // 1. CHARACTER JACKET SLEEVE (Upper Forearm)
  const sleeveColor = new THREE.Color(characterColorHex);
  const sleeveMat = new THREE.MeshStandardMaterial({
    color: sleeveColor,
    roughness: 0.82,
    metalness: 0.04,
  });

  const sleeveGroup = new THREE.Group();
  sleeveGroup.position.set(0, -0.22, -0.42);
  armRoot.add(sleeveGroup);

  // Anatomical tapered arm sleeve
  const sleeveGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.68, isHigh ? 16 : 10);
  const sleeveMesh = new THREE.Mesh(sleeveGeo, sleeveMat);
  sleeveMesh.rotation.x = 0.22; // Natural arm angle towards center
  sleeveMesh.castShadow = isHigh;
  sleeveGroup.add(sleeveMesh);

  // Rolled fabric cuff band (dobladillo de la manga)
  const cuffMat = new THREE.MeshStandardMaterial({
    color: sleeveColor.clone().multiplyScalar(0.72),
    roughness: 0.88,
  });
  const cuffRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.25, 0.05, 8, isHigh ? 16 : 10),
    cuffMat
  );
  cuffRing.rotation.x = Math.PI / 2 + 0.22;
  cuffRing.position.set(0, -0.32, 0.08);
  sleeveGroup.add(cuffRing);

  // Forearm group containing the glove gauntlet and hand
  const forearmGroup = new THREE.Group();
  forearmGroup.position.set(0, -0.48, -0.34);
  armRoot.add(forearmGroup);

  // 2. REALISTIC RUBBER SANITATION GLOVE MATERIALS
  const gloveColor = new THREE.Color(0xfacc15); // Canary yellow
  const gloveMat = new THREE.MeshStandardMaterial({
    color: gloveColor,
    roughness: 0.28,
    metalness: 0.06,
    map: gloveTex,
  });

  // Darker reinforced rubber material for grip pads & knuckles
  const gripAccentMat = new THREE.MeshStandardMaterial({
    color: 0xca8a04,
    roughness: 0.42,
    metalness: 0.03,
  });

  // A. Characteristic rolled rubber bead collar (el reborde tubular del guante)
  const gloveBead = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.035, 8, isHigh ? 18 : 12),
    gloveMat
  );
  gloveBead.rotation.x = Math.PI / 2;
  gloveBead.position.set(0, 0.08, 0);
  forearmGroup.add(gloveBead);

  // B. Forearm gauntlet sleeve of the rubber glove
  const gauntletGeo = new THREE.CylinderGeometry(0.20, 0.22, 0.26, isHigh ? 16 : 10);
  const gloveGauntlet = new THREE.Mesh(gauntletGeo, gloveMat);
  gloveGauntlet.position.set(0, -0.05, 0);
  gloveGauntlet.castShadow = isHigh;
  forearmGroup.add(gloveGauntlet);

  // C. Anatomical wrist transition (elliptical cross section)
  const wristGeo = new THREE.CylinderGeometry(0.17, 0.19, 0.16, isHigh ? 14 : 8);
  wristGeo.scale(1.15, 1, 0.82); // Wider horizontally than vertically
  const wristMesh = new THREE.Mesh(wristGeo, gloveMat);
  wristMesh.position.set(0, -0.22, 0.02);
  forearmGroup.add(wristMesh);

  // 3. PALM & DORSUM OF THE HAND (Metacarpal region)
  const palmGroup = new THREE.Group();
  palmGroup.position.set(0, -0.36, 0.04);
  palmGroup.rotation.x = -0.15; // Natural resting wrist tilt
  forearmGroup.add(palmGroup);

  // Central palm body with sculpted thickness
  const palmGeo = new THREE.BoxGeometry(0.32, 0.36, 0.16);
  const palmMesh = new THREE.Mesh(palmGeo, gloveMat);
  palmMesh.position.set(0, -0.12, 0);
  palmMesh.castShadow = isHigh;
  palmGroup.add(palmMesh);

  // Thenar Eminence (Fleshy muscular mound at the base of the thumb)
  const thenarGeo = new THREE.SphereGeometry(0.11, 10, 8);
  thenarGeo.scale(1.1, 1.4, 0.85);
  const thenarMesh = new THREE.Mesh(thenarGeo, gloveMat);
  thenarMesh.position.set(-0.12, -0.11, -0.04);
  palmGroup.add(thenarMesh);

  // Hypothenar Eminence (Fleshy pad on the pinky side)
  const hypothenarGeo = new THREE.SphereGeometry(0.09, 8, 8);
  hypothenarGeo.scale(0.9, 1.3, 0.8);
  const hypothenarMesh = new THREE.Mesh(hypothenarGeo, gloveMat);
  hypothenarMesh.position.set(0.12, -0.14, -0.03);
  palmGroup.add(hypothenarMesh);

  // Knuckle Arch (4 distinct rounded MCP knuckle mounds on back of hand)
  const knuckleOffsets = [-0.105, -0.035, 0.035, 0.105];
  knuckleOffsets.forEach((xOff) => {
    const knuckleMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.042, 8, 6),
      gloveMat
    );
    knuckleMesh.position.set(xOff, -0.29, 0.065);
    palmGroup.add(knuckleMesh);
  });

  // Eco-sanitation leaf badge on back of hand
  const ecoBadgeMat = new THREE.MeshBasicMaterial({ color: 0x16a34a });
  const ecoBadge = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.11), ecoBadgeMat);
  ecoBadge.position.set(0, -0.12, 0.082);
  ecoBadge.rotation.y = Math.PI;
  palmGroup.add(ecoBadge);

  // Non-slip rubber ribbed strips on the palm surface
  for (let r = 0; r < 4; r++) {
    const rib = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.024, 0.016),
      gripAccentMat
    );
    rib.position.set(0, -0.06 - r * 0.055, -0.082);
    palmGroup.add(rib);
  }

  // 4. FIVE ANATOMICALLY ARTICULATED DIGITS (Dedos con articulaciones reales)
  function buildArticulatedFinger(
    baseX: number,
    baseY: number,
    baseZ: number,
    proximalLen: number,
    intermediateLen: number,
    distalLen: number,
    radius: number,
    restingCurl: number
  ): FingerJoints {
    // A. MCP (Knuckle) Joint Pivot
    const mcp = new THREE.Group();
    mcp.position.set(baseX, baseY, baseZ);
    mcp.rotation.x = restingCurl;
    palmGroup.add(mcp);

    // Proximal Phalanx Mesh
    const pGeo = new THREE.CylinderGeometry(radius, radius * 1.05, proximalLen, isHigh ? 10 : 6);
    const pMesh = new THREE.Mesh(pGeo, gloveMat);
    pMesh.position.set(0, -proximalLen * 0.5, 0);
    pMesh.castShadow = isHigh;
    mcp.add(pMesh);

    // B. PIP (Middle) Joint Pivot
    const pip = new THREE.Group();
    pip.position.set(0, -proximalLen, 0);
    pip.rotation.x = restingCurl * 0.8;
    mcp.add(pip);

    // Intermediate Phalanx Mesh
    const iGeo = new THREE.CylinderGeometry(radius * 0.92, radius, intermediateLen, isHigh ? 10 : 6);
    const iMesh = new THREE.Mesh(iGeo, gloveMat);
    iMesh.position.set(0, -intermediateLen * 0.5, 0);
    iMesh.castShadow = isHigh;
    pip.add(iMesh);

    // C. DIP (Tip) Joint Pivot
    const dip = new THREE.Group();
    dip.position.set(0, -intermediateLen, 0);
    dip.rotation.x = restingCurl * 0.6;
    pip.add(dip);

    // Distal Phalanx with rounded fingertip pad
    const dGeo = new THREE.CylinderGeometry(radius * 0.82, radius * 0.92, distalLen, isHigh ? 10 : 6);
    const dMesh = new THREE.Mesh(dGeo, gloveMat);
    dMesh.position.set(0, -distalLen * 0.5, 0);
    dip.add(dMesh);

    // Rounded rubber fingertip with reinforced grip pad
    const tipPadGeo = new THREE.SphereGeometry(radius * 0.84, 8, 6);
    tipPadGeo.scale(1, 0.9, 1.15);
    const tipMesh = new THREE.Mesh(tipPadGeo, gripAccentMat);
    tipMesh.position.set(0, -distalLen, -0.01);
    dip.add(tipMesh);

    return { mcp, pip, dip, tipMesh };
  }

  // Build the 4 fingers with true anatomical length proportions
  // Middle is longest, Index & Ring are medium, Pinky is shortest
  const index = buildArticulatedFinger(-0.105, -0.30, 0.02, 0.16, 0.12, 0.10, 0.038, 0.22);
  const middle = buildArticulatedFinger(-0.035, -0.31, 0.03, 0.18, 0.14, 0.11, 0.040, 0.26);
  const ring = buildArticulatedFinger(0.035, -0.30, 0.02, 0.165, 0.125, 0.10, 0.038, 0.32);
  const pinky = buildArticulatedFinger(0.105, -0.28, 0.01, 0.13, 0.095, 0.085, 0.034, 0.40);

  // Natural inward splay of fingers
  index.mcp.rotation.z = 0.04;
  ring.mcp.rotation.z = -0.04;
  pinky.mcp.rotation.z = -0.09;

  // 5. ARTICULATED OPPOSABLE THUMB (Pulgar articulado con rotación natural)
  const cmc = new THREE.Group();
  cmc.position.set(-0.15, -0.13, -0.04);
  cmc.rotation.set(-0.35, 0.45, -0.55); // Rotated outward and forward for opposition
  palmGroup.add(cmc);

  const thumbMetacarpal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.048, 0.055, 0.14, isHigh ? 10 : 6),
    gloveMat
  );
  thumbMetacarpal.position.set(0, -0.07, 0);
  cmc.add(thumbMetacarpal);

  // Thumb MCP
  const thumbMcp = new THREE.Group();
  thumbMcp.position.set(0, -0.14, 0);
  thumbMcp.rotation.x = 0.25;
  cmc.add(thumbMcp);

  const thumbProximal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.044, 0.048, 0.13, isHigh ? 10 : 6),
    gloveMat
  );
  thumbProximal.position.set(0, -0.065, 0);
  thumbMcp.add(thumbProximal);

  // Thumb DIP
  const thumbDip = new THREE.Group();
  thumbDip.position.set(0, -0.13, 0);
  thumbDip.rotation.x = 0.35;
  thumbMcp.add(thumbDip);

  const thumbTipGeo = new THREE.SphereGeometry(0.046, 8, 6);
  thumbTipGeo.scale(1.1, 1.4, 0.95);
  const thumbTip = new THREE.Mesh(thumbTipGeo, gripAccentMat);
  thumbTip.position.set(0, -0.065, -0.01);
  thumbDip.add(thumbTip);

  // Dedicated container for held object during grab
  const heldObjectGroup = new THREE.Group();
  heldObjectGroup.position.set(0, -0.32, -0.12);
  palmGroup.add(heldObjectGroup);

  // Initial resting camera-relative position in lower right viewport
  armRoot.position.set(0.60, -0.42, -0.85);
  armRoot.rotation.set(-0.16, 0.14, 0.07);

  return {
    armRoot,
    forearmGroup,
    sleeveMesh,
    gloveGauntlet,
    palmGroup,
    fingers: {
      index,
      middle,
      ring,
      pinky,
    },
    thumb: {
      cmc,
      mcp: thumbMcp,
      dip: thumbDip,
      tipMesh: thumbTip,
    },
    grabT: 0,
    isGrabbing: false,
    heldObjectGroup,
  };
}

/**
 * Updates realistic arm posture, breathing, walking bobbing, and full-finger grab action.
 */
export function updatePlayerArmAnimation(
  rig: PlayerHandRig,
  delta: number,
  isWalking: boolean,
  walkCycle: number,
  onGrabPeak?: () => void
): void {
  // 1. Natural Walk Bobbing & Idle Breathing
  const idleBob = Math.sin(walkCycle * 0.6) * 0.012;
  const walkBobY = isWalking ? Math.sin(walkCycle) * 0.038 : idleBob;
  const walkSwayX = isWalking ? Math.cos(walkCycle * 0.5) * 0.026 : Math.cos(walkCycle * 0.3) * 0.007;

  const baseRestX = 0.60;
  const baseRestY = -0.42;
  const baseRestZ = -0.85;

  const baseFingers = [
    { finger: rig.fingers.index, curl: 0.22 },
    { finger: rig.fingers.middle, curl: 0.26 },
    { finger: rig.fingers.ring, curl: 0.32 },
    { finger: rig.fingers.pinky, curl: 0.40 },
  ];

  if (rig.isGrabbing) {
    rig.grabT += delta * 4.4; // Responsive ~0.23 second full reach-grab-retrieve cycle

    if (rig.grabT >= 1.0) {
      rig.isGrabbing = false;
      rig.grabT = 0;
      // Reset fingers to natural resting curl
      baseFingers.forEach(({ finger, curl }) => {
        finger.mcp.rotation.x = curl;
        finger.pip.rotation.x = curl * 0.8;
        finger.dip.rotation.x = curl * 0.6;
      });
      rig.thumb.cmc.rotation.x = -0.35;
      rig.thumb.mcp.rotation.x = 0.25;
      rig.thumb.dip.rotation.x = 0.35;
    } else {
      const t = rig.grabT;

      // Phase 1: Reach forward & downward, fingers open wide (0 -> 0.42)
      if (t < 0.42) {
        const reachP = Math.sin((t / 0.42) * (Math.PI / 2));

        rig.armRoot.position.x = baseRestX - 0.30 * reachP;
        rig.armRoot.position.y = baseRestY - 0.34 * reachP;
        rig.armRoot.position.z = baseRestZ - 0.52 * reachP;

        rig.armRoot.rotation.x = -0.16 - 0.72 * reachP;
        rig.armRoot.rotation.y = 0.14 - 0.28 * reachP;
        rig.armRoot.rotation.z = 0.07 - 0.18 * reachP;

        // Open fingers wide ready to clasp the object
        baseFingers.forEach(({ finger }) => {
          finger.mcp.rotation.x = -0.25 * reachP;
          finger.pip.rotation.x = -0.15 * reachP;
          finger.dip.rotation.x = -0.10 * reachP;
        });

        // Open thumb
        rig.thumb.cmc.rotation.y = 0.45 + 0.35 * reachP;
        rig.thumb.mcp.rotation.x = 0.10;
      }
      // Phase 2: Grab Contact Peak - Fingers curl tightly around waste (0.42 -> 0.66)
      else if (t < 0.66) {
        const clenchP = (t - 0.42) / 0.24;

        rig.armRoot.position.x = baseRestX - 0.30 + 0.05 * clenchP;
        rig.armRoot.position.y = baseRestY - 0.34 + 0.14 * clenchP;
        rig.armRoot.position.z = baseRestZ - 0.52 + 0.16 * clenchP;

        rig.armRoot.rotation.x = -0.88 + 0.26 * clenchP;

        // Tight anatomical grip: all 3 joints curl tightly around the item
        baseFingers.forEach(({ finger }) => {
          finger.mcp.rotation.x = THREE.MathUtils.lerp(-0.25, 0.95, clenchP);
          finger.pip.rotation.x = THREE.MathUtils.lerp(-0.15, 1.15, clenchP);
          finger.dip.rotation.x = THREE.MathUtils.lerp(-0.10, 0.85, clenchP);
        });

        // Opposable thumb clamps down tightly
        rig.thumb.cmc.rotation.y = THREE.MathUtils.lerp(0.80, 0.25, clenchP);
        rig.thumb.mcp.rotation.x = THREE.MathUtils.lerp(0.10, 0.85, clenchP);
        rig.thumb.dip.rotation.x = THREE.MathUtils.lerp(0.35, 1.10, clenchP);

        if (clenchP > 0.45 && onGrabPeak) {
          onGrabPeak();
        }
      }
      // Phase 3: Smooth Retraction back to first-person rest posture (0.66 -> 1.0)
      else {
        const retractP = (t - 0.66) / 0.34;
        const easeRetract = 1 - Math.cos(retractP * (Math.PI / 2));

        rig.armRoot.position.x = THREE.MathUtils.lerp(baseRestX - 0.25, baseRestX, easeRetract);
        rig.armRoot.position.y = THREE.MathUtils.lerp(baseRestY - 0.20, baseRestY, easeRetract);
        rig.armRoot.position.z = THREE.MathUtils.lerp(baseRestZ - 0.36, baseRestZ, easeRetract);

        rig.armRoot.rotation.x = THREE.MathUtils.lerp(-0.62, -0.16, easeRetract);
        rig.armRoot.rotation.y = THREE.MathUtils.lerp(-0.14, 0.14, easeRetract);
        rig.armRoot.rotation.z = THREE.MathUtils.lerp(-0.11, 0.07, easeRetract);

        // Relax fingers back to comfortable resting posture
        baseFingers.forEach(({ finger, curl }) => {
          finger.mcp.rotation.x = THREE.MathUtils.lerp(0.95, curl, easeRetract);
          finger.pip.rotation.x = THREE.MathUtils.lerp(1.15, curl * 0.8, easeRetract);
          finger.dip.rotation.x = THREE.MathUtils.lerp(0.85, curl * 0.6, easeRetract);
        });

        rig.thumb.cmc.rotation.y = THREE.MathUtils.lerp(0.25, 0.45, easeRetract);
        rig.thumb.mcp.rotation.x = THREE.MathUtils.lerp(0.85, 0.25, easeRetract);
        rig.thumb.dip.rotation.x = THREE.MathUtils.lerp(1.10, 0.35, easeRetract);
      }
      return;
    }
  }

  // Normal resting / walking pose
  rig.armRoot.position.set(baseRestX + walkSwayX, baseRestY + walkBobY, baseRestZ);
  rig.armRoot.rotation.set(-0.16 + (isWalking ? Math.sin(walkCycle) * 0.07 : 0), 0.14, 0.07);

  // Subtle breathing flex in fingers at rest
  const breath = Math.sin(walkCycle * 0.5) * 0.03;
  baseFingers.forEach(({ finger, curl }) => {
    finger.mcp.rotation.x = curl + breath;
    finger.pip.rotation.x = curl * 0.8 + breath * 0.7;
    finger.dip.rotation.x = curl * 0.6 + breath * 0.5;
  });
}
