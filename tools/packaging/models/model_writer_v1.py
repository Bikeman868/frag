from typing_extensions import ParamSpecArgs


from logger import Logger

class ModelWriter:
    def __init__(self, binaryWriter):
        self.writer = binaryWriter

    def write(self, fileName, name, littleEndian, logIndent):
        Logger.log('Packing ' + name + ' from ' + fileName, logIndent)
        
        self.writer.writeByte(1) # version number
        if littleEndian:
            self.writer.writeByte(1)
        else:
            self.writer.writeByte(2)
        self.writer.writePad(2)

        self.writer.writeInt(123)

