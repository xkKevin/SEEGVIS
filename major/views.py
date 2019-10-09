from django.shortcuts import render
from django.http import JsonResponse
import os
import scipy.io as sio
import json
import numpy as np
import pandas as pd
import datetime
import csv
# Create your views here.

matData = None
h2_lag_direction = []
electrode_names = []
step = None
start = None

def index(request):
    if request.method == "POST":
        try:
            file_obj = request.FILES.get("up_file")
            f1 = open(file_obj.name, "wb")
            for i in file_obj.chunks():
                f1.write(i)
            f1.close()
            global matData, step, start
            matData = sio.loadmat(file_obj.name)
            hour = matData['hour'][0][0]
            minute = matData['minute'][0][0]
            second = matData['second'][0][0]
            os.remove(file_obj.name)
            file_name = file_obj.name
            filters = list(matData['filters'][0])
            filters = match_wave(filters)
            windowSize = matData['aw_windowSize'][0][0]
            step = matData['aw_step'][0][0]
            maxLag = matData['aw_maxLag'][0][0]
            start = matData['aw_start'][0][0]
            section_iterations = matData['section_iterations'][0][0]
        except Exception as e:
            return render(request, "index.html", {"file_name": json.dumps(False),
                                                  "msg":json.dumps(".mat文件读取失败！\n请检查数据是否正确。")})
        try:
            # date_time = str(hour) + ':' + str(minute) + ':' + str(second)
            date_time = str(datetime.time(hour, minute, second))
        except Exception as e:
            date_time = str(hour) + ':' + str(minute) + ':' + str(second)
        global electrode_names
        electrode_names.clear()
        for i in matData['electrode_names'][0]:
            electrode_names.append(i[0])
        fc_info = {"electrode_names": electrode_names,"filters": filters,"time": date_time, "windowSize": windowSize,
                   "step": step, "maxLag": maxLag, "start": start, "section_iterations": section_iterations}

        all_h2_max_direction(matData['aw_h2'], matData['aw_lag'])
        links = out_in(matData['aw_h2'], matData['aw_lag']) # [out_links,in_links]
        return render(request, "index.html", {"fc_info": fc_info,"file_name":json.dumps(file_name),
                                              "links": links, "msg":json.dumps(False)})
    return render(request, "index.html",{"file_name":json.dumps(False),"msg":json.dumps(False)})


def getH2(request):
    global matData
    '''
    if request.method == "POST":
        index = request.POST.get('index')
        print(type(matData["aw_h2"]))
        print(matData["aw_h2"].shape)
        dd = matData["aw_h2"][:,:,int(index)]
        return JsonResponse({'result': True, 'h2': [[0,2],[2,3]]})
    return JsonResponse({'result': False,'msg':"Failed"})
    '''
    if request.method == "POST":
        try:
            s1 = int(request.POST.get('s1'))
            s2 = int(request.POST.get('s2'))
            s1_s2 = h2_max_direction(matData['aw_h2'], matData['aw_lag'], s1, s2)
        except Exception as e:
            return JsonResponse({'result': False, 'msg': "信号输入不正确！"})
        return JsonResponse({'result': True, 's1_s2': s1_s2})
    return JsonResponse({'result': False, 'msg': "Not POST Request!"})


