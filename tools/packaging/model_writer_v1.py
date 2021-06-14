import json
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
        else: animations = list()

        if 'meshes' in modelJson: meshes = modelJson['meshes']
        else: meshes = list()

        if 'objects' in modelJson: models = modelJson['objects']
        else: models = list()

        if 'fps' in config: fps = config['fps']
        else: fps = 30
        msPerFrame = int(1000 / fps)

        Logger.log('{} animations @{}fps, {} meshes, {} models'.format(len(animations), fps, len(meshes), len(models)), logIndent)

        self._transformData(logIndent, models, animations, meshes)

        Logger.log('Model animations: {}'.format(', '.join([animation['name'] for animation in animations])), logIndent)

        self._writeMeshes(logIndent, meshes)
        self._writeAnimations(logIndent, animations, msPerFrame)
        self._writeModels(logIndent, models, model.name)

    def _transformData(self, logIndent, models, animations, meshes):
        meshesById = {mesh['id'] : mesh for mesh in meshes}
        animationsByName = {animation['name'] : animation for animation in animations}
        modelsByName = {model['name'] : model for model in models}

        for animation in animations:
            animation['channels'] = list()
            for group in animation['groups']:
                for channel in group['channels']:
                    animation['channels'].append(channel)
            del animation['groups']

        animations.clear()

        for model in models: 
            modelName = model['name']
            animationName = model.get('animation', None)
            meshId = model.get('mesh', None)
            Logger.debug('Model {} animation={} mesh={}'.format(modelName, animationName, meshId), logIndent)

            children = [modelsByName[childName] for childName in model['children']]
            for child in children: child['parentModel'] = model
            model['childModels'] = children

            if not meshId in (None, ''):
                mesh = meshesById[meshId]
                model['mesh'] = mesh
                materials = mesh['materials']
                if len(materials) > 0:
                    model['materialIndex'] = self._writer.getOrAddMaterial(materials[0])

            if not animationName in (None, ''):
                animation = animationsByName[animationName]
                modelAnimationName = animation['name'][len(modelName):]
                animation['name'] = modelAnimationName
                for channel in animation['channels']:
                    channel['pattern'] = '^' + modelName + '$'
                if modelAnimationName in animationsByName:
                    existing = animationsByName[modelAnimationName]
                    Logger.debug('Adding {} channels to existing {} animation'.format(len(animation['channels']), modelAnimationName), logIndent + 1)
                    for channel in animation['channels']:
                        existing['channels'].append(channel)
                else:
                    Logger.debug('New {} animation with {} channels'.format(modelAnimationName, len(animation['channels'])), logIndent + 1)
                    animationsByName[modelAnimationName] = animation
                    animations.append(animation)
                del animationsByName[animationName]

        Logger.debug('Animation channels extracted:', logIndent)
        for animation in animations:
            Logger.debug('{} animation has {} channels'.format(animation['name'], len(animation['channels'])), logIndent + 1)

        for model in models: 
            if not 'parentModel' in model:
                model['animations'] = animations

    def _writeMeshes(self, logIndent, meshes):
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
                    self._writer.writeDataFloat(vertex[2])
                    self._writer.writeDataFloat(vertex[1])

                for triangle in mesh['triangles']:
                    normal = triangle['normal']
                    self._writer.writeDataFloat(normal[0])
                    self._writer.writeDataFloat(normal[2])
                    self._writer.writeDataFloat(normal[1])
            finally:
                self._writer.endHeader()

    def _writeAnimations(self, logIndent, animations, msPerFrame):
        for animation in animations:
            animation['headerIndex'] = self._writer.startHeader(3)
            try:
                name = animation['name'].lower()
                frameStart = animation['frames'][0]
                frameEnd = animation['frames'][1]
                flags = 1 # TODO: Set to zero when we find the loop flag in Blender
                if 'loop' in animation and animation['loop']: flags |= 1
                if 'rewind' in animation and animation['rewind']: flags |= 2
                channelCount = len(animation['channels'])

                self._writer.writeIndexStr(name)
                self._writer.writeIndexByte(flags)
                self._writer.writeIndexUShort(int(frameEnd - frameStart + 1))
                self._writer.writeIndexUShort(msPerFrame)
                self._writer.writeIndexByte(channelCount)

                for channel in animation['channels']:
                    pattern = channel['pattern']
                    dataPath = channel['data_path']
                    dataIndex = channel['array_index']

                    self._writer.writeIndexStr(pattern)
                    if (dataPath == 'location'): 
                        self._writer.writeIndexStr('translate-' + 'xzy'[dataIndex])
                    elif (dataPath == 'rotation_euler'): 
                        self._writer.writeIndexStr('rotate-' + 'xzy'[dataIndex])
                    elif (dataPath == 'delta_rotation_euler'):
                        self._writer.writeIndexStr('rotate-' + 'xzy'[dataIndex])
                    else: 
                        Logger.warn('Unsupported data path ' + dataPath)
                        self._writer.writeIndexStr('')
                    self._writer.writeIndexUShort(len(channel['keyframes']))

                    for keyframe in channel['keyframes']:
                        x = keyframe['co'][0]
                        y = keyframe['co'][1]
                        interpolation = keyframe['interpolation']
                        # handleLeftX = keyframe['handle_left'][0]
                        # handleLeftY = keyframe['handle_left'][1]
                        # handleRightX = keyframe['handle_right'][0]
                        # handleRightY = keyframe['handle_right'][1]

                        self._writer.writeIndexUShort(int(x))
                        if interpolation == 'CONSTANT': self._writer.writeIndexByte(0)
                        elif interpolation == 'LINEAR': self._writer.writeIndexByte(1)
                        elif interpolation == 'BEZIER': self._writer.writeIndexByte(2)
                        else: self._writer.writeIndexByte(1)

                        self._writer.writeIndexFloat(y)
            finally:
                self._writer.endHeader()

    def _writeModels(self, logIndent, models, rootName):
        for model in models: 
            if not 'parentModel' in model: rootModel = model
        self._writeModelHeirachy(logIndent, rootModel, rootName)

    def _writeModelHeirachy(self, logIndent, model, modelName):
        children = model['childModels']
        for child in children:
            self._writeModelHeirachy(logIndent, child, child['name'])

        isRoot = not 'parentModel' in model
        flags = 0
        if isRoot: flags |= 1
        if 'materialIndex' in model: flags |= 2
        if 'mesh' in model: flags |= 4

        translation = (0, 0, 0)
        rotation = (0, 0, 0)
        scale = (1, 1, 1)

        if isRoot and 'animations' in model: animations = model['animations']
        else: animations = list()

        model['headerIndex'] = self._writer.startHeader(4)        
        try:
            self._writer.writeIndexStr(modelName)
            self._writer.writeIndexByte(flags)

            if 'materialIndex' in model: self._writer.writeIndexUShort(model['materialIndex'])
            else: self._writer.writeIndexUShort(0)

            if 'mesh' in model: self._writer.writeIndexUShort(model['mesh']['headerIndex'])
            else: self._writer.writeIndexUShort(0)

            self._writer.writeIndexFloat(translation[0])
            self._writer.writeIndexFloat(translation[1])
            self._writer.writeIndexFloat(translation[2])

            self._writer.writeIndexFloat(rotation[0])
            self._writer.writeIndexFloat(rotation[1])
            self._writer.writeIndexFloat(rotation[2])

            self._writer.writeIndexFloat(scale[0])
            self._writer.writeIndexFloat(scale[1])
            self._writer.writeIndexFloat(scale[2])

            self._writer.writeIndexUShort(len(children))
            self._writer.writeIndexUShort(len(animations))

            for child in children:
                self._writer.writeIndexUShort(child['headerIndex'])

            for animation in animations:
                self._writer.writeIndexUShort(animation['headerIndex'])
        finally:
            self._writer.endHeader()