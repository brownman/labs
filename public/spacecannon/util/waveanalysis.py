#!/usr/bin/env python
# encoding: utf-8
"""
waveanalysis.py

Created by Brian Stoner on 2010-05-15.
Copyright (c) 2010 Brian Stoner. All rights reserved.
"""

import sys
import getopt
import math
import struct
import wave

help_message = '''
The help message goes here.
'''


class Usage(Exception):
	def __init__(self, msg):
		self.msg = msg


def main(argv=None):
	if argv is None:
		argv = sys.argv
	try:
		try:
			opts, args = getopt.getopt(argv[1:], "ho:v", ["help", "output="])
		except getopt.error, msg:
			raise Usage(msg)
	
		# option processing
		for option, value in opts:
			if option == "-v":
				verbose = True
			if option in ("-h", "--help"):
				raise Usage(help_message)
			if option in ("-o", "--output"):
				output = value
	
		
		output_wavedata();

	
	except Usage, err:
		print >> sys.stderr, sys.argv[0].split("/")[-1] + ": " + str(err.msg)
		print >> sys.stderr, "\t for help use --help"
		return 2


def output_wavedata():
	w = wave.open(sys.argv[1], 'rb')
	# We assume 44.1k @ 16-bit, can test with getframerate() and getsampwidth().
	sum = 0
	value = 0;
	delta = 0;
	amps = [ ]

	for i in xrange(0, w.getnframes()):
		# Assume stereo, mix the channels.
		data = struct.unpack('<hh', w.readframes(1))
		sum += (data[0]*data[0] + data[1]*data[1]) / 2
		# 44100 / 30 = 1470
		if (i != 0 and (i % 1470) == 0):
			value = int(math.sqrt(sum / 1470.0) / 10)
			amps.append(value - delta)
			delta = value
			sum = 0

	print amps


if __name__ == "__main__":
	sys.exit(main())
