package com.jeff_fennell.capstone;

import android.app.Activity;
import android.content.Context;
import android.widget.EditText;
import android.widget.Toast;

import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class Utils {

    public static String getTrimmedEditTextInput(Activity activity, int editTextId) {
        EditText editText = (EditText) activity.findViewById(editTextId);
        return editText.getText().toString().trim();
    }

    public static void setEditTextError(Activity activity, int editTextId, int stringResourceId) {
        ((EditText)activity.findViewById(editTextId))
            .setError(activity.getString(stringResourceId));
    }

    public static void toast(Context context, int stringResourceId, int length) {
        String successString = context.getString(stringResourceId);
        Toast toast = Toast.makeText(context, successString, length);
        toast.show();
    }

    public static void toastDynamic(Context context, String resourceString, int length) {
        Toast toast = Toast.makeText(context, resourceString, length);
        toast.show();
    }

    public static BubblService getClient() {
        Retrofit retrofit = new Retrofit.Builder()
                .addConverterFactory(GsonConverterFactory.create())
                .baseUrl(BuildConfig.API_BASE_URL)
                .build();
        BubblService api = retrofit.create(BubblService.class);
        return api;
    }
}
