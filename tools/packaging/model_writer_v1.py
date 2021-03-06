import json
from package_writer import PackageWriter
from logger import Logger
from asset_file import AssetFile

class ModelWriter:
    _writer: PackageWriter

    def __init__(self, writer: PackageWriter):
        self._writer = writer

    def write(self, model: AssetFile, logIndent: int):
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

        def addOrUpdateAnimation(animation, modelName, animationName):
            for channel in animation['channels']:
                channel['pattern'] = '^' + modelName + '$'
            if modelAnimationName in animationsByName:
                existing = animationsByName[modelAnimationName]
                if animation['frames'][0] < existing['frames'][0]: existing['frames'][0] = animation['frames'][0]
                if animation['frames'][1] > existing['frames'][1]: existing['frames'][1] = animation['frames'][1]
                Logger.debug('Adding {} channels to existing {} animation'.format(len(animation['channels']), modelAnimationName), logIndent + 1)
                for channel in animation['channels']:
                    existing['channels'].append(channel)
            else:
                Logger.debug('New {} animation with {} channels'.format(modelAnimationName, len(animation['channels'])), logIndent + 1)
                animationsByName[modelAnimationName] = animation
                animations.append(animation)
            del animationsByName[animationName]

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
            tracks = model.get('tracks', {})
            Logger.debug('Model {} animation={} mesh={}'.format(modelName, animationName, meshId), logIndent)

            children = [modelsByName[childName] for childName in model['children']]
            for child in children: child['parentModel'] = model
            model['childModels'] = children

            if not meshId in (None, ''):
                mesh = meshesById[meshId]
                model['mesh'] = mesh
                materials = mesh['materials']
                if len(materials) > 0:
                    model['materialIndex'] = self._writer.getOrAddMaterial(materials[0], True)

            if not animationName in (None, ''):
                animation = animationsByName[animationName]
                modelAnimationName = animation['name'][len(modelName):]
                animation['name'] = modelAnimationName
                addOrUpdateAnimation(animation, modelName, animationName)
            
            if len(tracks):
                for modelAnimationName, animationName in tracks.items():
                    animation = animationsByName[animationName]
                    animation['name'] = modelAnimationName
                    addOrUpdateAnimation(animation, modelName, animationName)

        Logger.debug('Animation channels extracted:', logIndent)
        for animation in animations:
            Logger.debug('{} animation has {} channels'.format(animation['name'], len(animation['channels'])), logIndent + 1)

        for model in models: 
            if not 'parentModel' in model:
                model['animations'] = animations

    def _writeMeshes(self, logIndent, meshes):
        for mesh in meshes:
            if len(mesh['triangles']) == 0: continue
            firstTriangle = mesh['triangles'][0]
            includeNormals = 'normal' in firstTriangle and len(firstTriangle['normal']) == 3

            mesh['headerIndex'] = self._writer.startHeader(2)
            Logger.debug('Writing mesh #{} of {} triangles. Normals={}'.format(mesh['headerIndex'], len(mesh['triangles']), includeNormals), logIndent)
            try:
                self._writer.writeIndexUShort(1) # Only 1 fragment
                self._writer.writeIndexByte(1) # Distinct triangles
                self._writer.writeIndexByte(3) # Indexed 3D vertices
                if includeNormals: self._writer.writeIndexByte(3) # One normal vector per triangle
                else: self._writer.writeIndexByte(0) # No normal vectors
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
                    self._writer.writeDataFloat(vertex[2]) # Blender has Z-up
                    self._writer.writeDataFloat(vertex[1]) 
                    Logger.debug('({}, {}, {})'.format(vertex[0], vertex[2], vertex[1]), logIndent + 1)

                if includeNormals:
                    for triangle in mesh['triangles']:
                       normal = triangle['normal']
                       self._writer.writeDataFloat(normal[0])
                       self._writer.writeDataFloat(normal[2]) # Blender has Z-up
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

                Logger.debug('Writing {} animation'.format(name), logIndent)
                self._writer.writeIndexStr(name)
                self._writer.writeIndexByte(flags)
                self._writer.writeIndexUShort(int(frameEnd - frameStart + 1))
                self._writer.writeIndexUShort(msPerFrame)
                self._writer.writeIndexByte(channelCount)

                for channel in animation['channels']:
                    pattern = channel['pattern']
                    dataPath = channel['data_path']
                    dataIndex = channel['array_index']

                    Logger.debug('Writing {}[{}] channel matching {}'.format(dataPath, 'xzy'[dataIndex], pattern), logIndent + 1)
                    self._writer.writeIndexStr(pattern)
                    scale = 1
                    if (dataPath == 'location'): 
                        self._writer.writeIndexStr('translate-' + 'xzy'[dataIndex]) # Blender has Z-up
                    elif (dataPath == 'rotation_euler'): 
                        self._writer.writeIndexStr('rotate-' + 'xzy'[dataIndex]) # Blender has Z-up
                        scale = -1
                    elif (dataPath == 'delta_rotation_euler'):
                        self._writer.writeIndexStr('rotate-' + 'xzy'[dataIndex]) # Blender has Z-up
                        scale = -1
                    else: 
                        Logger.warn('Unsupported data path ' + dataPath)
                        self._writer.writeIndexStr('')
                    self._writer.writeIndexUShort(len(channel['keyframes']))

                    for keyframe in channel['keyframes']:
                        x = int(keyframe['co'][0])
                        y = keyframe['co'][1] * scale
                        interpolation = keyframe['interpolation']

                        # TODO: Process bezier curves with handles
                        # handleLeftX = keyframe['handle_left'][0]
                        # handleLeftY = keyframe['handle_left'][1]
                        # handleRightX = keyframe['handle_right'][0]
                        # handleRightY = keyframe['handle_right'][1]

                        Logger.debug('Keyframe[{}]={}'.format(x, y), logIndent + 2)
                        self._writer.writeIndexUShort(x)
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

        translation = (model['location'][0], model['location'][2], model['location'][1])
        rotation = (-model['rotation'][0], -model['rotation'][2], -model['rotation'][1])
        scale = (model['scale'][0], model['scale'][2], model['scale'][1])

        if isRoot and 'animations' in model: animations = model['animations']
        else: animations = list()

        model['headerIndex'] = self._writer.startHeader(4)        
        Logger.debug('Writing {} model with {}'.format(modelName, 'mesh #' + str(model['mesh']['headerIndex']) if 'mesh' in model else 'no mesh'), logIndent)
        Logger.debug('Location ({}, {}, {})'.format(translation[0], translation[1], translation[2]), logIndent + 1)
        Logger.debug('Rotation ({}, {}, {})'.format(rotation[0], rotation[1], rotation[2]), logIndent + 1)
        Logger.debug('Scale ({}, {}, {})'.format(scale[0], scale[1], scale[2]), logIndent + 1)
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