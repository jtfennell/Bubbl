package com.jeff_fennell.capstone;

import android.app.DialogFragment;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

public class InviteMemberDialog extends DialogFragment {
    public static final String FRAGMENT_TAG = "dialogFragment";

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View v = inflater.inflate(R.layout.invite_member_dialog_view, container, false);
        getDialog().setTitle(R.string.invite_member_title);

        return v;
    }

    @Override
    public void onStart() {
        super.onStart();
        bindListenerToInviteButton();
    }

    public interface InviteMemberListener {
        void inviteMember(String username);
    }

    private void bindListenerToInviteButton() {
        Button inviteButton = (Button)getView().findViewById(R.id.invite_member_button);
            inviteButton.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    TextView usernameEditText = (TextView)getView().findViewById(R.id.invite_member_username);
                    String username = usernameEditText.getText().toString().trim();

                    if (!validUsername(username)) {
                        usernameEditText.setError(getString(R.string.invite_user_bad_username));
                    } else {
                        ((InviteMemberListener)getActivity()).inviteMember(username);
                    }
                }
            });
    }

    private boolean validUsername(String username) {
        return !username.equals("");
    }

}
