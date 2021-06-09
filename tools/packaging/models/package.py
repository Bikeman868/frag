from config import config
from logger import Logger
from binary_writer import BinaryWriter
from model_writer_v1 import ModelWriter

logger = Logger()
try:
    logger.log('Combining Frag Blender exports from ' + config['root'], 0)
    logger.logStart()
    for package in config['packages']:
        logger.log('Creating package ' + package['output'], 0)
        with BinaryWriter(package['output'], package['littleEndian']) as writer:
            modelWriter = ModelWriter(writer)
            for type in package['types']:
                logger.log('Packing ' + type['modelName'] + ' models', 1)
                for modelFile in type['include']:
                    modelWriter.write(modelFile, 2)
except BaseException as error:
    logger.exception(error)
finally:
    logger.close()
