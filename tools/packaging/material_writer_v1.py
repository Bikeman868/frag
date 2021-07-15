import typing
from package_writer import PackageWriter
from logger import Logger
from asset_file import AssetFile

class MaterialWriter:
    _writer: PackageWriter

    def __init__(self, writer: PackageWriter):
        self._writer = writer

    def write(self, material: str, textures: typing.Mapping[str, AssetFile], logIndent: int):
        Logger.log('Adding {} material'.format(material), logIndent)
        self._writer.getOrAddMaterial(material, False)
        self._writer.writeIndexByte(len(textures))
        for textureType in textures:
            Logger.log('{} {} texture in {}'.format(material.capitalize(), textureType, textures[textureType].filename), logIndent + 1)
            self._writeTexture(textureType, textures[textureType])
        self._writer.endHeader()

    def _writeTexture(self, textureType: str, texture: AssetFile):
        self._writer.writeIndexStr(textureType)
        self._writer.writeDataImage(texture.filename)
