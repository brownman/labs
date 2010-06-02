#!/usr/bin/env python
# encoding: utf-8
"""
echonestUtil.py

Created by Brian Stoner on 2010-05-20.
"""
from __future__ import division
import sys
import os
from echonest import audio


def main():
	af  = audio.LocalAudioFile("../audio/Houseboat_Babies.mp3");
	segs = af.analysis.segments;
	starts = segs.start; # An array of times (in secs) for the begin of each segment
	pitches = segs.pitches; # An array of 12-element pitch arrays, one for each segment
	loudness = segs.loudness_begin; # An array of loudness at the beginning of each segment
	sections = af.analysis.sections.start; # An array of times (in secs) for the begin of each major song section
	beats = af.analysis.beats.start; # An array of times (in secs) for the begin of each beat in the song
	
	# Arrays for output:
	segmentStarts = [];
	segmentPitches = [];
	segmentLoudness = [];
	
	song_len = 260*10;  # Roughly the length of the song (260 sec) * 10 because we want data for every 1/10 of a second, want to try
				   # 1/20 or even 1/30 in future, but afraid it would be too choppy/slow
	curSeg = 0; # keep track of current place in the segs array

	# Loop through each 1/10 of a second and create the arrays:
	for s in range(song_len):
		print s
		sec = s/10;
		if(len(starts)-1<curSeg):
			# If we hit the end of the song, stop
			break;
		if(sec>=starts[curSeg]):
			print "actual segment: " + str(curSeg) + ", " + str(starts[curSeg]);
			segmentStarts.append(starts[curSeg]);
			segmentPitches.append(pitches[curSeg]);
			segmentLoudness.append(loudness[curSeg]);
			curSeg += 1;
			if(s!=0):
				s -= 1;
				# We want to go back through the loop and insert smoothed values on the 1/10 of second
				# in addition to the values inserted at the segment begin which likely isn't falling on a 1/10 of a second
		else:
			print "artificual segment: " + str(sec)
			segmentStarts.append(sec);
			# smooth upcoming loudness with previously added loudness
			segmentLoudness.append((loudness[curSeg]+segmentLoudness[s-1])/2);
			segP = []
			# smooth out the upcoming pitch levels in the array with previous pitch level:
			for p in range(12):
				if(segmentPitches[s-1][p]):
					segP.append((pitches[curSeg][p] + segmentPitches[s-1][p])/2);
				else:
					segP.append(pitches[curSeg][p]);
			segmentPitches.append(segP)
		
	f = open("../data/echonestData.js","w");
	f.write("segmentStarts=" + str(segmentStarts) + ";\n")
	f.write("segmentPitches=" + str(segmentPitches) + ";\n")
	f.write("segmentLoudness=" + str(segmentLoudness) + ";\n")
	f.write("beatStarts=" + str(beats) + ";\n")
	f.write("sectionStarts=" + str(sections) + ";\n")
	f.close()
	
if __name__ == '__main__':
	main()

