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
                    for keyframe in channel.keyframe_points:
                        keyframes.append({
                            "type": keyframe.type,
                            "co": self.serializeCurveCoord(keyframe.co, channel.array_index),
                            "amplitude": keyframe.amplitude,
                            "back": keyframe.back,
                            "interpolation": keyframe.interpolation,
                            "handle_left": self.serializeCurveCoord(keyframe.handle_left, channel.array_index),
                            "handle_left_type": keyframe.handle_left_type,
                            "handle_right": self.serializeCurveCoord(keyframe.handle_right, channel.array_index),
                            "handle_right_type": keyframe.handle_right_type,
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

    def serializePosition(self, v):
        return [round(v.x, 4), round(v.y, 4), round(v.z, 4)]

    def serializeColor(self, v):
        return [round(v.r, 4), round(v.g, 4), round(v.b, 4)]

    def serializeCurveCoord(self, v, axis):
        return [round(v.x, 4), round(v.y, 4)]

    def serializeRange(self, v):
        return [round(v.x, 4), round(v.y, 4)]

    def serializeObject(self, obj):
        for child in obj.children:
            self.serializeObject(child)

        Logger.log('Serializing object ' + obj.name)
        if obj.mode == 'EDIT':
            Logger.log('Applying unsaved edits in ' + obj.name)
            obj.update_from_editmode()

        serialization = { 
            'name': obj.name, 
            'children': [ child.name for child in obj.children ]
            }

        if obj.type == 'MESH':
            serialization['mesh'] = self.serializeMesh(obj)

            # Only 1 action can be assigned to an object via animation data
            # Multiple actions are only possible via NLA tracks
            ad = obj.animation_data
            if not ad is None:
                action = obj.animation_data.action
                if not action is None:
                    serialization["animation"] = action.name

        self.objects.append(serialization)

    def serializeMesh(self, obj):
        try:
            mesh = obj.to_mesh()
        except RuntimeError:
            return ''

        if mesh is None:
            return ''

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
            'vertices': [self.serializePosition(v.co) for v in vertices],
            'triangles': [{
                "vertices": [tri.vertices[0], tri.vertices[1], tri.vertices[2]], 
                "normal": self.serializePosition(tri.normal)
                } for tri in triangles], 
        }

        obj.to_mesh_clear()

        self.meshes.append(serialization)

        return id
