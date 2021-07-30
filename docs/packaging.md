# Packaging

To create models and load them into your game:
1. Draw models and define animation effects in Blender
2. Install the Frag exporter addon for Blender
3. Export your models to `.frag_model` files using the Blender addon
4. Create a configuration for the model packager script
5. Run the packager Python script to combine all the `.frag_model` files into one or more package
6. Host your package files on the Internet so that the game can download them

To create fonts and load them into your game:
1. Go to https://evanw.github.io/font-texture-generator/ and download the fonts you need
2. Copy/paste the generated json into a file stored alongside the font image
3. Create a configuration for the model packager script
4. Run the packager Python script to combine all the font files into one or more packages
5. Host your package files on the Internet so that the game can download them

To create materials and load them into your game:
1. Download and install Adobe Substance Player
2. Find or purchase some substances
3. Load substance into Substance Player, tweak the settings then export the texture files
4. Create a configuration for the model packager script
5. Run the packager Python script to combine all the texture bitmaps into one or more packages
6. Host your package files on the Internet so that the game can download them

These steps are explained in more detail below. The examples given relate to rebuilding
the packages contained in the [samples folder](../samples)

## 1. Draw models and define animation effects in Blender
We do not attempt to support all of the features of Blender because Blender is a tool that 
has many uses, and this framework is focussed on writing games. There are other WebGL
frameworks that do attempt to import a scene from Blender and reproduce it as accurately
as possible in the browser, but it was my frustration with these frameworks that led me to 
build Frag. These other frameworks put huge barriers in the path of game developers.

In this workflow we only need Blender for the following:
* Sculpting meshes and arranging them into an object hierarchy
* Assigning material names to meshes. Note that the materials are not extracted, just the names
* Defining animations using either the Dope Editor or NLA Strips

We do not use Blender for any of the following:
* Designing materials using the Node Editor
* Defining the scene content
* Lighting

Note that we do not export materials from Blender. This doesn't work for games because:
* The node based material definitions are too big and slow work for a game
* The same model should look different for each player, i.e. same model with different materials
* The materials used typically vary by level or scenario within your game

When creating models in Blender follow these guidelines
* Start by creating an "Empty" and position it on the groumd where you want the origin of your 
model to be.
* When you scale or rotate your model in the game, the "Empty" at the root of the obejct hierarchy 
will be the centre of rotation and scaling.
* When you position your object within the game scene, the "Empty" at the root of the object hierarchy
will be placed at this location, and the rest of the model will be drawn relative to this.
* Parent all of the other parts of your model to the "Empty". Each part of the model can contain
child objects etc to any depth.
* The name of the "Empty" is irrelevant, so call it anything you like.
* Name any objects within your model that you want to annimate. Objects that are not animated do not
need to be named, but naming them can help with debugging issues.
* If you create animations by adding "Actions" to the "Dope Sheet" then each object can only have one 
animation. Since dope sheet actions must have unique names, but you might want multiple objects to move 
when an animation is started. To make this work, you must name your actions by combining the name of the 
object and the name of the animation. For example if you have wheels on your model that should all turn 
together when the "Moving" animation is started, and if your wheels are named "Wheel1" and "Wheel2", 
then the dope sheet actions must be called "Wheel1Moving" and "Wheel2Moving" for them to work.
* If you push dope sheet actions down onto NLA action strips, then you should name the action strips
with whatever you want the animation to be called within the game. For example if you create an action 
strip called "Moving" then scene objects created from this model will have an `animations.moving` property
that can be used to start and stop the animation. In this case it doesn't matter how you name the Actions.
Pushing Actions down onto Action Strips allows you to define multiple animations for the same object.
* You can mix NLA Action Strips and Dope Sheet Actions in the same Blender file. For Actions that are
not pushed onto Action Strips, the name of the Action defines the name of the animation in Frag after
stripping off the object name prefix. For Actions that are pushed down onto Action Strips, the name of the 
action strip will be the name of the animation in Frag.
* Material names are exported from Blender but not the materials themselves. This means that you can
create materials in Blender with any characterstics you like, only the name of the material matters. Frag
works this way because it is much more efficient to reuse materials accross multiple models. The assumption
is that you will draw many models using the same material names in each model, then import the materials
into the game once only and apply them to all of the models within the game. You can also define your materials
in code if you like rather than importing them.

## 2. Install the Frag exporter addon for Blender
To install the exporter you can copy the Python code from `./tools/blender/FragExporter` in this
repository into the Blender `addons` folder. Alternatively you can Zip this folder and use the "Install Addon"
feature in Blender - which will just unzip the Python code into the `addons` folder for you.

## 3. Export your models to `.frag_model` files using the Blender addon
* Open your `.blend` file in Blender
* Go to the "File|Export|Frag model" option in the Blender menu
* Save the export. This will produce a `.frag_model` file and also a `.log` file that you can check for errors

## 4. Generate the fonts you need
If you want to draw text in your OpenGL scene then you will need to generate some font textures. Note that
you can also create the game UI in the web page using Vue.js, Angular.js, React.js etc and jut have
the game scene rendered onto a canvas in the page. In this case you may not need any fonts.
* Nativate to https://evanw.github.io/font-texture-generator/
* Choose a bitmap size that is a power of 2
* Choose your font family and other settings
* Download the font bitmap file onto your computer
* Copy the generated json and save it into a `.json` file alongside the font bitmap file. 
  It must be in the same folder and have the same filename but have a `.json` file extension.

