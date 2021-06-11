import json
from typing_extensions import ParamSpecArgs
from package_writer import PackageWriter
from logger import Logger
from model import Model

class ModelWriter:
    _writer: PackageWriter

    def __init__(self, writer: PackageWriter):
        self._writer = writer

    def write(self, model: Model, logIndent: int):
        with open(model.filename, 'rt') as file:
            modelJson = json.loads(file.read())

        if 'config' in modelJson: config = modelJson['config']
        else: config = dict()

        if 'animations' in modelJson: animations = modelJson['animations']
        else: animations = dict()

        if 'meshes' in modelJson: meshes = modelJson['meshes']
        else: meshes = dict()

        if 'objects' in modelJson: objects = modelJson['objects']
        else: objects = dict()

        if 'fps' in config: fps = config['fps']
        else: fps = 30
        msPerFrame = int(1000 / fps)

        Logger.log(str(len(animations)) + ' animations, ' + str(len(meshes)) + ' meshes, ' + str(len(objects)) + ' models', logIndent)

        self._writeMeshes(meshes)
        self._extractModelAnimations(objects, animations)
        self._writeAnimations(animations, msPerFrame)

        rootModel = None
        self._writeModels(objects, rootModel)

    def _writeMeshes(self, meshes):
        for mesh in meshes:
            mesh['headerIndex'] = self._writer.startHeader(2)
            try:
                self._writer.writeIndexUShort(1) # Only 1 fragment
                self._writer.writeIndexByte(1) # Distinct triangles
                self._writer.writeIndexByte(3) # Indexed 3D vertices
                self._writer.writeIndexByte(3) # One normal vector per triangle
                self._writer.writeIndexByte(0) # No tangent vectors
                self._writer.writeIndexByte(0) # No bitangent vectors
                self._writer.writeIndexByte(0) # No UV coordinates
                self._writer.writeIndexByte(0) # No colors
                self._writer.writeIndexUInt(len(mesh['triangles']) * 3) # vertices in the mesh
                self._writer.writeIndexUInt(len(mesh['vertices'])) # Distinct vertices in the index
                self._writer.writeDataOffset()

                for triangle in mesh['triangles']:
                    for vertex in triangle['vertices']:
                        self._writer.writeDataUShort(vertex)

                if len(mesh['triangles']) & 1 == 1:
                    self._writer.writeDataUShort(1) # word alignment padding

                for vertex in mesh['vertices']:
                    self._writer.writeDataFloat(vertex[0])
                    self._writer.writeDataFloat(vertex[1])
                    self._writer.writeDataFloat(vertex[2])

                for triangle in mesh['triangles']:
                    normal = triangle['normal']
                    self._writer.writeDataFloat(normal[0])
                    self._writer.writeDataFloat(normal[1])
                    self._writer.writeDataFloat(normal[2])
            finally:
                self._writer.endHeader()

    def _extractModelAnimations(self, models, animations):
        for animation in animations:
            for group in animation['groups']:
                for channel in group['channels']:
                    channel['pattern'] = '^blah$'

    def _writeAnimations(self, animations, msPerFrame):
        for animation in animations:
            animation['headerIndex'] = self._writer.startHeader(3)
            try:
                name = animation['name'].lower()
                frameStart = animation['frames'][0]
                frameEnd = animation['frames'][1]
                flags = 0
                if 'loop' in animation and animation['loop']: flags |= 1
                channelCount = 0
                for group in animation['groups']: channelCount += len(group['channels'])

                self._writer.writeIndexStr(name)
                self._writer.writeIndexByte(flags)
                self._writer.writeIndexUShort(int(frameEnd - frameStart + 1))
                self._writer.writeIndexUShort(msPerFrame)
                self._writer.writeIndexByte(channelCount)

                for group in animation['groups']:
                    for channel in group['channels']:
                        pattern = channel['pattern']
                        dataPath = channel['data_path']
                        dataIndex = channel['array_index']

                        self._writer.writeIndexStr(pattern)
                        if (dataPath == 'location'): 
                            self._writer.writeIndexStr('translate-' + 'xyz'[dataIndex])
                        elif (dataPath == 'rotation_euler'): 
                            self._writer.writeIndexStr('rotate-' + 'xyz'[dataIndex])
                        else: 
                            Logger.warn('Unsupported data path ' + dataPath)
                            self._writer.writeIndexStr('')
                        self._writer.writeIndexUShort(len(channel['keyframes']))

                        for keyframe in channel['keyframes']:
                            x = keyframe['co'][0]
                            y = keyframe['co'][1]
                            interpolation = keyframe['interpolation']
                            handleLeftX = keyframe['handle_left'][0]
                            handleLeftY = keyframe['handle_left'][1]
                            handleRightX = keyframe['handle_right'][0]
                            handleRightY = keyframe['handle_right'][1]

                            if interpolation == 'CONSTANT': self._writer.writeIndexByte(0)
                            elif interpolation == 'LINEAR': self._writer.writeIndexByte(1)
                            elif interpolation == 'BEZIER': self._writer.writeIndexByte(2)
                            else: self._writer.writeIndexByte(1)

            finally:
                self._writer.endHeader()

    def _writeModels(self, models, root):
        pass

        