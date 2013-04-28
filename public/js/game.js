//                ISK
//   A Unofficial EVE Strategy Game
//
// javascript by Plato
// art by PooPooTheGorilla
var ISK = {
  svg: null,
  grid: null,
  w : window.innerWidth*0.8,
  h : window.innerHeight,
  w2 : window.innerWidth*0.8 * 0.5,
  h2 : window.innerHeight * 0.5,
  r: 35, //hex outer radius in pixels
  currentState: '',
  gameOver: false,
  turn: 0, // 0 = staging,  1 = p1 turn 1,  2 = p2 turn 1...
  nP: 2, // number of players
  activeP: 0, // 0 = staging,  1 = p1's turn, 2 = p2's turn
//  turnPhase: '',  // "deploy", "attack", "checkGameOver", "fortify"
  toDeployCount: 0, // units to deploy this turn
  map: [
    {
      sName:'Klingt',
      sId:'abc',
      cName:'Eldulf',
      cId:'def',
      owner: 1, // P1
      unitCount: 1,
      security: 0.5,
      p:6,
      q:0,
      outGates:['123','456'],
    },
  ],
  handleHexClicked: function(){},
};

document.addEventListener('DOMContentLoaded', ISKInit ,false);

function ISKInit(){
  console.log('Hi Sexy! Creating grids and placing svgs');
  ISK.grid = new Sexy.Grid(ISK.w, ISK.h, ISK.r);

  ISK.svg = d3.select("#map").append("svg")
    .attr("width", ISK.w)
    .attr("height", ISK.h);

  ISK.svg.append("rect")
    .attr("width", ISK.w)
    .attr("height", ISK.h)
    .attr("x", 0)
    .attr("y", 0)
    .attr('stroke', 'none')
    .attr('fill', 'rgba(0,0,0,0.7)');
  
  createNewState(function(err){
    if(err){ console.log(err); return false };
    console.log('State created');
    console.log(ISK);
    //update();
    ISK.goState('staging');
  });
}

function createNewState(callback){
  async.series(
  [ /*function(done){
      $.getJSON('/loadRegionMap', {region: 'Molden Heath'}, function(systems){
        ISK.map = systems;
        done(null);
      });
    },*/
    function(done){
      ISK.map.forEach(function(system){
        var xy = Sexy.pq2xy(system.p, system.q, ISK.r);
        system.localX = xy.x + ISK.w2;
        system.localY = (-1*xy.y) + ISK.h2; // canvas +y is down; sexy +y is up
      });
      done(null);
    },
    function(done){
      placeInitialUnits();
      done(null);
    },
  ],function(err, results){
    if(err){ 
      console.log(err);
      return callback(err) 
    };
    callback(null);
  }); // end of async.series
};

function placeInitialUnits(){
  ISK.map[0].owner = 1;
  ISK.map[0].unitCount= 5;
};

function update(){
  // create a d3 selection of all path.hex in ISK.svg and bind/update data
  var sHexes = ISK.svg.selectAll('.hex')
    .data(ISK.map);
  var sText = ISK.svg.selectAll('.text')
    .data(ISK.map);

  sHexes
  .enter()
    .append('path')
      .attr('class',function(d){
        if(d.owner == 1){
          return 'hex p1system';
        } else if (d.owner == 2){
          return 'hex p2system';
        } else { 
          return 'hex';
        }
      })
      .attr('d',function(d){ 
        return Sexy.hex2path(d.localX, d.localY, ISK.r); //SVG path string
      })
      .attr('fill',function(d){
        return 'rgba(0,255,50,'+d.security+')'; 
      })
      .on('click', function(d){
        ISK.handleHexClicked(d);
      });

  sText
  .enter()
    .append('text')
    .attr('x', function(d){
      return d.localX;
    })
    .attr('y', function(d){
      return d.localY;
    })
    .text(function(d){
      return d.unitCount;
    })
        
      //.on('click', function(d){d.clicked(function(){update()})});

  sHexes.attr('stroke',function(d){
    if(d.selected){return 'black'} else {return 'none'}
  });
}; // end of update() definition

