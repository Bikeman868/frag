import sys
from math import floor
from time import time, ctime
from sys import exc_info
from traceback import format_tb

class Logger:
    instance = None # singleton

    def __init__(self):
        self.start_time = time()
        self.nWarnings = 0
        self.nErrors   = 0

        Logger.instance = self

    def close(self):
        if self.nErrors > 0:
            Logger.log('Packaging failed', 0)
        else:
            Logger.log('Packaging succeeded', 0)

        elapsed_time = time() - self.start_time
        minutes = floor(elapsed_time / 60)
        seconds = elapsed_time - (minutes * 60)
        Logger.log('Elapsed time:  {} min, {:.2f} sec'.format(minutes, seconds))

        if self.nWarnings > 0:
            Logger.log('Warnings:  ' + str(self.nWarnings))

        if self.nErrors > 0:
            Logger.log('Errors:  ' + str(self.nErrors))

        Logger.instance = None

    def logStart(self):
        Logger.log('Start time: ' + ctime(self.start_time))

    @staticmethod
    def exception(exception = None):
        Logger.log('\n========= EXCEPTION =========', 0)
        Logger.instance.nErrors += 1

        ex = exc_info()
        if exception is None:
            exception = ex[1]

        stack = format_tb(ex[2])
        for line in stack:
           Logger.log(line, 1, 0)

        Logger.log('Error:  ' + str(exception), 1)
        Logger.log('=========================', 0, 2)

    @staticmethod
    def error(msg):
        Logger.instance.nErrors += 1
        Logger.log('\nERROR: ' + msg.upper(), 0, 2)

    @staticmethod
    def warn(msg, tabCount = 1, newLineCount = 1):
        Logger.instance.nWarnings += 1
        Logger.log('WARNING: ' + msg, tabCount, newLineCount)

    @staticmethod
    def log(msg, tabCount = 1, newLineCount = 1):
        if Logger.instance is None: return
        if tabCount > 0: sys.stdout.write('\t' * tabCount)
        if len(msg) > 0: sys.stdout.write(msg)
        if newLineCount > 0: sys.stdout.write('\n' * newLineCount)
