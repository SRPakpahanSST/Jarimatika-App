# Makefile for Jarimatika App

.PHONY: help install run test clean deploy

help:
	@echo "Jarimatika App - Available Commands:"
	@echo "  install  - Install dependencies"
	@echo "  run      - Run Streamlit app"
	@echo "  test     - Run tests"
	@echo "  clean    - Clean cache and temp files"
	@echo "  deploy   - Deploy to Streamlit Cloud"

install:
	python -m venv .venv
	.venv/bin/pip install --upgrade pip
	.venv/bin/pip install -r requirements.txt

run:
	.venv/bin/streamlit run app.py

test:
	.venv/bin/pytest tests/

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".mypy_cache" -exec rm -rf {} +
	rm -rf .venv
	rm -rf logs
	rm -rf checkpoints

deploy:
	@echo "Deploying to Streamlit Cloud..."
	@echo "Make sure you have committed all changes to GitHub"
	@echo "Then push to the main branch"
	git push origin main
	@echo "Deployment trigger completed!"

docker-build:
	docker build -t jarimatika-app .

docker-run:
	docker run -p 8501:8501 jarimatika-app

docker-compose:
	docker-compose up -d

docker-stop:
	docker-compose down