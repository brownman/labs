from django.conf.urls.defaults import *
from piston.resource import Resource

from frogger.api.handlers import ScoreHandler

score = Resource(ScoreHandler)

urlpatterns = patterns('',
    (r'^score/?', score),
    )