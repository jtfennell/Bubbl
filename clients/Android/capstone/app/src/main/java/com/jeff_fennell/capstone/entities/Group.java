package com.jeff_fennell.capstone.entities;

import com.google.gson.annotations.SerializedName;

import java.util.List;

public class Group {
    @SerializedName("group_id")
    private Long groupId;
    private String name;
    @SerializedName("created_on")
    private Long createdOnTimestamp;
    private Long admin;
    private List members;

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

    public List getMembers() {
        return members;
    }

    public void setMembers(List members) {
        this.members = members;
    }
}
