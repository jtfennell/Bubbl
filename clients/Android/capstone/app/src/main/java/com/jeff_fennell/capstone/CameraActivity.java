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
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import com.jeff_fennell.capstone.entities.Group;

public class CameraActivity extends Activity implements SelectGroupDialog.OnGroupSelectedListener {

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
       promptUserForGroup();
    }

    @Override
    public void onBackPressed() {
        moveTaskToBack(true);
    }

    private void promptUserForGroup() {
        DialogFragment newFragment = new SelectGroupDialog();
        newFragment.show(getFragmentManager(), SelectGroupDialog.FRAGMENT_TAG);
    }

    @Override
    public void updateGroupSelected(Group groupSelected) {
        Camera2BasicFragment cameraFragment = (Camera2BasicFragment)getFragmentManager().findFragmentByTag(Camera2BasicFragment.FRAGMENT_TAG);
        cameraFragment.updateGroupInfo(groupSelected);
    }
}
