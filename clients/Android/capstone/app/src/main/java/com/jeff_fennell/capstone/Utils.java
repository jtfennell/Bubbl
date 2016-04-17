package com.jeff_fennell.capstone;

import android.app.Activity;
import android.content.Context;
import android.widget.EditText;
import android.widget.Toast;

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
}
