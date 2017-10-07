var game = new Phaser.Game (document.documentElement.clientWidth, document.documentElement.clientHeight, Phaser.canvas, "",{
    preload: preload,
    create: create,
    update: update,
 // render: render,
});

// variable globales------------------------------------------------
var alto = document.documentElement.clientHeight;
var ancho = document.documentElement.clientWidth;
var tilesprite;         // animacion de fondo que se ira moviendo
var fondo;              // imagen de fondo        
var bote;               //imagen principal
var quieto = true;      // activa para la animacion del fondo.

var score=0;            // almacena la puntuacion.
var scoreTxt;           // contiene la informacion para mostrar la puntuacion

var cadena;

 var velocidad= 0;      // rango velocidad del tilemap
var animacion = false;  // habilitamos la animacion
var fin = false;        // control de parada
    
var timer;               // guardara la temporizacion de agitar

var velocidadX=0;       // velocidad de la espuma
var velocidadY=0;

var emitter;    
 var watchID = null;

//---------------------------------------------------
function preload () {
  // cargamos las imagenes del juego.
    
  game.load.image ('fondo','img/background_hi2.png');
  game.load.image ('bote', 'img/bottle2.png');
  game.load.image ('smoke', 'img/smoke-puff.png');    
};

//--------------------------------------------------------
function create () {
    
    tilesprite = game.add.tileSprite (0,0,ancho,alto, 'fondo'); // añadimos el fondo
    
    bote = game.add.sprite ((ancho/2),(alto/2), 'bote');       // añadimos la imagen principal   
    game.add.tween(bote.scale).to( { x: 2.5, y: 2.5 }, 300, Phaser.Easing.Linear.None, true);
    bote.anchor.x = 0.5;
    bote.anchor.y =0.5;
    
    // añadiendo las leyes fisicas
    game.physics.enable(bote, Phaser.Physics.ARCADE);
    
    // añadienmdo particulas
    emitter = game.add.emitter(game.world.centerX, game.world.centerY, 400);
    emitter.makeParticles(['smoke','smoke','smoke','smoke']);
    
    //añandiendo puntuacion.
   scoreTxt = game.add.text(16, 16, '0', { fontSize: '50px', fill: '#0fF' });
    cadena = game.add.text (115,1500, 'Toque para Inicio',{ fontSize: '100px', fill: '#0fF' });
    game.input.onDown.add(inicioJuego, this);
  
};
//--------------------------------
function onSuccess (datosAceleracion){
    var agitacionX = datosAceleracion.x > 10;
    var agitacionY = datosAceleracion.y > 10;
    if (agitacionX || agitacionY)
    {
        score += 3;
        scoreTxt.text = score;
    };
};
function onError (){
    console.log ('error')
};

//-------------------------------------------------------------------
function update () {
    
    //game.debug.text("Time until event: " + game.time.events.duration, 32, 32); // datos para depurar!!
    tilesprite.tilePosition.x -=  (velocidad);
    if (animacion){
      estela();
      calculaVelocidad();
      //tilesprite.tilePosition.x -=  (velocidad);
    }
    if (fin)
    {
        velocidad = 3;
        
       // navigator.accelerometer.clearWatch (watchID);
        //watchID = null;
    
        game.add.tween(emitter).to( { alpha: 0 }, 100, Phaser.Easing.Linear.None, true);
        game.add.tween(bote).to( { alpha: 0 }, 200, Phaser.Easing.Linear.None, true);
       
        cadena.text = "    Game Over"
        scoreTxt.text = "";
        var FINAL = game.add.text (60,100, "",{ fontSize: '32px', fill: '#0fF' });
        FINAL.text ="        " +score + "\n    Metros \n Recorridos";
        game.time.events.add(Phaser.Timer.SECOND * 7, comenzar, this);
        
    };
    if (velocidad === 1){
          game.time.events.add(Phaser.Timer.SECOND * 3, stopTile, this);
        velocidad = 0.5;
    }
};

//------------------------------------------------
function inicioJuego(){
    watchID =  navigator.accelerometer.watchAcceleration(onSuccess, onError, { frequency: 300});
    game.camera.shake(0.02, 200);
    score +=1;
    
    scoreTxt.text = "" + score;  // presenta el falso score
    cadena.text ="";
    //  Creamos nuestro temporizador
    timer = game.time.create(false);

    //  fijamos el tiempo de juego
    timer.add(4000, finJuego, this);

    //  Start the timer running - this is important!
    //  It won't start automatically, allowing you to hook it to button events and the like.
    timer.start(); 
     
};
//--------------------------------------------------------------------------
function finJuego (){
    game.input.onDown.remove(inicioJuego, this);
    navigator.accelerometer.clearWatch (watchID);
    
    watchID = null;
    cadena.text = "     Animacion ";
    game.add.tween (bote).to( { angle:-90 }, 200, Phaser.Easing.Linear.None, true);
    game.add.tween(bote.scale).to( { x: 1, y: 1 }, 200, Phaser.Easing.Linear.None, true);
    
    bote.x = ancho/2;
    animacionJuego();
};

//---------------------------------------------------------------
function animacionJuego (){
    animacion = true;
   
    bote.body.collideWorldBounds = true;
    bote.body.bounce.y=(0.8);
    bote.body.gravity.y= (400);
    bote.body.velocity.set (10+score*2);
  
    
    //pruebas particulas 2::
    emitter.gravity = 1800;
    emitter.setAlpha(1, 0, 500);
    emitter.setScale(0.8, 0, 0.8, 0, 5000);
    emitter.start(false,6000, 5);
     
};
//-------------------------------------------------------------
function calculaVelocidad (){
    velocidadX = Math.abs(parseInt(bote.body.velocity.x));
     velocidadY = Math.abs(parseInt(bote.body.velocity.y));                          
     if (velocidadX > 1){
        velocidad = velocidadX;
     } else {
             if ((velocidadX<=1) && (velocidadY >1)){
                velocidad = 8;
            }
             else{
                velocidad =1;
              }
    };
    
};

//-----------------------------------------------------
function estela() {
    var px = bote.body.velocity.x;
    var py = bote.body.velocity.y;

    px *= -20;
    py *= -0.5;

    emitter.minParticleSpeed.set(px, py);
    emitter.maxParticleSpeed.set(px, py);

    emitter.emitX = bote.x-200;
    emitter.emitY = bote.y;    
    
};
//----------------------------------------------------------
function stopTile (){
    velocidad = 5;
    animacion = false;
    fin = true;
    //return;
};
//---------------------------------------------------------
function comenzar () {
    fin= false;
    animacion = false;
    score = 0;
    velocidad = 0;
    this.game.state.restart();
    
}