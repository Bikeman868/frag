# Package Loader
To construct a new package loader object call the `PackageLoader` method, then use
fluent syntax to configure the attributes of the package loader and load
packages.

The package loader can be used to download assets that were packaged by the
packaging python script. See [packaging](../packaging.md) for details of how
to assemble assets and package them ready for downloading.

The assets that you can package and download are: Materials and their textures,
models with child sub-models and their meshes, and fonts.

## Constructor
```javascript
window.frag.PackageLoader(engine: Engine)
```

* `engine` is the game engine for your game. It is an instance of the `Engine` 
  class. You can have more than one on a page but more often there is just one
  that is constructed at the very beginning.

Note that for any constructor, you can call this function on the `engine` rather 
than passing `engine` as a parameter. In this case the call looks like:

```javascript
engine.PackageLoader()
```

## Examples
The [model loader sample](../../samples/model-loader.html) is a great example of
how to download a package of assets and use those assets within the game.

Note that in this example the parent model has no mesh and therefore does not draw 
anything, it just provides an anchor point that can be moved around the scene to
move both butterfly wings together. I attached a shader and material to this empty
model because these settings will be inherited by the child models.

```javascript
const engine = window.frag.Engine().start();
const camera = engine.FrustumCamera().frustum(60, 50, 2000);
const scene = engine.Scene().camera(camera);
engine.mainScene(scene);

// This function will be called when the package has been dowloaded into an asset catalog
const assetsLoaded = function(assetCatalog) {
  // Get the 'excavator' model from the package
  const excavatorModel = assetCatalog.getModel('excavator');

  // Construct an excavator from this model
  const excavator = engine.SceneObject(excavatorModel);

  // Add the excavator to the scene
  scene.addObject(excavator);
}

// If you associate a shader with the asset catalog it will be attached to
// all of the models that are loaded into the asset catalog
const shader = engine.Shader().compile();
const assetCatalog = engine.AssetCatalog(shader);

// Create a package loader instance
const packageLoader = engine.PackageLoader();

// For efficiency you should download a package that matches the endiness
// of the devce running the game.
const packageUrl = packageLoader.littleEndian ? 'assets/little-endian.pkg' : 'assets/big-endian.pkg';
packageLoader.loadFromUrl(packageUrl, assetCatalog, assetsLoaded)

```

## dispose()
Frees resources consumed by the package loader.

## loadFromBuffer(buffer: ArrayBuffer, assetCatalog: AssetCatalog | undefined): AssetCatalog
Loads a package into an [AssetCatalog](asset-catalog.md) from a binary array and
returns the asset catalog. If you pass an existing asset catalog the new assets
will be added to it, othereise a new asset catalog will be created for you.

## loadFromUrl(url: string, assetCatalog: AssetCatalog | undefined, onload: Function(assetCatalog: AssetCatalog) | undefined): PackageLoader
Asynchronously downloads a package from the internet into an 
[AssetCatalog](asset-catalog.md). If you pass an existing asset catalog the new assets
will be added to it, othereise a new asset catalog will be created for you.

You can optionally pass an `onload` function that will be called when the assets have been
loaded from the package. The `onload` function will be passed the asset catalog.