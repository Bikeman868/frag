# Packaging

To create models and load them into your game
1. Draw models and define animation effects in Blender
2. Install the Frag exporter addon for Blender
3. Export your models to `.frag_model` files using the Blender addon
4. Create a configuration for the model packager script
5. Run the packager Python script to combine all the `.frag_model` files into one or more package
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

## 2. Install the Frag exporter addon for Blender
To install the exporter you can copy the Python code from `./tools/blender/FragExporter` in this
repository into the Blender `addons` folder. Alternatively you can Zip this folder and use the "Install Addon"
feature in Blender - which will just unzip the Python code into the `addons` folder for you.

## 3. Export your models to `.frag_model` files using the Blender addon
* Open your `.blend` file in Blender
* Select the root object of your model. Note that this allows you to draw many models in one Blender file if you want to
* Go to the "File|Export|Frag model" option in the Blender menu
* Save the export. This will produce a `.frag_model` file and also a `.log` file that you can check for errors

## 4. Create a configuration for the model packager script
The model packager is a Python application that combines multiple `.frag_model` files into one or mode
package files. The package files use a very efficient and compact binary format that can be compressed
and delivered to the browser to get your game running as quickly as possible.

The packager is in the `./tools/packaging/` folder within this repository.

The packager uses a configuration file to locate all of the `.frag_model` files, and define which models
are packaged into which packages. If you only have a few models it migh make sense to build one package.
If different models come into play at different stages of your game, then you can build a small package
that contains only the models needed to get the game started, and one or more packages that download
in the background for later in the game.

When you run the packager you can pass the location of the configuration file on the command line. If you
don't specify this location then it defaults to `package.config.json` in the directory containing the python
script.

The checked in code contains a `package.config.json` file that builds the packages in the [samples folder](../samples)

The minimal form of the configurartion file is:
```json
{
    "model-packages":[{
        "variants":[{
            "output": "models_little.pkg",
            "littleEndian": true,
            "version": 1
        }],
        "groups":[{
            "include": "Models\\{type}\\{size}.frag_model",
            "modelName": "model_{type}{size}"
        }]
    }],
}
```

In this file:
* `variants` is a collection of package files to output. All of these files will contain the
  same set of models. The variations are in the schema version and the endiness of the binary
  data. To output the latest version omit the `version` property.
* `groups` are sets of models that have a common naming convention. The `include` property
  is a file name pattern of the models to package. These must be exported from Blender using
  the Frag exporter. The `modelName` property defines how the name of the model (in your game)
  will be derrived from the file name. The placeholders in curly braces must match the ones in the
  `include` property.
* For the `include` property, each path segment can only contain one placeholder in curly braces.
  These placeholders will match any text in the filename, and define the part of the filename
  that will be extracted and used to form the names of the models.

## 5. Run the packager Python script to combine all the `.frag_model` files into one or more package
In the `./tools/packaging/` folder there are examples of how to run the Python program and
supply command line parameters. These examples are `pack.cmd` for Windows users and `pack.sh` for
Linux and Mac users.

These sample scripts rebuild the packages in the `./samples/assets/` folder.

Since you will likely run these packaging programs many times during the development of your game
I recommend making a shell script that is specific to your folder structure so that you can run
it easily.

## 6. Host your package files on the Internet so that the game can download them
In the Frag framework you will load your models by providing a URL to the package file.
You can host this file the same way you would host your html, css etc.

I recommend building both little-endian and big-endian versions of your packages, detecting
the endiness of the players device, and downloading the one that matches, because this will
be unpacked much more efficiently on the device and the gaem will start up faster.

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
    "model-packages":[{
        "variants":[{
            "output": "models_little.pkg",
            "littleEndian": true,
            "version": 1
        },{
            "output": "models_big.pkg",
            "littleEndian": false,
            "version": 1
        }],
        "groups":[{
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
    "material-packages":[]
}
```

Note that the path separator is platform dependant

## Running the packaging Python script
This sample command will execute the packager with
* The configuration file in the current folder
* The root path for searching for `.frag_model` files defined by the `-i` argument
* The root path for outputting package files defined by the `-o` argument

```bash
python package.py -i "C:\Users\marti\Dropbox\Private\Freelance\Collonizer\Git\GameServer\Assets\Models\" -o "..\"
```

Note that that path separator is platform dependent
