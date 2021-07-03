import json
import argparse

parser = argparse.ArgumentParser(description='Package Frag models exported from Blender.')
parser.add_argument('configFile', metavar='C', type=str, nargs='?', default='package.config.json', help='the configuration file to use')
parser.add_argument('-i', '--input', metavar='I', type=str, nargs=1, required=False, help='override the input folder path')
parser.add_argument('-o', '--output', metavar='O', type=str, nargs=1, required=False, help='override the output folder path')
parser.add_argument('-d', '--dryRun', dest='dryRun', action='store_true', required=False, help='outputs a log without creating any packages')
parser.add_argument('-l', '--logLevel', metavar='L', type=str, nargs=1, required=False, choices=['error', 'warn', 'info', 'debug'], default=['info'], help='logging level')
args = parser.parse_args()

with open(args.configFile, 'rt', encoding='utf-8-sig') as file:
    global config
    config = json.load(file)

if args.input is None:
    if not 'input' in config or len(config['input']) == 0:
        config['input'] = '.\\'
else:
    config['input'] = args.input[0]

if args.output is None:
    if not 'output' in config or len(config['output']) == 0:
        config['output'] = '.\\'
else:
    config['output'] = args.output[0]

config['dryRun'] = args.dryRun

if args.logLevel is None:
    config['logLevel'] = 2
else:
    if args.logLevel[0] == 'error': config['logLevel'] = 0
    if args.logLevel[0] == 'warn': config['logLevel'] = 1
    elif args.logLevel[0] == 'info': config['logLevel'] = 2
    elif args.logLevel[0] == 'debug': config['logLevel'] = 3

# print(config)
