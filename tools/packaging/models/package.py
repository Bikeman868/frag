from config import config
from logger import Logger
from model import Model
from binary_writer import BinaryWriter
from model_writer_v1 import ModelWriter as ModelWriterV1

logger = Logger()
try:
    rootPath = config['root']
    dryRun = config['dryRun']
    logger.log('Combining Frag Blender exports from ' + rootPath, 0)
    logger.logStart()

    for package in config['packages']:
        for variant in package['variants']:
            output = variant['output']
            littleEndian = variant['littleEndian']
            version = variant["version"]
            if version == 0: version = 1 # Most recent version
            if littleEndian:
                logger.log('Creating little-endian version ' + str(version) + ' package ' + output, 0)
            else:
                logger.log('Creating big-endian version ' + str(version) + ' package ' + output, 0)

            with BinaryWriter(output, littleEndian) as writer:
                if version == 1: modelWriter = ModelWriterV1(writer)
                else: raise NotImplementedError()

                for group in package['groups']:
                    modelName = group['modelName']
                    include = group['include']
                    exclude = group['exclude']
                    logger.log('Adding ' + modelName + ' models to the package', 1)
                    for model in Model.enumerateModels(rootPath, modelName, include, exclude):
                        logger.log('Adding ' + model.name + ' from ' + model.filename, 2)
                        if not dryRun: modelWriter.write(model, littleEndian, 3)

except BaseException as error:
    logger.exception(error)
finally:
    logger.close()
