from django.conf.urls.defaults import *
from piston.resource import Resource

from fbg.api.handlers import ScoreHandler

score = Resource(handler=ScoreHandler)

urlpatterns = patterns('',
    (r'^score/$', score),
    )