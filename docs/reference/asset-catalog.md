# Asset Catalog

This class holds named collections of fonts, materials and models. The catalog can
be filled by downloading packages from your server using a [`PackageLoader`](package-loader.md).

## Constructor
```javascript
window.frag.AssetCatalog(engine: Engine, shader: Shader | undefined, defaultTextures: Object | undefined)
```

* `engine` is the game engine for your game. It is an instance of the `Engine` class. You can 
  have more than one on a page but more often there is just one that is constructed at the 
  very beginning.
* `shader` if you pass a shader here then it will be assigned to all of the models that
  are added to the asset catalog.
* `defaultTextures` this will be used to fill the gaps in materials that are added to
  the catalog. If your shader expects certain textures to be present in materials then
  you should define defaults for these textures to ensure that every material has them.
  This is an object where the property names are the names of the textures and the property
  values are instances of the [`Texture` class](texture.md).

Note that for any constructor, you can call this function on the `engine` rather than passing
`engine` as a parameter. In this case the call looks like:

```javascript
engine.AssetCatalog(shader: Shader | undefined, defaultTextures: Object | undefined)
```

## dispose

Call the `dispose` method to release any resources consumed by the asset catalog.

## getFont(name: string): Font
Always returns a font instance even if the catalog does not contain any
fonts with this name. If the same font is added to the catalog later, then
the same font instance will be updated. This means that you can get fonts
from the catalog and use them in your scene before the package containing the
font has been downloaded and this will work correctly.

## getMaterial(name: string): Material
Always returns a material instance even if the catalog does not contain any
materials with this name. If the same material is added to the catalog later, then
the same material instance will be updated. This means that you can get materials
from the catalog and use them in your scene before the package containing the
material has been downloaded and this will work correctly.

## getModel(name: string): Model
Always returns a model instance even if the catalog does not contain any
models with this name. If the same model is added to the catalog later, then
the same model instance will be updated. This means that you can get models
from the catalog and use them in your scene before the package containing the
model has been downloaded and this will work correctly.
