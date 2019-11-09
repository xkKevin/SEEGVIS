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
h2_lag_direction = []  # h2_max, nw_direction, w_direction
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
            end = start + (section_iterations - 1) * step
        except Exception as e:
            return render(request, "index.html", {"msg": json.dumps(".mat文件读取失败！\n请检查数据是否正确。")})
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
                   "step": step, "maxLag": maxLag, "start": start, "end":end, "section_iterations": section_iterations}

        # all_h2_max_direction(matData['aw_h2'], matData['aw_lag'],0, section_iterations)  fc分析的时候才计算
        # links = out_in(matData['aw_h2'], matData['aw_lag']) # [out_links,in_links]
        return render(request, "index.html", {"fc_info": fc_info, "file_name": json.dumps(file_name)})
    return render(request, "index.html")


def getH2(request):
    global start, step
    if request.method == "GET":
        try:
            s1 = int(request.GET.get('s1'))
            s2 = int(request.GET.get('s2'))
            h2_threshold = float(request.GET.get('h2_threshold'))
            select_start = float(request.GET.get('select_start'))
            select_end = float(request.GET.get('select_end'))
            select_s = int((select_start - start)/step)  # 筛选的起始时间下标
            select_l = int((select_end - start)/step) - select_s + 1  # 筛选的总长度
            s1_s2 = h2_max_direction(s1, s2, select_s, select_l, h2_threshold)
        except Exception as e:
            return JsonResponse({'result': False, 'msg': "系统出错！\n" + repr(e)})
        return JsonResponse({'result': True, 's1_s2': s1_s2})
    return JsonResponse({'result': False, 'msg': "Not GET Request!"})


def fcAnalyse(request):
    '''
    区域内与区域间的FC分析
    :param request:
    :return:
    '''
    if request.method == "POST":
        try:
            global start, step
            ez = json.loads(request.POST.get('ez'))
            pz = json.loads(request.POST.get('pz'))
            niz = json.loads(request.POST.get('niz'))

            # zone_e = np.r_[ez, pz, niz]  此方法如果某个子数组为空，则最后的结果会变成浮点数类型，eg np.r_[[], [1,2]] 会得到 [1.0,2.0]
            zone_e = []
            for i in ez:
                zone_e.append(i)
            for i in pz:
                zone_e.append(i)
            for i in niz:
                zone_e.append(i)

            elec_len = len(zone_e)

            h2_threshold = float(request.POST.get('h2_threshold'))
            select_start = float(request.POST.get('select_start'))
            select_end = float(request.POST.get('select_end'))
            select_s = int((select_start - start) / step)  # 筛选的起始时间下标
            select_l = int((select_end - start) / step) - select_s + 1  # 筛选的总长度
            zone_h2_max_direction(zone_e, select_s, select_l, h2_threshold)

            # fileHeader = ["zone", "electrodes", "h2", "nwd", "wd"]
            ez_in = cal_fc_in(ez,0,elec_len,"ez")
            pz_in = cal_fc_in(pz,len(ez),elec_len,"pz")
            niz_in = cal_fc_in(niz,len(ez)+len(pz),elec_len,"niz")
            ez_pz = cal_fc_bwt(ez,0,pz,len(ez),elec_len,"ez_pz")
            ez_niz = cal_fc_bwt(ez,0,niz,len(ez)+len(pz),elec_len,"ez_niz")
            pz_niz = cal_fc_bwt(pz,len(ez),niz,len(ez)+len(pz),elec_len,"pz_niz")

        except Exception as e:
            return JsonResponse({'result': False, 'msg': "系统出错！\n" + repr(e)})

        # return JsonResponse({'result': True, "ez":ez_in, "pz":pz_in, "niz":niz_in, "ez_pz":ez_pz, "ez_niz":ez_niz, "pz_niz":pz_niz})   # 'zones': [ez,pz,niz]
        return JsonResponse({'result': True, "data":[ez_in, pz_in, niz_in, ez_pz, ez_niz, pz_niz]})   # 'zones': [ez,pz,niz]
    return JsonResponse({'result': False, 'msg': "Not POST Request!"})


def outAnalyse(request):
    global start, step
    if request.method == "GET":
        try:
            select_start = float(request.GET.get('select_start'))
            select_end = float(request.GET.get('select_end'))
            h2_threshold = float(request.GET.get('h2_threshold'))
            select_ei = json.loads(request.GET.get('select_ei'))  # 将字符串格式转化为json对象
            select_s = int((select_start - start)/step)  # 筛选的起始时间下标
            select_l = int((select_end - start)/step) - select_s + 1  # 筛选的总长度
            links = out_in(select_s, select_l, h2_threshold, select_ei)  # [out_links, in_links]
        except Exception as e:
            return JsonResponse({'result': False, 'msg': "系统出错！\n" + repr(e)})
        return JsonResponse({'result': True, 'out_links': links[0], "in_links": links[1]})
    return JsonResponse({'result': False, 'msg': "Not GET Request!"})


