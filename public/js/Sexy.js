// Sexy Hexes v0.1 by Plato
var Sexy = {};
Sexy.grids = []; // one Sexy.grid per layer

Sexy.Grid = function(x,y,r){
// Returns a Grid in p,q space. p is up (12'ck) q is 60' CW from p (2'ck)
  if(arguments.length<3){  x=400; y=400; r=10;  };
  this.r = r;  this.xpx = x;  this.ypx = y;
  this.verts = {}; // to store Vertex(p,q) objects
  this.hexes =[]; //to store Hex(v,data) objects (d3 will bind this)
  var s      = r*Math.sqrt(3)*0.5; // 'Short' radius (center to edge midpoint)

  // Calculate how many hexes of radius r we can squeeze into x*y px
  // Remember that even rows are staggered right by s
  this.rows  = Math.floor((y-(r/2))/(1.5*r)); 
  this.cols  = Math.floor((x-s)/(2*s));
  if(this.rows <= 0 || this.cols <= 0){ 
    console.log('No room for even one hex'); return false;
  };

  // Calculate left+top padding in px (to center grid in container)
  this.xpad = Math.floor((x-(2*s*this.cols+s))/2);       
  this.ypad = Math.floor((y-(1.5*r*this.rows+0.5*r))/2); 

  // Calculate the hex origin's row number & column number. 
  // 1 indexed from top left. Halve & round up
  var iR = Math.floor(this.rows/2)+1; // hex origin row index
  var iC = Math.floor(this.cols/2)+1; // hex origin col index

  // Calculate x and y coordinates of hex origin
  // Relative to container top left. +y is down, +x is right (i.e. SVG)
  if(iR % 2 == 1){ // Odd rows have zero stagger
    this.ho_x = this.xpad + s+ (2*s*(iC-1));
  } else { // Even rows are staggered from the left by s
    this.ho_x = this.xpad + 2*s + (2*s*(iC-1));
  };
  this.ho_y = this.ypad + r + (1.5*r*(iR-1)); // regardless of row even/odd

  // Calculate where to place the rest of the grid
  // We will iterate from top left across each row then down
  // a1..b2 represent bounding indices for rows and columns
  if(this.cols %2 == 1){ //odd # cols
    // origin halfway along cols
    var a1 = iC-this.cols;  //e.g. 5 rows -> iC 3 -> a:-2..2 inclusive
    var a2 = a1+this.cols-1;
  } else { //even #cols, we can't place origin in horz center - round right
    var a1 = iC-1-this.cols;//e.g. 4 rows -> iC 3 -> a:-1..1 inclusive
    var a2 = a1+this.cols-1;
  };
  var b2 = iR - this.rows;    // lowest row index
  var b1 = b2+this.rows-1;   // highest row index, iterate down

  // 'column 0' is actually slanted along 10'ck..4'ck axis, so we have to
  // nudge the row one unit leftwards, every two rows, otherwise we end up
  // with a parallelogram shape.
  var rows_above = b1;
  var prenudge = Math.floor(rows_above/2);
  a1 = a1 + prenudge;
  a2 = a2 + prenudge;

  var nudge = 0;
  
  // Iterate across all grid points, calculate xy coordinates
  // and add a Hex to this.hexes. 
  // Cols left of origin will have j<0
  // Rows below origin will have i<0
  for(var i=b1; i>=b2; i--){   // Start at top row and work down
    for(var j=a1; j<=a2; j++){ // left to right
      // Converting i,j into pq: <p,q> = col * <-1,2> + row * <2,-1>
      var p = (-1*j)+( 2*i);
      var q = ( 2*j)+(-1*i);
      var vert = new Sexy.Vertex(p, q, this);
      // Place hexes relative to hex origin ho_x, ho_y:
      var xy = Sexy.pq2xy(p,q,r);
      var x1 = this.ho_x+xy.x;
      var y1 = this.ho_y-xy.y;
      // x and y values may be negative. pq2xy returns standard cartesian
      // coordinates, where +y is up. SVG expects +y to be down, thus the -
      
      var hex = new Sexy.Hex(vert, x1, y1);
      this.hexes.push(hex);
      //this.setVtx(vert);
    };
    nudge++;
    if(nudge == 2){ // Shift columns left every two rows (to alternate)
      a1--;  a2--;
      nudge=0;
    };
  };

  Sexy.grids.push(this);
/*
  this.setVtx=function(v0){
    var pstr=v0.p.toString(); var qstr=v0.q.toString();
    if(typeof(this.verts[pstr])=="undefined"){ 
      this.verts[pstr] = {};
    }
    this.verts[pstr][qstr] = v0;
  };

  this.getVtx=function(p,q) {
    var pstr=p.toString(); var qstr=q.toString();
    if(typeof(this.verts[pstr])=="undefined"){ 
      this.verts[pstr] = {};
      this.verts[pstr][qstr] = new Sexy.Vertex(p,q);
    } else if (typeof(this.verts[pstr][qstr])=="undefined"){
      this.verts[pstr][qstr] = new Sexy.Vertex(p,q);
    };
    return this.verts[pstr][qstr]; 
  };
*/

}; // end of Sexy.Grid definition

