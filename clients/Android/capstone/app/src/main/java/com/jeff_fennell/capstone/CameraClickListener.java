package com.jeff_fennell.capstone;

import android.view.View;

/**
 * Created by Jeff on 1/26/2016.
 */

public abstract class CameraClickListener implements View.OnClickListener {

    private static final long DOUBLE_CLICK_TIME_DELTA = 200;//milliseconds

    long lastClickTime = 0;

    @Override
    public void onClick(View v) {
        long clickTime = System.currentTimeMillis();
        if (clickTime - lastClickTime < DOUBLE_CLICK_TIME_DELTA){
            onDoubleClick(v);
        }
        lastClickTime = clickTime;
    }

    public abstract void onDoubleClick(View v);
}