from struct import Struct, pack
from byte_array import ByteArray

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
        file = open(self._filename, 'wb')
        try:
            for i in range(self._head.getLength()): 
                file.write(bytes([self._head.getByte(i)]))
            for i in range(self._index.getLength()): 
                file.write(bytes([self._index.getByte(i)]))
            for i in range(self._data.getLength()): 
                file.write(bytes([self._data.getByte(i)]))
        finally:
            file.close()
        return self

    def getLittleEndian(self):
        return self._littleEndian

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
        self.writeIndexByte(len(value))
        for ch in value: self.writeIndexByte(int(ch))

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
        self.writeDataByte(len(value))
        for ch in value: self.writeDataByte(int(ch))

