import glob
import re
import os

class NameField:
    def __init__(self, identifier, segment, start, end):
        self.identifier = identifier
        self.segment = segment
        self.start = start
        self.end = end

    def __repr__(self): return 'NameField(' + self.identifier + '=>[' + str(self.segment) + '][' + str(self.start) + ',' + str(self.end) + '])'

class AssetFile:
    @property
    def name(self): return self.__name

    @property
    def filename(self): return self.__filename

    def __init__(self, name, filename):
        self.__name = name
        self.__filename = filename

    @staticmethod
    def enumerateAssets(rootPath, assetNamePattern, include, exclude):
        rootSegments = rootPath.split(os.path.sep)

        fields = []
        includeSegments = include.split(os.path.sep)
        for i in range(len(includeSegments)):
            segment = includeSegments[i]
            fieldStart = segment.find('{')
            if fieldStart >=0:
                fieldEnd = segment.find('}')
                if fieldEnd == len(segment) - 1:
                    fieldEnd = None
                    replEnd = None
                else:
                    fieldEnd += 1
                    replEnd = fieldEnd - len(segment)
                identifier = segment[fieldStart:fieldEnd]
                segmentIndex = i + len(rootSegments) - 1
                fields.append(NameField(identifier, segmentIndex, fieldStart, replEnd))

        assets = []
        pattern = rootPath + re.sub(r'{[^}]*}', '*', include)
        for filename in glob.iglob(pattern):
            pathSegments = filename.split(os.path.sep)
            assetName = assetNamePattern
            for field in fields:
                assetName = assetName.replace(field.identifier, pathSegments[field.segment][field.start:field.end])
            assets.append(AssetFile(assetName, filename))
        return assets
