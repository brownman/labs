from django.db import models
from datetime import datetime

class User(models.Model):
	userid = models.CharField(max_length=50);
	first_name = models.CharField(max_length=255);
	last_name = models.CharField(max_length=255);
	def __unicode__(self): 
		return str(self.first_name) + str(self.last_name)
	
class Play(models.Model):
	user = models.ForeignKey(User);
	score = models.IntegerField();
	create_date = models.DateTimeField(default=datetime.now(),auto_now_add=True);
	def __unicode__(self):    
		return str(self.user) + ' ' + str(self.score)
	class Meta:
		ordering = ["-score"]
