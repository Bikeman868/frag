from typing_extensions import ParamSpecArgs


from logger import Logger
from model import Model

class ModelWriter:
    def __init__(self, binaryWriter):
        self.writer = binaryWriter

    def write(self, model: Model, littleEndian: bool, logIndent: int):
        Logger.log('Actually doing it', logIndent)
        self.writer.writeByte(1) # version number
        if littleEndian:
            self.writer.writeByte(1)
        else:
            self.writer.writeByte(2)
        self.writer.writePad(2)

        self.writer.writeInt(123)

