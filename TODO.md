# Things that need to be added or improved

## Bug fixes
No known bugs at this time

## Core features that are missing
* Shader support for glossinness textures
* Shader support for roughness textures
* Shader support for ambient occlusion textures
* Shader support for metalic textures
* Particle system
* Armatures and mesh animation
* Vector fonts as 2D mesh per ASCII character
* Analog input methods for accelerometer and device orientation
* Set cameras and other objects to 'look at' something in the scene
* Better handling of velocity and acceleration for analog inputs
* Make the cylinder shape able to make truncated cones with optional end caps
* Point source lights and shadows

## Optional nice to have features
* Play sounds synced with animations. This is nice to have because there are better libraries for playing sounds. This is a WebGL wrapper and WebGL does not provide any sound playing capabilities.
* Dynamic ground where only the player locale is rendered. This is a nice to have because not all games will have ground, and if they do they are likely to want tiled ground (squares or hexagons) and associate some game data with each tile, and this makes it game specific.
* UI widgets such as menus, dockable panels, modal popups etc. This is nice to have because it doesn't really make sense to render the UI along with the main scene 40 times per second. There are great frameworks like React.js and Vue.js that are extremely well suited to building user interfaces. The game is drawn on a canvas that is part of a webpage, and this page can contain other things apart from the 3D game scene.