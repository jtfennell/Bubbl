package com.jeff_fennell.capstone;

import android.app.Fragment;
import android.graphics.Bitmap;
import android.os.AsyncTask;
import android.os.Bundle;
import android.app.Activity;
import android.support.v4.graphics.drawable.RoundedBitmapDrawable;
import android.support.v4.graphics.drawable.RoundedBitmapDrawableFactory;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.GridView;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import com.bumptech.glide.Glide;
import com.bumptech.glide.request.target.BitmapImageViewTarget;
import com.jeff_fennell.capstone.entities.Album;
import com.jeff_fennell.capstone.entities.Group;
import com.jeff_fennell.capstone.entities.Image;
import com.jeff_fennell.capstone.entities.User;
import org.apache.commons.lang3.StringUtils;
import java.io.IOException;
import java.util.List;
import it.sephiroth.android.library.widget.HListView;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class  GroupDetailView extends Activity implements
        InviteMemberDialog.InviteMemberListener,
        CreateAlbumDialog.CreateAlbumListener {
    private Group group;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_group_detail_view);
        Group groupToDisplay = (Group)getIntent().getExtras().get(Group.serializeKey);
        getActionBar().setTitle(groupToDisplay.getName());
        this.group = groupToDisplay;
        hideInviteButtonIfNotAdmin();
        displayMembers(groupToDisplay);
        displayAlbums(groupToDisplay);
    }

    private void displayMembers(Group group) {
        TextView groupEmptyMessage = (TextView)findViewById(R.id.group_empty_message);

        if (group.getMembers() != null && group.getMembers().size() >= 1) {
            groupEmptyMessage.setVisibility(View.GONE);
        } else {
            groupEmptyMessage.setVisibility(View.VISIBLE);
        }
        HListView memberList = (HListView)findViewById(R.id.members_in_group);
        memberList.setAdapter(new MemberAdapter(group.getMembers(), this));
    }

    @Override
    public void createAlbum(String albumName) {
        Album newAlbum = new Album(group.getGroupId(), albumName, UserProfile.getUserId(this));
        Call<Album> createAlbum = Utils
           .getClient()
           .createNewAlbum(
               newAlbum,
               UserProfile.getAuthenticationToken(this)
           );

        createAlbum.enqueue(new Callback<Album>() {
            @Override
            public void onResponse(Call<Album> call, Response<Album> response) {
                if (response.isSuccessful()) {
                    Utils.toast(
                            getApplicationContext(),
                            R.string.album_created,
                            Toast.LENGTH_LONG
                    );
                } else {
                    Utils.toast(
                            getApplicationContext(),
                            R.string.album_create_fail,
                            Toast.LENGTH_LONG
                    );
                }
            }

            @Override
            public void onFailure(Call<Album> call, Throwable t) {
                Utils.toast(
                        getApplicationContext(),
                        R.string.album_create_fail,
                        Toast.LENGTH_LONG
                );
            }
        });
    }

    public class MemberAdapter extends ArrayAdapter<User>{
        private Activity activity;
        public MemberAdapter(List<User> members, Activity activity) {
            super(activity, R.layout.member_view, members);
            this.activity = activity;
        }

        @Override
        public View getView(int position, View recycledView, ViewGroup parent) {
            final User user = getItem(position);
            View memberView = null;

            if (recycledView == null) {
                memberView = LinearLayout.inflate(activity, R.layout.member_view, null);
            } else {
                memberView = recycledView;
            }

            TextView memberName = (TextView)memberView.findViewById(R.id.member_name);
            memberName.setText(StringUtils.join(user.getFirstName()));
            final ImageView userImage = (ImageView)memberView.findViewById(R.id.member_profile_image);
            new GetMemberImageTask(activity, user.getUserId(), userImage).execute();

            return memberView;
        }
    }

    public void openInviteDialog(View view) {
        getFragmentManager()
            .beginTransaction()
            .add(new InviteMemberDialog(), InviteMemberDialog.FRAGMENT_TAG)
            .commit();
    }

    public class GetMemberImageTask extends AsyncTask<Void, Void, Image> {
        private Activity activity;
        private ImageView profileImageView;
        private long userId;

        public GetMemberImageTask(Activity activity, long userId, ImageView profileImageView) {
            this.activity = activity;
            this.profileImageView = profileImageView;
            this.userId = userId;
       }

        @Override
        protected Image doInBackground(Void... params) {
            Call getUserProfileImage = Utils.getClient().getProfileImage(
                    Image.USER_PROFILE,
                    userId,
                    UserProfile.getAuthenticationToken(activity)
            );
            Image image = null;

            try {
                Response response = getUserProfileImage.execute();
                if (response.isSuccessful()) {
                    image = ((List<Image>)response.body()).get(0);
                }

            } catch (IOException e) {
                System.out.println("here");
            }
            return image;
        }

        @Override
        protected void onPostExecute(Image image) {
            super.onPostExecute(image);
            if (image == null || image.getUrl() == null) {
                profileImageView.setImageDrawable(getDrawable(R.drawable.ic_people_white_24dp));
            } else {
                Glide
                    .with(activity)
                    .load(image.getUrl())
                    .asBitmap()
                    .placeholder(R.drawable.ic_people_white_48dp)
                    .centerCrop()
                    .into(new BitmapImageViewTarget(profileImageView) {
                        @Override
                        protected void setResource(Bitmap resource) {
                            RoundedBitmapDrawable circularBitmapDrawable =
                                    RoundedBitmapDrawableFactory.create(activity.getResources(), resource);
                            circularBitmapDrawable.setCircular(true);
                            profileImageView.setImageDrawable(circularBitmapDrawable);
                        }
                    });
            }
        }
    }

    @Override
    public void inviteMember(String username) {
        Call inviteMember = Utils
                .getClient()
                .inviteMemberToGroup(
                        username,group.getGroupId(),
                        UserProfile.getAuthenticationToken(this)
                );
        inviteMember.enqueue(new Callback() {
            @Override
            public void onResponse(Call call, Response response) {
                if (response.isSuccessful()) {
                    toastSuccessMessage();
                    dismissInviteFragment();
                } else if (response.code() == 404){
                    toastMemberNotFoundMessage();
                }
            }

            @Override
            public void onFailure(Call call, Throwable t) {
                toastErrorMessage();
            }
        });
    }

    private void toastSuccessMessage() {
        Utils.toast(
                getApplicationContext(),
                R.string.invite_user_success,
                Toast.LENGTH_LONG
        );
    }

    private void toastMemberNotFoundMessage() {
        Utils.toast(
            getApplicationContext(),
            R.string.user_not_found,
            Toast.LENGTH_LONG
        );
    }

    private void dismissInviteFragment() {
        Fragment  inviteFragment = getFragmentManager()
            .findFragmentByTag(
                InviteMemberDialog.FRAGMENT_TAG
            );
        getFragmentManager()
            .beginTransaction()
            .remove(inviteFragment)
            .commit();
    }

    private void toastErrorMessage() {
        Utils.toast(
                this,
                R.string.invite_user_failure,
                Toast.LENGTH_LONG
        );
    }

    private void hideInviteButtonIfNotAdmin() {
        if (UserProfile.getUserId(this) != group.getAdmin()) {
            findViewById(R.id.invite_member_button).setVisibility(View.GONE);
        }
    }

    public void openCreateAlbumDialog(View view) {
        getFragmentManager()
            .beginTransaction()
            .add(
                new CreateAlbumDialog(),
                CreateAlbumDialog.FRAGMENT_TAG
            ).commit();
    }

    private void displayAlbums(Group group) {
        Call<List<Album>> getAlbums = Utils
            .getClient()
            .getAlbumsForGroup(
                group.getGroupId(),
                UserProfile.getAuthenticationToken(this)
            );

        new GetAlbums(this).execute();
    }

    public class GetAlbums extends AsyncTask<Void, Void, List<Album>> {
        private Activity activity;

        public GetAlbums(Activity activity) {
            this.activity = activity;
        }

        @Override
        protected void onPreExecute() {
            super.onPreExecute();
            //start a spinner or something
        }

        @Override
        protected List<Album> doInBackground(Void... params) {
            Call getAlbums = Utils.getClient()
                .getAlbumsForGroup(
                    group.getGroupId(),
                    UserProfile.getAuthenticationToken(activity)
                );
            List<Album> albums = null;
            try {
               albums = (List<Album>)getAlbums.execute().body();
            } catch (IOException e) {
                //render error message for loading albums
            }
            return albums;
        }

        @Override
        protected void onPostExecute(List<Album> albums) {
            super.onPostExecute(albums);

            if (albums.size() > 0) {
                setUpAlbumList(albums);
            } else {
                setNoAlbumsMessage();
            }

        }
    }

    static class ViewHolder {
        ImageView image1, image2, image3, image4, image5;
        TextView albumName;
    }

    public class AlbumAdapter extends ArrayAdapter<Album>{
        private Activity activity;

        public AlbumAdapter(Activity activity, List<Album> albums) {
            super(getApplicationContext(), R.layout.album_preview, albums);
            this.activity = activity;
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            final ViewHolder holder;
            Album album = getItem(position);

            if (convertView == null) {
                convertView = getLayoutInflater().inflate(R.layout.album_preview, null);
                holder = new ViewHolder();

                holder.image1 = (ImageView) convertView.findViewById(R.id.image_1);
                holder.image2 = (ImageView) convertView.findViewById(R.id.image_2);
                holder.image3 = (ImageView) convertView.findViewById(R.id.image_3);
                holder.image4 = (ImageView) convertView.findViewById(R.id.image_4);
                holder.image5 = (ImageView) convertView.findViewById(R.id.image_5);
                holder.albumName = (TextView) convertView.findViewById(R.id.album_name);

                convertView.setTag(holder);
            } else {
                holder = (ViewHolder) convertView.getTag();
            }

            holder.albumName.setText(album.getName());

            Call<List<Image>> getAlbumPreview = Utils.getClient()
                .getAlbumPreviewImages(
                    album.getGroupId(),
                    album.getAlbumId(),
                    UserProfile.getAuthenticationToken(activity)
                );

            getAlbumPreview.enqueue(new Callback<List<Image>>() {
                @Override
                public void onResponse(Call<List<Image>> call, Response<List<Image>> response) {
                    if (response.isSuccessful()) {
                        List<Image> previewImages = response.body();
                        for (int i = 0; i < previewImages.size(); i++) {
                            Image image = previewImages.get(i);

                            ImageView previewImageView = null;
                            if (i == 0) {
                                previewImageView = holder.image1;
                            } else if (i == 1) {
                                previewImageView = holder.image2;
                            } else if (i == 2) {
                                previewImageView = holder.image3;
                            } else if (i == 3) {
                                previewImageView = holder.image4;
                            } else if (i == 4) {
                                previewImageView = holder.image5;
                            }
                            final ImageView previewImage = previewImageView;

                            Glide
                                .with(activity)
                                .load(image.getUrl())
                                .asBitmap()
                                .placeholder(R.drawable.ic_people_white_48dp)
                                .centerCrop()
                                .into(new BitmapImageViewTarget(previewImageView) {
                                    @Override
                                    protected void setResource(Bitmap resource) {
                                        RoundedBitmapDrawable circularBitmapDrawable =
                                                RoundedBitmapDrawableFactory.create(activity.getResources(), resource);
                                        circularBitmapDrawable.setCircular(true);
                                        previewImage.setImageDrawable(circularBitmapDrawable);
                                    }
                                });
                        }
                    } else {
                        //set no images message
                    }
                }

                @Override
                public void onFailure(Call<List<Image>> call, Throwable t) {

                }
            });
            return convertView;
        }
    }

    private void loadAlbumPreviewImage() {

    }

    private void setUpAlbumList(List<Album> albums) {
        GridView albumList = (GridView)findViewById(R.id.album_list);
        albumList.setAdapter(new AlbumAdapter(this, albums));
    }

    private void setNoAlbumsMessage() {

    }
}
