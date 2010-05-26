from django.conf.urls.defaults import *

from frogger.views import main

urlpatterns = patterns('',
    (r'^api/', include('frogger.api.urls')),

	# Intro Page:
    (r'^$', main),

	# Actual Game:
    (r'^play/$', "django.views.generic.simple.direct_to_template", {"template":"frogger/game.html"}),

)
