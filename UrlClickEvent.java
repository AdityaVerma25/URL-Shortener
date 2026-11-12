package com.shortener.event;

public record UrlClickEvent(String shortCode, String clickedAt) {}
