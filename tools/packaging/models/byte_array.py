from struct import Struct

class ByteArray:
    MAX_CHUNK_SIZE = 65536

    _littleEndian: bool
    _chunkSize: int
    _length: int
    _byteArrays: list

    _shortStruct: Struct
    _ushortStruct: Struct
    _intStruct: Struct
    _uintStruct: Struct
    _floatStruct: Struct

    def __init__(self, capacity: int, littleEndian: bool):
        self._chunkSize = self._nextPowerOfTwo(capacity)
        if self._chunkSize > self.MAX_CHUNK_SIZE: self._chunkSize = self.MAX_CHUNK_SIZE
        self._littleEndian = littleEndian
        self._length = 0
        self._byteArrays = []

        if littleEndian:
            self._shortStruct = Struct('<h')
            self._ushortStruct = Struct('<H')
            self._intStruct = Struct('<i')
            self._uintStruct = Struct('<I')
            self._floatStruct = Struct('<f')
        else:
            self._shortStruct = Struct('>h')
            self._ushortStruct = Struct('>H')
            self._intStruct = Struct('>i')
            self._uintStruct = Struct('>I')
            self._floatStruct = Struct('>f')

    # Setting the length resizes the array

    def setLength(self, length: int):
        self._length = length
        chunks = int(length / self._chunkSize + 1)
        while len(self._byteArrays) > chunks:
            self._byteArrays.pop(len(self._byteArrays) - 1)

    def getLength(self):
        return self._length

    # Read and write bytes anywhere in the array

    def setByte(self, index: int, value: int):
        chunkIndex, chunkOffset = self._getChunk(index)
        self._byteArrays[chunkIndex][chunkOffset] = value
        return index + 1

    def getByte(self, index: int):
        chunkIndex, chunkOffset = self._getChunk(index)
        return self._byteArrays[chunkIndex][chunkOffset]

    # Write multi-byte values according to the endiness

    def setShort(self, index: int, value: int):
        return self._set(self._shortStruct, index, value)

    def setUShort(self, index: int, value: int):
        return self._set(self._ushortStruct, index, value)

    def setInt(self, index: int, value: int):
        return self._set(self._intStruct, index, value)

    def setUInt(self, index: int, value: int):
        return self._set(self._uintStruct, index, value)

    def setFloat(self, index: int, value: int):
        return self._set(self._floatStruct, index, value)

    # Read multi-byte values according to the endiness

    def getShort(self, index: int):
        return self._get(self._shortStruct, index, 2)

    def getUShort(self, index: int):
        return self._get(self._ushortStruct, index, 2)

    def getInt(self, index: int):
        return self._get(self._intStruct, index, 4)

    def getUInt(self, index: int):
        return self._get(self._uintStruct, index, 4)

    def getFloat(self, index: int):
        return self._get(self._floatStruct, index, 4)

    # Private methods

    def _set(self, struct: Struct, index: int, value: any):
        for byte in struct.pack(value):
            index = self.setByte(index, byte)
        return index

    def _get(self, struct: Struct, index: int, length: int):
        bytes = bytearray(length)
        for i in range(length):
            bytes[i] = self.getByte(index + i)
        return struct.unpack(bytes)

    def _nextPowerOfTwo(self, n: int):
        n -= 1
        n |= n >> 1
        n |= n >> 2
        n |= n >> 4
        n |= n >> 8
        n |= n >> 16
        return n + 1

    def _getChunk(self, offset: int):
        chunkIndex = int(offset / self._chunkSize)
        chunkOffset = int(offset - chunkIndex * self._chunkSize)
        if chunkIndex >= len(self._byteArrays):
            self._addChunks(chunkIndex - len(self._byteArrays) + 1)
        if offset >= self._length: self._length = offset + 1
        return (chunkIndex, chunkOffset)

    def _addChunks(self, count: int):
        for i in range(count): 
            self. _byteArrays.append(bytearray(self._chunkSize))