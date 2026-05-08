.PHONY: install dev dev-frontend dev-backend build lint

install:
	cd frontend && pnpm install
	cd backend && python -m pip install -r requirements.txt

dev-frontend:
	cd frontend && pnpm dev

dev-backend:
	cd backend && uvicorn main:app --reload --port 8000

dev:
	make -j2 dev-frontend dev-backend

build:
	cd frontend && pnpm build

lint:
	cd frontend && pnpm lint
