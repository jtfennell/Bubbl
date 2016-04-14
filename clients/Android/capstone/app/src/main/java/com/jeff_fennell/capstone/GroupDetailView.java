package com.jeff_fennell.capstone;

import android.os.Bundle;
import android.app.Activity;

import com.jeff_fennell.capstone.entities.Group;

public class  GroupDetailView extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_group_detail_view);
        Group groupToDisplay = (Group)getIntent().getExtras().get(Group.serializeKey);
        System.out.println("Object");
    }

}
