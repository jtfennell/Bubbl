package com.jeff_fennell.capstone;

import android.app.DialogFragment;
import android.content.Context;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.TextView;
import com.jeff_fennell.capstone.entities.Album;
import com.jeff_fennell.capstone.entities.Group;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class SelectAlbumDialog extends DialogFragment {
    public static final String FRAGMENT_TAG = "selectAlbum";
    private Group group;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        group = (Group)getArguments().getSerializable(CameraActivity.GROUP_KEY);
        View v = inflater.inflate(R.layout.select_album_fragment_dialog, container, false);
        getDialog().setTitle(R.string.album_dialog_title);

        return v;
    }

    @Override
    public void onStart() {
        super.onStart();
        populateAlbumList();
        setAlbumSelectListener();
    }

    private void populateAlbumList() {
        Call getAlbums = Utils.getClient().getAlbumsForGroup(
            group.getGroupId(),
            UserProfile.getAuthenticationToken(getActivity())
        );

        getAlbums.enqueue(new Callback() {
            @Override
            public void onResponse(Call call, Response response) {
                if (response.isSuccessful()) {
                    List<Album> albums = (List<Album>)response.body();
                    showAlbumList(albums);
                }
            }

            @Override
            public void onFailure(Call call, Throwable t) {

            }
        });
    }

    private void showAlbumList(List<Album> albums) {
        ListView albumList = (ListView)getView().findViewById(R.id.album_list);
        albumList.setAdapter(new AlbumAdapter(getActivity(),albums));
    }

    public class AlbumAdapter extends ArrayAdapter<Album> {

        AlbumAdapter(Context context, List<Album> albums) {
            super(context, R.layout.album_list_view, albums);
        }


        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            Album album = getItem(position);
            AlbumViewHolder holder;
            if (convertView == null) {
                convertView = getActivity().getLayoutInflater().inflate(R.layout.album_list_view, null);
                holder = new AlbumViewHolder();
                holder.albumName = (TextView)convertView.findViewById(R.id.album_name);
                convertView.setTag(holder);
            } else {
                holder = (AlbumViewHolder)convertView.getTag();
            }
            holder.albumName.setText(album.getName());

            return convertView;
        }
    }

    static class AlbumViewHolder {
        TextView albumName;
    }

    public interface OnAlbumSelectListener {
        void updateSelectedAlbum(Album album);
    }

    private void setAlbumSelectListener() {
        ListView albumList = (ListView)getView().findViewById(R.id.album_list);
        albumList.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                Album selectedAlbum = (Album)parent.getItemAtPosition(position);
                ((OnAlbumSelectListener) getActivity()).updateSelectedAlbum(selectedAlbum);
            }
        });
    }

}
