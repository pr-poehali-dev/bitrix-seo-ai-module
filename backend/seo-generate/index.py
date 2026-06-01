# v2
import json
import os
import urllib.request
import urllib.error


def handler(event: dict, context) -> dict:
    """
    Генерация SEO-контента через OpenAI GPT-4o:
    - мета-теги (title + description) для страниц
    - кластеры ключевых слов с рекомендациями
    """
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    body = json.loads(event.get('body') or '{}')
    mode = body.get('mode', 'meta')  # 'meta' или 'keywords'
    url = body.get('url', '')
    title = body.get('title', '')
    description = body.get('description', '')
    topic = body.get('topic', '')

    api_key = os.environ.get('OPENAI_API_KEY', '')
    if not api_key:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'OPENAI_API_KEY не настроен'})
        }

    if mode == 'meta':
        system_prompt = (
            "Ты эксперт по SEO-оптимизации для русскоязычных сайтов. "
            "Генерируй мета-теги строго в JSON без лишних символов."
        )
        user_prompt = (
            f"Сгенерируй SEO мета-теги для страницы сайта.\n"
            f"URL: {url}\n"
            f"Текущий title: {title or 'отсутствует'}\n"
            f"Текущее описание: {description or 'отсутствует'}\n\n"
            f"Верни JSON с полями:\n"
            f"- title (до 60 символов, цепляющий, с ключевыми словами)\n"
            f"- description (до 160 символов, призыв к действию)\n"
            f"- keywords (5 ключевых слов через запятую)\n"
            f"- score (оценка SEO от 0 до 100 после оптимизации)\n"
            f"- tips (массив из 2-3 коротких советов по улучшению)\n"
            f"Только JSON, без markdown и пояснений."
        )
    else:
        system_prompt = (
            "Ты эксперт по семантическому ядру и кластеризации ключевых слов для SEO. "
            "Отвечай строго в JSON без лишних символов."
        )
        user_prompt = (
            f"Проанализируй тематику сайта и предложи ключевые слова.\n"
            f"Тематика/ниша: {topic or 'общая'}\n\n"
            f"Верни JSON с полями:\n"
            f"- clusters (массив из 5 объектов: {{name, keywords: [5 фраз], volume_estimate, competition}})\n"
            f"- top_opportunities (массив из 3 фраз с наибольшим потенциалом)\n"
            f"- summary (2-3 предложения с выводами)\n"
            f"Только JSON, без markdown и пояснений."
        )

    payload = json.dumps({
        "model": "gpt-4o",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 1000
    }).encode('utf-8')

    req = urllib.request.Request(
        'https://api.openai.com/v1/chat/completions',
        data=payload,
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        },
        method='POST'
    )

    with urllib.request.urlopen(req, timeout=25) as resp:
        result = json.loads(resp.read().decode('utf-8'))

    content = result['choices'][0]['message']['content'].strip()
    # Убираем markdown-блоки если есть
    if content.startswith('```'):
        content = content.split('```')[1]
        if content.startswith('json'):
            content = content[4:]
    parsed = json.loads(content.strip())

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ok': True, 'data': parsed, 'mode': mode})
    }