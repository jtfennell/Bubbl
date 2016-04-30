package com.jeff_fennell.capstone.entities;

import com.google.gson.annotations.SerializedName;

public class Album {
    String name;
    @SerializedName("album_id")
    long albumId;
    @SerializedName("created_on")
    long createdOn;
    @SerializedName("group_id")
    long groupId;
    @SerializedName("created_by")
    long createdBy;

    public Album() {

    }

    public Album(long groupId, String name, long createdByUserId) {
        this.groupId = groupId;
        this.name = name;
        this.createdBy = createdByUserId;
    }

    public long getAlbumId() {
        return albumId;
    }

    public void setAlbumId(long albumId) {
        this.albumId = albumId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public long getCreatedOn() {
        return createdOn;
    }

    public void setCreatedOn(long createdOn) {
        this.createdOn = createdOn;
    }

    public long getGroupId() {
        return groupId;
    }

    public void setGroupId(long groupId) {
        this.groupId = groupId;
    }

    public long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(long createdBy) {
        this.createdBy = createdBy;
    }
}