function onHexClicked(system){
  ISK.handleHexClick(system) 
  console.log(system.sName+'clicked');
};

function countSystemsOwned(p){
  var count = 0;
  ISK.map.forEach(function(system){
    if(system.owner == p){ count += 1 };
  });
  return count;
};

ISK.goState = function(state){
  console.log('Transitioning from state '+ISK.currentState+' to '+state);
  ISK.currentState = state;
  ISK.stateList[state]();
  update();
};

ISK.stateList = {
  staging: function(){
    function startGame(){
      $('#startButton').hide();
      ISK.turn = 1;
      ISK.activeP = 1;
      ISK.goState('p1a');
    };
    $('#startButton').show();
    $('#startButton').unbind('click', startGame); // in case we reset
    $('#startButton').click(startGame);
  },
  p1a: function(){
    // Start of turn - count up units
    var q = countSystemsOwned(ISK.activeP)
    q = Math.floor(q/3);
    q = Math.max(q, 3);
    ISK.unitsToDeploy = q;
    ISK.goState('p1b');
  },
  p1b: function(){
    // Add a unit to a territory
    function deployUnit(system){
      system.unitCount += 1;
      ISK.unitsToDeploy -= 1;
      if(ISK.unitsToDeploy <= 0){
        ISK.pushMsg('Player '+ISK.activeP+': Attack Phase');
        ISK.goState('p2a');
      } else {
        ISK.goState('p1b');
      };
    };
    ISK.handleHexClicked = deployUnit;
  },
  p2a: function(){
    $('#doneAttackingButton').show();
    $('#doneAttackingButton').unbind('click');
    $('#doneAttackingButton').click(endAttackPhase);
    function endAttackPhase(){
      ISK.goState('p3a');
    };

    function selectAttackFrom(system){
      if(system.owner != ISK.activeP){
        ISK.goState('p2a'); // can't attack from others' systems
      } else if(system.unitCount <= 1){
        ISK.pushMsg(system.sName+' can\'t spare any forces to attack.');
        ISK.goState('p2a'); // can't attack from others' systems
      } else {
        ISK.pushMsg('Player ' + ISK.activeP+' attacking from '+system.sName+'...');
        ISK.attackFrom = system;
        ISK.goState('p2b');
      };
    };
    ISK.handleHexClicked = selectAttackFrom;
  },
  p2b: function(){
    $('#abortAttackButton').show();
    $('#abortAttackButton').val('Abort Attack');
    $('#abortAttackButton').click(resetAttack);
    function resetAttack(){
      ISK.goState('p2a');
    };

    function selectAttackTo(system){
      if(system.owner == ISK.activeP){
        ISK.goState('p2b'); // can't attack self
      } else {
        function testNeighbor(item, done){
          if(item == ISK.attackFrom.sId) { 
            done(true)
          } else {
            done(false)
          };
        };
        async.detect(system.outGates, testNeighbor, function(result){
          if(result){
            ISK.pushMsg('...to '+system.sName+'.');
            ISK.attackTo = system;
            ISK.goState('p2c');
          } else { // Not neighbor
            ISK.goState('p2b');
          };
        });
      };
    };
    ISK.handleHexClicked = selectAttackTo;
  },
  p2c: function(){
    // Attack from and to have both been selected
    // Players select dice count and attacker attacks
    $('#dice').show();
    $('#diceAtk > input').removeAttr('disabled'); 
    $('#diceDef > input').removeAttr('disabled'); 
    var atkP = ISK.attackFrom.owner;
    var defP = ISK.attackTo.owner;
    var atkMax = Math.min(3, (ISK.attackFrom.unitCount -1)); // max usable attacker dice
    var defMax = Math.min(2, (ISK.attackFrom.unitCount)); // max usable defender dice
    switch(atkMax){
      case 3: $('#atk_d3').attr('checked', 'checked');   break;
      case 2: $('#atk_d3').attr('disabled', 'disabled'); 
              $('#atk_d2').attr('checked', 'checked');   break;
      case 1: $('#atk_d3').attr('disabled', 'disabled'); 
              $('#atk_d2').attr('disabled', 'disabled'); 
              $('#atk_d1').attr('checked', 'checked');   break;
      default: break;
    };
    switch(defMax){
      case 3:               $('#def_d3').attr('checked', 'checked'); break;
      case 2: $('#diceDef > input').removeAttr('disabled');
              $('#def_d2').attr('checked', 'checked');
              $('#def_d3').attr('disabled', 'disabled'); break;
      case 1: $('#diceDef > input').removeAttr('disabled');
              $('#def_d1').attr('checked', 'checked');
              $('#def_d3').attr('disabled', 'disabled'); 
              $('#def_d2').attr('disabled', 'disabled'); break;
      default: break;
    };
    function rollDice(){
      atkCt = $('input[@name=atk_DiceCt]:checked').val();
      defCt = $('input[@name=def_DiceCt]:checked').val();
      ISK.atkDice = [];
      ISK.defDice = [];
      for(var i=0; i<atkCt; i++){
        ISK.atkDice.push(Math.ceil(Math.random()*6));
      };
      for(var j=0; j<defCt; j++){
        ISK.defDice.push(Math.ceil(Math.random()*6));
      };
      ISK.atkDice.sort(); // highest last
      ISK.defDice.sort();
      ISK.atkN = ISK.atkDice.length;
      ISK.defN = ISK.defDice.length;

      // compare dice
      while( ISK.atkDice.length > 0 && ISK.defDice.length > 0 ){
        var a = ISK.atkDice.pop(); //highest remaining die
        var b = ISK.defDice.pop(); //highest remaining die
        $('#diceResultsAtk').append($('<li></li>').text(a));
        $('#diceResultsDef').append($('<li></li>').text(b));
        if( a > b ){  // aggressor higher
          ISK.attackTo.unitCount -= 1;
        } else { // tie or defender higher
          ISK.attackFrom.unitCount -= 1;
        };
      };
      while( ISK.atkDice.length > 0 || ISK.defDice.length > 0 ){
      // Draw any extra dice
        var a = ISK.atkDice.pop(); //highest remaining die
        var b = ISK.defDice.pop(); //highest remaining die
        if(a) { $('#diceResultsAtk').append($('<li></li>').text(a)); }
        if(b) { $('#diceResultsDef').append($('<li></li>').text(b)); }
      }
      // This attack complete
      if(ISK.attackTo.unitCount <= 0 ){ // Conquered
        ISK.pushMsg('Player '+ISK.atkP+' seized control of '+ISK.attackTo.sName+' from Player '+ISK.defP);
        ISK.attackTo.owner = ISK.activeP;
        // Determine how many units to move:
        var low = ISK.atkN; // move at least # of dice
        var hi  = ISK.attackFrom.unitCount-1; // move at least # of dice
        if(low == hi) { // No choice, automatically move the exact number of units
          ISK.attackTo.unitCount += low;
          ISK.attackFrom.unitCount -= low;
        } else {
          while(true){
            var n = window.prompt('Invade with how many units? ( '+low+' .. '+hi+' )');
            if((n >= low) && (n <= hi)){
              ISK.attackTo.unitCount += n;
              ISK.attackFrom.unitCount -= n;
            } else {
              continue;
            };
          };
        };
        return ISK.goState('p2a');
      };
      if(ISK.attackFrom.unitCount <= 1){ // No more troops
        return ISK.goState('p2a');
      };
      // Otherwise, we re-apply this state, to continue attack 
      ISK.goState('p2c');
    };
    $('#rollDice').click(rollDice)
  },
  p3a: function(){
  // Fortify
    ISK.goState('EOT');
  },
  EOT: function(){
    ISK.turn += 1;
    ISK.activeP = (ISK.activeP + 1) % ISK.nP; // increment active player
    ISK.goState('p2a');
  },
};

ISK.pushMsg = function(msg){
  var msg = $('<p></p>').text(msg);
  $('#messages').prepend(msg);
};
