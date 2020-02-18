window.onload = function(){
    main();
}

function main() {
  const canvas = document.querySelector('#c');
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  const renderer = new THREE.WebGLRenderer({canvas});

  const fov = 75;
  const aspect = 2;  // the canvas default
  const near = 0.5;
  const far = 10;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  //const camera = new THREE.OrthographicCamera(-3 , 3 , 3 , -3, 2, 5);
  camera.position.z = 3;

  let raycaster = new THREE.Raycaster();
  let mouse = new THREE.Vector2();

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  const boxWidth = 0.2;
  const boxHeight = 0.2;
  const boxDepth = 0.2;

  let cubeArray = [];
  let nasId = 0;

  let cubeIndex = 0;
  let scalingStep = 0.02;
  let selectedObject = null;

  const scene = new THREE.Scene();
  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
    scene.background = new THREE.Color(color);
  }

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );

  function onMouseMove( event ) {
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  }

  function addAllCubes(){
    for(let x = 0; x < 6; x++){
      for(let y = 0; y < 6; y++){
          let cube = new THREE.Mesh(new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth), new THREE.MeshPhongMaterial({color: 0x44aa88}));
          cube.position.x = ((x + x) * 0.2) -1;
          cube.position.y = ((y + y) * 0.2) -1;
          cube.ourID = nasId++;
          addCube(cube, x);
      }
    }
  }

  function addCube(cube, x){
    if(x%2 == 0){
      cubeArray.push(cube);
    }else{
      cube.position.y *= -1;
      cubeArray.push(cube); 
    }
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }

  
  function render(time) {
    raycaster.setFromCamera( mouse, camera );
    time *= 0.001;  // convert time to seconds

    

    if (selectedObject){
      selectedObject.material.color.set( '#44aa88');
      selectedObject = null;
    }

    var intersects = raycaster.intersectObjects( cubeArray );
 
    if (intersects.length > 0) {
      selectedObject = intersects[0].object;
      selectedObject.rotation.x += 0.02;
      selectedObject.rotation.y += 0.02;
      selectedObject.material.color.set( '#ff0000' );
    }

    // camera.rotation.y += Math.PI/260; 

    // cubeArray.forEach(cube => {
    //   cube.rotation.y = time + cube.position.y * 300;
    //   cube.rotation.x = time;
    // });

    //cube.rotation.z = time;

    // cube.scale.x += scalingStep;
    // cube.scale.y += scalingStep;
    // cube.scale.z += scalingStep;


    // camera pan
    // camera.position.x += scalingStep;

    // if(camera.position.x >= 2 || camera.position.x <= -2){
    //     scalingStep = scalingStep * -1;
    // }

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  addAllCubes();

  // cubeArray.forEach(element => {
  //   scene.add(element);
  // });
  
  let a = setInterval(function(){
    scene.add(cubeArray[cubeIndex++]);
    if(cubeIndex == cubeArray.length){
      clearInterval(a);
    }
  }, 100);

  render();
  window.addEventListener( 'resize', onWindowResize, false );
  window.addEventListener( 'mousemove', onMouseMove, false );
}


