#!/usr/bin/python3
import sys
import shutil
from datetime import date, datetime, timedelta

class Adder():
	def __init__(self, argv):
		self.HISTORY_FILE_NAME = 'data/history.json'
		if len(argv) < 6:
			raise Exception('USAGE: challenger opponent date_offset set1, set2\n  challenger : string\n  opponent: string\n  date_offset: int (offset from today [2 -> two days ago])\n  set1 : string -> 11-9, for example\n  set2 : same as above\n  [set3] : if needed, same as above ')

		scores = '['
		for score in argv[4:]:
			parts = score.split('-')
			scores += '[%s,%s], ' % (parts[0], parts[1])
		scores = scores[:-2] + ']'

		if int(argv[3]) < 0:
			raise Exception('  date_offset must be positive (given %s)' % argv[3])

		date = (datetime.now() - timedelta(days=int(argv[3]))).strftime('%Y/%m/%d %H:%M:%S')

		self.next_match = '{'
		self.next_match += '\n\t"challenger" : "%s",' % argv[1]
		self.next_match += '\n\t"opponent" : "%s",' % argv[2]
		self.next_match += '\n\t"scores" : %s,' % scores
		self.next_match += '\n\t"date" : "%s"' % date
		self.next_match += '\n}'
		
		print(self.next_match)

	def add(self):
		shutil.copyfile(self.HISTORY_FILE_NAME, self.HISTORY_FILE_NAME[:-5] + datetime.now().strftime('_%Y-%m-%d_%H%M%S.json'))
		with open(self.HISTORY_FILE_NAME, 'r') as f:
			history = f.readlines()
		history[-1] = history[-1][:-1] + ', ' + self.next_match + ']'
		with open(self.HISTORY_FILE_NAME, 'w') as f:
			f.writelines(history)



		# print(history)

try:
	Adder(sys.argv).add()
except Exception as e:
	print(e)