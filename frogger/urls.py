from django.conf.urls.defaults import *

from frogger.views import leaderboard

urlpatterns = patterns('',
    (r'^api/', include('api.urls')),
    (r'^leaderboard/', leaderboard),

    (r'^$', "django.views.generic.simple.direct_to_template", {"template":"frogger/index.html"}),

)
