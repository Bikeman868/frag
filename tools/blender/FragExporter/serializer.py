import bpy
from .logger import Logger

class FragSerializer:
    '''Converts a Blender object into a Frag DTO'''
    
    def __init__(self, context):
        self.context = context
        self.meshes = []
        self.animations = []
        self.objects = []
    
    def serialize(self, obj):
        Logger.log('Serializing animation', 0)
        self.serializeAnimations()
        Logger.log('Serialized animation', 0, 2)

        Logger.log('Serializing object ' + obj.name, 0)
        self.serializeObject(obj)
        Logger.log('Serialized object ' + obj.name, 0, 2)

        return { 
				'config': {
					'fps': bpy.context.scene.render.fps
				},
                'animations': self.animations,
                'meshes': self.meshes,
                'objects': self.objects,
            }

    def serializeAnimations(self):
        for action in bpy.data.actions:
            Logger.log('Serializing action ' + action.name)
            groups = []
            for group in action.groups:
                channels = []
                for channel in group.channels:
                    keyframes = []
                    baseY = 0
                    for keyframe in channel.keyframe_points:
                        if len(keyframes) == 0: baseY = keyframe.co.y
                        keyframes.append({
                            "type": keyframe.type,
                            "co": self.serializeCurveCoord(keyframe.co, baseY),
                            # "amplitude": self.serializeFloat(keyframe.amplitude),
                            # "back": self.serializeFloat(keyframe.back),
                            "interpolation": keyframe.interpolation,
                            # "handle_left": self.serializeCurveCoord(keyframe.handle_left, baseY),
                            # "handle_left_type": keyframe.handle_left_type,
                            # "handle_right": self.serializeCurveCoord(keyframe.handle_right, baseY),
                            # "handle_right_type": keyframe.handle_right_type,
                        })
                    channels.append({ 
                        "data_path": channel.data_path,
                        "array_index": self.serializeAxis(channel.array_index),
                        "extrapolation": channel.extrapolation,
                        "keyframes": keyframes})
                groups.append({
                    "name": group.name,
                    "channels": channels})
            self.animations.append({ 
                "name": action.name,
                "frames": self.serializeRange(action.frame_range),
                "groups": groups })

    def serializeAxis(self, v):
        return v

    def serializePosition(self, v, baseX, baseY, baseZ):
        return [round(v.x - baseX, 4), round(v.y - baseY, 4), round(v.z - baseZ, 4)]

    def serializeColor(self, v):
        return [round(v.r, 4), round(v.g, 4), round(v.b, 4)]

    def serializeCurveCoord(self, v, baseY):
        return [round(v.x, 4), round(v.y - baseY, 4)]

    def serializeRange(self, v):
        return [round(v.x, 4), round(v.y, 4)]

    def serializeFloat(self, v):
        return round(v, 4)

    def serializeObject(self, obj):
        for child in obj.children:
            self.serializeObject(child)

        Logger.log('Serializing object ' + obj.name)
        if obj.mode == 'EDIT':
            Logger.log('Applying unsaved edits in ' + obj.name)
            obj.update_from_editmode()

        locationX = obj.location.x + obj.delta_location.x
        locationY = obj.location.y + obj.delta_location.y 
        locationZ = obj.location.z + obj.delta_location.z

        rotationX = obj.rotation_euler.x + obj.delta_rotation_euler.x
        rotationY = obj.rotation_euler.y + obj.delta_rotation_euler.y
        rotationZ = obj.rotation_euler.z + obj.delta_rotation_euler.z

        scaleX = obj.scale.x * obj.delta_scale.x
        scaleY = obj.scale.y * obj.delta_scale.y
        scaleZ = obj.scale.z * obj.delta_scale.z

        if obj.parent:
            locationX -= obj.parent.location.x + obj.parent.delta_location.x
            locationY -= obj.parent.location.y + obj.parent.delta_location.y
            locationZ -= obj.parent.location.z + obj.parent.delta_location.z

            rotationX -= obj.parent.rotation_euler.x + obj.parent.delta_rotation_euler.x
            rotationY -= obj.parent.rotation_euler.y + obj.parent.delta_rotation_euler.y
            rotationZ -= obj.parent.rotation_euler.z + obj.parent.delta_rotation_euler.z

            scaleX /= obj.parent.scale.x * obj.parent.delta_scale.x
            scaleY /= obj.parent.scale.y * obj.parent.delta_scale.y
            scaleZ /= obj.parent.scale.z * obj.parent.delta_scale.z

        serialization = { 
            'name': obj.name, 
            'location': [
                round(locationX, 4), 
                round(locationY, 4), 
                round(locationZ, 4)], 
            'rotation': [
                round(rotationX, 4), 
                round(rotationY, 4), 
                round(rotationZ, 4)], 
            'scale': [
                round(scaleX, 4), 
                round(scaleY, 4), 
                round(scaleZ, 4)], 
            'children': [ child.name for child in obj.children ]
            }

        if obj.type == 'MESH':
            # Only 1 action can be assigned to an object via animation data
            # Multiple actions are only possible via NLA tracks
            action = None
            ad = obj.animation_data
            if not ad is None:
                action = obj.animation_data.action
                if not action is None:
                    serialization["animation"] = action.name

            serialization['mesh'] = self.serializeMesh(obj, action)

        self.objects.append(serialization)

    def serializeMesh(self, obj, action):
        try:
            mesh = obj.to_mesh()
        except RuntimeError:
            return ''

        if mesh is None:
            return ''

        baseX = obj.location.x + obj.delta_location.x
        baseY = obj.location.y + obj.delta_location.y
        baseZ = obj.location.z + obj.delta_location.z

        if obj.parent:
            baseX += obj.parent.location.x + obj.parent.delta_location.x
            baseY += obj.parent.location.y + obj.parent.delta_location.y
            baseZ += obj.parent.location.z + obj.parent.delta_location.z

        if action != None:
            for group in action.groups:
                for channel in group.channels:
                    if channel.data_path == 'delta_location' or channel.data_path == 'location':
                        firstKeyframe = channel.keyframe_points[0]
                        if channel.array_index == 0: baseX += firstKeyframe.co.y
                        elif channel.array_index == 1: baseY += firstKeyframe.co.y
                        elif channel.array_index == 2: baseZ += firstKeyframe.co.y

        id = mesh.name
        mat = obj.matrix_world
        mesh.transform(mat)
        if mat.is_negative:
            mesh.flip_normals()
        mesh.calc_loop_triangles()

        vertices = mesh.vertices
        triangles = mesh.loop_triangles

        Logger.log('Mesh {} has {} triangles formed from {} verticies'.format(mesh.name, len(triangles), len(vertices)), 2)

        serialization = { 
            'id': mesh.name,
            'materials': [material.name for material in mesh.materials],
            'vertices': [self.serializePosition(v.co, baseX, baseY, baseZ) for v in vertices],
            'triangles': [{
                "vertices": [tri.vertices[0], tri.vertices[1], tri.vertices[2]], 
                "normal": self.serializePosition(tri.normal, 0, 0, 0)
                } for tri in triangles], 
        }

        obj.to_mesh_clear()

        self.meshes.append(serialization)

        return id
