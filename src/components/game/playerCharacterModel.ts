import * as THREE from 'three';
import { Character } from '../../types/game';

export interface PlayerCharacterRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  headGroup: THREE.Group;
  torsoGroup: THREE.Group;
  backpack: THREE.Mesh;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  capVisor: THREE.Mesh;
}

/**
 * Creates a high quality voxel/cartoon 3D character for 2nd and 3rd person views.
 * Customizes clothing, hat, and details based on the selected hero character (Juan, Sofi, etc.).
 */
export function createPlayerCharacterModel(character: Character): PlayerCharacterRig {
  const root = new THREE.Group();
  root.name = 'player_character_rig';

  // Body container for local bobbing
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const mainColorHex = parseInt(character.color.replace('#', '0x'), 16) || 0xff8a3d;
  const darkTrimHex = 0x1f2937;
  const skinToneHex = 0xf5cda7;
  const gloveYellowHex = 0xfacc15;
  const pantsHex = 0x2563eb;
  const shoeWhiteHex = 0xf8fafc;

  // Materials
  const shirtMat = new THREE.MeshLambertMaterial({ color: mainColorHex });
  const trimMat = new THREE.MeshLambertMaterial({ color: darkTrimHex });
  const skinMat = new THREE.MeshLambertMaterial({ color: skinToneHex });
  const gloveMat = new THREE.MeshLambertMaterial({ color: gloveYellowHex });
  const pantsMat = new THREE.MeshLambertMaterial({ color: pantsHex });
  const shoeMat = new THREE.MeshLambertMaterial({ color: shoeWhiteHex });
  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const eyePupilMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
  const reflectiveStripeMat = new THREE.MeshLambertMaterial({ color: 0xa3e635 }); // neon eco green

  // ==========================================
  // 1. TORSO & BACKPACK
  // ==========================================
  const torsoGroup = new THREE.Group();
  torsoGroup.position.y = 1.05; // Center around waist/chest
  bodyGroup.add(torsoGroup);

  // Main Torso (0.5w x 0.65h x 0.32d)
  const torsoGeo = new THREE.BoxGeometry(0.5, 0.62, 0.3);
  const torsoMesh = new THREE.Mesh(torsoGeo, shirtMat);
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;
  torsoGroup.add(torsoMesh);

  // Reflective Safety Harness / Eco Stripe across chest
  const stripeGeo = new THREE.BoxGeometry(0.52, 0.08, 0.32);
  const stripeMesh = new THREE.Mesh(stripeGeo, reflectiveStripeMat);
  stripeMesh.position.y = 0.08;
  torsoGroup.add(stripeMesh);

  // Eco Badge on front left chest
  const badgeGeo = new THREE.BoxGeometry(0.1, 0.1, 0.02);
  const badgeMesh = new THREE.Mesh(badgeGeo, new THREE.MeshLambertMaterial({ color: 0x10b981 }));
  badgeMesh.position.set(-0.14, 0.16, 0.16);
  torsoGroup.add(badgeMesh);

  // Belt / waistband
  const beltGeo = new THREE.BoxGeometry(0.52, 0.08, 0.32);
  const beltMesh = new THREE.Mesh(beltGeo, trimMat);
  beltMesh.position.y = -0.27;
  torsoGroup.add(beltMesh);

  // Eco-Recycling Backpack (stores the 16 slots!) on the back (-Z)
  const backpackGeo = new THREE.BoxGeometry(0.42, 0.5, 0.22);
  const backpackMat = new THREE.MeshLambertMaterial({ color: 0x059669 });
  const backpack = new THREE.Mesh(backpackGeo, backpackMat);
  backpack.position.set(0, 0.05, -0.22);
  backpack.castShadow = true;
  torsoGroup.add(backpack);

  // Backpack pocket detail & solar eco-pad
  const pocketGeo = new THREE.BoxGeometry(0.32, 0.22, 0.08);
  const pocketMesh = new THREE.Mesh(pocketGeo, new THREE.MeshLambertMaterial({ color: 0x047857 }));
  pocketMesh.position.set(0, -0.08, -0.13);
  backpack.add(pocketMesh);

  // ==========================================
  // 2. HEAD, FACE & CAP
  // ==========================================
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.62, 0);
  bodyGroup.add(headGroup);

  // Head block
  const headGeo = new THREE.BoxGeometry(0.42, 0.42, 0.4);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Hair / Sideburns
  const hairGeo = new THREE.BoxGeometry(0.44, 0.16, 0.42);
  const hairMat = new THREE.MeshLambertMaterial({ color: 0x451a03 });
  const hairMesh = new THREE.Mesh(hairGeo, hairMat);
  hairMesh.position.set(0, 0.14, -0.02);
  headGroup.add(hairMesh);

  // Big friendly cartoon eyes on front (+Z)
  // Left eye
  const eyeWhiteGeo = new THREE.BoxGeometry(0.09, 0.1, 0.02);
  const leftEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
  leftEyeWhite.position.set(-0.11, 0.02, 0.21);
  headGroup.add(leftEyeWhite);

  const pupilGeo = new THREE.BoxGeometry(0.05, 0.06, 0.02);
  const leftPupil = new THREE.Mesh(pupilGeo, eyePupilMat);
  leftPupil.position.set(-0.11, 0.02, 0.22);
  headGroup.add(leftPupil);

  // Right eye
  const rightEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
  rightEyeWhite.position.set(0.11, 0.02, 0.21);
  headGroup.add(rightEyeWhite);

  const rightPupil = new THREE.Mesh(pupilGeo, eyePupilMat);
  rightPupil.position.set(0.11, 0.02, 0.22);
  headGroup.add(rightPupil);

  // Cheerful smile
  const mouthGeo = new THREE.BoxGeometry(0.12, 0.03, 0.02);
  const mouthMesh = new THREE.Mesh(mouthGeo, new THREE.MeshBasicMaterial({ color: 0x991b1b }));
  mouthMesh.position.set(0, -0.12, 0.21);
  headGroup.add(mouthMesh);

  // Cap / Hat (Hero color)
  const capCrownGeo = new THREE.BoxGeometry(0.44, 0.18, 0.44);
  const capCrown = new THREE.Mesh(capCrownGeo, shirtMat);
  capCrown.position.set(0, 0.22, 0);
  headGroup.add(capCrown);

  // Cap Visor sticking forward (+Z)
  const visorGeo = new THREE.BoxGeometry(0.42, 0.04, 0.18);
  const capVisor = new THREE.Mesh(visorGeo, shirtMat);
  capVisor.position.set(0, 0.15, 0.26);
  headGroup.add(capVisor);

  // ==========================================
  // 3. ARMS WITH PROTECTIVE SANITATION GLOVES
  // ==========================================
  // Helper to build articulated arm with yellow sanitation glove
  const buildArm = (isLeft: boolean) => {
    const shoulderPivot = new THREE.Group();
    const xOffset = isLeft ? -0.34 : 0.34;
    shoulderPivot.position.set(xOffset, 1.3, 0);

    // Upper arm (sleeve matching shirt color)
    const upperArmGeo = new THREE.BoxGeometry(0.16, 0.26, 0.16);
    const upperArm = new THREE.Mesh(upperArmGeo, shirtMat);
    upperArm.position.y = -0.13;
    shoulderPivot.add(upperArm);

    // Forearm / Wrist
    const forearmGeo = new THREE.BoxGeometry(0.14, 0.24, 0.14);
    const forearm = new THREE.Mesh(forearmGeo, skinMat);
    forearm.position.y = -0.36;
    shoulderPivot.add(forearm);

    // Heavy-duty Yellow Rubber Sanitation Glove
    const gloveGeo = new THREE.BoxGeometry(0.16, 0.18, 0.16);
    const glove = new THREE.Mesh(gloveGeo, gloveMat);
    glove.position.y = -0.48;
    glove.castShadow = true;
    shoulderPivot.add(glove);

    // Thumb & fingers voxel block
    const fingersGeo = new THREE.BoxGeometry(0.14, 0.08, 0.12);
    const fingers = new THREE.Mesh(fingersGeo, gloveMat);
    fingers.position.set(0, -0.58, 0.02);
    shoulderPivot.add(fingers);

    return shoulderPivot;
  };

  const leftArm = buildArm(true);
  const rightArm = buildArm(false);
  bodyGroup.add(leftArm);
  bodyGroup.add(rightArm);

  // ==========================================
  // 4. LEGS & SNEAKERS
  // ==========================================
  const buildLeg = (isLeft: boolean) => {
    const hipPivot = new THREE.Group();
    const xOffset = isLeft ? -0.14 : 0.14;
    hipPivot.position.set(xOffset, 0.75, 0);

    // Pants/Leg (0.18w x 0.52h x 0.18d)
    const legGeo = new THREE.BoxGeometry(0.18, 0.52, 0.18);
    const leg = new THREE.Mesh(legGeo, pantsMat);
    leg.position.y = -0.26;
    leg.castShadow = true;
    hipPivot.add(leg);

    // Sneaker / Shoe (extends slightly forward +Z)
    const shoeGeo = new THREE.BoxGeometry(0.19, 0.14, 0.26);
    const shoe = new THREE.Mesh(shoeGeo, shoeMat);
    shoe.position.set(0, -0.55, 0.04);
    shoe.castShadow = true;
    hipPivot.add(shoe);

    // Sneaker colored sole stripe matching character color
    const soleGeo = new THREE.BoxGeometry(0.19, 0.04, 0.26);
    const sole = new THREE.Mesh(soleGeo, shirtMat);
    sole.position.set(0, -0.61, 0.04);
    hipPivot.add(sole);

    return hipPivot;
  };

  const leftLeg = buildLeg(true);
  const rightLeg = buildLeg(false);
  bodyGroup.add(leftLeg);
  bodyGroup.add(rightLeg);

  return {
    root,
    bodyGroup,
    headGroup,
    torsoGroup,
    backpack,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    capVisor,
  };
}

