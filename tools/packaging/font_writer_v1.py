import json
import os
from package_writer import PackageWriter
from logger import Logger
from asset_file import AssetFile

class FontWriter:
    _writer: PackageWriter

    def __init__(self, writer: PackageWriter):
        self._writer = writer

    def write(self, font: AssetFile, logIndent: int):
        imageFilename = font.filename
        path, ext = os.path.splitext(imageFilename)
        metaFilename = path + '.json'
        with open(metaFilename, 'rt') as metaFile:
            meta = json.loads(metaFile.read())
            fontName = meta["name"]
            fontSize = meta["size"]
            fontWidth = meta["width"]
            fontHeight = meta["height"]
            chars = meta["characters"]
        Logger.log('Adding {} characters in {} point {} from {}'.format(len(chars), fontSize, fontName, imageFilename), logIndent)
        self._writer.startHeader(5)
        self._writer.writeIndexStr(font.name)
        self._writer.writeIndexStr(fontName)
        self._writer.writeIndexUShort(fontSize)
        self._writer.writeIndexUShort(fontWidth)
        self._writer.writeIndexUShort(fontHeight)
        self._writer.writeIndexUShort(len(chars))
        for char in chars:
            charData = chars[char]
            self._writer.writeIndexStr(char)
            self._writer.writeIndexUShort(charData['x'])
            self._writer.writeIndexUShort(charData['y'])
            self._writer.writeIndexUShort(charData['width'])
            self._writer.writeIndexUShort(charData['height'])
            self._writer.writeIndexShort(charData['originX'])
            self._writer.writeIndexShort(charData['originY'])
            self._writer.writeIndexShort(charData['advance'])
        self._writer.writeDataImage(imageFilename)
        self._writer.endHeader()
