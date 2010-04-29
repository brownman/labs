from piston.handler import BaseHandler
from piston.utils import rc

from fbg.models import User, Play

class ScoreHandler(BaseHandler):
	allowed_methods = ('POST',)

	def create(self,request):
		data = request.POST
		
		u_id = ""
		l_name = ""
		f_name = ""
		score = 0
		
		#if (bool(data.get("user_id"))):
		u_id = data.get("user_id")
		#if (bool(data.get("last_name"))):
		l_name = data.get("last_name")
		#if (bool(data.get("first_name"))):
		f_name = data.get("first_name")
		#if (bool(data.get("score"))):
		score = data.get("score")
		
		try:
			u = User.objects.get(userid=u_id)
		except User.DoesNotExist:
			u = User(userid=u_id,last_name=l_name,first_name=f_name)
			u.save()
			
		p = Play(user=u,score=score)
		p.save()
		return p