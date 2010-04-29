from django.contrib import admin
from fbg.models import Play, User

class PlayAdmin(admin.ModelAdmin):
    list_display = ('user','score','create_date')

    
admin.site.register(Play,PlayAdmin)
admin.site.register(User)
