import k from "../kaplayCtx";

export function makeHeart(pos) {
  return k.add([
    k.sprite("heart"),
    k.scale(4),
    k.area(),
    k.anchor("center"),
    k.pos(pos),
  ]);
}
