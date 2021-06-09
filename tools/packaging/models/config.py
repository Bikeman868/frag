import json
import argparse

parser = argparse.ArgumentParser(description='Package Frag models exported from Blender.')
parser.add_argument('configFile', metavar='C', type=str, nargs='?', default='package.config.json', help='the configuration file to use')
parser.add_argument('-r', '--root', metavar='R', type=str, nargs=1, required=False, help='override the root folder path')
args = parser.parse_args()

with open(args.configFile, 'rt', encoding='utf-8') as file:
    global config
    config = json.load(file)

if (not 'root' in config):
    config['root'] = '.\\'

if (args.root is not None):
    config['root'] = args.root[0]
