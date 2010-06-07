from django.conf.urls.defaults import *
from googauth.views import goog_login, goog_logout, \
    goog_authenticated

urlpatterns = patterns('',
    url(r'^login/?$', goog_login),
    url(r'^logout/?$', goog_logout),
    url(r'^login/authenticated/?$', goog_authenticated),
)