## 5. Create the materials that you need
You don't have to package materials. If you want to use solid colors in your game that you can easily
create materials programmatically. Most of the [samples](../samples) do this just to keep the samples
easy to understand.

Materials are defined using a collection of bitmaps. Each bitmap represents one aspect of how the
model surface is rendered. For example one bitmap can define how rough or smooth the surface is and
another defines how dull or shiny it is etc. These bitmaps can be generated from a substance file
using a substance player. This is the approach that Frag supports.
* Download and install the Adobe Substance Player application.
* Purchase or download free substances, or use Adobe Substance Designer to build your own substances.
* Open your substance in Substace Player and play with the settings to get the look that you want
* Export the substance into a set of bitmap files. The files will all have the same prefix and various 
  suffixes to let you knoe which ones are the glossiness etc.

## 6. Create a configuration for the packager script
The packager is a Python application that combines multiple `.frag_model` files, font files and textures
into one or more package files. The package files use a very efficient and compact binary format that 
can be compressed and delivered to the browser to get your game running as quickly as possible.

The packager is in the `./tools/packaging/` folder within this repository.

The packager uses a configuration file to locate all of the files to package, and define which models, fonts
and materials are packaged into which packages. If you only have a few assets it migh make sense to build one package.
If different assets come into play at different stages of your game, then you can build a small package
that contains only the assets needed to get the game started, and one or more packages that are download
in the background for later in the game.

When you run the packager you can pass the location of the configuration file on the command line. If you
don't specify this location then it defaults to `package.config.json` in the directory containing the python
script.

The checked in code contains a `package.config.json` file that builds the packages in the [samples folder](../samples)

This is an example of a very simple packager configuration. It creates one package file with
little-endian byte ordering that contains some models, fonts and materials using default naming:
```json
{
    "packages":[{
        "variants":[{
            "output": "models_little.pkg",
            "littleEndian": true,
            "version": 1
        }],
        "models":[{
            "include": "Models\\{type}\\{size}.frag_model",
            "modelName": "model_{type}{size}"
        }],
        "fonts":[{
            "include": "Fonts\\{name}.png",
            "fontName": "{name}"
        }],
        "materials":[{
            "folder": "materials\\",
            "materialName": "{name}",
            "textures": {
                "diffuse": "{name}_Base_Color.jpg"
            }
        }]
    }]
}
```

In this file:
* `variants` is a collection of package files to output. All of these files will contain the
  same set of assets. The variations are in the schema version and the endiness of the binary
  data. To output the latest version omit the `version` property.
* `models` are sets of models that have a common naming convention. The `include` property
  is a file name pattern of the models to package. These must be exported from Blender using
  the Frag exporter. The `modelName` property defines how the name of the model (in your game)
  will be derrived from the file name. The placeholders in curly braces must match the ones in the
  `include` property.
* For the `include` property, each path segment can only contain one placeholder in curly braces.
  These placeholders will match any text in the filename, and define the part of the filename
  that will be extracted and used to form the names of the models.
* `fonts` are sets of fonts that have a common naming convention. The rules are similar to the
  rules for models.
* `materials` are sets of texture files that define materials and have a common naming convention. 
  The rules are similar to the rules for models except that you need to specify how the various
  texture file names are formed. The example above matches the default configuration of Substance Player.

## 7. Run the packager Python script to combine all the asset files into one or more package
In the `./tools/packaging/` folder there are examples of how to run the Python program and
supply command line parameters. These examples are `pack.cmd` for Windows users and `pack.sh` for
Linux and Mac users.

These sample scripts rebuild the packages in the `./samples/assets/` folder.

Since you will likely run these packaging programs many times during the development of your game
I recommend making a shell script that is specific to your folder structure so that you can run
it easily.

## 8. Host your package files on the Internet so that the game can download them
In the Frag framework you will load your models by providing a URL to the package file.
You can host this file the same way you would host your html, css etc.

I recommend building both little-endian and big-endian versions of your packages, detecting
the endiness of the players device, and downloading the one that matches, because this will
be unpacked much more efficiently on the device and the game will start up faster.

# Examples

## Packager script configuration
This sample script will:
* Create two package files from the models
* Write the packages according to the version 1 schema
* Write `models_little.pkg` with little-endian byte ordering
* Write `models_big.pkg` with big-endian byte ordering
* Scan the file system for `Connector\*\*.frag_model` files and package them as models called `connector_{type}{size}`
* Scan the file system for `Building\*\*.frag_model` files and package them as models called `building_{type}{size}`
* Scan the file system for `Robot\*.frag_model` files and package them as models called `robot_{type}`

```json
{
    "input": "..\\assets\\",
    "output": "..\\assets\\",
    "packages":[{
        "variants":[{
            "output": "models_little.pkg",
            "littleEndian": true,
            "version": 1
        },{
            "output": "models_big.pkg",
            "littleEndian": false,
            "version": 1
        }],
        "models":[{
            "modelName": "connector_{type}{size}",
            "include": "Connector\\{type}\\{size}.frag_model",
        },{
            "modelName": "building_{type}{size}",
            "include": "Building\\{type}\\{size}.frag_model",
        },{
            "modelName": "robot_{type}",
            "include": "Robot\\{type}.frag_model",
        }]
    }],
}
```

Note that the path separator is platform dependant

## Running the packaging Python script
This sample command will execute the packager with
* The configuration file in the current folder
* The root path for searching for `.frag_model` files defined by the `-i` argument
* The root path for outputting package files defined by the `-o` argument

```bash
python package.py -i "C:\Git\GameServer\Assets\Models\" -o "..\"
```

Note that that path separator is platform dependent
