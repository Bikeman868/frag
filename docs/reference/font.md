# Font

The `Font()` function constructs a font object. The font object can be used to build 
meshes that render characters from that font.

Note that you do not usually need to construct a font object like this, the more
usual approach is to add a font to an asset package and download it into an
asset catalog.

## Example

The following example downloads a font image, defines the characters that can be 
rendered from this font, then uses it to darw some text in the scene.

```javascript
const engine = window.frag.Engine().start();

const fontImage = new Image();
fontImage.src = "http://somewhere/something.jpg";

const font = engine.Font()
    .name("MyFont")
    .fromImage(fontImage)
    .textColor([1, 0, 0, 1])
    .backgroundColor([0, 0, 0, 0])
    .lineHeight(48)
    .addChar("A", 0, 0, 24, 24, 0, 23, 26)
    .addChar("B", 25, 0, 24, 24, 0, 23, 26)
    .addChar("C", 50, 0, 24, 24, 0, 23, 26);

const textModel = font.buildTextModel("ABBCAA");
const textObject = engine.SceneObject(textModel);

const scene = engine.Scene();
scene.addObject(textObject);
```

# Functions

## addChar(char: string, x: int, y: int, width: int, height: int, originX: int, originY: int, advance: float)
Defines an area of the font bitmap that contains a character. The parameters are interpreted as follows:
* `char` the character that is in this location in the font image
* `x` the number of pixels from the left edge of the bitmap to the left edge of the character
* `y` the number of pixels from the top edge of the bitmap to the top edge of the character
* `width` the width of the character in pixels
* `height` the height of the character in pixels
* `originX` the offset in pixels from the left side of the character cell to the left edge of the text. This is used to horizontally align characters that are arranged vertically.
* `originY` the offset in pixels from the top edge of the character cell to the baseline. This is used to vertically align characters that are aranged horizontally.
* `advance` the number of pixels to advance after drawing this character.

## backgroundColor(value: float[])
You must pass an array of four floating point values for the red, green, blue and alpha
components of the color. This color will be rendered in places where the font bitmap is
black.

## buildTextMesh(text: string)
Constructs and returns a mesh comprising one rectangle per character with UV 
coordinates to map the correct character onto each rectangle. You can use this mesh
to construct models that render text.

Note that the `Font` is a `Material` and can be assigned as the material to use to
paint any model, but it works best on meshes that have been created by this function.

## buildTextModel(text: string)
Constructs a mesh comprising one rectangle per character and uses UV mapping to render the
correct character onto each rectangle.

Returns a `Model` that references this mesh, and is painted with the textue bitmap. This model
can be used exactly like any other model within the scene.

## clone()
Makes a copy of this font so that you can have different versions of the font in different
colors.

Note that if you want different character spacing etc then you don't need to clone the
font, you can just configure the values you want before calling `buildTextMesh` and the
mesh will be built with the current settings.

## fromImage(image: Image)
Loads the font image from an html `Image` element.

## kerning(value: bool)
Turning kerning on pushes the characters as close together as possible.
This can create overlap between the bounding boxes.

## letterSpacing(value: number)
Adds space between each letter. You can also pass a negative value to
push the letters closer together.

## name(value: string)
Defines the name of the font for debugging purposes

## textColor(value: float[])
You must pass an array of four floating point values for the red, green, blue and alpha
components of the color. This color will be rendered in places where the font bitmap is
white.

## updateTextModel(model: Model, text: string)
Replaces the text in a model that was constructed with the `buildTextModel` function.
Any scene objects that are based on this model will be updated because they reference the
mesh within the model for rendering efficiency. If you want different scene obejcts to 
display different text then you need to construct a separate model for each.