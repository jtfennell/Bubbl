package com.jeff_fennell.capstone;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;

public class Camera extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_camera);
        if (savedInstanceState == null) {
            loadCameraFragment();
        }
    }

    private void loadCameraFragment() {
        getFragmentManager().beginTransaction()
                .replace(R.id.container, CameraFragment.newInstance())
                .commit();
    }
}