bl_info = {
    'name': 'Frag Exporter',
    'author': 'Martin Halliday',
    'category': 'Exporter',
    'version': (1, 0, 0),
    'blender': (2, 80, 0),
    'description': 'Export the selected object as a Frag model'
}
 
import bpy
from bpy_extras.io_utils import ExportHelper
from bpy.types import Operator

class JsonMain(Operator, ExportHelper):
    bl_idname = 'export.frag'
    bl_label = 'Export Frag Model'
    bl_options = {'REGISTER', 'UNDO'}
    filename_ext = '.frag'

    filepath: bpy.props.StringProperty(subtype = 'FILE_PATH')
    filter_glob: bpy.props.StringProperty(name='.frag',default='*.frag', options={'HIDDEN'})

    def execute(self, context):
        from .json_exporter import JsonExporter

        exporter = JsonExporter()
        exporter.execute(context, self.filepath)

        if (exporter.fatalError):
            self.report({'ERROR'}, exporter.fatalError)

        elif (exporter.nErrors > 0):
            self.report({'ERROR'}, 'Output cancelled due to data error, See log file.')

        elif (exporter.nWarnings > 0):
            self.report({'WARNING'}, 'Processing completed, but ' + str(exporter.nWarnings) + ' WARNINGS were raised,  see log file.')

        return {'FINISHED'}

classes = (
    JsonMain,
)

def register():
    from bpy.utils import register_class
    for cls in classes:
        register_class(cls)
    bpy.types.TOPBAR_MT_file_export.append(menu_func)

def unregister():
    from bpy.utils import unregister_class
    for cls in reversed(classes):
        unregister_class(cls)
    bpy.types.TOPBAR_MT_file_export.remove(menu_func)

def menu_func(self, context):
    self.layout.operator(JsonMain.bl_idname, text='Frag model')

if __name__ == '__main__':
    unregister()
    register()