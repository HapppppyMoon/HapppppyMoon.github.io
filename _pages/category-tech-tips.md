---
title: "Tech Notes"
layout: single
permalink: /categories/tech-tips/
author_profile: true
toc: false
---

Technical notes, tips, and problem-solving approaches.

---

## 📝 포스트 목록

{% for post in site.categories['tech-tips'] %}
<div style="margin-bottom: 2em;">
  <h3 style="margin-bottom: 0.5em;">
    <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
  </h3>
  <p style="color: #666; margin-bottom: 0.5em;">
    <small>{{ post.date | date: "%Y년 %m월 %d일" }}</small>
    {% if post.tags %}
      |
      {% for tag in post.tags %}
        <span style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-size: 0.85em;">{{ tag }}</span>
      {% endfor %}
    {% endif %}
  </p>
  {% if post.excerpt %}
    <p>{{ post.excerpt | strip_html | truncate: 200 }}</p>
  {% endif %}
</div>
{% endfor %}