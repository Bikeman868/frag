# Packaging

To create models and load them into your game
1. Draw models and define animation effects in Blender
2. Install the Frag exporter addon for Blender
3. Export your models to `.frag` files using the Blender addon
4. Create a configuration for the model packager script
5. Run the packager Python script to combine all the `.frag` files into one or more package
6. Host your package files on the Internet so that the game can download them

## Examples

### Packager script configuration
This sample script will:
* Create two package files from the models
* Write the packages according to the version 1 schema
* Write `models_little.pkg` with little-endian byte ordering
* Write `models_big.pkg` with big-endian byte ordering
* Scan the file system for `Connector\*\*.frag` files and package them as models called `connector_{type}{size}`
* Scan the file system for `Building\*\*.frag` files and package them as models called `building_{type}{size}`
* Scan the file system for `Robot\*.frag` files and package them as models called `robot_{type}`

```json
{
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
            "include": "Connector\\{type}\\{size}.frag",
        },{
            "modelName": "building_{type}{size}",
            "include": "Building\\{type}\\{size}.frag",
        },{
            "modelName": "robot_{type}",
            "include": "Robot\\{type}.frag",
        }]
    }],
    "material-packages":[]
}
```

Note that the path separator is platform dependant

### Running the packaging Python script
This sample command will execute the packager with
* The configuration file in the current folder
* The root path for searching for `.frag` files defined by the `-i` argument
* The root path for outputting package files defined by the `-o` argument

```bash
python package.py -i "C:\Users\marti\Dropbox\Private\Freelance\Collonizer\Git\GameServer\Assets\Models\" -o "..\"
```

Note that that path separator is platform dependent
