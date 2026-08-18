let scrollY = -200;
let targetScrollY = -200;
const SCROLL_SPEED = 0.5;
const MAX_SCROLL = 1800;
const MIN_SCROLL = -200;
let entered = false;

//butter flies
let inc = 0.3;
let zinc = 0.05;
let butterflies = [];
let flowfield = [];
let centerRadius;
let backCol = 255;
//

async function setup() {
  c = createCanvas(800, 800).parent("canvas");
  pixelDensity(2);

  firstImg = await loadImage("assets/first.webp");
  frontImg = await loadImage("assets/front.webp");
  coverImg = await loadImage("assets/cover.webp");
  doneImg = await loadImage("assets/scrolled.webp");

  imageMode(CENTER);
  rectMode(CENTER);

  //butter flies
  cnv = createGraphics(windowWidth, windowHeight);
  cnv.pixelDensity(0.5);
  cnv.canvas.style.display = "block";
  cnv.canvas.id = "layer";
  cnv.background(20);
  img = await loadImage("assets/img.png");
  imgs = [];
  for (let j = 0; j < 6; j++) {
    for (let i = 0; i < 4; i++) {
      imgs.push(
        img.get(
          (i * img.width) / 4,
          (j * img.height) / 6,
          img.width / 4,
          img.height / 6,
        ),
      );
    }
  }
  // console.log(imgs.length);
  scl = 50;
  cols = floor(cnv.width / scl);
  rows = floor(cnv.height / scl);
  cnv.stroke(255);
  cnv.noFill();
  zoff = 0;
  cnv.imageMode(CENTER);
  for (let i = 0; i < max(cols, rows); i++) {
    butterflies[i] = new Butterfly(
      random(50, cnv.width - 50),
      random(50, cnv.height - 50),
    );
  }
  flowfield = new Array(cols * rows);
  centerRadius = (min(windowWidth, windowHeight) - 200) / 2;
  //

  //
}
function draw() {
  background(255);
  scrollY = lerp(scrollY, targetScrollY, 0.1);
  translate(width / 2, height / 2);

  push();
  if (scrollY < 50) {
    translate(0, map(scrollY, -200, 100, 0, 600));
    scale(1 + map(scrollY, -200, -100, 0, 0.5));
    image(firstImg, 0, 0, 800, 800);
  }
  pop();
  if (scrollY > -100 && scrollY < 50) {
    fill(255, map(scrollY, -100, 50, 0, 255));
    rect(0, 0, 800, 800);
  }

  push();

  if (scrollY > 50 && scrollY < 600) {
    translate(0, map(scrollY, 50, 600, -400, 0));
  }
  if (scrollY > 50) {
    scale(map(scrollY, 50, 600, 4.5, 1));
    image(frontImg, 0, 0, 800, 600);
  }
  if (scrollY > 50 && scrollY < 100) {
    fill(255, map(scrollY, 50, 100, 200, 0));
    rect(0, 0, 800, 800);
  }

  pop();

  fill(255, map(scrollY, 450, 500, 0, 255));
  rect(0, 0, 800, 800);

  push();

  if (scrollY > 500 && scrollY < 1800) {
    scale(map(scrollY, 500, 1800, 1.5, 1));
    image(doneImg, 0, 0, 800, 800);
  }
  if (scrollY > 500 && scrollY < 1800) {
    fill(255, map(scrollY, 500, 1800, 255, 0));
    rect(0, 0, 800, 800);
  }
  pop();

  image(coverImg, 0, 0, 800, 800);

  cnv.fill("green");
  //butter flies
  if (backCol < 0) {
    cnv.clear();
  } else {
    let mouseOver = false;
    if (abs(mouseX - width / 2) < 120 && abs(mouseY - height / 2) < 30) {
      mouseOver = true;
    }

    push();
    cnv.clear();
    cnv.background(20, backCol);
    if (!entered) {
      cnv.rectMode(CENTER);
      cnv.textAlign(CENTER, CENTER);
      cnv.noFill();
      cnv.stroke("#9DBEAA");
      cnv.strokeWeight(4);
      if (mouseOver) cnv.fill("#9DBEAA");
      cnv.rect(cnv.width / 2, cnv.height / 2, 240, 60);
      cnv.textFont("arial");
      cnv.noStroke();
      cnv.fill("#9DBEAA");
      if (mouseOver) cnv.fill("#2b2b2b");
      cnv.textSize(45);
      cnv.text("ENTER", cnv.width / 2, cnv.height / 2);
      pop();
    }

    if (mouseOver && mouseIsPressed) {
      mouseIsPressed = false;
      entered = true;
    }
    if (entered) {
      backCol--;
    }
  }

  let yoff = 0;
  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      // cnv.rect(x*scl,y*scl,scl,scl);
      let v = p5.Vector.fromAngle(noise(xoff, yoff, zoff) * TWO_PI);
      if (dist(x * scl, y * scl, mouseX, mouseY) < scl * 2) {
        let x_ = mouseX - x * scl;
        let y_ = mouseY - y * scl;
        let a = atan2(y_, x_);
        v = p5.Vector.fromAngle(a + PI);
      }
      if (
        dist(x * scl, y * scl, windowWidth / 2, windowHeight / 2) < centerRadius
      ) {
        let x_ = windowWidth / 2 - x * scl;
        let y_ = windowHeight / 2 - y * scl;
        let a = atan2(y_, x_);
        v = p5.Vector.fromAngle(a + PI);
      }
      v.mag(2);
      // cnv.push();
      // cnv.translate(x * scl, y * scl);
      // cnv.rotate(v.heading());
      // cnv.line(0, 0, scl, 0);
      // cnv.pop();
      xoff += inc;
      let index = x + y * cols;
      flowfield[index] = v;
    }
    yoff += inc;
  }
  zoff += zinc;
  for (let b of butterflies) {
    b.update(flowfield);
    b.show();
  }
  //
}