Sexy.pq2xy=function(p0,q0,r) {
  // Return x,y relative to p,q. +x is right, +y is up
  var q_sign = ((q0<0) ?   -1 : 1);
  var hypotenuse = (Math.abs(q0)*r);
  var q_to_x=hypotenuse*Math.cos(Math.PI/6); // hyp * cos = adjacent
  var q_to_y=hypotenuse*Math.sin(Math.PI/6); // Pi/6 rad = 30 degrees

  if(q_sign==1){  //q component is pointing 2 o clock
    var x1= q_to_x;    
    var y1= p0*r + q_to_y;
  } else if (q_sign==-1){  //q component is pointing 8 o clock
    var x1= -1*q_to_x;    
    var y1= p0*r - q_to_y;
  } else {console.log("error in pq2xy")};
  return {'x':x1, 'y':y1};
};

Sexy.Vertex = function(p0, q0, grid) {
  this.grid = grid;
  this.p=p0;    this.q=q0;    this.theta=null;
  //theta: rotation angle. 0: up/12'ck, Pi/3: 10'ck, Pi: 6'ck 2*Pi: 12'ck
  this.phaseP=((this.p%3)+3)%3;    this.phaseQ=((this.q%3)+3)%3;
  //We have to do modulo twice to handle p|q<0. e.g. (-4)%3 = -1 => (-1+3)%3=2
};

Sexy.Hex = function(v0,x,y){
  this.v = v0;
  this.x = x;
  this.y = y;
  this.data = Math.random();
  this.selected = false;
  this.clicked = (function(hex){
    return function(callback){
      Sexy.select(hex);
      console.log('Hi Sexy! @p,q <'+hex.v.p+','+hex.v.q+'>');
      callback();
    };
  })(this);
  this.deselect = (function(what){
    return function(){
      what.selected = false;
    };
  })(this);
};

Sexy.hex2path = function(x,y,r){     //x,y center, r radius
// Generate string for svg.path('d') property describing hex path
// These hexes have vertices at 12'ck, 2'ck...
  var s = 0.5*Math.sqrt(3)*r; //r' short radius
  var t = 0.5*r;              //half of r
  var z =                     //xy coordinates of the six vertices 
   [[x  ,y+r], [x+s,y+t], [x+s,y-t],  //clockwise 12'ck 2'ck 4'ck...
    [x  ,y-r], [x-s,y-t], [x-s,y+t]];
  var path="";
  path+=("M"+z[0][0]+" "+z[0][1]+" ");   // move pen to...
  for(i=1;i<6;i++){
    path+=("L"+z[i][0]+" "+z[i][1]+" "); // line to...
  }
  path+=("Z");                           // close loop
  return path;
};
/*
 * This flavor has vertices at 1'ck, 3'ck...
 *var z =
   [[x-r,y  ], [x-t,y+s], [x+t,y+s],  //clockwise 9'ck 11'ck 1'ck...
    [x+r,y  ], [x+t,y-s], [x-t,y-s]];
*/

Sexy.select = function(hex){
  var old = hex.v.grid.lastSelection || null;
  if(old){old.deselect();};
  hex.v.grid.lastSelection = hex;
  hex.selected = true;
};
