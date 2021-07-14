import json
from package_writer import PackageWriter
from logger import Logger
from asset_file import AssetFile

class MaterialWriter:
    _writer: PackageWriter

    def __init__(self, writer: PackageWriter):
        self._writer = writer

    def write(self, material, textures: dict, logIndent: int):
        Logger.log('Adding {} material'.format(material), logIndent)
        for textureType in textures:
            Logger.log('{} {} texture in {}'.format(material.capitalize(), textureType, textures[textureType].filename), logIndent + 1)

