from struct import Struct, pack
from byte_array import ByteArray
from config import config

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

    _materials: map

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

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
        return False

    def close(self):
        if not config['dryRun']:
            file = open(self._filename, 'wb')
            try:
                self._head.writeTo(file)
                self._index.writeTo(file)
                self._data.writeTo(file)
            finally:
                file.close()

    # Materials

    def getOrAddMaterial(self, materialName: str):
        if materialName in self._materials:
            return self._materials[materialName]

        materialIndex = self.startHeader(1)
        self.writeIndexStr(materialName)
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

