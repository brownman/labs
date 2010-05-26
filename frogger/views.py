from django.shortcuts import render_to_response
#from django.template import RequestContext

from frogger.models import Play

def main(request):
	vars = {"plays":Play.objects.all()[0:25]}
	return render_to_response("frogger/index.html",vars,{})