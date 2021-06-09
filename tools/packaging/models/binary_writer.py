from struct import Struct, pack

class BinaryWriter:
    def __init__(self, filename, littleEndian):
        self.filename = filename
        if littleEndian:
            self.shortStruct = Struct('<h')
            self.ushortStruct = Struct('<H')
            self.intStruct = Struct('<i')
            self.uintStruct = Struct('<I')
            self.floatStruct = Struct('<f')
            self.stringStruct = Struct('p')
        else:
            self.shortStruct = Struct('>h')
            self.ushortStruct = Struct('>H')
            self.intStruct = Struct('>i')
            self.uintStruct = Struct('>I')
            self.floatStruct = Struct('>f')
            self.stringStruct = Struct('p')

    def __enter__(self):
        self.file = open(self.filename, 'wb')
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.file.close()
        return self

    def seek(self, offset):
        self.file.seek(offset)

    def tell(self):
        return self.file.tell()

    def writeByte(self, b):
        self.file.write(bytes([b]))
        return self

    def writePad(self, count):
        self.file.write(pack('x' * count))
        return self

    def writeShort(self, value):
        self.file.write(self.shortStruct.pack(value))
        return self

    def writeUShort(self, value):
        self.file.write(self.ushortStruct.pack(value))
        return self
                
    def writeInt(self, value):
        self.file.write(self.intStruct.pack(value))
        return self
                                
    def writeUInt(self, value):
        self.file.write(self.uintStruct.pack(value))
        return self
                                                                
    def writeFloat(self, value):
        self.file.write(self.floatStruct.pack(value))
        return self

    def writeString(self, value):
        self.file.write(self.stringStruct.pack(value))
        return self
