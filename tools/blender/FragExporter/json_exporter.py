import json

from .logger import Logger
from .serializer import FragSerializer

class JsonExporter:
    
    def write_json(self, filepath, data):
        json_text = json.dumps(data, indent=None)
        f = open(filepath, 'w', encoding='utf-8')
        try:
            f.write(json_text)
        finally:
            f.close()
        return {'FINISHED'}

    def execute(self, context, filepath):
        scene = context.scene
        self.scene = scene
        self.fatalError = None
        self.nErrors = 0
        self.nWarnings = 0

        logger = Logger(filepath.rpartition('.')[0] + '.log')
        try:
            serializer = FragSerializer(context)
            data = serializer.serialize(context.object)
            return self.write_json(filepath, data)
        except BaseException as error:
            self.fatalError = str(error)
            Logger.exception(error)
        finally:
            logger.close()
