package com.jeff_fennell.capstone.entities;

public class Group {

    private Long groupId;
    private String name;
    private Long createdOnTimestamp;
    private Long admin;

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getCreatedOnTimestamp() {
        return createdOnTimestamp;
    }

    public void setCreatedOnTimestamp(Long createdOnTimestamp) {
        this.createdOnTimestamp = createdOnTimestamp;
    }

    public Long getAdmin() {
        return admin;
    }

    public void setAdmin(Long admin) {
        this.admin = admin;
    }
}
