package com.jeff_fennell.capstone;

import android.app.Activity;
import android.os.Bundle;

public class Camera extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_camera);
        if (savedInstanceState == null) {
            loadCameraFragment();
        }
    }

    @Override
    public void onBackPressed() {
        moveTaskToBack(true);
    }

    private void loadCameraFragment() {
        getFragmentManager().beginTransaction()
                .replace(R.id.container, CameraFragment.newInstance())
                .commit();
    }
}