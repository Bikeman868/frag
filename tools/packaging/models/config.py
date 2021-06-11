import json
import argparse

parser = argparse.ArgumentParser(description='Package Frag models exported from Blender.')
parser.add_argument('configFile', metavar='C', type=str, nargs='?', default='package.config.json', help='the configuration file to use')
parser.add_argument('-i', '--input', metavar='I', type=str, nargs=1, required=False, help='override the input folder path')
parser.add_argument('-o', '--output', metavar='O', type=str, nargs=1, required=False, help='override the output folder path')
parser.add_argument('-d', '--dryRun', dest='dryRun', action='store_true', required=False, help='outputs a log without creating any packages')
args = parser.parse_args()

with open(args.configFile, 'rt', encoding='utf-8') as file:
    global config
    config = json.load(file)

if (not 'input' in config or len(config['input']) == 0):
    config['input'] = '.\\'

if (not 'output' in config or len(config['output']) == 0):
    config['output'] = '.\\'

if (args.input is not None):
    config['input'] = args.input[0]

if (args.output is not None):
    config['output'] = args.output[0]

config['dryRun'] = args.dryRun
