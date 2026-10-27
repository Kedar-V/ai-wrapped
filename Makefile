# AI Wrapped — common classroom / local commands
.PHONY: help dev build preview test vote vote-restart

help:
	@echo "make dev           Vite app"
	@echo "make build         Production build"
	@echo "make preview       Preview build"
	@echo "make test          App + vote-server tests"
	@echo "make vote          Vote server + ngrok (password: ethics)"
	@echo "make vote-restart  Kill old vote/ngrok, then vote"

dev:
	npm run dev

build:
	npm run build

preview:
	npm run preview

test:
	npm test

vote:
	npm run vote:demo

vote-restart:
	-pkill -f 'vote-demo.mjs'
	-pkill -f 'ngrok http'
	@sleep 1
	-lsof -ti :8787 | xargs kill 2>/dev/null
	@sleep 0.5
	npm run vote:demo
