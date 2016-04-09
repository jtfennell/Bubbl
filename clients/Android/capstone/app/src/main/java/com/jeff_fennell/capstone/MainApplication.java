package com.jeff_fennell.capstone;

import android.app.Application;
import android.content.Context;
import android.widget.Toast;
import com.adobe.creativesdk.foundation.AdobeCSDKFoundation;
import com.adobe.creativesdk.foundation.auth.IAdobeAuthClientCredentials;
import com.adobe.creativesdk.foundation.internal.auth.AdobeAuthIMSEnvironment;
import com.jeff_fennell.capstone.entities.User;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class MainApplication extends Application implements IAdobeAuthClientCredentials {

    private static final String CREATIVE_SDK_CLIENT_ID = "37b02e503bef4f819284d52cde4d951b";
    private static final String CREATIVE_SDK_CLIENT_SECRET = "2d3656e2-e3dc-4c01-8445-f17d1e47d7a3";

    @Override
    public void onCreate() {
        super.onCreate();
        AdobeCSDKFoundation.initializeCSDKFoundation(
                getApplicationContext(),
                AdobeAuthIMSEnvironment.AdobeAuthIMSEnvironmentProductionUS
        );
    }

    @Override
    public String getClientID() {
        return CREATIVE_SDK_CLIENT_ID;
    }

    @Override
    public String getClientSecret() {
        return CREATIVE_SDK_CLIENT_SECRET;
    }
}