window.onload = function(){
    main();
}

function main() {
  const canvas = document.querySelector('#c');
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  const renderer = new THREE.WebGLRenderer({canvas, antialias: true});

  const fov = 75;
  const aspect = 2;  // the canvas default
  const near = 0.5;
  const far = 10;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  var screenShake = ScreenShake();
  //const camera = new THREE.OrthographicCamera(-3 , 3 , 3 , -3, 2, 5);
  camera.position.z = 2;

  let raycaster = new THREE.Raycaster();
  let mouse = new THREE.Vector2();

  let activeCubeArray = [];

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  const boxWidth = 0.2;
  const boxHeight = 0.2;
  const boxDepth = 0.2;

  let cubeArray = [];
  let nasId = 0;

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

  let color1 = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
  let color2 = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
  let color3 = '#'+(Math.random()*0xFFFFFF<<0).toString(16);

  function chooseRandomColor(){
    let i = getRandomInt();
    console.log(i);
    switch(i){
      case 0:
        return color1;
      case 1:
        return color2;
      case 2:
        return color3;
    }
  }


  function getRandomInt() {
      return Math.floor(Math.random() * 3);
  }



  let colorArray = [color1, color2, color3];

  let rect1 = document.getElementById("color1");
  let rect2 = document.getElementById("color2");
  let rect3 = document.getElementById("color3");

  function setGuideColors(){
    rect1.style.background = colorArray[0];
    rect2.style.background = colorArray[1];
    rect3.style.background = colorArray[2];
  }

  function shiftColors(){
    console.log(colorArray);
    colorArray.pop(2);
    colorArray.unshift(chooseRandomColor());
    console.log(colorArray);
  }

  function onMouseMove( event ) {
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  }

  function onMouseUp( event ) {
    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );
    
    // if (selectedObject){
    //   selectedObject.material.color.set( '#44aa88');
    //   selectedObject = null;
    // }

    var intersects = raycaster.intersectObjects( cubeArray );
 
    if (intersects.length > 0) {
      if (activeCubeArray.lastIndexOf(intersects[0].object) != -1){
        //izklopi rotacijo oz odstrani iz arraya
        intersects[0].object.material.color.set( '#44aa88');
        activeCubeArray.splice(activeCubeArray.indexOf(intersects[0].object), 1);
      }else{
        //vklopi rotacijo oz dodaj v array
        console.log('#' + colorArray[2]);
        intersects[0].object.material.color.set(colorArray[2]);
        activeCubeArray.push(intersects[0].object);
        shake();
        shiftColors();
        setGuideColors();
        //checkMatches();
      }

      // console.log(activeCubeArray);
      // selectedObject = intersects[0].object;
      // selectedObject.rotation.x += 0.02;
      // selectedObject.rotation.y += 0.02;
      // selectedObject.material.color.set( '#ff0000' );
    }
  }

  function addAllCubes(){
    for(let x = 0; x < 6; x++){
      for(let y = 0; y < 6; y++){
          let cube = new THREE.Mesh(new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth), new THREE.MeshPhongMaterial({color: 0x44aa88}));
          cube.position.x = (((x + x) * 0.2) -1).toFixed(1);
          cube.position.y = (((y + y) * 0.2) -1).toFixed(1);
          cube.ourID = nasId++;
          // addCube(cube, x);
          cubeArray.push(cube); 
      }
    }
  }

  // function addCube(cube, x){
  //   if(x%2 == 0){
  //     cubeArray.push(cube);
  //   }else{
  //     cube.position.y *= -1;
  //     cubeArray.push(cube); 
  //   }
  // }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }

  function ScreenShake() {

    return {

      // When a function outside ScreenShake handle the camera, it should
      // always check that ScreenShake.enabled is false before.
      enabled: false,

      _timestampStart: undefined,

      _timestampEnd: undefined,

      _startPoint: undefined,

      _endPoint: undefined,


      // update(camera) must be called in the loop function of the renderer,
      // it will repositioned the camera according to the requested shaking.
      update: function update(camera) {
        if ( this.enabled == true ) {
          const now = Date.now();
          if ( this._timestampEnd > now ) {
            let interval = (Date.now() - this._timestampStart) / 
              (this._timestampEnd - this._timestampStart) ;
            this.computePosition( camera, interval );
          } else {
            camera.position.copy(this._startPoint);
            this.enabled = false;
          };
        };
      },


      // This initialize the values of the shaking.
      // vecToAdd param is the offset of the camera position at the climax of its wave.
      shake: function shake(camera, vecToAdd, milliseconds) {
        this.enabled = true ;
        this._timestampStart = Date.now();
        this._timestampEnd = this._timestampStart + milliseconds;
        this._startPoint = new THREE.Vector3().copy(camera.position);
        this._endPoint = new THREE.Vector3().addVectors( camera.position, vecToAdd );
      },


      computePosition: function computePosition(camera, interval) {

        // This creates the wavy movement of the camera along the interval.
        // The first bloc call this.getQuadra() with a positive indice between
        // 0 and 1, then the second call it again with a negative indice between
        // 0 and -1, etc. Variable position will get the sign of the indice, and
        // get wavy.
        if (interval < 0.4) {
          var position = this.getQuadra( interval / 0.4 );
        } else if (interval < 0.7) {
          var position = this.getQuadra( (interval-0.4) / 0.3 ) * -0.6;
        } else if (interval < 0.9) {
          var position = this.getQuadra( (interval-0.7) / 0.2 ) * 0.3;
        } else {
          var position = this.getQuadra( (interval-0.9) / 0.1 ) * -0.1;
        }

        // Here the camera is positioned according to the wavy 'position' variable.
        camera.position.lerpVectors( this._startPoint, this._endPoint, position );
      },

      // This is a quadratic function that return 0 at first, then return 0.5 when t=0.5,
      // then return 0 when t=1 ;
      getQuadra: function getQuadra(t) {
        return 9.436896e-16 + (4*t) - (4*(t*t)) ;
      }

    };

  };

  function shake() {
    screenShake.shake( camera, new THREE.Vector3(0, 0, -0.05), 150 );
  }


  //mappaj tej active array takoj kak dodaš notri novi element

  function checkMatches(){
    if(activeCubeArray.length <= 1){
      return;
    }

    let clonedActiveArray = activeCubeArray.slice(0);

    clonedActiveArray.forEach(element => {

      activeCubeArray.forEach(el => {
        console.log("compare y: ", parseFloat(element.position.y), parseFloat(el.position.y));
        if(element.position === el.position){
          console.log("same object");
          return;
        }
        if (parseFloat(element.position.y) === parseFloat(el.position.y)){
          //console.log("compare x: ", parseFloat(element.position.x), (parseFloat(el.position.x)));
          if (parseFloat(element.position.x) === parseFloat(el.position.x + 0.4) || parseFloat( element.position.x) === parseFloat(el.position.x - 0.4)){
            console.log("soseda na x osi");
          }
        }


        if (parseFloat(element.position.x) === parseFloat(el.position.x)){
          console.log("compare y: ", parseFloat(element.position.y), parseFloat(el.position.y));
          if (parseFloat(element.position.y) === parseFloat(el.position.y + 0.4) || parseFloat(element.position.y) === parseFloat(el.position.y - 0.4)){
            console.log("soseda na y osi");
          }
        }
      });
    });
  }

  function render(time) {
    time *= 0.001;  // convert time to seconds

    screenShake.update(camera);

    raycaster.setFromCamera( mouse, camera );
    
    if (selectedObject){
      selectedObject.material.color.set( '#44aa88');
      selectedObject = null;
    }
    
    activeCubeArray.forEach(element => {
      element.rotation.y += 0.02;
      //element.material.color.set( '#ff0000' );
    });

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  addAllCubes();
  setGuideColors();

  cubeArray.forEach(element => {
    scene.add(element);
  });
  
  // let a = setInterval(function(){
  //   scene.add(cubeArray[cubeIndex++]);
  //   if(cubeIndex == cubeArray.length){
  //     clearInterval(a);
  //   }
  // }, 100);

  render();
  window.addEventListener( 'resize', onWindowResize, false );
  window.addEventListener( 'mousemove', onMouseMove, false );
  window.addEventListener( 'mouseup', onMouseUp, false );
}


