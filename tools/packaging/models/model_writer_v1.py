from typing_extensions import ParamSpecArgs


from logger import Logger

class ModelWriter:
    def __init__(self, binaryWriter):
        self.writer = binaryWriter

    def write(self, fileName, logIndent):
        Logger.log('Packing ' + fileName, logIndent)
        
        self.writer.writeByte(1) # version number
        self.writer.writePad(3)

        self.writer.writeInt(123)

