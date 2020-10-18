'''
此脚本实现去除原edf文件中电极标签的空格

用户在终端下输入此命令：
python 此文件的绝对路径 原edf文件绝对路径 [新edf文件绝对路径]

如：python D:\RewriteEDF.py D:\ncs3.edf D:\test.edf
新edf文件路径可以不写，默认是在原edf文件后增加_new
如：python D:\RewriteEDF.py D:\ncs3.edf
最后生成的文件为 ncs3_new.edf
'''

import pyedflib
import numpy as np
import sys
from datetime import datetime,date

# 输入欲重写的edf文件的绝对路径
old_edf = r"D:\ncs3.edf"
new_edf = r"D:\ncs3_new.edf"

try:
	if len(sys.argv) >= 2:
		old_edf = sys.argv[1]
		if len(sys.argv) >= 3:
			new_edf = sys.argv[2]
		else:
			new_edf = old_edf.replace(".edf","_new.edf")
			
	# 原edf文件 f
	print("正在读取文件：" + old_edf)
	f = pyedflib.EdfReader(old_edf)
	n = f.signals_in_file
	signal_labels = f.getSignalLabels()
	sigbufs = np.zeros((n, f.getNSamples()[0]))
	for i in np.arange(n):
		sigbufs[i, :] = f.readSignal(i)
	
	# 新edf文件 new 
	print("正在配置新文件：" + new_edf)
	new = pyedflib.EdfWriter(new_edf, f.signals_in_file)

	signalHeaders = f.getSignalHeaders()
	for i in np.arange(len(signalHeaders)):
		signalHeaders[i]['label'] = signalHeaders[i]['label'].replace(' ', '')
	
	new.setSignalHeaders(signalHeaders)
	new.setTechnician(f.technician)
	new.setRecordingAdditional(f.recording_additional)
	new.setPatientName(f.patientname)
	new.setPatientCode(f.patientcode)
	new.setPatientAdditional(f.patient_additional)
	new.setEquipment(f.equipment)
	new.setAdmincode(f.admincode)
	new.setGender(f.gender)
	new.setDatarecordDuration(f.datarecord_duration)
	new.set_number_of_annotation_signals(f.annotations_in_file)
	new.setStartdatetime(f.getStartdatetime())

	if f.getBirthdate():
		new.setBirthdate(datetime.strptime(f.getBirthdate(),"%d %b %Y"))
	
	print("正在写入文件：" + new_edf)
	new.writeSamples(sigbufs)

	for i in range(f.annotations_in_file):
		new.writeAnnotation(f.readAnnotations()[0][i],f.readAnnotations()[1][i],f.readAnnotations()[2][i])
	
	new.close()
except Exception as e:
	print("Error:", e)
	print("写入失败！")
else:
	print("写入成功！")
	