/**
 * Updates full 3D body animations for walking, grabbing, and idle swaying.
 */
export function updatePlayerCharacterAnimation(
  rig: PlayerCharacterRig,
  delta: number,
  isWalking: boolean,
  walkCycle: number,
  isGrabbing: boolean,
  grabProgress: number = 0
) {
  if (isWalking) {
    const legSwing = Math.sin(walkCycle) * 0.65;
    const armSwing = Math.sin(walkCycle) * 0.5;

    rig.leftLeg.rotation.x = legSwing;
    rig.rightLeg.rotation.x = -legSwing;

    rig.leftArm.rotation.x = -armSwing;
    // Right arm swings unless player is currently reaching/grabbing
    if (!isGrabbing) {
      rig.rightArm.rotation.x = armSwing;
      rig.rightArm.rotation.z = 0;
    }

    // Walking vertical bobbing
    rig.bodyGroup.position.y = Math.abs(Math.sin(walkCycle * 2)) * 0.05;
    rig.headGroup.rotation.y = Math.sin(walkCycle) * 0.04;
  } else {
    // Idle stance: relax legs and smooth idle breathing
    rig.leftLeg.rotation.x = THREE.MathUtils.lerp(rig.leftLeg.rotation.x, 0, 0.2);
    rig.rightLeg.rotation.x = THREE.MathUtils.lerp(rig.rightLeg.rotation.x, 0, 0.2);

    const breath = Math.sin(walkCycle * 0.8) * 0.03;
    rig.bodyGroup.position.y = breath;
    rig.headGroup.rotation.y = THREE.MathUtils.lerp(rig.headGroup.rotation.y, 0, 0.1);

    rig.leftArm.rotation.x = THREE.MathUtils.lerp(rig.leftArm.rotation.x, 0.08 + breath, 0.2);
    if (!isGrabbing) {
      rig.rightArm.rotation.x = THREE.MathUtils.lerp(rig.rightArm.rotation.x, 0.08 + breath, 0.2);
      rig.rightArm.rotation.z = THREE.MathUtils.lerp(rig.rightArm.rotation.z, -0.05, 0.2);
    }
  }

  // Active trash collection reaching animation
  if (isGrabbing) {
    // Reach down & forward with right arm to pick up waste
    const reachCurve = Math.sin(Math.min(1, Math.max(0, grabProgress)) * Math.PI);
    rig.rightArm.rotation.x = -0.95 * reachCurve;
    rig.rightArm.rotation.z = 0.25 * reachCurve;
  }
}
