package com.jeff_fennell.capstone;

import android.app.DialogFragment;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

public class CreateAlbumDialog extends DialogFragment {
    public static final String FRAGMENT_TAG = "CREATE_ALBUM_FRAGMENT";

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View v = inflater.inflate(R.layout.create_album_dialog_view, container, false);
        getDialog().setTitle(R.string.create_album_title);

        return v;
    }

    @Override
    public void onStart() {
        super.onStart();
        bindListenerToCreateAlbumButton();
    }

    public interface CreateAlbumListener {
        void createAlbum(String albumName);
    }

    private void bindListenerToCreateAlbumButton() {
        Button createAlbumButton = (Button)getView().findViewById(R.id.create_album_button);
        createAlbumButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                TextView albumNameEditText = (TextView)getView().findViewById(R.id.create_album_name);
                String albumName = albumNameEditText.getText().toString().trim();

                if (!isValidAlbumName(albumName)) {
                    albumNameEditText.setError(getString(R.string.create_album_bad_name));
                } else {
                    ((CreateAlbumListener)getActivity()).createAlbum(albumName);
                }
            }
        });
    }

    private boolean isValidAlbumName(String albumName) {
        return !albumName.isEmpty();
    }
}
