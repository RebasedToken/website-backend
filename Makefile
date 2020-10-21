www:
	@./node_modules/.bin/nodemon bin/www.js

cron:
	@./node_modules/.bin/pm2 start bin/cron.js

.PHONY: \
	cron \
	www

