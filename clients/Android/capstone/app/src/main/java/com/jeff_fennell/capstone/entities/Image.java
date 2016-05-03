package com.jeff_fennell.capstone.entities;

public class Image {
    public static final String GROUP_PROFILE = "groupProfile";
    public static final String USER_PROFILE = "userProfile";
    public static final String GROUP_ALL = "groupAll";
    public static final String GROUP_ALBUM = "groupAlbum";
    private String url;
    private long image_id;
    private long date_uploaded;
    private String type;
    private long albumId;
    private long groupId;

    public Image() {

    }

    public Image(String url,long albumId, long groupId, String type ) {
        this.url = url;
        this.albumId = albumId;
        this.groupId = groupId;
        this.type = type;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public long getImage_id() {
        return image_id;
    }

    public void setImage_id(long image_id) {
        this.image_id = image_id;
    }

    public long getDate_uploaded() {
        return date_uploaded;
    }

    public void setDate_uploaded(long date_uploaded) {
        this.date_uploaded = date_uploaded;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }


}
