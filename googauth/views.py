import oauth2 as oauth
import cgi

from django.shortcuts import render_to_response
from django.http import HttpResponseRedirect
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required

import gdata.gauth
import gdata.docs.client
import gdata.photos.service
import gdata.media
import gdata.geo

from googauth.models import GoogleAccount

#consumer = oauth.Consumer(settings.GOOGLE_TOKEN, settings.GOOGLE_SECRET)
#client = oauth.Client(consumer)

scopes = ["https://docs.google.com/feeds/","http://picasaweb.google.com/data/"]

client = gdata.docs.client.DocsClient(source="labs.brian-stoner.com")

oauth_callback = "http://labs.brian-stoner.com/googauth/login/authenticated"

#request_token_url = 'https://www.google.com/accounts/OAuthGetRequestToken?scope=' + scope
#access_token_url = 'https://www.google.com/accounts/OAuthGetAccessToken'
#authorize_url = 'https://www.google.com/accounts/OAuthAuthorizeToken'

def goog_login(request):
	#resp, content = client.request(request_token_url, "GET")
	#if resp['status'] != '200':
	#	print resp, content
	#	raise Exception("Invalid response from Google.")

	#request.session['request_token'] = dict(cgi.parse_qsl(content))
	
	#url = "%s?oauth_token=%s%s" % (authorize_url,
	#	request.session['request_token']['oauth_token'],
	#	"&oauth_callback=http://127.0.0.1:8000/googauth/login/authenticated")

	request_token = client.GetOAuthToken(scopes,oauth_callback,settings.GOOGLE_TOKEN, consumer_secret=settings.GOOGLE_SECRET)

	request.session['request_token'] = request_token.token
	request.session['request_token_secret'] = request_token.token_secret

	return HttpResponseRedirect(request_token.generate_authorization_url(google_apps_domain=None))

def goog_logout(request):
	logout(request)
	return HttpResponseRedirect('/syncshow/')

def goog_authenticated(request):
	saved_request_token = oauth.Token(request.session['request_token'],
		request.session['request_token_secret'])
		
	print saved_request_token
	#client = oauth.Client(consumer, token)

	#resp, content = client.request(access_token_url, "GET")
	#if resp['status'] != '200':
	#	print resp,content
	#	raise Exception("Invalid response from Google.")

	#access_token = dict(cgi.parse_qsl(content))

	request_token = gdata.gauth.AuthorizeRequestToken(saved_request_token, self.request.uri)
	
	print 'req_token', request_token
	access_token = client.GetAccessToken(request_token)
	print 'access_token', access_token
	
	feed = client.GetDocumentListFeed()
	for entry in feed.entry:
		print entry.title.text
	
	fdsa
	
	#try:
	#	user = User.objects.get(username='googauth_' + access_token['oauth_token'])
	#except User.DoesNotExist:
	#	user = User.objects.create_user('googauth_' + access_token['oauth_token'],
	#		'oauth@gmail.com',
	#		access_token['oauth_token_secret'])

	#	profile = GoogleAccount()
	#	profile.user = user
	#	profile.oauth_token = access_token['oauth_token']
	#	profile.oauth_secret = access_token['oauth_token_secret']
	#	profile.save()

	#user = authenticate(username='googauth_' + access_token['oauth_token'],
	#	password=access_token['oauth_token_secret'])
	#login(request, user)

	return HttpResponseRedirect('/syncshow/')