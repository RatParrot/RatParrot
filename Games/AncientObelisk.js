let scene = new THREE.Scene();
scene.background = new THREE.Color(0x4a7cff);

let camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.y = 5;

let renderer = new THREE.WebGLRenderer({ antialias:false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(0.75);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.7));
let sun = new THREE.DirectionalLight(0xffffff, 0.6);
sun.position.set(50,100,50);
scene.add(sun);

let size = 200;
let segments = 64;
let geo = new THREE.PlaneGeometry(size, size, segments, segments);
geo.rotateX(-Math.PI / 2);

let pos = geo.attributes.position;
for (let i = 0; i < pos.count; i++) {
  let x = pos.getX(i);
  let z = pos.getZ(i);
  let y = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 4 + Math.random() * 0.5;
  pos.setY(i, y);
}
geo.computeVertexNormals();

let mat = new THREE.MeshStandardMaterial({
  color: 0xf4a460,
  flatShading: true
});
let ground = new THREE.Mesh(geo, mat);
scene.add(ground);

let yaw = 0, pitch = 0;
let keys = {};

document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

document.body.requestPointerLock =
  document.body.requestPointerLock ||
  document.body.mozRequestPointerLock;

document.body.onclick = () => document.body.requestPointerLock();

document.addEventListener("mousemove", e => {
  if (document.pointerLockElement !== document.body) return;
  yaw -= e.movementX * 0.002;
  pitch -= e.movementY * 0.002;
  pitch = Math.max(-1.5, Math.min(1.5, pitch));
  camera.rotation.set(pitch, yaw, 0);
});

let clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  let dt = clock.getDelta();
  let speed = 30 * dt;

  let dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  dir.y = 0;
  dir.normalize();

  let right = new THREE.Vector3().crossVectors(dir, camera.up);

  if (keys["KeyW"]) camera.position.addScaledVector(dir, speed);
  if (keys["KeyS"]) camera.position.addScaledVector(dir, -speed);
  if (keys["KeyA"]) camera.position.addScaledVector(right, speed);
  if (keys["KeyD"]) camera.position.addScaledVector(right, -speed);

  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
