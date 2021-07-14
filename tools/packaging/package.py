from config import config
from logger import Logger
from asset_file import AssetFile
from package_writer import PackageWriter
from model_writer_v1 import ModelWriter as ModelWriterV1
from font_writer_v1 import FontWriter as FontWriterV1
from material_writer_v1 import MaterialWriter as MaterialWriterV1

logger = Logger()

def packageModels(inputPath: str, package: dict, modelWriter):
    for modelPattern in package['models']:
        modelName = modelPattern.get('modelName', r'{filename}')
        include = modelPattern.get('include', r'{filename}.frag_model')
        exclude = modelPattern.get('exclude', '')
        logger.log('Adding ' + modelName + ' models to the package', 1)
        for model in AssetFile.enumerateAssets(inputPath, modelName, include, exclude):
            logger.log('Adding ' + model.name + ' from ' + model.filename, 2)
            modelWriter.write(model, 3)

def packageFonts(inputPath: str, package: dict, fontWriter):
    for fontPattern in package['fonts']:
        fontName = fontPattern.get('fontName', r'{filename}')
        include = fontPattern.get('include', r'{filename}.png')
        exclude = fontPattern.get('exclude', '')
        logger.log('Adding ' + fontName + ' fonts to the package', 1)
        for font in AssetFile.enumerateAssets(inputPath, fontName, include, exclude):
            fontWriter.write(font, 2)

def packageMaterials(inputPath: str, package: dict, materialWriter):
    for materialPattern in package['materials']:
        defaultTextures = {
            'ambient': r'{name}_Ambient_Occlusion.jpg',
            'diffuse': r'{name}_Base_Color.jpg',
            'glossiness': r'{name}_Glossiness.jpg',
            'height': r'{name}_Height.jpg',
            'metal': r'{name}_Metalic.jpg',
            'normal': r'{name}_NormalOgl.jpg',
            'roughness': r'{name}_Roughness.jpg'
        }
        materialName = materialPattern.get('materialName', r'{name}')
        folder = materialPattern.get('folder', '')
        exclude = materialPattern.get('exclude', '')
        textures = materialPattern.get('textures', defaultTextures)
        materials = dict()
        for textureType in textures:
            for texture in AssetFile.enumerateAssets(inputPath, materialName, folder + textures[textureType], exclude):
                if not texture.name in materials: materials[texture.name] = dict()
                materials[texture.name][textureType] = texture
        for material in materials:
            materialWriter.write(material, materials[material], 1)

def writePackageFile(output: str, littleEndian: bool, version: int, package: dict):
    if version == 0: version = 1 # Most recent version
    if littleEndian:
        logger.log('Creating little-endian version ' + str(version) + ' package ' + output, 0)
    else:
        logger.log('Creating big-endian version ' + str(version) + ' package ' + output, 0)

    with PackageWriter(output, littleEndian) as writer:
        writer.writeHeadByte(1) # version number
        if littleEndian: 
            writer.writeHeadByte(1) # Little-endian
        else: 
            writer.writeHeadByte(2) # Big-endian
        writer.writeHeadByte(0) # Word alignment padding
        writer.writeHeadByte(0) # Word alignment padding

        if version == 1: 
            modelWriter = ModelWriterV1(writer)
            fontWriter = FontWriterV1(writer)
            materialWriter = MaterialWriterV1(writer)
        else: raise NotImplementedError()

        packageModels(inputPath, package, modelWriter)
        packageFonts(inputPath, package, fontWriter)
        packageMaterials(inputPath, package, materialWriter)

try:
    inputPath = config['input']
    outputPath = config['output']
    logger.log('Packaging Blender models from ' + inputPath + ' to ' + outputPath, 0)
    logger.logStart()

    for package in config['packages']:
        for variant in package['variants']:
            output = outputPath + variant['output']
            littleEndian = variant['littleEndian']
            version = variant["version"]
            writePackageFile(output, littleEndian, version, package)

except BaseException as error:
    logger.exception(error)
finally:
    logger.close()
