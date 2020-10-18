## SEEGVIS

### Introduction

**It is a web system for visualizing and processing EEG/SEEG FC (Functional Connectivity) data.**

##### Methodological Techniques:

1. Non-linear regression (Piecewise linear regression )
2. Sliding windows and max time lag
3. Anomaly detection and handling

##### Project Techniques:

1. Django
2. D3.js
3. Vue.js

##### Visualization:

1. line chart
2. box chart
3. violin chart
4. heat map
5. theme river / stream graph
6. 3-D scatter chart

### Install

Python 3.7.x

| Package | Version |
| ------- | ------- |
| Django  | 1.11.8  |
| numpy   |         |
| scipy   |         |
| pandas  | 0.24.2  |
| xlwt    |         |

### Deployment

1. Install [Miniconda](https://mirrors.tuna.tsinghua.edu.cn/anaconda/miniconda/) 

   For Windows 64, click [here](https://mirrors.tuna.tsinghua.edu.cn/anaconda/miniconda/) to download installation package, then install it.

2. Use conda to create an environment with python3.7

   `conda create -n seegvis python=3.7`

3. Activate this environment

   `conda activate seegvis`

4. Install those python packages:

   `pip install django==1.11.8 scipy pandas==0.24.2 xlwt` 

   you can use image sources to speed up installation, like:

   `pip install -i https://pypi.tuna.tsinghua.edu.cn/simple django==1.11.8 scipy pandas==0.24.2 xlwt` 

5. Enter the SEEGVIS project folder, then run it:

   `python manage.py runserver 0.0.0.0:80`

   now the project is running on your [localhost](http://localhost)

> Note: If there is a **SyntaxError: Generator expression must be parenthesized**
> Please delete the last comma in this code: `'%s=%s' % (k, v) for k, v in params.items(),`  [reference link](https://blog.csdn.net/qq_28311921/article/details/88898741)
> Then repeat the step 5.

#### Data Description

![data_description](/data/data_description.png)