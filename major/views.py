from django.shortcuts import render
from django.http import HttpResponseRedirect, JsonResponse, FileResponse
from django.urls import reverse
import os
import scipy.io as sio
import numpy as np
import datetime

# Create your views here.

matData = None


def index(request):
    global matData
    if request.method == "POST":
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
        date_time = str(hour) + ':' + str(minute) + ':' + str(second)

        nez = request.POST.get('EZ')
        npz = request.POST.get('PZ')
        nniz = request.POST.get('NIZ')
        print(nez, npz, nniz)
        return render(request, "index.html", {"date_time": date_time})
    return render(request, "index.html", {"date_time": None})


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
        print(s1_s2[0])
        print(s1_s2[3])
        return JsonResponse({'result': True, 's1_s2': s1_s2})
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
