ISK The Game
========

EVE Online hex grid strategy game

This game is played on a hex grid. Players place capsuleer troops on systems and
fight to capture adjacent systems.

Campaign mode ideas
===================
Region minigame:
Played on a region minimap to build territory blocs
Players take turns claiming regions to establish their empires.

Setup:
Start players semi randomly in empty regions.

Gameplay:
If there is an unclaimed region adjacent to a player's territory, they must
claim it. The freshly claimed region becomes their territory. 

If there are no unclaimed contiguous regions, a player may claim unclaimed,
non-contiguous regions. (i.e. on the other side of the map.)

If there are no unclaimed contiguous regions, a player may CONTEST a region that
is another player's territory, or a region contested by other players, as long
as the contested region is adjacent to the player's own territory.

A contested region does not count as the territory of either player.



Main game: 
Played on a region map representing a single contested region. 


Setup:
Players choose whether to play at constellation scale or solar system scale.
Solarsystems or constellations are placed with appropriate links.

TBD: How to distribute units and fleets

If a player owns at least one neighboring region, that player may only deploy
their initial forces into solarsystems or constellations that are adjacent to a
region they own.

If a player is contesting the region but doesn't own any adjacent regions, they
may deploy their fleets anywhere within the region.


Turn phases:
  Upkeep - Fleet behavior for this turn is set to last turn's choice.  
    Add units to fleets? Deploy new fleets?
  Orders - Per-fleet: Set next turn's behavior, set move path, engage here,
    always engage, never engage
  Execute -  
    If a fleet is on top of another fleet and has orders to engage, handle those fights first.
    When all in-place engagement orders are handled (either one side
    successfully disengages, or one side is wiped out):
      Move each fleet one step
      Recalculate Detection for any collisions, give fleets the option to engage
      Repeat until no fleets have movement points left
  EOT: recalculate constellation control bonuses. Control switches if a fleet
    remains in a constellation for the whole turn without any other players'
    fleets starting, moving through, or ending on a system in the constellation.



Dice:
Different fleet behaviors affect two stats, Intel and Movement. These numbers
represent counts of six sided dice. 

If two fleets make a 'Movement Roll' they each roll the appropriate number of
dice. The total pips are counted and the winner is the one with the higher
total.

#dice:  
Behavior      Intel        Movement 
----------------------------------------------
Stealthy      4            3
Aggressive    2            3
Fast          3            4


Upkeep:
Each fleet rolls its movement dice and divides the total count by three, rounding
up. This is the number of movement points available to the fleet this turn. New
units are deployed TBD (perhaps fully owned constellations provide a bonus.) 

Orders:

Movement:
Moving one system (or constellation, at constellation scale) takes up one move
point.

Detection/Initiative:
Both fleets make an Intel roll for detection when a fleet lands on or moves
through a solarsystem where another fleet is placed.

Any fleet that detects another fleet gets the option to engage or ignore it.

(Digital mechanic - Stealth) Additionally, an undetected fleet is not revealed
to the other fleet when it lands on or passes through the system.

Movement roll results:
         WIN: Stealthy     Aggressive    Fast
LOSE:     
---------------------------------------------
Stealthy      0-0          1-1           0-1
Aggressive    0-1          1-1           1-1
Fast          0-1          1-1           0-0
  Key:        W-L; 0=Undetected 1=Detected

e.g. top right: Fast wins 3d6 vs Stealthy 4d6; Fast chooses to engage or not

Combat:
Once an engagement begins, both sides get the option to attempt to disengage at
the beginning of each round of combat.

Any fleet that chooses to disengage may revise their movement path for the turn.
They may choose to not spend every movement point.

If *both sides* disengage, combat ends, and both fleets are flagged as Stealthy for
this turn.

Detection rolls are made as normal against any fleets that the fleeing fleet
encounters, including the opposing fleet (if the opposing fleet moves along the
same path.)

If *only one side* chooses to disengages, both fleets make a Movement roll. The
fleeing fleet must win or tie half of their dice rolls, rounded up, to
successfully disengage.

The other side does full combat damage if disengagement is unsuccessful.

If *neither side* chooses to disengage, combat proceeds mormally.

Each fleet gets one dice per ship up to a maximum of 10 dice
Each ship in the fleet has shields/armor/hull, they die in three hits

For one round of combat, each side rolls all Combat dice
Match the dice up highest to lowest and compare each pair
For each tie, each side places one hit on the enemy ship
For each win, the winning side places one hit on an enemy ship
For dice without a pair (overwhelming force) miss on 1,2,3,4 and hit on 5, 6




Random Ideas:
Stationing units on a system will hold the constellation. Enemy units moving
into the constellation will not break bonuses. Enemy units killing all friendly
units in the constellation will flip constellation control (after N turn delay?)

Perhaps units can forfeit their move to camp a system ( and maybe neighbors? )
to force an engagement if enemies move into those systems

