from django.shortcuts import render_to_response
#from django.template import RequestContext

from frogger.models import Play

def leaderboard(request):
	vars = {"plays":Play.objects.all()[0:25]}
	return render_to_response("frogger/highscores.html",vars,{})