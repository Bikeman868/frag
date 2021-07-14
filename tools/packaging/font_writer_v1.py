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
            Logger.log('Adding {} point {} from {}'.format(meta["size"], meta["name"], imageFilename), logIndent)
            with open(imageFilename, 'rb') as imageFile:
                image = imageFile.read()
