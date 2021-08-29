# Things that need to be added or improved

## Bug fixes
In the truck on a track sample, the pitch of the truck in not adjusted to the rise and fall of the track.

## Core features that are missing
* Shader support for glossinness textures
* Shader support for roughness textures
* Shader support for ambient occlusion textures
* Shader support for metalic textures
* Armatures, bones and mesh animation
* Vector fonts as 2D mesh per ASCII character
* Analog input methods for accelerometer and device orientation
* Better handling of velocity and acceleration for analog inputs
* Point source lights and shadows
* Hemispherical lights
* Place the scene inside a sphere or box with a material painted onto the inside
* Frustum culling

## Optional nice to have features
* Play sounds synced with animations. This is nice to have because there are better libraries for playing sounds. This is a WebGL wrapper and WebGL does not provide any sound playing capabilities.
* UI widgets such as menus, dockable panels, modal popups etc. This is nice to have because it doesn't really make sense to render the UI along with the main scene 40 times per second. There are great frameworks like React.js and Vue.js that are extremely well suited to building user interfaces. The game is drawn on a canvas that is part of a webpage, and this page can contain other things apart from the 3D game scene.