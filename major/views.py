from django.shortcuts import render
from django.http import JsonResponse
import os
import scipy.io as sio
import json
import numpy as np
import datetime

# Create your views here.

matData = None
h2_lag_direction = []

def index(request):
    if request.method == "POST":
        global matData
        file_obj = request.FILES.get("up_file")
        f1 = open(file_obj.name, "wb")
        for i in file_obj.chunks():
            f1.write(i)
        f1.close()
        matData = sio.loadmat(file_obj.name)
        hour = matData['hour'][0][0]
        minute = matData['minute'][0][0]
        second = matData['second'][0][0]
        os.remove(file_obj.name)
        # date_time = str(hour) + ':' + str(minute) + ':' + str(second)
        date_time = str(datetime.time(hour, minute, second))
        file_name = file_obj.name
        filters = list(matData['filters'][0])
        filters = match_wave(filters)
        windowSize = matData['aw_windowSize'][0][0]
        step = matData['aw_step'][0][0]
        maxLag = matData['aw_maxLag'][0][0]
        start = matData['aw_start'][0][0]
        section_iterations = matData['section_iterations'][0][0]
        electrode_names = []
        for i in matData['electrode_names'][0]:
            electrode_names.append(i[0])
        fc_info = {"electrode_names": electrode_names,"filters": filters,"time": date_time, "windowSize": windowSize,
                   "step": step, "maxLag": maxLag, "start": start, "section_iterations": section_iterations}

        nez = request.POST.get('EZ')
        npz = request.POST.get('PZ')
        nniz = request.POST.get('NIZ')
        print(nez, npz, nniz)
        all_h2_max_direction(matData['aw_h2'], matData['aw_lag'])
        return render(request, "index.html", {"fc_info": fc_info,"file_name":json.dumps(file_name)})
    return render(request, "index.html",{"file_name":json.dumps(False)})


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
        except ValueError as e:
            return JsonResponse({'result': False, 'msg': "请输入整数！"})
        except Exception as e:
            return JsonResponse({'result': False, 'msg': "信号输入不正确！"})
        # print(s1_s2[0])
        # print(s1_s2[3])
        return JsonResponse({'result': True, 's1_s2': s1_s2})
    return JsonResponse({'result': False, 'msg': "Not POST Request!"})


def fcAnalyse(request):

    if request.method == "POST":
        try:
            ez = to_lists(request.POST.get('ez'))
            pz = to_lists(request.POST.get('pz'))
            niz = to_lists(request.POST.get('niz'))
        except Exception as e:
            return JsonResponse({'result': False, 'msg': "区域格式输入不正确！\n正确格式为：1-3,6"})

        return JsonResponse({'result': True, 'zones': [ez,pz,niz]})
    return JsonResponse({'result': False, 'msg': "Not POST Request!"})


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
    for ei1 in range(enum - 1):
        for ei2 in range(ei1 + 1, enum):
            h2_lag_direction.append(h2_max_direction(h2, lag, ei1, ei2))


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
    # return result
    return list(set(result)) # 列表去重，并且从小到大排序


def chart(request):
    return render(request, "chart.html")


def guide(request):
    return render(request, "guide.html")