package com.jeff_fennell.capstone;

import android.content.Context;
import android.os.AsyncTask;
import android.os.Bundle;
import android.app.Activity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.GridView;
import android.widget.ImageView;
import com.bumptech.glide.Glide;
import com.jeff_fennell.capstone.entities.Album;
import com.jeff_fennell.capstone.entities.Group;
import com.jeff_fennell.capstone.entities.Image;
import java.io.IOException;
import java.lang.ref.WeakReference;
import java.util.List;
import retrofit2.Call;
import retrofit2.Response;

public class ViewAlbumImagesActivity extends Activity {
    private Group group;
    private Album album;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Bundle payload = getIntent().getExtras();
        group = (Group)payload.get(Group.serializeKey);
        album = (Album)payload.get(Album.serializeKey);
        setContentView(R.layout.activity_view_album_images);
    }

    @Override
    public void onStart() {
        super.onStart();
        new GetImagesInAlbumTask(this).execute();
    }


    public class GetImagesInAlbumTask extends AsyncTask<Void, Void, List<Image>> {
        WeakReference<Activity> context;
        public GetImagesInAlbumTask(Activity activity) {
            super();
            this.context = new WeakReference<Activity>(activity);
        }

        @Override
        protected void onPreExecute() {
            super.onPreExecute();
        }

        @Override
        protected void onPostExecute(List<Image> images) {
            super.onPostExecute(images);
            if (images != null) {
                GridView imageList = (GridView)findViewById(R.id.album_image_list);
                imageList.setAdapter(new ImageAdapter(context.get(), images));
            }
            System.out.println("hello");
        }

        @Override
        protected List<Image> doInBackground(Void... params) {
            List<Image> results = null;
            Call<List<Image>> getAlbumImages = Utils.getClient().getImages(
                    Image.GROUP_ALBUM,
                    group.getGroupId(),
                    album.getAlbumId(),
                    UserProfile.getAuthenticationToken(context.get())
            );
            try {
                Response<List<Image>> response = getAlbumImages.execute();
                if (response.isSuccessful()) {
                    results = response.body();
                } else {
                    //toast error message
                }
            } catch (IOException e) {
                //toast error message
            }
            return results;
        }
    }

    public class ImageAdapter extends ArrayAdapter<Image> {
        private WeakReference<Activity> activity;
        public ImageAdapter(Activity activity, List<Image> images) {
            super(activity, R.layout.image_list_view, images);
            this.activity = new WeakReference<Activity>(activity);
        }

        @Override
        public int getCount() {
            return super.getCount();
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            Image image = (Image)getItem(position);
            ViewHolder holder;

            if (convertView == null) {
                convertView = activity.get().getLayoutInflater().inflate(R.layout.image_list_view, null);
                holder = new ViewHolder();
                holder.image = (ImageView)convertView.findViewById(R.id.image);
                convertView.setTag(holder);
            } else {
                holder = (ViewHolder)convertView.getTag();
            }

            Glide
                    .with(activity.get())
                    .load(image.getUrl())
                    .placeholder(R.drawable.ic_people_white_48dp)
                    .centerCrop()
                    .into(holder.image);

            return convertView;
        }
    }

    static class ViewHolder {
        ImageView image;
    }


}
