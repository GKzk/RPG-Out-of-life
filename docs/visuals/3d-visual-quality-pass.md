# 3D Visual Quality Pass — implementation notes

## Goal

Improve the existing Three.js isometric sector without changing the RPG rules or replacing the logical tile grid. The visual reference is the broad presentation quality of ATOM RPG, not its assets or exact art direction.

## Implemented in this pass

- Reworked the procedural survivor into a layered low-poly model with body, limbs, boots, headwear, backpack, straps, and equipped weapon/armor color variants.
- Added distinct procedural companion silhouettes for hound, cat, crow, ferret, boar, and no-pet selection.
- Added per-tile visual variation for forest, grass, water, radiation, fences, debris, concrete walls, and bunker gates.
- Added low-poly trees, grass tufts, rubble, exposed rebar, broken wooden beams, and simple ruined-hut silhouettes.
- Added visible POI/enemy markers and a hovered-cell highlight.
- Added a restrained flashlight, ambient dust, orthographic framing, resize observation, and disposal of scene geometry/materials on unmount.
- Changed the viewport label to project-neutral Russian wording instead of presenting the prototype as an ATOM RPG engine.

## Preserved constraints

- The tile grid remains authoritative for movement and interaction.
- Existing callbacks remain responsible for movement and gameplay outcomes.
- No SPECIAL, skill checks, XP, inventory rules, combat formulas, sector IDs, POI IDs, or transitions were intentionally changed.
- The models are procedural prototypes, not final authored GLB/GLTF assets. This pass improves volume and readability but does not yet provide rigged animation, detailed faces, bespoke building interiors, or imported PBR textures.

## Verification checklist

Run from the project root:

1. `npm run lint`
2. `npm test`
3. `npm run build`

Then manually inspect:

- Open the village sector and switch to the Three.js view.
- Move across path, grass, forest, wall, fence, debris, water, and radiation tiles.
- Verify clicks still use the existing tile movement/interactions.
- Move the character and verify the model follows the logical position and changes facing.
- Switch between all pet IDs and verify the model silhouette changes; `none` must hide the companion.
- Equip/unequip weapons and armor and verify the character appearance updates.
- Toggle the flashlight and inspect visibility.
- Resize the viewport and open/close the map repeatedly; check for blank canvases, console errors, or progressive slowdown.
- Verify fog-of-war affects individual tiles rather than unintentionally fading every tile sharing a material.

## Next production step

After this procedural vertical slice passes browser verification, replace the most visible placeholder meshes with licensed or original GLB/GLTF assets, starting with one survivor, one dog, one wooden house, one pine tree, and one concrete bunker module. Keep the current procedural scene as a fallback while imported assets are introduced incrementally.
