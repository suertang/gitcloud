#!/usr/bin/env python
# -*- encoding: utf-8 -*-
import os
import logging
import csv
import requests
import uuid
from download import download
import xlrd

def readxls():
	

	data_path = "./"   # 存放excel表的路径
	xlsname = "list.xls" # excel表的名字
	sheetname = "Sheet1" # excel表的sheet名字
	dataresult = [] # 保存从excel表中读取出来的值，每一行为一个list，dataresult中保存了所有行的内容
	#result = [] # 是由dict组成的list，是将dataresult中的内容全部转成字典组成的list：result
	datapath = data_path + '\\' + xlsname
	xls1 = xlrd.open_workbook(datapath)
	table = xls1.sheet_by_name(sheetname)
	for i in range(0,table.nrows):
	  dataresult.append(table.row_values(i))
	#将list转化成dict
	#for i in range(1,len(dataresult)):
	#	temp = dict(zip(dataresult[0],dataresult[i]))
	#	result.append(temp)
	return dataresult
	
def down():
	
	reader = readxls()
	for item in reader:

		tim,title,url=item
		file_name='%s.mp4' % title
		print("正在下载:%s " % file_name )
		if os.path.exists("./down/"+file_name):
			print("此文件已经下载，跳过。")
			continue
		unique_filename = "./down/" + str(uuid.uuid4())
		path=download(url, unique_filename,replace=True)
		os.rename(unique_filename,"./down/" + file_name)
		print("%s 下载完成\n" % file_name)
down()