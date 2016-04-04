package com.jeff_fennell.capstone;

import android.app.Activity;
import android.widget.EditText;

public class Utils {

    public static String getTrimmedEditTextInput(Activity activity, int editTextId) {
        EditText editText = (EditText) activity.findViewById(editTextId);
        return editText.getText().toString().trim();
    }

    public static void setEditTextError(Activity activity, int editTextId, int stringResourceId) {
        ((EditText)activity.findViewById(editTextId))
            .setError(activity.getString(stringResourceId));
    }
}