def cal_fc_in(signals, offset, n, zone):
    '''
    计算区域内FC
    :param：signals为数组，如[0,2,3]，offset表示该组signals在zone_e下的偏移量，n表示zone_e电极数，zone表示：ez,pz,niz
    :return：如果signals为空数组，则该函数也返回空数组；返回格式例如：["ez","C5-C6--C7-C8",h2,lag,nwd,wd]
    '''
    result = []
    slen = len(signals)
    global h2_lag_direction
    for i in range(slen - 1):
        for j in range(i+1,slen):
            tmp = [zone,str(electrode_names[signals[i]])+"--"+str(electrode_names[signals[j]])]   # 需要电极在总电极点的下标 signals[i]
            tmp.extend(h2_lag_direction[position(offset+i,offset+j,n)])  # 需要电极在zone电极点的下标
            result.append(tmp)
    return result


def cal_fc_bwt(s1,offset1,s2,offset2,n,zone):
    '''
    计算区域内FC
    :param：s1,s2均为数组，如[0,2,3]，n表示总电极数，zone表示：ez_pz,ez_niz,pz_niz
    :return：如果s1或s2为空数组，则该函数也返回空数组；返回格式例如：["ez_pz","C5-C6--C7-C8",h2,lag,nwd,wd]
    '''
    result = []
    global h2_lag_direction
    # for i in s1:
    #     for j in s2:
    for i in range(len(s1)):
        for j in range(len(s2)):
            tmp = [zone,str(electrode_names[s1[i]]) + "--" + str(electrode_names[s2[j]])]
            tmp.extend(h2_lag_direction[position(offset1+i,offset2+j, n)])
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


def h2_max_direction(s1, s2, select_s, select_l, h2_threshold):
    '''
    s1,s2代表数字，如 0,3
    select_s：筛选的起始时间下标；select_l：筛选的总长度（个数）
    返回这组信号中s1与s2的最终h2（最大值）及其对应的时间延迟
    以及两信号的不加权方向及加权方向
    '''
    # pnum = h2.shape[2]  # 时间点的数量
    global matData
    h2 = matData['aw_h2']
    lag = matData['aw_lag']
    h2_max = [None] * select_l
    lag_max = [None] * select_l

    positive = []
    negative = []
    neutral = []  # 还要考虑中立的情况

    for pi in range(select_s, select_s + select_l):
        select_i = pi - select_s
        if h2[s1, s2, pi] >= h2[s2, s1, pi]:
            if h2[s1, s2, pi] >= h2_threshold:
                h2_max[select_i] = h2[s1, s2, pi]
                lag_max[select_i] = lag[s1, s2, pi]

                if lag_max[select_i] > 0:
                    negative.append(h2_max[select_i])
                elif lag_max[select_i] < 0:
                    positive.append(h2_max[select_i])
                else:
                    neutral.append(h2_max[select_i])
            else:
                h2_max[select_i] = 0
                lag_max[select_i] = 0

        else:
            if h2[s2, s1, pi] >= h2_threshold:
                h2_max[select_i] = h2[s2, s1, pi]
                lag_max[select_i] = -lag[s2, s1, pi]

                if lag_max[select_i] > 0:
                    negative.append(h2_max[select_i])
                elif lag_max[select_i] < 0:
                    positive.append(h2_max[select_i])
                else:
                    neutral.append(h2_max[select_i])
            else:
                h2_max[select_i] = 0
                lag_max[select_i] = 0

    sp = sum(positive)
    sn = sum(negative)
    lp = len(positive)
    ln = len(negative)
    lpn = lp + ln
    lpnneu = lpn + len(neutral)
    nw_direction = w_direction = mean_h2 = median_h2 = max_h2 = min_h2 = \
        mean_p = median_p = mean_n = median_n = max_p = min_p = max_n = min_n = 0

    if lpn:
        nw_direction = (lp - ln) / lpn

    if sp + sn:
        w_direction = (sp - sn) / (sp + sn)

    if lpnneu:
        pn = np.r_[positive,negative,neutral]
        mean_h2 = np.mean(pn)
        median_h2 = np.median(pn)
        max_h2 = max(pn)
        min_h2 = min(pn)

    if lp:
        mean_p = sp / lp
        median_p = np.median(positive)
        max_p = max(positive)
        min_p = min(positive)

    if ln:
        mean_n = sn / ln
        median_n = np.median(negative)
        max_n = max(negative)
        min_n = min(negative)

    return [h2_max,lag_max,nw_direction,w_direction], [median_h2,mean_h2,max_h2,min_h2],\
           [median_p,mean_p,max_p,min_p], [median_n,mean_n,max_n,min_n]#, [lp, ln]


