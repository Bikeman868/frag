from config import config
from logger import Logger
from asset_file import AssetFile
from package_writer import PackageWriter
from model_writer_v1 import ModelWriter as ModelWriterV1
from font_writer_v1 import FontWriter as FontWriterV1
from material_writer_v1 import MaterialWriter as MaterialWriterV1

logger = Logger()
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

                for modelPattern in package['models']:
                    modelName = modelPattern.get('modelName', r'{filename}')
                    include = modelPattern.get('include', r'{filename}.frag_model')
                    exclude = modelPattern.get('exclude', '')
                    logger.log('Adding ' + modelName + ' models to the package', 1)
                    for model in AssetFile.enumerateAssets(inputPath, modelName, include, exclude):
                        logger.log('Adding ' + model.name + ' from ' + model.filename, 2)
                        modelWriter.write(model, 3)

                for fontPattern in package['fonts']:
                    fontName = modelPattern.get('fontName', r'{filename}')
                    include = modelPattern.get('include', r'{filename}.png')
                    exclude = modelPattern.get('exclude', '')
                    logger.log('Adding ' + fontName + ' fonts to the package', 1)
                    for font in AssetFile.enumerateAssets(inputPath, modelName, include, exclude):
                        logger.log('Adding ' + font.name + ' from ' + font.filename, 2)
                        fontWriter.write(font, 3)

                for materialPattern in package['materials']:
                    materialName = modelPattern.get('materialName', r'{filename}')
                    include = modelPattern.get('include', r'{filename}.jpg')
                    exclude = modelPattern.get('exclude', '')
                    textures = modelPattern.get('textures', dict())
                    logger.log('Adding ' + materialName + ' materials to the package', 1)
                    for material in AssetFile.enumerateAssets(inputPath, materialName, include, exclude):
                        logger.log('Adding ' + material.name + ' from ' + material.filename, 2)
                        materialWriter.write(material, textures, 3)

except BaseException as error:
    logger.exception(error)
finally:
    logger.close()