def fcAnalyse(request):
    '''
    区域内与区域间的FC分析
    :param request:
    :return:
    '''
    if request.method == "POST":
        try:
            ez = to_lists(request.POST.get('ez'))
            pz = to_lists(request.POST.get('pz'))
            niz = to_lists(request.POST.get('niz'))
        except Exception as e:
            return JsonResponse({'result': False, 'msg': "输入格式不正确！\n正确格式应如：1-3,6"})

        # 判断是否越界 （空数组为false）
        elec_len = len(electrode_names)
        if (ez and ez[-1]>=elec_len):
            return JsonResponse({'result': False, 'msg': "EZ存在错误电极（数字越界）！\n数字范围应为：0至"+str(elec_len-1)})
        if (pz and pz[-1]>=elec_len):
            return JsonResponse({'result': False, 'msg': "PZ存在错误电极（数字越界）！\n数字范围应为：0至"+str(elec_len-1)})
        if (niz and niz[-1]>=elec_len):
            return JsonResponse({'result': False, 'msg': "NIZ存在错误电极（数字越界）！\n数字范围应为：0至"+str(elec_len-1)})

        fileHeader = ["zone", "electrodes", "h2", "lag", "nwd", "wd"]
        ez_in = cal_fc_in(ez,elec_len,"ez")
        pz_in = cal_fc_in(pz,elec_len,"pz")
        niz_in = cal_fc_in(niz,elec_len,"niz")
        ez_pz = cal_fc_bwt(ez,pz,elec_len,"ez_pz")
        ez_niz = cal_fc_bwt(ez,niz,elec_len,"ez_niz")
        pz_niz = cal_fc_bwt(pz,niz,elec_len,"pz_niz")
        # w 表示重新写入文件，newline=""表示行末为""，要不然会存在空行的情况
        fc_analyse = open("static/data/fc_result.csv","w",newline="")
        writer = csv.writer(fc_analyse)
        writer.writerow(fileHeader)
        for i in ez_in:
            writer.writerow(i)
        for i in pz_in:
            writer.writerow(i)
        for i in niz_in:
            writer.writerow(i)
        for i in ez_pz:
            writer.writerow(i)
        for i in ez_niz:
            writer.writerow(i)
        for i in pz_niz:
            writer.writerow(i)
        fc_analyse.close()
        return JsonResponse({'result': True, 'zones': [ez,pz,niz]})
    return JsonResponse({'result': False, 'msg': "Not POST Request!"})


def cal_fc_in(signals,n,zone):
    '''
    计算区域内FC
    :param：signals为数组，如[0,2,3]，n表示总电极数，zone表示：ez,pz,niz
    :return：如果signals为空数组，则该函数也返回空数组；返回格式例如：["ez","C5-C6--C7-C8",h2,lag,nwd,wd]
    '''
    result = []
    slen = len(signals)
    global h2_lag_direction
    for i in range(slen - 1):
        for j in range(i+1,slen):
            tmp = [zone,str(electrode_names[signals[i]])+"--"+str(electrode_names[signals[j]])]
            tmp.extend(h2_lag_direction[position(signals[i],signals[j],n)])
            result.append(tmp)
    return result


def cal_fc_bwt(s1,s2,n,zone):
    '''
    计算区域内FC
    :param：s1,s2均为数组，如[0,2,3]，n表示总电极数，zone表示：ez_pz,ez_niz,pz_niz
    :return：如果s1或s2为空数组，则该函数也返回空数组；返回格式例如：["ez_pz","C5-C6--C7-C8",h2,lag,nwd,wd]
    '''
    result = []
    global h2_lag_direction
    for i in s1:
        for j in s2:
            tmp = [zone,str(electrode_names[i]) + "--" + str(electrode_names[j])]
            tmp.extend(h2_lag_direction[position(i, j, n)])
            result.append(tmp)
    return result


def position(s1,s2,n):
    '''
    :param：s1与s2为两电极数字（[0,n-1]之间）,且s1小于s2
    n表示总电极数
    :return：返回s1与s2的位置
    '''
    p = 0
    for i in range(s1):
        p+=n-1-i
    return p+s2-s1-1


def h2_max_direction(h2, lag, s1=0, s2=1):
    '''
    s1,s2代表数字，如 0,3
    返回这组信号中s1与s2的最终h2（最大值）及其对应的时间延迟
    以及两信号的不加权方向及加权方向
    '''
    pnum = h2.shape[2]  # 时间点的数量
    h2_max = [None] * pnum
    lag_max = [None] * pnum
    h2_direct = [0] * pnum

    positive = []
    negative = []

    for pi in range(pnum):
        if h2[s1, s2, pi] >= h2[s2, s1, pi]:
            h2_max[pi] = h2[s1, s2, pi]
            lag_max[pi] = lag[s1, s2, pi]

            if lag_max[pi] > 0:
                h2_direct[pi] = -1
                negative.append(h2_max[pi])
            elif lag_max[pi] < 0:
                h2_direct[pi] = 1
                positive.append(h2_max[pi])

        else:
            h2_max[pi] = h2[s2, s1, pi]
            lag_max[pi] = lag[s2, s1, pi]

            if lag_max[pi] > 0:
                h2_direct[pi] = 1
                positive.append(h2_max[pi])
            elif lag_max[pi] < 0:
                h2_direct[pi] = -1
                negative.append(h2_max[pi])

    sp = sum(positive)
    sn = sum(negative)
    nw_direction = (h2_direct.count(1) - h2_direct.count(-1)) / pnum
    return h2_max, lag_max, nw_direction, (sp - sn) / (sp + sn)


