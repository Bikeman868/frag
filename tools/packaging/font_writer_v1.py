import json
from package_writer import PackageWriter
from logger import Logger
from asset_file import AssetFile

class FontWriter:
    _writer: PackageWriter

    def __init__(self, writer: PackageWriter):
        self._writer = writer

    def write(self, font: AssetFile, logIndent: int):
        pass
