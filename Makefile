ENV?=development

www:
	@./node_modules/.bin/nodemon bin/www.js

cron:
	@./node_modules/.bin/nodemon bin/cron.js

pm2:
	@./node_modules/.bin/pm2 start ecosystem.config.js --env $(ENV)

.PHONY: \
	cron \
	www \
	pm2