def all_h2_max_direction(h2, lag):
    enum = h2.shape[0]  # 电极点的数量
    global h2_lag_direction  # h2_max, lag_max, nw_direction, w_direction
    h2_lag_direction.clear()
    for ei1 in range(enum - 1):
        for ei2 in range(ei1 + 1, enum):
            h2_lag_direction.append(h2_max_direction(h2, lag, ei1, ei2))


def out_in(h2, lag):
    '''
    s1,s2代表数字，如 0,3
    返回每一个节点的out与in及tot links值
    '''
    enum = h2.shape[0]  # 电极点的数量
    tnum = h2.shape[2]  # 时间点的数量
    out_links = [[0] * enum for i in range(tnum)]  # (p,e)每一个时间窗口(p)每一个电极点(e)的出链数  [[0] * enum] * pnum 错误写法
    in_links = [[0] * enum for i in range(tnum)]
    for ei1 in range(enum - 1):
        for ei2 in range(ei1 + 1, enum):
            for pi in range(tnum):
                if h2[ei1, ei2, pi] >= h2[ei2, ei1, pi]:
                    if lag[ei1, ei2, pi] > 0:
                        in_links[pi][ei1] += 1
                        out_links[pi][ei2] += 1
                    elif lag[ei1, ei2, pi] < 0:
                        in_links[pi][ei2] += 1
                        out_links[pi][ei1] += 1
                else:
                    if lag[ei2, ei1, pi] > 0:
                        in_links[pi][ei2] += 1
                        out_links[pi][ei1] += 1
                    elif lag[ei2, ei1, pi] < 0:
                        in_links[pi][ei1] += 1
                        out_links[pi][ei2] += 1

    global electrode_names, start, step
    data = pd.DataFrame(np.c_[out_links,in_links],index=[start + step * i for i in range(tnum)],
                        columns=[np.r_[['OUT'] * enum, ['IN'] * enum],electrode_names * 2])
    data.to_excel("static/data/out_result.xls")
    return out_links, in_links
    # JsonResponse({'out': out_links, 'in': out_links})


def match_wave(filters):
    # if np.sum(filters) == 0
    if sum(filters) == 0:
        filters = "No Filtering: " + str(filters)
    elif sum(filters) == 5:
        filters = "Delta: " + str(filters)
    elif sum(filters) == 12:
        filters = "Theta: " + str(filters)
    elif sum(filters) == 23:
        filters = "Alpha: " + str(filters)
    elif sum(filters) == 45:
        filters = "Beta: " + str(filters)
    elif sum(filters) == 75:
        filters = "Gamma: " + str(filters)
    elif sum(filters) == 145:
        filters = "Gamma2: " + str(filters)
    elif sum(filters) == 330:
        filters = "Ripple: " + str(filters)
    elif sum(filters) == 750:
        filters = "Fast Ripple: " + str(filters)
    else:
        filters = str(filters)
    return filters


def to_lists(str_num):
    """
    :param str_num: 字符串："4-8,10,15-17"
    :return: 整数列表：[4, 5, 6, 7, 8, 10, 15, 16, 17]
    """
    result = []
    if str_num=="" or str_num== None:
        return result
    for i in str_num.split(","):
        tmp = i.split("-")
        if len(tmp) == 2:
            result.extend([i for i in range(int(tmp[0]), int(tmp[1]) + 1)])
        else:
            result.append(int(tmp[0]))
    '''
    return result  # 未去重，原始数据
    return list(set(result)) # 列表去重
    '''
    result = list(set(result))
    result.sort()
    return result  # 列表去重，并且从小到大排序


def chart(request):
    return render(request, "chart.html")


def guide(request):
    return render(request, "guide.html")


def ViolinBox(request):
    return render(request, "ViolinBoxPlot.html")