# Project status
This framework is being developed alongside a game. Once the game is production 
ready this framework will be considered beta.

Right now we are still making breaking changes, so this should be considered an
alpha release for people who are interested in tracking the development of this
project. We do not recommend using this for writing production games yet.

# Concepts

# Example scenes

Here are some scenes that use Frag.

## Hello cube
This is a very simple scene that displays a spining cube with a texture painted on it.

```html
<!DOCTYPE html>
<html xmlns='http://www.w3.org/1999/xhtml' lang='en-US'>
<head>
    <title>Hello cube</title>
    <meta name='viewport' content='width=device-width, initial-scale=1.0' />
    <style>
        html,
        body {
            overflow: hidden;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
        }

        #c {
            width: 100vw;
            height: 100vh;
            touch-action: none;
            display: block;
        }
    </style>
</head>
<body>
    <canvas id='c'></canvas>
    <script src='dist/main.js'></script>
    <script>
    /* See javascript below */
    </script>
</body>
```

```javascript
const frag = window.frag;
const degToRad = Math.PI / 180;

const gameCamera = frag.PerspectiveCamera()
    .frustrum(35 * degToRad, -100, 100)
    .scaleX(100)
    .moveToZ(-120);

const gameScene = frag.Scene()
    .camera(gameCamera);

frag.mainScene(gameScene);

const shader = frag.shader()
    .name("My shader")
    .verticiesXYZ()
    .matrix3D()
    .diffuseTexture()
    .directionalLightWhite()
    .compile();

const texture = frag.Texture()
    .name('My texture')
    .dataFormat(gl.RGB)
    .fromUrl(0, 'https://ap.rdcpix.com/51c4717bcab97d0f1610abc768fca32cl-m2509308761od-w1024_h768.webp');

const material = frag.Material()
    .name('My material')
    .setTexture('diffuse', texture);

const model = frag.Model()
    .name('My model')
    .data(frag.Cube(8, { duplicateTexture: true })
        .name('My cube')
        .shadeSmooth())
    .shader(shader)
    .transform(frag.Transform2D().identity())
    .material(material);

const cube = frag.SceneObject(model)
    .enable();
cube.getPosition()
    .scale(60);
mainScene.addObject(cube);

frag.Animation()
    .repeatTicks(function () {
        const position = cube.getPosition();

        let rotationX = position.getRotateX() + 0.01;
        if (rotationX > Math.PI) rotationX -= Math.PI * 2;
        position.rotateX(rotationX);

        let rotationY = position.getRotateY() - 0.01;
        if (rotationY < -Math.PI) rotationY += Math.PI * 2;
        position.rotateY(rotationY);
    }, 5)
    .start();
```
