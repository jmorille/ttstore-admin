#! /usr/bin/env python

'''
AJAX proxy

Allow an AJAX script to access a 3rd party site.

Example: Use "http://localhost:8080/redirect?dest=http://api.search.yahoo.com"
in AJAX script in order to access "http://api.search.yahoo.com" from the
script.  That's assuming that the original AJAX page was served from this
same proxy.

Based on code from http://effbot.org/librarybook/simplehttpserver.htm

'''

import SocketServer
import SimpleHTTPServer
import urllib

PORT = 8000

class Proxy(SimpleHTTPServer.SimpleHTTPRequestHandler):
        def do_GET(self):
                # Is this a special request to redirect?
                prefix = '/es/'
                print "Address",self.address_string()
                if self.path.startswith(prefix):
                        # Strip off the pefix.
                        newPath = self.path.lstrip(prefix)
                else:
                        # Concatenate the curr dir with the relative path.
                        newPath = self.translate_path(self.path)

                self.copyfile(urllib.urlopen(newPath), self.wfile)

SocketServer.ThreadingTCPServer.allow_reuse_address = True
httpd = SocketServer.ThreadingTCPServer(('', PORT), Proxy)
print "serving at port", PORT
httpd.serve_forever()