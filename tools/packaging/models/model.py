import glob
import re
from logger import Logger

class Model:

    @property
    def name(self): return self.__name

    @property
    def filename(self): return self.__filename

    def __init__(self, name, filename):
        self.__name = name
        self.__filename = filename

    @staticmethod
    def enumerateModels(rootPath, modelName, include, exclude):
        pattern = rootPath + re.sub(r'{[^}]*}', '*', include)
        models = []
        for filename in glob.iglob(pattern):
            models.append(Model('name', filename))
        return models
