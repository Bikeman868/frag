# Texture
Textures are just bitmaps that can be assigned to one or more materials.
How the bitmap will be used to render the scene is defined by the shader.

## Constructor
```javascript
window.frag.Texture(engine: Engine)
```

* `engine` is the game engine for your game. It is an instance of the `Engine` class. You can 
  have more than one on a page but more often there is just one that is constructed at the 
  very beginning.

Note that for any constructor, you can call this function on the `engine` rather than passing
`engine` as a parameter. In this case the call looks like:

```javascript
engine.Texture()
```

## Examples
This is an example of creating a new texture and assigning it to
a material as the 'emmissive' characteristic of the model surface.

```javascript
const engine = window.frag.Engine().start();

const texture = engine.Texture()
  .name('My emmissive texture')
  .dataFormat(engine.gl.RGB)
  fromUrl(0, 'emmissive_64x64.jpg')
  fromUrl(1, 'emmissive_32x32.jpg')
  fromUrl(2, 'emmissive_16x16.jpg')
  fromUrl(3, 'emmissive_8x8.jpg')
  fromUrl(4, 'emmissive_4x4.jpg')
  fromUrl(5, 'emmissive_2x2.jpg')
  fromUrl(6, 'emmissive_1x1.jpg');

const material = engine.Material()
  .setTexture("emmissive", texture);
```

## Mip levels
Mip levels represent different levels of detail. The WebGL engine will choose
a mip level that is the most efficient for rendering based on the size of the
mesh in screen pixels.

You can supply your own bitmaps for each mip level, or you can just supply
level 0 and allow the framework to generate all of the other levels for you. You
cannot define only some of the mip levels, it's all or nothing.

The largest version of the texture is mip level 0. Subsequent mip levels are
half the width and half the height. You must keep going all the way down to
a 1x1 pixel image.

Because of the requirement to halve the width and height with each subsequent
mip level, the largest size (mip level 0) should have a width and height that
is a power of 2.

## dispose()
Frees resources consumed by the texture.

## disposeTextures(dispose: bool)
If the material is configured to dispose of textures then it will
dispose any textures that are no longer used by the material.

## name(name: string)
The name function sets the name of the texture. This is only useful for
debugging purposes, the framework does not use the texture name.

## dataFormat(format: int)
Defines the format to use in the graphics card to store this
texture. Using more channels will pass more information to the shader
but consumes more memory on the graphics card.

The values of the format parameter are defined by WebGL. The supported
options are:

* `engine.gl.RGBA` this is the default. Uses 4 bytes per pixel.
* `engine.gl.RGB` uses 3 bytes per pixel. The alpha component will always be fully opaque.
* `engine.gl.LUMINANCE_ALPHA` uses 2 bytes per pixel for brightness and transparency.
* `engine.gl.LUMINANCE` uses 1 bytes per pixel for brightness only.
* `engine.gl.ALPHA` uses 1 bytes per pixel for transparency only.

## fromArrayBuffer(level: int, buffer: ArrayBuffer, offset: int, width: int, height: int)
Allows you to supply bitmap data in an array. You can construct the array
in code, or download the data from a back-end service.

* `level` parameter is the mip level that you are defining - see description above.
* `buffer` is a Javascript ArrayBuffer instance containing the pixel data
* `offset` is the offset into the buffer where the pixel data begins
* `width` is the width of the bitmap in pixels
* `height` is the height of the bitmap in pixels

The data in the `buffer` must match the structure defined by the `dataFormat` method call,
and `dataFormat` must be called before calling `fromArrayBuffer`.

This is an example of creating a 1x1 pixel texture using `ArrayBuffer`
```javascript
const level = 0;
const width = 1;
const height = 1;
const red = 167;
const green = 89;
const blue = 54;
const pixelData = new Uint8Array([red, green, blue]);

const texture = engine.Texture()
  .dataFormat(engine.gl.RGB)
  .fromArrayBuffer(level, pixelData, 0, width, height);
```

## fromImage(level: int, image: Image)
Sets the pixel data from an html Image element.

* `level` parameter is the mip level that you are defining - see description above
* `image` is a Javascript Image element

If you call this method from the `onload` event of the image then the image will
be assigned to the texture immediately, otherwise this function will attach an
`onload` handler to the image and initialize the texture when the image finished loading.

## fromUrl(level: int, url: string, crossOrigin?: string)
Sets the pixel data by downloading an image from the specified url.

* `level` parameter is the mip level that you are defining - see description above
* `url` parameter is any url that is valid as the `src` attribute of an image element
* `crossOrigin` parameter is an optional crossOrigin attribute to set for the image

## fromScene(scene: Scene, width: int, height: int)
Specifies that a Frag Scene should be rendered to produce the texture bitmap.
This scene can contain anything that scenes usually contain, and must have a 
camera defined that projects the scene onto a viewport.

If the scene changes amd you want to update the texture by re-rendering the scene,
then call the `update()` method of the texture. Note that this not only renders the
scene, but also creates all of the mip levels down to 1x1 pixel, so it is very expensive.

* `scene` the Frag framework scene to render into this texture
* `width` the width of the bitmap to render the scene onto - should be a power of 2
* `height` the height of the bitmap to render the scene onto - should be a power of 2

## update()
If this texture is from a scene, calling the update method will re-render the scene,
capture the output as a bitmap, upload this bitmap to the graphics card, generate
all mip levels down to 1x1 pixel, and upload all of those bitmaps to the graphics card.