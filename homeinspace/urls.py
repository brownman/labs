from django.conf.urls.defaults import *

urlpatterns = patterns('',
    (r'^$', "django.views.generic.simple.direct_to_template", {"template":"homeinspace/main.html"}),
	(r'^play/', "django.views.generic.simple.direct_to_template", {"template":"homeinspace/index.html"}),

)
