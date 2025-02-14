import k from "../kaplayCtx";
import { makeSonic } from "../entities/sonic";
import { makeRing } from "../entities/ring";
import { makeMotoBug } from "../entities/motobug";

export default function game() {
  const citySfx = k.play("city", { volume: 0.2, loop: true });
  k.setGravity(3100);

  const bgPieceWidth = 1920;
  const bgPieces = [
    k.add([k.sprite("chemical-bg"), k.pos(0, 0), k.scale(2), k.opacity(0.8)]),
    k.add([
      k.sprite("chemical-bg"),
      k.pos(bgPieceWidth, 0),
      k.scale(2),
      k.opacity(0.8),
    ]),
  ];

  const platforms = [
    k.add([k.sprite("platforms"), k.pos(0, 450), k.scale(4)]),
    k.add([k.sprite("platforms"), k.pos(348 * 4, 450), k.scale(4)]),
  ];

  const sonicObj = makeSonic(k.vec2(200, 745));
  sonicObj.setControls();
  sonicObj.setEvents();


  const controlsText = k.add([
    k.text("Press Space/Click/Touch to Jump!", {
      font: "mania",
      size: 64,
    }),
    k.anchor("center"),
    k.pos(k.center()),
  ]);

  const dismissControlsAction = k.onButtonPress("jump", () => {
    k.destroy(controlsText), dismissControlsAction.cancel();
  });

  const scoreText = k.add([
    k.text("SCORE: 0", { font: "mania", size: 72 }),
    k.pos(20, 20),
  ]);

  let score = 0;
  let scoreMultipler = 0;

  sonicObj.onCollide("ring", (ring) => {
    k.play("ring", { volume: 0.5 });
    k.destroy(ring);

    score++;
    scoreText.text = `SCORE : ${score}`;
    sonicObj.ringCollectUI.text = "+1";
    k.wait(1, () => {
      sonicObj.ringCollectUI.text = "";
    });
  });

  sonicObj.onCollide("enemy", (enemy) => {
    if (!sonicObj.isGrounded()) {
      k.play("destroy", { volume: 0.5 });
      k.play("hyper-ring", { volume: 0.5 });
      k.destroy(enemy);
      sonicObj.play("jump");
      sonicObj.jump();

      scoreMultipler += 1;
      score += 10 * scoreMultipler;
      scoreText.text = `SCORE : ${score}`;

      if (scoreMultipler === 1) {
        sonicObj.ringCollectUI.text = `+${10 * scoreMultipler}`;
      }
      if (scoreMultipler > 1)
        sonicObj.ringCollectUI.text = `x${scoreMultipler}`;
      k.wait(1, () => {
        sonicObj.ringCollectUI.text = "";
      });
      return;
    }
    k.play("hurt", { volume: 0.5 });
    k.setData("current-score", score);
    k.go("gameover", citySfx);
  });

  let gameSpeed = 300;
  k.loop(1, () => {
    gameSpeed += 50;
  });

  const spawnRing = () => {
    const ring = makeRing(k.vec2(1950, 745));
    ring.onUpdate(() => {
      ring.move(-gameSpeed, 0);
    });
    ring.onExitScreen(() => {
      if (ring.pos.x < 0) k.destroy(ring);
    });

    const waitTime = k.rand(0.5, 3);
    k.wait(waitTime, spawnRing);
  };

  spawnRing();

  const spawnMotoBug = () => {
    const moto = makeMotoBug(k.vec2(1950, 773));
    moto.onUpdate(() => {
      if (gameSpeed < 3000) {
        moto.move(-(gameSpeed + 300), 0);
        return;
      }
    });

    moto.onExitScreen(() => {
      if (moto.pos.x < 0) k.destroy(moto);
    });

    const waitTime = k.rand(0.5, 2.5);

    k.wait(waitTime, spawnMotoBug);
  };

  spawnMotoBug();

  k.add([
    k.rect(1920, 300),
    k.opacity(0),
    k.area(),
    k.pos(0, 832),
    k.body({ isStatic: true }),
    "platform",
  ]);



  k.onUpdate(() => {
    if (sonicObj.isGrounded()) scoreMultipler = 0;

    if (bgPieces[1].pos.x < 0) {
      bgPieces[0].moveTo(bgPieces[1].pos.x + bgPieceWidth * 2, 0);
      bgPieces.push(bgPieces.shift());
    }

    bgPieces[0].move(-100, 0);
    bgPieces[1].moveTo(bgPieces[0].pos.x + bgPieceWidth * 2, 0);

    bgPieces[0].moveTo(bgPieces[0].pos.x, -sonicObj.pos.y / 10 - 50);
    bgPieces[1].moveTo(bgPieces[1].pos.x, -sonicObj.pos.y / 10 - 50);

    if (platforms[1].pos.x < 0) {
      platforms[0].moveTo(platforms[1].pos.x + platforms[1].width * 4, 450);
      platforms.push(platforms.shift());
    }

    platforms[0].move(-gameSpeed, 0);
    platforms[1].moveTo(platforms[0].pos.x + platforms[1].width * 4, 450);
  });
}
