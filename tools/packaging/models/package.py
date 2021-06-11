from config import config
from logger import Logger
from model import Model
from package_writer import PackageWriter
from model_writer_v1 import ModelWriter as ModelWriterV1

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
                    writer.writeHeadByte(1)
                else: 
                    writer.writeHeadByte(2)
                writer.writeHeadByte(0) # Word alignment padding
                writer.writeHeadByte(0) # Word alignment padding

                if version == 1: modelWriter = ModelWriterV1(writer)
                else: raise NotImplementedError()

                for group in package['groups']:
                    modelName = group['modelName']
                    include = group['include']
                    exclude = group['exclude']
                    logger.log('Adding ' + modelName + ' models to the package', 1)
                    for model in Model.enumerateModels(inputPath, modelName, include, exclude):
                        logger.log('Adding ' + model.name + ' from ' + model.filename, 2)
                        modelWriter.write(model, 3)

except BaseException as error:
    logger.exception(error)
finally:
    logger.close()
