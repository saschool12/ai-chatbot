package com.chatbot.model;

public class Persona {
    private String id;
    private String name;
    private String icon;
    private String description;
    private String systemPrompt;

    public Persona() {}

    public Persona(String id, String name, String icon, String description, String systemPrompt) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.description = description;
        this.systemPrompt = systemPrompt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSystemPrompt() {
        return systemPrompt;
    }

    public void setSystemPrompt(String systemPrompt) {
        this.systemPrompt = systemPrompt;
    }
}
