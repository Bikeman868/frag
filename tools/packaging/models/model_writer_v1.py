from typing_extensions import ParamSpecArgs
from package_writer import PackageWriter
from logger import Logger
from model import Model

class ModelWriter:
    _writer: PackageWriter

    def __init__(self, writer: PackageWriter):
        self._writer = writer

    def write(self, model: Model, logIndent: int):
        self._writer.writeHeadByte(1) # version number
        if self._writer.getLittleEndian(): 
            self.writer.writeHeadByte(1)
        else: 
            self._writer.writeHeadByte(2)
        self._writer.writeHeadByte(0) # Word alignment padding
        self._writer.writeHeadByte(0) # Word alignment padding

        self._writer.startHeader(1)
        self._writer.writeIndexInt(123)
        self._writer.endHeader()
