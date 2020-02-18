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
  var frustumSize = 60;
  const near = 0.5;
  const far = 10;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  //const camera = new THREE.OrthographicCamera(-3 , 3 , 3 , -3, 2, 5);
  camera.position.z = 3;

  const scene = new THREE.Scene();

  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  }

  const boxWidth = 0.2;
  const boxHeight = 0.2;
  const boxDepth = 0.2;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  const material = new THREE.MeshPhongMaterial({color: 0x44aa88});  // greenish blue

  //naredi več kock

  let cubeArray = [];
  let nasId = 0;

  for(let x = 0; x < 6; x++){
    for(let y = 0; y < 6; y++){
        let cube = new THREE.Mesh(geometry, material);
        cube.position.x = ((x + x) * 0.2) -1;
        cube.position.y = ((y + y) * 0.2) -1;
        //cubeArray.push(cube);
        cube.ourID = nasId++;
        addCube(cube, x);
    }
  }
  console.log(scene);

  function addCube(cube, x){
    console.log(cube.ourID);
    if(x%2 == 0){
      cubeArray.push(cube);
    }else{
      cube.position.y *= -1;
      cubeArray.push(cube); 
    }
  }

  let cubeIndex = 0;

  let a = setInterval(function(){
    scene.add(cubeArray[cubeIndex++]);
    if(cubeIndex == cubeArray.length){
      clearInterval(a);
    }
  }, 200);

  
  let scalingStep = 0.02;

  function render(time) {
    time *= 0.001;  // convert time to seconds

    // camera.rotation.y += Math.PI/260; 

    // cubeArray.forEach(cube => {
    //   cube.rotation.y = time + cube.position.y * 300;
    //   cube.rotation.x = time;
    // });

    // 
    //cube.rotation.z = time;

    // cube.scale.x += scalingStep;
    // cube.scale.y += scalingStep;
    // cube.scale.z += scalingStep;

    camera.position.x += scalingStep;

    if(camera.position.x >= 2 || camera.position.x <= -2){
        scalingStep = scalingStep * -1;
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}


