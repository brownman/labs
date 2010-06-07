import oauth2 as oauth
import cgi

from django.shortcuts import render_to_response
from django.http import HttpResponseRedirect
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required

from googauth.models import GoogleAccount

consumer = oauth.Consumer(settings.GOOGLE_TOKEN, settings.GOOGLE_SECRET)
client = oauth.Client(consumer)

scope = "http://picasaweb.google.com/data/"

request_token_url = 'https://www.google.com/accounts/OAuthGetRequestToken?scope=' + scope
access_token_url = 'https://www.google.com/accounts/OAuthGetAccessToken'
authorize_url = 'https://www.google.com/accounts/OAuthAuthorizeToken'

def goog_login(request):
	resp, content = client.request(request_token_url, "GET")
	if resp['status'] != '200':
		print resp, content
		raise Exception("Invalid response from Google.")

	request.session['request_token'] = dict(cgi.parse_qsl(content))
	
	url = "%s?oauth_token=%s" % (authorize_url,
		request.session['request_token']['oauth_token'])

	return HttpResponseRedirect(url)

def goog_logout(request):
	logout(request)
	return HttpResponseRedirect('/')

def goog_authenticated(request):
	token = oauth.Token(request.session['request_token']['oauth_token'],
		request.session['request_token']['oauth_token_secret'])
	client = oauth.Client(consumer, token)

	resp, content = client.request(access_token_url, "GET")
	if resp['status'] != '200':
		print resp,content
		raise Exception("Invalid response from Google.")

	access_token = dict(cgi.parse_qsl(content))

	try:
		user = User.objects.get(username=access_token['screen_name'])
	except User.DoesNotExist:
		user = User.objects.create_user(access_token['screen_name'],
			'%s@google.com' % access_token['screen_name'],
			access_token['oauth_token_secret'])

		profile = GoogleAccount()
		profile.user = user
		profile.oauth_token = access_token['oauth_token']
		profile.oauth_secret = access_token['oauth_token_secret']
		profile.save()

	user = authenticate(username=access_token['screen_name'],
		password=access_token['oauth_token_secret'])
	login(request, user)

	return HttpResponseRedirect('/')