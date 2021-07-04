import bpy
import mathutils
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
            Logger.log('Applying unsaved edits in ' + obj.name, 2)
            obj.update_from_editmode()

        location, rotation, scale = (obj.matrix_local).decompose()
        Logger.log('Loc, rot, scale ' + str(location) + str(rotation) + str(scale), 2)

        serialization = { 
            'name': obj.name, 
            'location': [
                round(location.x, 4), 
                round(location.y, 4), 
                round(location.z, 4)], 
            'rotation': [
                round(rotation.x, 4), 
                round(rotation.y, 4), 
                round(rotation.z, 4)], 
            'scale': [
                round(scale.x, 4), 
                round(scale.y, 4), 
                round(scale.z, 4)], 
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

        base = mathutils.Vector()

        if action != None:
            for group in action.groups:
                for channel in group.channels:
                    if channel.data_path == 'delta_location' or channel.data_path == 'location':
                        firstKeyframe = channel.keyframe_points[0]
                        if channel.array_index == 0: base.x += firstKeyframe.co.y
                        elif channel.array_index == 1: base.y += firstKeyframe.co.y
                        elif channel.array_index == 2: base.z += firstKeyframe.co.y

        id = mesh.name
        mesh.calc_loop_triangles()

        vertices = mesh.vertices
        triangles = mesh.loop_triangles

        Logger.log('Mesh {} has {} triangles formed from {} verticies'.format(mesh.name, len(triangles), len(vertices)), 2)

        serialization = { 
            'id': mesh.name,
            'materials': [material.name for material in mesh.materials],
            'vertices': [self.serializePosition(v.co, base.x, base.y, base.z) for v in vertices],
            'triangles': [{
                "smooth": tri.use_smooth,
                "vertices": [tri.vertices[0], tri.vertices[1], tri.vertices[2]], 
                "normal": self.serializePosition(tri.normal, 0, 0, 0)
                } for tri in triangles], 
        }

        obj.to_mesh_clear()

        self.meshes.append(serialization)

        return id
