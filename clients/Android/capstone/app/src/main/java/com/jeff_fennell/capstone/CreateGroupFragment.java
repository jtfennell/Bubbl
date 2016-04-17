package com.jeff_fennell.capstone;

import android.app.DialogFragment;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;

public class CreateGroupFragment extends DialogFragment {

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View v = inflater.inflate(R.layout.create_group_fragment, container, false);
        getDialog().setTitle(R.string.title_create_group_dialog);
        v.findViewById(R.id.create_group_button).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                EditText groupNameEditText = (EditText)getView().findViewById(R.id.create_group_name);
                String groupName = groupNameEditText.getText().toString().trim();
                ((CreateGroupListener)getActivity()).createGroup(groupName);
            }
        });

        return v;
    }

    public interface CreateGroupListener {
        public void createGroup(String name);
    }
}
