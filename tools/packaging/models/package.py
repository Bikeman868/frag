from config import config
from logger import Logger
from binary_writer import BinaryWriter
from model_writer_v1 import ModelWriter

logger = Logger()
try:
    logger.log('Combining Frag Blender exports from ' + config['root'], 0)
    logger.logStart()

    for package in config['packages']:
        output = package['output']
        littleEndian = package['littleEndian']
        if littleEndian:
            logger.log('Creating little-endian package ' + output, 0)
        else:
            logger.log('Creating big-endian package ' + output, 0)

        with BinaryWriter(output, littleEndian) as writer:
            modelWriter = ModelWriter(writer)

            for type in package['types']:
                modelName = type['modelName']
                logger.log('Packing ' + modelName + ' models', 1)
                for modelFile in type['include']:
                    modelWriter.write(modelFile, modelName, littleEndian, 2)
except BaseException as error:
    logger.exception(error)
finally:
    logger.close()
