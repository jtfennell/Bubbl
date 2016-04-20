package com.jeff_fennell.capstone;

import android.os.Bundle;
import android.app.Activity;
import com.jeff_fennell.capstone.entities.Group;
import com.jeff_fennell.capstone.entities.User;
import java.util.List;

public class  GroupDetailView extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_group_detail_view);
        Group groupToDisplay = (Group)getIntent().getExtras().get(Group.serializeKey);
        getActionBar().setTitle(groupToDisplay.getName());
        loadMemberImages(groupToDisplay);
    }

    private void loadMemberImages(Group group) {
        for (User user : (List<User>)group.getMembers()) {
            System.out.println(user);
        }
    }

}
