// Jay Newby 2014
// http://people.mbi.ohio-state.edu/newby.23/
// http://www.math.utah.edu/~newby/
// https://github.com/newby-jay
// Based on the global weather visualization,
// http://earth.nullschool.net/ by Cameron Beccario
//////////////////////////////////////////////////

// Visible bounds:
var uRange = [-20, 20];
var vRange = [-100, 50];

// vector field data
var X0 = [], Y0 = []; // to store initial starting locations
var X = [], Y = []; // to store current point for each curve

var canvasElt = document.getElementById('animation');
var canvasRect = canvasElt.getBoundingClientRect();
var width = canvasRect.width, height = canvasRect.height;
canvasElt.width = width; canvasElt.height = height;


var nPoints = 2000;
var nImmortal = 1000;
var maxAge = 100; // # timesteps before restart
var dT = 0.25; // 0.05;

// PARAMS:
var vHigh = 5;
var vLow = 0;
var addV = true;

var A = 0.02;
var B = 0.2;
var C = -65;
var D = 8;

// vfield
function F(u, v) {
  var deltaU = A * (B * v - u);
  var deltaV = 0.04 * v * v + 5* v + 140 - u + (addV ? vHigh : vLow);
  return [deltaU, deltaV];
}

function updateParams(a, b, c, d, dt, aV, vL, vH) {
  A = a; B = b; C = c; D = d;
  if (dt !== undefined) dT = dt;
  if (aV !== undefined) addV = aV;
  if (vL !== undefined) vLow = vL;
  if (vH !== undefined) vHigh = vH;

  document.getElementById('valAText').innerHTML = '' + A;
  document.getElementById('valBText').innerHTML = '' + B;
  document.getElementById('valCText').innerHTML = '' + C;
  document.getElementById('valDText').innerHTML = '' + D;
  document.getElementById('valDTText').innerHTML = '' + dT;
  document.getElementById('valA').value = A;
  document.getElementById('valB').value = B;
  document.getElementById('valC').value = C;
  document.getElementById('valD').value = D;
  document.getElementById('valDT').value = dT;
  document.getElementById('valAddV').checked = addV;
  document.getElementById('valVLow').value = vLow;
  document.getElementById('valVHigh').value = vHigh;
}

function randn(n) { return Math.round(Math.random() * n) }

function selectType(e) {
  switch (e.target.value) {
    case "RS":
      updateParams(0.02, 0.2, -65, 8); break;
    case "IB":
      updateParams(0.02, 0.2, -55, 4); break;
    case "CH":
      updateParams(0.02, 0.2, -50, 2); break;
    case "FS":
      updateParams(0.10, 0.2, -65, 2); break;
    case "TC":
      updateParams(0.02, 0.25, -65, 0.05); break;
    case "RZ":
      updateParams(0.10, 0.25, -65, 2); break;
    case "LTC":
      updateParams(0.02, 0.25, -65, 2); break;
    case "Chaotic":
      updateParams(0.05, 0.23, -51, 6.4, 0.05); break;
  }
}

function changeSlider(e) {
  updateParams(
    parseFloat(document.getElementById('valA').value),
    parseFloat(document.getElementById('valB').value),
    parseFloat(document.getElementById('valC').value),
    parseFloat(document.getElementById('valD').value),
    parseFloat(document.getElementById('valDT').value),
    document.getElementById('valAddV').checked,
    parseFloat(document.getElementById('valVLow').value),
    parseFloat(document.getElementById('valVHigh').value),
  )
}

function resetDots() {
  var uMapIdx = d3.scale.linear().domain([0, 1]).range(uRange);
  var vMapIdx = d3.scale.linear().domain([0, 1]).range(vRange);

  X = []; Y = []; X0 = []; Y0 = [];

  for (var i = 0; i < nPoints; i++) {
    var atU = uMapIdx(Math.random());
    var atV = vMapIdx(Math.random());
    X.push(atU); Y.push(atV);
    X0.push(atU); Y0.push(atV);
  }
}


(function animation() {
  //// frame setup
  var g = d3.select("#animation").node().getContext("2d"); // initialize a "canvas" element
  g.fillStyle = "rgba(0, 0, 0, 0.10)"; // for fading curves
  g.lineWidth = 1.5;

  resetDots();

  //// mapping from vfield coords to web page coords
  var xMap = d3.scale.linear()
      .domain(uRange)
      .range([0, width]);
  var yMap = d3.scale.linear()
      .domain(vRange)
      .range([height, 0]);

  //// animation setup
  var animAge = 0,
      frameRate = 30, // ms per timestep (yeah I know it's not really a rate)
      age = [];

  for (var i=0; i < X.length; i++) {
    age.push(randn(maxAge));
  }

  d3.timer(draw, frameRate);


  // for info on the global canvas operations see
  // http://bucephalus.org/text/CanvasHandbook/CanvasHandbook.html#globalcompositeoperation
  g.globalCompositeOperation = "source-over";
  function draw() {
    g.fillRect(0, 0, width, height);
    for (var i=0; i < X.length; i++) { // draw a single timestep for every curve
      if (i == 0) {
        g.strokeStyle = "#409900"; // html color code
      } else if (i == nImmortal) {
        g.strokeStyle = "#dd3000"; // html color code
      }
      var dr = F(X[i], Y[i]);
      g.beginPath();
      g.moveTo(xMap(X[i]), yMap(Y[i])); // the start point of the path
      X[i] += dr[0] * dT;
      Y[i] += dr[1] * dT;
      if (Y[i] >= 30) {
        if (i >= nImmortal) g.lineTo(xMap(X[i]), yMap(Y[i]));
        X[i] += D;
        Y[i] = C;
        if (i < nImmortal) g.lineTo(xMap(X[i]), yMap(Y[i]));
      } else {
        g.lineTo(xMap(X[i]), yMap(Y[i])); // the end point
      }
      g.stroke(); // final draw command

      if (i >= nImmortal && age[i]++ > maxAge) {
        // increment age of each curve, restart if maxAge is reached
        age[i] = 0;
        X[i] = X0[i];
        Y[i] = Y0[i];
      }
    }
  }
})()


function load() {
  selectType({target: {value: 'RS'}});
}
