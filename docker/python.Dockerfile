FROM python:3.12-slim
WORKDIR /app
COPY python/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY python .
RUN useradd -m dtm
USER dtm
EXPOSE 8501
CMD ["streamlit","run","streamlit/app.py","--server.address=0.0.0.0","--server.port=8501","--server.enableXsrfProtection=true"]