def zone_h2_max_direction(zone_e, select_s, select_l, h2_threshold):
    '''
        zone_e：是区域总电极集合：ez,pz,niz
    '''
    enum = len(zone_e)  # 区域总电极点的数量
    global h2_lag_direction  # h2_max, nw_direction, w_direction
    h2_lag_direction.clear()
    for ei1 in range(enum - 1):
        for ei2 in range(ei1 + 1, enum):
            h2_lag_direction.append(h2_max_direction_forFC(zone_e[ei1], zone_e[ei2], select_s, select_l, h2_threshold))


def h2_max_direction_forFC(s1, s2, select_s, select_l, h2_threshold):
    '''
    s1,s2代表数字，如 0,3
    select_s：筛选的起始时间下标；select_l：筛选的总长度（个数）
    返回这组信号中s1与s2的最终h2（最大值）及其对应的时间延迟
    以及两信号的不加权方向及加权方向
    '''
    # pnum = h2.shape[2]  # 时间点的数量
    global matData
    h2 = matData['aw_h2']
    lag = matData['aw_lag']
    h2_max = [None] * select_l
    # lag_max = [None] * select_l

    positive = []
    negative = []

    for pi in range(select_s, select_s + select_l):
        select_i = pi - select_s
        if h2[s1, s2, pi] >= h2[s2, s1, pi]:
            if h2[s1, s2, pi] >= h2_threshold:
                h2_max[select_i] = h2[s1, s2, pi]
                # lag_max[select_i] = lag[s1, s2, pi]

                if lag[s1, s2, pi] > 0:
                    negative.append(h2_max[select_i])
                elif lag[s1, s2, pi] < 0:
                    positive.append(h2_max[select_i])
            else:
                h2_max[select_i] = 0

        else:
            if h2[s2, s1, pi] >= h2_threshold:
                h2_max[select_i] = h2[s2, s1, pi]
                # lag_max[select_i] = lag[s2, s1, pi]

                if lag[s2, s1, pi] > 0:
                    positive.append(h2_max[select_i])
                elif lag[s2, s1, pi] < 0:
                    negative.append(h2_max[select_i])
            else:
                h2_max[select_i] = 0

    sp = sum(positive)
    sn = sum(negative)
    lpn = len(positive) + len(negative)
    if lpn == 0:
        nw_direction = 0
    else:
        nw_direction = (len(positive) - len(negative)) / lpn
    if sp + sn == 0:
        w_direction = 0
    else:
        w_direction = (sp - sn) / (sp + sn)
    return h2_max, nw_direction, w_direction


def out_in(select_s, select_l, h2_threshold, select_ei):
    '''
    select_s：筛选的起始时间下标；select_l：筛选的总长度（个数）
    select_ei：表示所选电极（通道）下标数组
    返回每一个节点在筛选的时间内的out与in links值
    '''
    global matData
    h2 = matData['aw_h2']
    lag = matData['aw_lag']
    enum = len(select_ei)  # 所选电极点的数量
    # tnum = h2.shape[2] 时间点的数量
    out_links = [[0] * enum for i in range(select_l)]  # (p,e)每一个时间窗口(p)每一个电极点(e)的出链数  [[0] * enum] * select_l 错误写法
    in_links = [[0] * enum for i in range(select_l)]
    for ei1 in range(enum - 1):
        for ei2 in range(ei1 + 1, enum):
            for pi in range(select_s, select_s + select_l):
                select_i = pi - select_s
                if h2[select_ei[ei1], select_ei[ei2], pi] >= h2[select_ei[ei2], select_ei[ei1], pi]:
                    if h2[select_ei[ei1], select_ei[ei2], pi] >= h2_threshold:
                        if lag[select_ei[ei1], select_ei[ei2], pi] > 0:
                            in_links[select_i][ei1] += 1
                            out_links[select_i][ei2] += 1
                        elif lag[select_ei[ei1], select_ei[ei2], pi] < 0:
                            in_links[select_i][ei2] += 1
                            out_links[select_i][ei1] += 1
                else:
                    if h2[select_ei[ei2], select_ei[ei1], pi] >= h2_threshold:
                        if lag[select_ei[ei2], select_ei[ei1], pi] > 0:
                            in_links[select_i][ei2] += 1
                            out_links[select_i][ei1] += 1
                        elif lag[select_ei[ei2], select_ei[ei1], pi] < 0:
                            in_links[select_i][ei1] += 1
                            out_links[select_i][ei2] += 1

    global electrode_names, start, step
    data = pd.DataFrame(np.c_[out_links,in_links], index=[start + step * i for i in range(select_s, select_s + select_l)],
                        columns=[np.r_[['OUT'] * enum, ['IN'] * enum],[electrode_names[i] for i in select_ei] * 2])
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