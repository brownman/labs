from django.conf.urls.defaults import *

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

from django.conf import settings

urlpatterns = patterns('',
    # Add labs here:
	(r'^frogger/', include('frogger.urls')),
    (r'^spacecannon/', include('homeinspace.urls')),
	(r'^reptar/', include('reptar.urls')),
    
	# Admin docs:
    (r'^admin/', include(admin.site.urls)),

	# Main Labs Page:
	(r'^$', "django.views.generic.simple.direct_to_template", {"template":"labs_home.html"}),
)

if (settings.PROD==False):
	urlpatterns += patterns('',
	(r'^site_media/(?P<path>.*)$', 'django.views.static.serve',
        {'document_root': '/django_trunk/django/bin/labs/public', 'show_indexes': True}),
)