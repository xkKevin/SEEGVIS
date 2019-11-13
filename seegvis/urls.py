"""seegvis URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.contrib import admin
import major.views as views

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$',views.index, name="index"),
    url(r'^getH2/$',views.getH2, name="getH2"),
    url(r'^fcAnalyse/$',views.fcAnalyse, name="fcAnalyse"),
    url(r'^chart/$',views.chart, name="chart"),
    url(r'^guide/$',views.guide, name="guide"),
    url(r'^ViolinBox/$',views.ViolinBox, name="ViolinBox"),
    url(r'^outAnalyse/$',views.outAnalyse, name="outAnalyse"),
    url(r'^distanceAnalyse/$',views.distanceAnalyse, name="distanceAnalyse"),
    url(r'^exitSystem/$',views.exitSystem, name="exitSystem"),
]
