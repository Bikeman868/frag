# Text Rendering
Many games either will not use text (because it has to be localized) or the
text they use will be on the web page in the html and not rendered to the
scene. If you do want to render text into your scene then this is supported
by the [`Font`](reference/font.md) class.

## Key Concepts
The way that test is rendered into a 3D scene is by creating a bitmap containing 
all of the characters you want to render and use this bitmap as a texture, then
use the UV coordinates to isolate the character you want to render onto a mesh.

To construct a line of text you need to make a mesh with one rectangle for each 
character in the line of text and use UV mapping to render the appropriate
character onto each rectangle.

Fortunately you have help!

These are the steps you need to code to achieve this:
* Create bitmaps containing a rendering of all the characters you need. In this
  bitmap the characters should be white and the background should be black.
* Create a json file that defines the location, size, origin and advance for each
  character in your bitmap.
* Add one or more fonts to your asset packages and download the packages into your
  game. See [packaging](packaging.md) for more details on how to do this.
* Create a font with the `window.frag.Font()` function and use fliud syntax to configure 
  it, or retrieve a font that was downloaded into an asset catalog.
* The font is basically a mesh factory and a material. It can produce models that
  render a line of text in the specified font.
* The text models can be instantiated multiple times within the scene, and can be
  scaled, moved, rotated and animated just like any other scene object.
* The `Font` object can also replace the mesh inside one of these models to change the
  text that is displayed.

## Example
This example displays the current frame rate.

The example gets an "Arial" font that was downloaded into an asset catalog from a
package, and configures its color, spacing etc. It then uses this font to construct
a model. This model will contain a mesh with one rectangle for each character in
the text. This model can then be used to construct scene objects in the usual fashion.

This sample then starts an animation that updates the text in the model (rebuilding
the mesh) with the current frame rate.

This example is taken from the [Model loader sample](../samples/model-loader.html). 
Please take a look at this sample to see the context in which this code runs.

```javascript
const font = assetCatalog.getFont("Arial")
    .backgroundColor([0, 0, 1, 0])
    .textColor([0, 0, 1, 1])
    .kerning(true)
    .letterSpacing(2);
const fpsModel = font.buildTextModel("Hello, world");
const fpsText = frag.SceneObject(fpsModel);
fpsText.getPosition()
    .scale(0.5)
    .moveByXYZ(-70, 40, -70);
scene.addObject(fpsText);
frag.Animation()
    .repeatTicks(() => {
        font.updateTextModel(fpsModel, Math.floor(frag.fps) + 'fps');
    }, 50)
    .start();
```