function mouseWheel(event) {
  // event.delta contains the scroll distance and direction
  targetScrollY += event.delta * SCROLL_SPEED;

  // Constrain scrolling within bounds
  targetScrollY = constrain(targetScrollY, MIN_SCROLL, MAX_SCROLL);

  // Return false to prevent standard browser page scrolling
  return false;
}

function Butterfly(x, y) {
  this.pos = createVector(x, y);
  this.vel = createVector(0, 0); //p5.Vector.random2D().mult(10)//createVector(0, 0);
  this.acc = createVector(0, 0);

  this.update = (flo) => {
    this.vel.add(this.acc);
    this.vel.limit(random(3, 9));
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.mult = random(1);
    this.frame = floor(random(25));

    if (this.pos.x > cnv.width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = cnv.width;
    if (this.pos.y > cnv.height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = cnv.height;

    //follow

    let x = floor(this.pos.x / scl);
    let y = floor(this.pos.y / scl);
    let index = x + y * cols;
    let force = flo[index];
    this.applyForce(force);
  };

  this.applyForce = (f) => {
    this.acc.add(f);
  };

  this.show = () => {
    cnv.push();
    cnv.translate(this.pos.x, this.pos.y);
    cnv.rotate(this.vel.heading() + PI / 2);
    cnv.image(imgs[int(frameCount / 10 + this.frame) % 24], 0, 0, 50, 50);
    cnv.pop();
  };
}

function windowResized() {
  cnv.resizeCanvas(windowWidth, windowHeight);
  scl = 50;
  cols = floor(cnv.width / scl);
  rows = floor(cnv.height / scl);
  cnv.stroke(255);
  cnv.noFill();
  zoff = 0;
  cnv.imageMode(CENTER);
  butterflies = [];
  for (let i = 0; i < max(cols, rows); i++) {
    butterflies[i] = new Butterfly(random(cnv.width), random(cnv.height));
  }
  flowfield = [];
  flowfield = new Array(cols * rows);
  centerRadius = (min(windowWidth, windowHeight) - 200) / 2;
}
