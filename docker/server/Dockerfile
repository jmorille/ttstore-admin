FROM node:5



# Expose
# #######################
EXPOSE 8000
VOLUME ["/opt/ttserver", "/log"]


# Start Command
# #######################" ]
# CMD [ "node", "/opt/ttserver/src/server.js" ]
CMD tail -f /var/log/alternatives.log
