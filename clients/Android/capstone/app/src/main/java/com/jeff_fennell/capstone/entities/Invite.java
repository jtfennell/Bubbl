package com.jeff_fennell.capstone.entities;

public class Invite {
    private Long inviteId;
    private Group group;

    public Invite() {

    }

    public Long getInviteId() {
        return inviteId;
    }

    public void setInviteId(Long inviteId) {
        this.inviteId = inviteId;
    }

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
    }
}
