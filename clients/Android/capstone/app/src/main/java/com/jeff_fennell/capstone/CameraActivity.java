/*
 * Copyright 2014 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.jeff_fennell.capstone;

import android.app.Activity;
import android.app.DialogFragment;
import android.app.Fragment;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.TextView;
import com.jeff_fennell.capstone.entities.Album;
import com.jeff_fennell.capstone.entities.Group;
import java.util.List;

public class CameraActivity extends Activity implements
        SelectGroupDialog.OnGroupSelectedListener,
        SelectAlbumDialog.OnAlbumSelectListener {

    private Group selectedGroup;
    private Album selectedAlbum;
    public final static String GROUP_KEY = "group";
    private List<Group> groups = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN);

        setContentView(R.layout.activity_camera);
        if (null == savedInstanceState) {
            getFragmentManager().beginTransaction()
                    .replace(R.id.container, Camera2BasicFragment.newInstance(),Camera2BasicFragment.FRAGMENT_TAG)
                    .commit();
        }
    }

    @Override
    protected void onStart() {
        super.onStart();
       promptUserForGroupAndAlbum(null);

    }

    @Override
    public void onBackPressed() {
        moveTaskToBack(true);
    }

    public void promptUserForGroupAndAlbum(View view) {
        DialogFragment newFragment = new SelectGroupDialog();
        newFragment.show(getFragmentManager(), SelectGroupDialog.FRAGMENT_TAG);
    }

    public void promptUserForAlbum() {
        Bundle args = new Bundle();
        args.putSerializable(GROUP_KEY, selectedGroup);
        DialogFragment selectAlbum = new SelectAlbumDialog();
        selectAlbum.setArguments(args);
        selectAlbum.show(getFragmentManager(), SelectAlbumDialog.FRAGMENT_TAG);
    }

    @Override
    public void handleGroupSelected(Group groupSelected) {
        TextView groupSelectedView = (TextView) findViewById(R.id.camera_group_selected);
        groupSelectedView.setText(groupSelected.getName());
        removeGroupFragment();
        this.selectedGroup = groupSelected;
        if (groupSelected != null) {
            promptUserForAlbum();
        }
    }

    public void removeGroupFragment() {
        Fragment fragment = getFragmentManager().findFragmentByTag(SelectGroupDialog.FRAGMENT_TAG);
        if(fragment != null) {
            getFragmentManager().beginTransaction().remove(fragment).commit();
        }
    }

    @Override
    public void updateSelectedAlbum(Album album) {
        Fragment selectAlbumFragment = getFragmentManager()
            .findFragmentByTag(SelectAlbumDialog.FRAGMENT_TAG);

        getFragmentManager().beginTransaction().remove(selectAlbumFragment).commit();
        TextView selectedAlbum = (TextView)findViewById(R.id.selected_album);
        selectedAlbum.setText(album.getName());
        this.selectedAlbum = album;
    }

    public List<Group> getGroups() {
        return groups;
    }

    public void setGroups(List<Group> groups) {
        this.groups = groups;
    }

    public Group getSelectedGroup() {
        return selectedGroup;
    }

    public void setSelectedGroup(Group selectedGroup) {
        this.selectedGroup = selectedGroup;
    }

    public Album getSelectedAlbum() {
        return selectedAlbum;
    }

    public void setSelectedAlbum(Album selectedAlbum) {
        this.selectedAlbum = selectedAlbum;
    }

}
