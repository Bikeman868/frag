from struct import Struct, pack
from byte_array import ByteArray
from config import config
from PIL import Image

class PackageWriter:
    _filename: str
    _littleEndian: bool

    _head: ByteArray
    _index: ByteArray
    _data: ByteArray

    _headOffset: int
    _indexOffset: int
    _dataOffset: int

    _headerIndex: int
    _headerStart: int

    _materials: dict

    def __init__(self, filename, littleEndian):
        self._filename = filename
        self._littleEndian = littleEndian
        self._head = ByteArray(20, littleEndian)
        self._index = ByteArray(5000, littleEndian)
        self._data = ByteArray(100000, littleEndian)
        self._headOffset = 0
        self._indexOffset = 0
        self._dataOffset = 0
        self._headerIndex = -1
        self._materials = dict()

    def __enter__(self):
        return self

    def __exit__(self, errorType, error, stack):
        self.close()
        return False

    def close(self):
        padBytes = 4 - (self._index.getLength() & 3)
        if padBytes < 4: 
            for i in range(padBytes): self.writeIndexByte(0)
        self.writeHeadUInt(self._index.getLength())

        if config['dryRun']: return
        
        file = open(self._filename, 'wb')
        try:
            self._head.writeTo(file)
            self._index.writeTo(file)
            self._data.writeTo(file)
        finally:
            file.close()

    # Materials

    def getOrAddMaterial(self, materialName: str, headerOnly: bool):
        materialIndex = self._materials.get(materialName, None)
        if materialIndex == None:
            materialIndex = self.startHeader(1)
            self.writeIndexStr(materialName)
            if headerOnly: 
                self.writeIndexByte(0) # no textures
                self.endHeader()
            self._materials[materialName] = materialIndex
        return materialIndex

    # Creating headers in the index

    def startHeader(self, headerType: int):
        self._headerIndex += 1
        self._headerStart = self._indexOffset
        self.writeIndexUShort(0) # Placeholder for the length
        self.writeIndexUShort(self._headerIndex)
        self.writeIndexByte(headerType)
        return self._headerIndex

    def endHeader(self):
        size = self._indexOffset - self._headerStart
        self._index.setUShort(self._headerStart, size)

    # Writing to the head area

    def writeHeadByte(self, value: int):
        self._headOffset = self._head.setByte(self._headOffset, value)

    def writeHeadUInt(self, value: int):
        self._headOffset = self._head.setUInt(self._headOffset, value)

    # Writing to the index area

    def writeIndexByte(self, value: int):
        self._indexOffset = self._index.setByte(self._indexOffset, value)

    def writeIndexShort(self, value: int):
        self._indexOffset = self._index.setShort(self._indexOffset, value)

    def writeIndexUShort(self, value: int):
        self._indexOffset = self._index.setUShort(self._indexOffset, value)

    def writeIndexInt(self, value: int):
        self._indexOffset = self._index.setInt(self._indexOffset, value)

    def writeIndexUInt(self, value: int):
        self._indexOffset = self._index.setUInt(self._indexOffset, value)

    def writeIndexFloat(self, value: int):
        self._indexOffset = self._index.setFloat(self._indexOffset, value)

    def writeIndexStr(self, value: str):
        strBytes = value.encode('utf-8')
        self.writeIndexByte(len(strBytes))
        for strByte in strBytes: self.writeIndexByte(strByte)

    def writeDataOffset(self):
        extraBytes = self._dataOffset % 4
        if extraBytes > 0:
            for i in range(4 - extraBytes): self.writeDataByte(0) # word alignment
        self.writeIndexUInt(self._dataOffset)

    # writing to the data area

    def writeDataByte(self, value: int):
        self._dataOffset = self._data.setByte(self._dataOffset, value)

    def writeDataShort(self, value: int):
        self._dataOffset = self._data.setShort(self._dataOffset, value)

    def writeDataUShort(self, value: int):
        self._dataOffset = self._data.setUShort(self._dataOffset, value)

    def writeDataInt(self, value: int):
        self._dataOffset = self._data.setInt(self._dataOffset, value)

    def writeDataUInt(self, value: int):
        self._dataOffset = self._data.setUInt(self._dataOffset, value)

    def writeDataFloat(self, value: int):
        self._dataOffset = self._data.setFloat(self._dataOffset, value)

    def writeDataStr(self, value: str):
        strBytes = value.encode('utf-8')
        self.writeIndexByte(len(strBytes))
        for strByte in strBytes: self.writeDataByte(strByte)

    def writeDataImage(self, filename: str):
        with Image.open(filename) as image:
            width, height = image.size
            self.writeIndexStr(image.mode)
            self.writeIndexUShort(width)
            self.writeIndexUShort(height)
            self.writeDataOffset()
            pixels = image.load()
            if image.mode == 'RGB':
                for y in range(height):
                    for x in range(width):
                        r, g, b = pixels[x,y]
                        self.writeDataByte(r)
                        self.writeDataByte(g)
                        self.writeDataByte(b)
            elif image.mode == 'RGBA':
                for y in range(height):
                    for x in range(width):
                        r, g, b, a = pixels[x,y]
                        self.writeDataByte(r)
                        self.writeDataByte(g)
                        self.writeDataByte(b)
                        self.writeDataByte(a)
            elif image.mode == 'L':
                for y in range(height):
                    for x in range(width):
                        l = pixels[x,y]
                        self.writeDataByte(l)
            else:
                raise NotImplementedError('Unknown image format ' + image.mode)
