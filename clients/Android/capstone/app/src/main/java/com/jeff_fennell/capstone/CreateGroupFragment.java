package com.jeff_fennell.capstone;

import android.app.DialogFragment;
import android.content.Context;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import com.jeff_fennell.capstone.entities.Group;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class CreateGroupFragment extends DialogFragment {
    public static String FRAGMENT_TAG = "createGroup";


    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View v = inflater.inflate(R.layout.create_group_fragment, container, false);
        getDialog().setTitle(R.string.title_create_group_dialog);
        Button createGroupButton = (Button)v.findViewById(R.id.create_group_button);
        createGroupButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                EditText createGroupEditText = (EditText)getView().findViewById(R.id.create_group_name);
                String groupToCreate = createGroupEditText.getText().toString().trim();
                if (groupToCreate .length() > 0) {
                    createGroup(groupToCreate);
                } else {
                    createGroupEditText.setError(getString(R.string.create_group_name_error));
                }
            }
        });

        return v;
    }

    public void createGroup(String groupName) {
        Retrofit retrofit = new Retrofit.Builder()
                .addConverterFactory(GsonConverterFactory.create())
                .baseUrl(BuildConfig.API_BASE_URL)
                .build();

        BubblService api = retrofit.create(BubblService.class);

        Call createNewGroup = api.createNewGroup(new Group(groupName), UserProfile.getAuthenticationToken(getActivity()));
        createNewGroup.enqueue(new Callback() {
            @Override
            public void onResponse(Call call, Response response) {
                if (response.isSuccessful()) {
                    Group newlyCreatedGroup = (Group) response.body();
                    ((CreateGroupListener) getActivity()).updateGroupList(newlyCreatedGroup);
                    displaySuccessToast();
                } else {
                    displayErrorToast();
                }
            }

            @Override
            public void onFailure(Call call, Throwable t) {
                displayErrorToast();
            }
        });
    }

    private void displaySuccessToast() {
        Context context = getActivity().getApplicationContext();
        Utils.toast(context, R.string.create_group_success, Toast.LENGTH_LONG);
    }

    private void displayErrorToast() {
        Context context = getActivity().getApplicationContext();
        Utils.toast(context, R.string.create_group_failure,Toast.LENGTH_LONG);
    }

    public interface CreateGroupListener {
        public void updateGroupList(Group group);
    }
}
